from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analyzer.git_fetcher import fetch_repo
from analyzer.scorer import score_repo
from analyzer.cache import get_cached, set_cached, PRELOADED_REPOS
from analyzer.jobs import create_job, get_job, set_job_result, update_job
from models.schemas import AnalysisRequest

app = FastAPI(title="GitSignal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze")
async def analyze_repo(req: AnalysisRequest):
    cached = get_cached(req.repo_url, req.max_commits or 200)
    if cached:
        return cached

    try:
        repo_data = await fetch_repo(req.repo_url, max_commits=req.max_commits or 200)
        result = await score_repo(repo_data)
        set_cached(req.repo_url, result, req.max_commits or 200)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/analyze/start")
async def analyze_start(req: AnalysisRequest, background_tasks: BackgroundTasks):
    max_commits = req.max_commits or 200
    cached = get_cached(req.repo_url, max_commits)
    if cached:
        job_id = create_job(req.repo_url, max_commits)
        set_job_result(job_id, cached, stage="cache_hit")
        return {"job_id": job_id, "cached": True}

    job_id = create_job(req.repo_url, max_commits)
    update_job(job_id, status="running", progress_pct=3, stage="queued")

    background_tasks.add_task(run_analysis_job, job_id, req.repo_url, max_commits)
    return {"job_id": job_id, "cached": False}


@app.get("/analyze/status/{job_id}")
async def analyze_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/preloaded")
async def list_preloaded():
    return {"repos": list(PRELOADED_REPOS.keys())}


@app.get("/health")
async def health():
    return {"status": "ok"}


async def run_analysis_job(job_id: str, repo_url: str, max_commits: int):
    def progress_cb(pct, stage):
        update_job(job_id, progress_pct=int(pct), stage=stage, status="running")

    try:
        progress_cb(5, "starting")
        repo_data = await fetch_repo(repo_url, max_commits=max_commits, progress_cb=progress_cb)
        result = await score_repo(repo_data, progress_cb=progress_cb)
        set_cached(repo_url, result, max_commits)
        set_job_result(job_id, result)
    except Exception as exc:
        update_job(job_id, status="error", stage="failed", error=str(exc))