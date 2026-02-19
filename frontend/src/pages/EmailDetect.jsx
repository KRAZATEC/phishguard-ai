import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Search, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { detectAPI } from '../services/api'
import toast from 'react-hot-toast'

function ResultCard({ result }) {
    const isPhishing = result.prediction === 'Phishing'
    const barColor = isPhishing ? 'from-red-600 to-rose-500' : 'from-emerald-600 to-teal-500'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`card gradient-border relative overflow-hidden mt-6 ${isPhishing ? 'border-red-500/20 bg-red-500/5' : 'border-emerald-500/20 bg-emerald-500/5'
                }`}
        >
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {isPhishing
                            ? <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
                            : <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-400" /></div>
                        }
                        <div>
                            <p className={`text-2xl font-black ${isPhishing ? 'text-red-400' : 'text-emerald-400'}`}>{result.prediction}</p>
                            <p className="text-xs text-gray-500">AI Email Analysis</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${result.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            result.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                        {result.risk_level} Risk
                    </span>
                </div>

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
                            className={`h-3 rounded-full bg-gradient-to-r ${barColor}`}
                        />
                    </div>
                </div>

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
                                className="text-sm text-gray-300 p-2.5 rounded-xl bg-white/3 border border-white/5"
                            >
                                {reason}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

const PHISHING_EXAMPLE = {
    subject: 'URGENT: Your account has been suspended',
    body: `Dear valued customer,

We detected unusual activity on your account and it has been temporarily suspended for security reasons.

To restore access immediately, please verify your credentials by clicking the link below and entering your password and credit card information.

You must act within 24 hours or your account will be permanently deleted.

Click here to verify: http://bank-secure-verify.tk/login?id=12345

Thank you,
Security Team`,
}

const SAFE_EXAMPLE = {
    subject: 'Your monthly newsletter - Tech Trends',
    body: `Hello!

Here's what's new in tech this month:

- Python 3.13 is out with major performance improvements
- React 19 introduces the new compiler for automatic memoization
- FastAPI 0.110 adds improved OpenAPI schema generation

Check out the full issue on our website at https://newsletter.example.com

Best wishes,
The Tech Newsletter Team`,
}

export default function EmailDetect() {
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleAnalyze = async () => {
        if (!body.trim()) { toast.error('Please enter email body content'); return }
        setLoading(true)
        setResult(null)
        try {
            const res = await detectAPI.predictEmail(subject, body)
            setResult(res.data)
            if (res.data.prediction === 'Phishing') {
                toast.error('⚠️ Phishing email detected!')
            } else {
                toast.success('✅ Email appears legitimate')
            }
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Analysis failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const loadExample = (example) => {
        setSubject(example.subject)
        setBody(example.body)
        setResult(null)
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-6 lg:p-8">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Email Phishing Scanner</h1>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Paste an email subject and body to detect phishing using TF-IDF + Random Forest AI.
                    </p>
                </motion.div>

                {/* Example buttons */}
                <div className="flex gap-3 mb-6">
                    <button onClick={() => loadExample(PHISHING_EXAMPLE)}
                        className="text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                        🎣 Load Phishing Example
                    </button>
                    <button onClick={() => loadExample(SAFE_EXAMPLE)}
                        className="text-xs px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                        ✅ Load Safe Example
                    </button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                    <div className="card gradient-border space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Subject (optional)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    placeholder="e.g. URGENT: Your account has been suspended"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-400">Email Body</label>
                                <span className="text-xs text-gray-600">{body.length} chars</span>
                            </div>
                            <textarea
                                className="input-field min-h-[200px] resize-y font-mono text-sm leading-relaxed"
                                placeholder="Paste the full email body here..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Running NLP Analysis...
                                </>
                            ) : (
                                <><Search className="w-5 h-5" /> Analyze Email</>
                            )}
                        </button>

                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: `${i * 0.2}s` }} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-cyan-300">
                                            Running TF-IDF vectorization and Random Forest classification...
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {result && <ResultCard result={result} />}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    )
}
