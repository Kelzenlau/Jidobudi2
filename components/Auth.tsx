import React, { useState, useContext } from 'react';
import { User, Mail, Lock, ArrowRight, Zap, Cpu, Scan, Atom } from 'lucide-react';
import { signInAnonymously, signInWithCustomToken, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '../services/firebase';
import { JidoBudiLogo } from './Layout';
import { LanguageContext } from '../LanguageContext';
import { UserProfile } from '../types';

const hashPassword = async (string: string) => {
    const msgBuffer = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const LoginPage = ({ setUser }: { setUser: (u: UserProfile) => void }) => {
    const { t, language, setLanguage } = useContext(LanguageContext);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // --- 1. ADMIN BYPASS (Hardcoded for Demo) ---
        if (isLogin && name.toLowerCase() === 'admin') {
             if (password === 'admin123') {
                setTimeout(() => {
                    const adminUser: UserProfile = { 
                        uid: 'admin-demo-uid', 
                        displayName: 'Admin', 
                        role: 'admin', 
                        email: 'admin@jidobudi.com', 
                        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin` 
                    };
                    setUser(adminUser);
                }, 800);
                return;
            } else {
                setError(t('error_wrong_password'));
                setIsLoading(false);
                return;
            }
        }

        // --- 2. REGULAR USER FLOW ---
        try {
            if (!auth.currentUser) {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            }

            const accountId = btoa(name.toLowerCase().trim());
            const accountRef = doc(db, 'artifacts', appId, 'public', 'data', 'accounts', accountId);

            if (isLogin) {
                const accountSnap = await getDoc(accountRef);
                if (!accountSnap.exists()) throw new Error("USER_NOT_FOUND");
                const accountData = accountSnap.data();
                const hashedPassword = await hashPassword(password);
                if (accountData.password !== hashedPassword) throw new Error("WRONG_PASSWORD");
                
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { displayName: accountData.name, photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${accountData.name}` });
                    setUser({ ...auth.currentUser, displayName: accountData.name, email: accountData.email, role: 'user' } as any);
                }
            } else {
                const accountSnap = await getDoc(accountRef);
                if (accountSnap.exists()) throw new Error("USER_EXISTS");
                const hashedPassword = await hashPassword(password);
                await setDoc(accountRef, { name: name, email: email || '', password: hashedPassword, createdAt: new Date() });
                
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { displayName: name, photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` });
                    setUser({ ...auth.currentUser, displayName: name, email: email || '', role: 'user' } as any);
                }
            }
        } catch (err: any) { 
            console.warn("Auth failed/Backend unavailable. Switching to Offline Mode.", err);
            
            if (err.message === "USER_NOT_FOUND") { setError(t('error_user_not_found')); setIsLoading(false); return; }
            if (err.message === "WRONG_PASSWORD") { setError(t('error_wrong_password')); setIsLoading(false); return; }
            if (err.message === "USER_EXISTS") { setError(t('error_user_exists')); setIsLoading(false); return; }

            // --- 3. FALLBACK: OFFLINE USER LOGIN ---
            setTimeout(() => {
                const demoUser: UserProfile = {
                    uid: 'guest-' + Math.random().toString(36).substr(2, 9),
                    displayName: name || 'Guest Gamer',
                    email: email || 'guest@demo.com',
                    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'Guest'}`,
                    role: 'user',
                    joinedAt: new Date()
                };
                setUser(demoUser);
            }, 800);
        }
    };

    return (
        <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-white">
            <style>{`
                /* Advanced Animations */
                @keyframes float-slow { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
                @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                
                .quantum-card {
                    background: rgba(10, 10, 20, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 0 40px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.5);
                }
                
                .quantum-input-group:focus-within .quantum-border {
                    width: 100%;
                    box-shadow: 0 0 15px #22d3ee;
                }
                
                .quantum-btn {
                    background: linear-gradient(90deg, #0891b2, #4f46e5);
                    position: relative;
                    z-index: 1;
                    overflow: hidden;
                }
                .quantum-btn::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(90deg, #4f46e5, #0891b2);
                    z-index: -1;
                    transition: opacity 0.3s;
                    opacity: 0;
                }
                .quantum-btn:hover::before { opacity: 1; }
            `}</style>
            
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 {/* Orbs */}
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-[float-slow_8s_ease-in-out_infinite]"></div>
                 <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] animate-[float-slow_10s_ease-in-out_infinite_reverse]"></div>
                 
                 {/* Particles */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin-slow_20s_linear_infinite]"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin-reverse_15s_linear_infinite]"></div>
            </div>

            {/* Login Container */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8 relative group cursor-default">
                    <div className="relative inline-block mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[360deg]">
                        <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full"></div>
                        <JidoBudiLogo className="relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        <Atom className="absolute -top-4 -right-4 text-cyan-400 animate-[spin-slow_4s_linear_infinite]" size={32} />
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] tracking-tight">
                        {t('login_welcome')}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-cyan-200/60 text-xs font-bold tracking-[0.2em] mt-2 uppercase">
                        <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-cyan-500"></span>
                        SYSTEM ACCESS
                        <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-cyan-500"></span>
                    </div>
                </div>

                {/* Card */}
                <div className="quantum-card rounded-2xl overflow-hidden relative">
                    {/* Scanning Line Effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-b from-transparent via-cyan-500 to-transparent h-[10%] w-full animate-[scanline_3s_linear_infinite]"></div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/5 bg-black/20">
                        <button onClick={() => {setIsLogin(true); setError('');}} className={`flex-1 py-4 text-sm font-bold tracking-wider transition-all relative ${isLogin ? 'text-cyan-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                            {t('login_btn')}
                            {isLogin && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>}
                        </button>
                        <button onClick={() => {setIsLogin(false); setError('');}} className={`flex-1 py-4 text-sm font-bold tracking-wider transition-all relative ${!isLogin ? 'text-purple-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                            {t('signup_btn')}
                            {!isLogin && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                         {/* Inputs with Quantum Styling */}
                         <div className="space-y-5">
                            <div className="quantum-input-group relative">
                                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1 block pl-1">ID</label>
                                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-lg overflow-hidden group focus-within:bg-black/60 transition-colors">
                                    <div className="pl-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors"><User size={18} /></div>
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border-none text-white px-4 py-3 focus:ring-0 placeholder-slate-600 text-sm font-medium tracking-wide" placeholder="Enter ID..." />
                                </div>
                                <div className="quantum-border absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-cyan-500 w-0 transition-all duration-300"></div>
                            </div>

                            {!isLogin && (
                                <div className="quantum-input-group relative animate-in slide-in-from-right fade-in">
                                    <label className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1 block pl-1">EMAIL</label>
                                    <div className="relative flex items-center bg-black/40 border border-white/10 rounded-lg overflow-hidden group focus-within:bg-black/60 transition-colors">
                                        <div className="pl-4 text-slate-500 group-focus-within:text-purple-400 transition-colors"><Mail size={18} /></div>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-none text-white px-4 py-3 focus:ring-0 placeholder-slate-600 text-sm font-medium tracking-wide" placeholder="user@net.com" />
                                    </div>
                                    <div className="quantum-border absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-purple-500 w-0 transition-all duration-300"></div>
                                </div>
                            )}

                            <div className="quantum-input-group relative">
                                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1 block pl-1">PASSWORD</label>
                                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-lg overflow-hidden group focus-within:bg-black/60 transition-colors">
                                    <div className="pl-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors"><Lock size={18} /></div>
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-none text-white px-4 py-3 focus:ring-0 placeholder-slate-600 text-sm font-medium tracking-wide" placeholder="••••••••" />
                                </div>
                                <div className="quantum-border absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-cyan-500 w-0 transition-all duration-300"></div>
                            </div>
                         </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-3 animate-bounce">
                                <div className="bg-red-500/20 p-1 rounded-full text-red-400"><Zap size={14} /></div>
                                <p className="text-red-300 text-xs font-bold tracking-wide">{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="quantum-btn w-full py-4 rounded-xl text-white font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group">
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2"><Scan className="animate-spin" size={18} /> Authenticating...</span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {isLogin ? 'LOGIN' : 'REGISTER'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer / Languages */}
                    <div className="bg-black/40 p-4 border-t border-white/5 flex justify-between items-center px-8">
                         <div className="flex gap-4">
                            {['en', 'ms', 'zh'].map((lang) => (
                                <button key={lang} onClick={() => setLanguage(lang)} className={`text-[10px] font-bold uppercase transition-colors ${language === lang ? 'text-cyan-400 shadow-[0_2px_10px_rgba(34,211,238,0.4)]' : 'text-slate-600 hover:text-slate-400'}`}>
                                    {lang === 'en' ? 'ENG' : lang === 'ms' ? 'MAY' : 'CHN'}
                                </button>
                            ))}
                         </div>
                         <div className="text-[10px] text-slate-600 font-mono">V.1.0.42</div>
                    </div>
                </div>
            </div>
        </div>
    );
};