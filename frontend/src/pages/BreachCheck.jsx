import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Search, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { detectAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function BreachCheck() {
    const { user } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleCheck = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setResult(null);
        try {
            const res = await detectAPI.checkBreach(email);
            setResult(res.data);
            if (res.data.breached) {
                toast.error('Oh no! Breaches found.', { icon: '🚨' });
            } else {
                toast.success('Clean record! No breaches found.', { icon: '🛡️' });
            }
        } catch (error) {
            toast.error('Failed to check breach status');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-950 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                            Identity Breach Scanner
                        </h1>
                        <p className="text-gray-400 mt-2">Check if your email has been exposed in known data breaches.</p>
                    </header>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <form onSubmit={handleCheck} className="gradient-border p-8 rounded-2xl bg-white/5 backdrop-blur-xl space-y-4">
                                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-12"
                                        placeholder="Enter email to check..."
                                        required
                                    />
                                    <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Scan Now'}
                                </button>
                            </form>

                            <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <h3 className="text-blue-400 font-semibold mb-2">Did you know?</h3>
                                <p className="text-sm text-blue-200/80">
                                    Data breaches expose millions of records annually. Use unique passwords and 2FA to stay safe even if your email is leaked.
                                </p>
                            </div>
                        </div>

                        <div className="min-h-[300px] flex flex-col">
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex-1 p-8 rounded-2xl border ${result.breached
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : 'bg-emerald-500/10 border-emerald-500/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        {result.breached ? (
                                            <ShieldAlert className="w-16 h-16 text-red-500" />
                                        ) : (
                                            <ShieldCheck className="w-16 h-16 text-emerald-500" />
                                        )}
                                        <div>
                                            <h2 className={`text-2xl font-bold ${result.breached ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {result.breached ? 'Breaches Found' : 'Secure Status'}
                                            </h2>
                                            <p className="text-gray-400">
                                                {result.breached
                                                    ? `This email appears in ${result.breaches.length} data breach(es).`
                                                    : 'This email does not appear in known breaches.'}
                                            </p>
                                        </div>
                                    </div>

                                    {result.breached && (
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {result.breaches.map((breach, idx) => (
                                                <div key={idx} className="p-4 bg-black/20 rounded-lg border border-red-500/20">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-red-200">{breach.Name}</h4>
                                                        <span className="text-xs text-red-400 border border-red-500/30 px-2 py-1 rounded">
                                                            {breach.BreachDate}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: breach.Description }} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {!result && !loading && (
                                <div className="flex-1 flex flex-col justify-center items-center text-gray-500 p-8 border border-white/5 rounded-2xl bg-white/5">
                                    <Search className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Enter an email to check against the database</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
