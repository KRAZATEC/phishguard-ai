import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Zap, Brain, Lock, ChevronRight, Globe, Mail, BarChart3, CheckCircle } from 'lucide-react'

const features = [
    {
        icon: Globe,
        title: 'URL Analysis',
        desc: 'Detect phishing URLs in real-time using machine learning feature extraction with 18+ URL attributes.',
        color: 'from-purple-500 to-indigo-500',
    },
    {
        icon: Mail,
        title: 'Email Detection',
        desc: 'Analyze email content with TF-IDF NLP models to identify phishing attempts, social engineering, and scams.',
        color: 'from-cyan-500 to-blue-500',
    },
    {
        icon: Brain,
        title: 'Explainable AI',
        desc: 'Understand why a URL or email is flagged — detailed reasoning powered by feature importance analysis.',
        color: 'from-pink-500 to-rose-500',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        desc: 'Track your scan history, detection trends, and threat statistics with interactive charts.',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        icon: Zap,
        title: 'Instant Results',
        desc: 'Sub-second analysis with confidence scores and risk levels (Low / Medium / High) for every scan.',
        color: 'from-yellow-500 to-orange-500',
    },
    {
        icon: Lock,
        title: 'Secure & Private',
        desc: 'JWT authentication, bcrypt password hashing, and secure MongoDB Atlas storage for all your data.',
        color: 'from-violet-500 to-purple-500',
    },
]

const stats = [
    { value: '99.2%', label: 'Detection Accuracy' },
    { value: '<200ms', label: 'Analysis Speed' },
    { value: '18+', label: 'URL Features' },
    { value: '5000+', label: 'TF-IDF Features' },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Landing() {
    return (
        <div className="min-h-screen bg-gray-950 overflow-hidden">
            {/* Animated background blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
                <div className="absolute inset-0 bg-grid opacity-30" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">PhishGuard AI</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <Link to="/login" className="btn-ghost text-sm py-2.5">Sign In</Link>
                        <Link to="/register" className="btn-primary text-sm py-2.5">Get Started Free</Link>
                    </motion.div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 pt-24 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-sm text-purple-300 mb-8"
                    >
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        AI-powered cybersecurity platform — No external APIs
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-6xl md:text-7xl font-black leading-tight mb-6"
                    >
                        Detect Phishing
                        <br />
                        <span className="gradient-text">Before It's Too Late</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        PhishGuard AI uses machine learning to instantly analyze URLs and emails for phishing threats.
                        Get confidence scores, risk levels, and detailed explanations — all powered by on-device ML models.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link to="/register" className="btn-primary text-base py-4 px-8 inline-flex items-center gap-2 justify-center">
                            Start Detecting Free <ChevronRight className="w-5 h-5" />
                        </Link>
                        <Link to="/login" className="btn-ghost text-base py-4 px-8 inline-flex items-center gap-2 justify-center">
                            Sign In to Dashboard
                        </Link>
                    </motion.div>
                </div>

                {/* Hero visual — fake scan result card */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="max-w-2xl mx-auto mt-16"
                >
                    <div className="card gradient-border p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs text-gray-500 font-mono mb-1">SCAN RESULT</p>
                                <p className="text-sm text-gray-300 font-mono truncate max-w-xs">http://paypal-verify.tk/login?id=123</p>
                            </div>
                            <span className="risk-badge-high">🚨 PHISHING</span>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-gray-400">Confidence</span>
                                <span className="text-red-400 font-bold">94.7%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '94.7%' }}
                                    transition={{ duration: 1.2, delay: 1 }}
                                    className="h-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-400"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            {[
                                '🚨 URL contains a raw IP-like domain structure',
                                '⚠️ URL does not use HTTPS encryption',
                                '🔑 Suspicious keywords: verify, login, paypal',
                                '🌐 Suspicious TLD detected (.tk)',
                            ].map((r, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 + i * 0.15 }}
                                    className="text-xs text-gray-400"
                                >
                                    {r}
                                </motion.p>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Stats */}
            <section className="relative z-10 py-16 px-6 border-y border-white/5">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                    {stats.map((s, i) => (
                        <motion.div key={i} variants={itemVariants} className="text-center">
                            <p className="text-4xl font-black gradient-text mb-2">{s.value}</p>
                            <p className="text-sm text-gray-500">{s.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Features */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Everything you need to stay <span className="gradient-text">protected</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Built with production-grade ML models and a modern tech stack for real cybersecurity applications.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((f, i) => (
                            <motion.div key={i} variants={itemVariants} className="glass-hover rounded-2xl p-6 group">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <f.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 py-24 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center card gradient-border relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10" />
                    <div className="relative z-10">
                        <Shield className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-float" />
                        <h2 className="text-4xl font-bold mb-4">Start protecting yourself today</h2>
                        <p className="text-gray-400 mb-8">Free to use. No credit card required. Powered by local ML models.</p>
                        <div className="flex items-center justify-center gap-3 mb-6">
                            {['No External APIs', 'Real ML Models', 'Instant Analysis'].map((t) => (
                                <div key={t} className="flex items-center gap-1.5 text-sm text-emerald-400">
                                    <CheckCircle className="w-4 h-4" /> {t}
                                </div>
                            ))}
                        </div>
                        <Link to="/register" className="btn-primary text-base py-4 px-10 inline-flex items-center gap-2">
                            Create Free Account <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center text-gray-600 text-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="gradient-text font-bold">PhishGuard AI</span>
                </div>
                <p>AI-Powered Phishing Detection Platform — Built with FastAPI + React + Scikit-learn</p>
            </footer>
        </div>
    )
}
