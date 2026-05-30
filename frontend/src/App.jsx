import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ResultsPage from './pages/ResultsPage'
import NavBar from './components/NavBar'
import { useRepoAnalysis } from './hooks/useRepoAnalysis'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const analysis = useRepoAnalysis()

  return (
    <>
      <NavBar scanning={analysis.loading} />
      <Routes>
        <Route path="/" element={<LandingPage analysis={analysis} />} />
        <Route path="/results" element={<ResultsPage analysis={analysis} />} />
      </Routes>
    </>
  )
}