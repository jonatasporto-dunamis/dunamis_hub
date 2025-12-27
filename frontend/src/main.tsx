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
import { AuthProvider, ProtectedRoute } from './auth/AuthProvider'
import axios from 'axios'

// Set auth header globally if token present
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute allowedRoles={["FINANCIAL", "ADMIN"]}><Finance /></ProtectedRoute>} />
            <Route path="/finance/:id" element={<ProtectedRoute allowedRoles={["FINANCIAL", "ADMIN"]}><FinanceDetail /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><Users /></ProtectedRoute>} />
            <Route path="/users/:id" element={<ProtectedRoute allowedRoles={["ADMIN"]}><UserDetail /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
