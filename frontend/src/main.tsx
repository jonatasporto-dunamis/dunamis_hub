import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Alerts from './pages/Alerts'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Finance from './pages/Finance'
import FinanceDetail from './pages/FinanceDetail'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import Layout from './components/Layout'
import axios from 'axios'

// Set auth header globally if token present
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/finance/:id" element={<FinanceDetail />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
