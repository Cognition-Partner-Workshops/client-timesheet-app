import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import TaskBoardPage from './pages/TaskBoardPage'
import TaskDetailPage from './pages/TaskDetailPage'

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <Routes>
          <Route path="/" element={<TaskBoardPage />} />
          <Route path="/task/:id" element={<TaskDetailPage />} />
        </Routes>
      </Router>
    </LocalizationProvider>
  )
}

export default App
