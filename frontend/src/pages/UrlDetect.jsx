import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Search, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { detectAPI } from '../services/api'
import toast from 'react-hot-toast'

function ResultCard({ result }) {
    const isPhishing = result.prediction === 'Phishing'

    const riskColor = {
        High: 'text-red-400',
        Medium: 'text-yellow-400',
        Low: 'text-emerald-400',
    }[result.risk_level] || 'text-gray-400'

    const barColor = isPhishing
        ? 'from-red-600 to-rose-500'
        : 'from-emerald-600 to-teal-500'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`card gradient-border relative overflow-hidden mt-6 ${isPhishing
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-emerald-500/20 bg-emerald-500/5'
                }`}
        >
            {/* Glow overlay */}
            <div className={`absolute inset-0 ${isPhishing ? 'bg-red-500/3' : 'bg-emerald-500/3'}`} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {isPhishing
                            ? <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
                            : <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-400" /></div>
                        }
                        <div>
                            <p className={`text-2xl font-black ${isPhishing ? 'text-red-400' : 'text-emerald-400'}`}>
                                {result.prediction}
                            </p>
                            <p className="text-xs text-gray-500">AI Detection Result</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${result.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            result.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                        {result.risk_level} Risk
                    </span>
                </div>

                {/* Confidence meter */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Confidence Score</span>
                        <span className={`text-xl font-black ${isPhishing ? 'text-red-400' : 'text-emerald-400'}`}>
                            {result.confidence}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className={`h-3 rounded-full bg-gradient-to-r ${barColor} shadow-lg`}
                        />
                    </div>
                </div>

                {/* Reasons */}
                <div>
                    <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-gray-500" /> AI Explanation
                    </p>
                    <div className="space-y-2">
                        {result.reasons.map((reason, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-start gap-2 text-sm text-gray-300 p-2.5 rounded-xl bg-white/3 border border-white/5"
                            >
                                <span>{reason}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default function UrlDetect() {
    const [url, setUrl] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleAnalyze = async () => {
        if (!url.trim()) { toast.error('Please enter a URL to analyze'); return }
        setLoading(true)
        setResult(null)
        try {
            const res = await detectAPI.predictUrl(url.trim())
            setResult(res.data)
            if (res.data.prediction === 'Phishing') {
                toast.error('⚠️ Phishing URL detected!')
            } else {
                toast.success('✅ URL appears safe')
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Analysis failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAnalyze()
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6 lg:p-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">URL Phishing Scanner</h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-13">
                        Paste any URL below to analyze it for phishing using our ML model.
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                    {/* Input */}
                    <div className="card gradient-border">
                        <label className="block text-sm font-medium text-gray-400 mb-3">URL to Analyze</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="url"
                                    className="input-field pl-10"
                                    placeholder="https://example.com or http://suspicious-link.tk"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading}
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="btn-primary flex items-center gap-2 whitespace-nowrap"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                                ) : (
                                    <><Search className="w-4 h-4" />Analyze</>
                                )}
                            </button>
                        </div>

                        {/* Loading state */}
                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: `${i * 0.2}s` }} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-purple-300">
                                            Extracting URL features and running ML analysis...
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Example URLs */}
                    <div className="mt-4">
                        <p className="text-xs text-gray-600 mb-2">Try these examples:</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'http://paypal-verify.tk/login?id=123',
                                'https://github.com/openai',
                                'http://192.168.1.1/banking/login',
                                'https://www.google.com',
                            ].map((example) => (
                                <button
                                    key={example}
                                    onClick={() => setUrl(example)}
                                    className="text-xs px-3 py-1.5 rounded-lg glass border border-white/10 text-gray-400
                             hover:text-white hover:border-purple-500/30 transition-all font-mono"
                                >
                                    {example.length > 40 ? example.slice(0, 40) + '...' : example}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Result */}
                    <AnimatePresence>
                        {result && <ResultCard result={result} />}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    )
}
