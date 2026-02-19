import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shield, LayoutDashboard, Globe, Mail, LogOut, Menu, X, User,
    FileQuestion, Key, Flag
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Globe, label: 'URL Scan', path: '/detect/url' },
    { icon: Mail, label: 'Email Scan', path: '/detect/email' },
    { icon: FileQuestion, label: 'Phishing Quiz', path: '/quiz' },
    { icon: Key, label: 'Identity Breach', path: '/breach-check' },
    { icon: Flag, label: 'Report Phishing', path: '/report' },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/')
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold gradient-text">PhishGuard AI</span>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const active = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${active
                                    ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${active ? 'text-purple-400' : ''}`} />
                            {item.label}
                            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />}
                        </Link>
                    )
                })}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-xl glass mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400
                     hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl"
                onClick={() => setOpen(!open)}
            >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-40 bg-gray-950/80 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile drawer */}
            <AnimatePresence>
                {open && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 glass border-r border-white/5"
                    >
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col w-64 min-h-screen glass border-r border-white/5 fixed top-0 left-0">
                <SidebarContent />
            </aside>
        </>
    )
}
