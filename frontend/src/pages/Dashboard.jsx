import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Shield, Activity, AlertTriangle, CheckCircle, TrendingUp, Globe, Mail, Clock
} from 'lucide-react'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'
import Sidebar from '../components/Sidebar'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PIE_COLORS = ['#ef4444', '#10b981']

function StatCard({ icon: Icon, label, value, sub, color, gradient }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${gradient} blur-2xl opacity-20`} />
            <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{value}</p>
            <p className="text-sm font-medium text-gray-300">{label}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </motion.div>
    )
}

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="glass px-3 py-2 rounded-xl text-sm">
            <p className="text-gray-400">{payload[0].name}</p>
            <p className="text-white font-bold">{payload[0].value} scans</p>
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, histRes] = await Promise.all([
                    dashboardAPI.stats(),
                    dashboardAPI.history(10)
                ])
                setStats(statsRes.data)
                setHistory(histRes.data.scans)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const pieData = stats ? [
        { name: 'Phishing', value: stats.phishing_detected },
        { name: 'Safe', value: stats.safe_detected },
    ] : []

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6 lg:p-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, <span className="gradient-text">{user?.username}</span> 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Here's your phishing detection activity overview.</p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                icon={Activity} label="Total Scans" value={stats?.total_scans ?? 0}
                                gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
                                sub="All time"
                            />
                            <StatCard
                                icon={AlertTriangle} label="Phishing Found" value={stats?.phishing_detected ?? 0}
                                gradient="bg-gradient-to-br from-red-600 to-rose-600"
                                sub={`${stats?.detection_rate ?? 0}% detection rate`}
                            />
                            <StatCard
                                icon={CheckCircle} label="Safe Scans" value={stats?.safe_detected ?? 0}
                                gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
                                sub="No threats found"
                            />
                            <StatCard
                                icon={TrendingUp} label="This Week" value={stats?.trend?.reduce((s, d) => s + d.scans, 0) ?? 0}
                                gradient="bg-gradient-to-br from-cyan-600 to-blue-600"
                                sub="7-day activity"
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid lg:grid-cols-2 gap-6 mb-8">
                            {/* Pie */}
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-purple-400" /> Detection Breakdown
                                </h3>
                                {stats?.total_scans === 0 ? (
                                    <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                                        No scan data yet. Run your first scan!
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                                paddingAngle={4} dataKey="value">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={index} fill={PIE_COLORS[index]} stroke="transparent" />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </motion.div>

                            {/* Bar */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" /> 7-Day Scan Trend
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={stats?.trend || []}>
                                        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="scans" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b5cf6" />
                                                <stop offset="100%" stopColor="#06b6d4" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        {/* Scan Type breakdown */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="card flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats?.url_scans ?? 0}</p>
                                    <p className="text-sm text-gray-400">URL Scans</p>
                                </div>
                            </div>
                            <div className="card flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats?.email_scans ?? 0}</p>
                                    <p className="text-sm text-gray-400">Email Scans</p>
                                </div>
                            </div>
                        </div>

                        {/* History Table */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" /> Recent Scan History
                            </h3>
                            {history.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No scans yet. Start by analyzing a URL or email.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-500 border-b border-white/5">
                                                <th className="pb-3 pr-4 font-medium">Type</th>
                                                <th className="pb-3 pr-4 font-medium">Input</th>
                                                <th className="pb-3 pr-4 font-medium">Result</th>
                                                <th className="pb-3 pr-4 font-medium">Risk</th>
                                                <th className="pb-3 font-medium">Confidence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((scan, i) => (
                                                <motion.tr
                                                    key={scan.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                                                >
                                                    <td className="py-3 pr-4">
                                                        <div className="flex items-center gap-1.5">
                                                            {scan.scan_type === 'url'
                                                                ? <Globe className="w-4 h-4 text-purple-400" />
                                                                : <Mail className="w-4 h-4 text-cyan-400" />}
                                                            <span className="uppercase text-xs font-medium text-gray-400">{scan.scan_type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-4 max-w-xs">
                                                        <p className="text-gray-300 truncate font-mono text-xs">{scan.input_data}</p>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${scan.prediction === 'Phishing'
                                                                ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                                            }`}>
                                                            {scan.prediction}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className={scan.risk_level === 'High' ? 'risk-badge-high' :
                                                            scan.risk_level === 'Medium' ? 'risk-badge-medium' : 'risk-badge-low'}>
                                                            {scan.risk_level}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="text-gray-300 font-mono text-xs">{scan.confidence}%</span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </main>
        </div>
    )
}
