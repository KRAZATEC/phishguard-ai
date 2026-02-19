import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UrlDetect from './pages/UrlDetect'
import EmailDetect from './pages/EmailDetect'
import Quiz from './pages/Quiz'
import BreachCheck from './pages/BreachCheck'
import ReportPhish from './pages/ReportPhish'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/detect/url" element={<ProtectedRoute><UrlDetect /></ProtectedRoute>} />
      <Route path="/detect/email" element={<ProtectedRoute><EmailDetect /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/breach-check" element={<ProtectedRoute><BreachCheck /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><ReportPhish /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(17,24,39,0.95)',
              color: '#f3f4f6',
              border: '1px solid rgba(139,92,246,0.3)',
              backdropFilter: 'blur(10px)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f3f4f6' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f3f4f6' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
