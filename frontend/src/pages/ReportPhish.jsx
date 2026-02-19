import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Flag, Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { detectAPI } from '../services/api';
import { toast } from 'react-hot-toast';

export default function ReportPhish() {
    const [url, setUrl] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await detectAPI.reportPhishing({ url, description: desc });
            setSuccess(true);
            toast.success('Report submitted successfully!');
            setUrl('');
            setDesc('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            toast.error('Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-950 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            Report Phishing
                        </h1>
                        <p className="text-gray-400 mt-2">Help the community by flagging suspicious websites.</p>
                    </header>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="gradient-border p-8 rounded-2xl bg-white/5 backdrop-blur-xl"
                    >
                        {success ? (
                            <div className="text-center py-12">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <Flag className="w-10 h-10 text-emerald-400" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                                <p className="text-gray-400">Your report has been received and will help train our AI.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Suspicious URL</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="input-field pl-12"
                                            placeholder="https://suspected-phishing-site.com"
                                            required
                                        />
                                        <LinkIcon className="absolute left-4 top-3.5 text-gray-500" size={20} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                                    <div className="relative">
                                        <textarea
                                            value={desc}
                                            onChange={(e) => setDesc(e.target.value)}
                                            className="input-field pl-12 min-h-[120px]"
                                            placeholder="How did you find this link? Email, SMS, etc."
                                        />
                                        <AlertTriangle className="absolute left-4 top-3.5 text-gray-500" size={20} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Submit Report'}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    <div className="text-center text-sm text-gray-500">
                        Reports are manually reviewed and added to our dataset to improve detection accuracy.
                    </div>
                </div>
            </main>
        </div>
    );
}
