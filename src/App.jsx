import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserDetail from './pages/admin/UserDetail'
import { HabitProvider } from './context/HabitContext'

function RequireAuth({ adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <HabitProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen(s => !s)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>
    </HabitProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route element={<RequireAuth adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/user/:userId" element={<UserDetail />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
