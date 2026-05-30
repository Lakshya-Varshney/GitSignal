import shutil
import tempfile
from datetime import datetime
from typing import Any, Dict

from git import Repo

# AST-level analysis (tree-sitter) scoped for post-hackathon.
# Current signals use diff entropy + test detection and do not require parsers.


async def fetch_repo(repo_url: str, max_commits: int = 200, progress_cb=None) -> Dict[str, Any]:
    tmpdir = tempfile.mkdtemp()
    try:
        if progress_cb:
            progress_cb(10, "cloning repository")
        repo = Repo.clone_from(
            repo_url,
            tmpdir,
            depth=max_commits + 10,
            no_single_branch=True
        )

        if progress_cb:
            progress_cb(30, "collecting commits")

        commits_data = []
        commits = list(repo.iter_commits("HEAD", max_count=max_commits))

        if progress_cb:
            progress_cb(35, "extracting diffs")

        total = len(commits)
        for idx, commit in enumerate(commits):
            try:
                diff_data = extract_diff(repo, commit)
                commit_record = {
                    "sha": commit.hexsha[:8],
                    "full_sha": commit.hexsha,
                    "author": commit.author.name,
                    "author_email": commit.author.email,
                    "timestamp": datetime.fromtimestamp(commit.committed_date).isoformat(),
                    "unix_ts": commit.committed_date,
                    "message": commit.message.strip()[:200],
                    "diff": diff_data,
                }
                commits_data.append(commit_record)
            except Exception:
                continue

            if progress_cb and total:
                if idx % 10 == 0 or idx == total - 1:
                    pct = 35 + int(((idx + 1) / total) * 25)
                    progress_cb(min(pct, 60), "extracting diffs")

        return {
            "repo_url": repo_url,
            "repo_name": repo_url.rstrip("/").split("/")[-1],
            "total_commits_analyzed": len(commits_data),
            "commits": commits_data,
        }
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def extract_diff(repo: Repo, commit) -> Dict[str, Any]:
    try:
        if not commit.parents:
            return empty_diff()

        parent = commit.parents[0]
        diffs = parent.diff(commit, create_patch=True)

        files_changed = []
        total_additions = 0
        total_deletions = 0
        test_files_changed = 0
        rename_count = 0
        comment_lines_added = 0
        bulk_insertion_detected = False
        raw_patch_tokens = []

        for diff in diffs:
            if diff.deleted_file or diff.new_file:
                fname = diff.b_path or diff.a_path
            else:
                fname = diff.b_path

            safe_name = fname or ""
            is_test = any(kw in safe_name.lower() for kw in [
                "test", "spec", "__tests__", "_test.", "tests/"
            ])
            is_rename = diff.rename_from != diff.rename_to if diff.rename_from else False

            patch = ""
            try:
                patch = diff.diff.decode("utf-8", errors="replace")
            except Exception:
                patch = ""

            added_lines = [
                line[1:] for line in patch.split("\n")
                if line.startswith("+") and not line.startswith("+++")
            ]
            removed_lines = [
                line[1:] for line in patch.split("\n")
                if line.startswith("-") and not line.startswith("---")
            ]

            additions = len(added_lines)
            deletions = len(removed_lines)
            total_additions += additions
            total_deletions += deletions

            if is_test:
                test_files_changed += 1
            if is_rename:
                rename_count += 1

            comment_lines = sum(
                1 for line in added_lines
                if line.strip().startswith(("#", "//", "/*", "*", '"""', "'''"))
            )
            comment_lines_added += comment_lines

            if additions > 80 and deletions < 5:
                bulk_insertion_detected = True

            raw_patch_tokens.extend(added_lines[:50])

            files_changed.append({
                "path": fname,
                "additions": additions,
                "deletions": deletions,
                "is_test": is_test,
                "is_rename": is_rename,
            })

        return {
            "files_changed": files_changed,
            "files_changed_count": len(files_changed),
            "total_additions": total_additions,
            "total_deletions": total_deletions,
            "test_files_changed": test_files_changed,
            "rename_count": rename_count,
            "comment_lines_added": comment_lines_added,
            "bulk_insertion_detected": bulk_insertion_detected,
            "raw_patch_sample": " ".join(raw_patch_tokens[:200]),
        }
    except Exception:
        return empty_diff()


def empty_diff() -> Dict[str, Any]:
    return {
        "files_changed": [],
        "files_changed_count": 0,
        "total_additions": 0,
        "total_deletions": 0,
        "test_files_changed": 0,
        "rename_count": 0,
        "comment_lines_added": 0,
        "bulk_insertion_detected": False,
        "raw_patch_sample": "",
    }