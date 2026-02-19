import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle, XCircle, ArrowRight, RefreshCcw } from 'lucide-react';

const questions = [
    {
        text: "You receive an email from 'support@netflix-verify.com' claiming your payment failed. What should you do?",
        options: [
            "Click the link and update payment",
            "Ignore it, it's likely a scam",
            "Reply with your credit card details"
        ],
        correct: 1,
        explanation: "Netflix emails come from @netflix.com. 'netflix-verify.com' is a look-alike domain."
    },
    {
        text: "Which of these URL prefixes is safest for entering personal data?",
        options: [
            "http://",
            "ftp://",
            "https://"
        ],
        correct: 2,
        explanation: "HTTPS encrypts your data. HTTP sends it in plain text."
    },
    {
        text: "A URL shortener (bit.ly) hides the destination. How can you check where it goes safely?",
        options: [
            "Click it to find out",
            "Use a URL expander tool",
            "Guess based on the context"
        ],
        correct: 1,
        explanation: "Tools like checkshorturl.com show the destination without visiting it."
    },
    {
        text: "Your boss emails you from 'cee-o-company@gmail.com' asking for urgent gift cards. This is example of:",
        options: [
            "Spear Phishing / CEO Fraud",
            "Bulk Spam",
            "A generous boss"
        ],
        correct: 0,
        explanation: "CEO Fraud targets employees by impersonating executives using personal emails."
    },
    {
        text: "An attachment named 'Invoice.pdf.exe' is attached to an email. Is it safe?",
        options: [
            "Yes, it's a PDF",
            "No, it's an executable file masking as a PDF",
            "Yes, if I have antivirus"
        ],
        correct: 1,
        explanation: "Windows hides extensions by default. 'pdf.exe' is an executable program, likely malware."
    }
];

export default function Quiz() {
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState(false);

    const handleAnswer = (index) => {
        setSelected(index);
        setAnswered(true);
        if (index === questions[current].correct) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (current + 1 < questions.length) {
            setCurrent(current + 1);
            setSelected(null);
            setAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const restart = () => {
        setCurrent(0);
        setScore(0);
        setShowResult(false);
        setSelected(null);
        setAnswered(false);
    };

    return (
        <div className="flex bg-gray-950 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-8">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                            Phishing IQ Quiz
                        </h1>
                        <p className="text-gray-400 mt-2">Test your knowledge against common cyber threats.</p>
                    </header>

                    <AnimatePresence mode='wait'>
                        {showResult ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="gradient-border p-8 rounded-2xl bg-white/5 backdrop-blur-xl text-center"
                            >
                                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
                                <p className="text-xl text-gray-300 mb-6">You scored <span className="text-purple-400 font-bold">{score} / {questions.length}</span></p>

                                <div className="flex justify-center">
                                    <button onClick={restart} className="btn-primary flex items-center gap-2">
                                        <RefreshCcw size={20} /> Try Again
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="gradient-border p-8 rounded-2xl bg-white/5 backdrop-blur-xl"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-400 text-sm">Question {current + 1} / {questions.length}</span>
                                    <span className="text-purple-400 font-semibold">Score: {score}</span>
                                </div>

                                <h3 className="text-2xl font-semibold text-white mb-6">{questions[current].text}</h3>

                                <div className="space-y-4">
                                    {questions[current].options.map((opt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => !answered && handleAnswer(index)}
                                            disabled={answered}
                                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center
                        ${answered
                                                    ? index === questions[current].correct
                                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                                        : index === selected
                                                            ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                                            : 'bg-white/5 border-white/10 text-gray-400 opacity-50'
                                                    : selected === index
                                                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30'
                                                }
                      `}
                                        >
                                            {opt}
                                            {answered && index === questions[current].correct && <CheckCircle className="text-emerald-400" size={20} />}
                                            {answered && index === selected && index !== questions[current].correct && <XCircle className="text-red-400" size={20} />}
                                        </button>
                                    ))}
                                </div>

                                {answered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 pt-6 border-t border-white/10"
                                    >
                                        <p className="text-gray-300 mb-4"><span className="font-semibold text-purple-400">Explanation:</span> {questions[current].explanation}</p>
                                        <div className="flex justify-end">
                                            <button onClick={nextQuestion} className="btn-primary flex items-center gap-2">
                                                Next Question <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
