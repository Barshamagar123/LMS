import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import { InstructorDashboard } from './pages/DashBoard/InstructorDashboard'

const App = () => {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} /> 
        <Route path='/instructor-dashboard' element={<InstructorDashboard />} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
