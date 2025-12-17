import React, { useState, useContext } from 'react';
import { User, Mail, Lock, ArrowRight, Zap, Cpu, Scan, Atom, Code } from 'lucide-react';
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
                /* Advanced Quantum Animations */
                @keyframes orbit-cw { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes orbit-ccw { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
                @keyframes pulse-core { 0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 40px #22d3ee; } 50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 80px #a855f7; } }
                @keyframes particle-float { 0%, 100% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: translateY(-100px); opacity: 0; } }

                .quantum-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(34, 211, 238, 0.3);
                    box-shadow: 0 0 15px rgba(34, 211, 238, 0.1);
                }
                
                .electron {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 10px; height: 10px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 0 20px #fff, 0 0 40px #22d3ee;
                }

                .quantum-core {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px; height: 100px;
                    background: radial-gradient(circle, #fff, #22d3ee, transparent);
                    border-radius: 50%;
                    filter: blur(10px);
                    animation: pulse-core 4s infinite ease-in-out;
                    z-index: 0;
                }
                
                .login-card {
                    background: rgba(10, 15, 30, 0.75);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 80px rgba(0, 0, 0, 0.6);
                }

                .input-field {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                .input-field:focus-within {
                    border-color: #22d3ee;
                    box-shadow: 0 0 20px rgba(34, 211, 238, 0.2);
                    background: rgba(0, 0, 0, 0.6);
                }
            `}</style>
            
            {/* Immersive Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-[#02040a] to-[#000]"></div>
                 
                 {/* Quantum Structure */}
                 <div className="relative w-[800px] h-[800px] opacity-30">
                     <div className="quantum-core"></div>
                     {/* Rings */}
                     <div className="quantum-ring w-[300px] h-[300px] top-[250px] left-[250px] animate-[orbit-cw_10s_linear_infinite] border-cyan-500/40">
                         <div className="electron" style={{top: '-5px', left: '50%'}}></div>
                     </div>
                     <div className="quantum-ring w-[500px] h-[500px] top-[150px] left-[150px] animate-[orbit-ccw_15s_linear_infinite] border-purple-500/30">
                         <div className="electron" style={{top: '50%', left: '-5px', backgroundColor: '#d8b4fe', boxShadow: '0 0 20px #a855f7'}}></div>
                     </div>
                     <div className="quantum-ring w-[700px] h-[700px] top-[50px] left-[50px] animate-[orbit-cw_25s_linear_infinite] border-blue-500/20">
                         <div className="electron" style={{bottom: '-5px', left: '50%'}}></div>
                     </div>
                 </div>

                 {/* Floating Particles */}
                 {[...Array(30)].map((_, i) => (
                     <div key={i} className="absolute bg-cyan-400 rounded-full blur-[1px]" style={{
                         top: `${Math.random() * 100}%`,
                         left: `${Math.random() * 100}%`,
                         width: `${Math.random() * 2 + 1}px`,
                         height: `${Math.random() * 2 + 1}px`,
                         animation: `particle-float ${3 + Math.random() * 5}s infinite linear`,
                         animationDelay: `${Math.random() * 5}s`
                     }}></div>
                 ))}
            </div>

            {/* Login Container */}
            <div className="relative z-10 w-full max-w-md perspective-[1000px]">
                {/* Header */}
                <div className="text-center mb-10 relative group">
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-cyan-500/40 blur-3xl rounded-full animate-pulse"></div>
                        <JidoBudiLogo className="relative z-10 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] transform group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                        {t('login_welcome')}
                    </h1>
                </div>

                {/* Card */}
                <div className="login-card rounded-3xl overflow-hidden relative transform transition-transform hover:scale-[1.01] duration-500">
                    
                    {/* Tabs */}
                    <div className="flex border-b border-white/5 bg-black/20">
                        <button onClick={() => {setIsLogin(true); setError('');}} className={`flex-1 py-5 text-sm font-bold tracking-widest uppercase transition-all relative group ${isLogin ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <span className="relative z-10">{t('login_btn')}</span>
                            {isLogin && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-cyan-500 shadow-[0_0_20px_#22d3ee]"></div>}
                        </button>
                        <button onClick={() => {setIsLogin(false); setError('');}} className={`flex-1 py-5 text-sm font-bold tracking-widest uppercase transition-all relative group ${!isLogin ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <span className="relative z-10">{t('signup_btn')}</span>
                            {!isLogin && <div className="absolute inset-x-0 bottom-0 h-[2px] bg-purple-500 shadow-[0_0_20px_#a855f7]"></div>}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                         <div className="space-y-5">
                            <div className="input-field rounded-2xl flex items-center p-1 group">
                                <div className="p-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors"><User size={20} /></div>
                                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border-none text-white px-3 py-3 focus:ring-0 placeholder-slate-600 text-sm font-bold tracking-wider outline-none" placeholder="USERNAME" />
                            </div>

                            {!isLogin && (
                                <div className="input-field rounded-2xl flex items-center p-1 group animate-in slide-in-from-right fade-in duration-300">
                                    <div className="p-3 text-slate-500 group-focus-within:text-purple-400 transition-colors"><Mail size={20} /></div>
                                    <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-none text-white px-3 py-3 focus:ring-0 placeholder-slate-600 text-sm font-bold tracking-wider outline-none" placeholder="EMAIL ADDRESS" />
                                </div>
                            )}

                            <div className="input-field rounded-2xl flex items-center p-1 group">
                                <div className="p-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors"><Lock size={20} /></div>
                                <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-none text-white px-3 py-3 focus:ring-0 placeholder-slate-600 text-sm font-bold tracking-wider outline-none" placeholder="PASSWORD" />
                            </div>
                         </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                                <Zap size={16} className="text-red-400" />
                                <p className="text-red-300 text-xs font-bold tracking-wide uppercase">{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl font-black tracking-[0.2em] uppercase text-white shadow-lg transform transition-all active:scale-[0.98] relative overflow-hidden group bg-slate-900 border border-white/10">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <span className="relative flex items-center justify-center gap-3 z-10">
                                {isLoading ? (
                                    <><Atom className="animate-spin" size={20} /> ACCESSING...</>
                                ) : (
                                    <>{isLogin ? 'ENTER SYSTEM' : 'INITIALIZE'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="bg-black/40 p-4 border-t border-white/5 flex justify-between items-center px-8">
                         <div className="flex gap-4">
                            {['en', 'ms', 'zh'].map((lang) => (
                                <button key={lang} onClick={() => setLanguage(lang)} className={`text-[10px] font-bold uppercase transition-all hover:scale-110 ${language === lang ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-slate-600 hover:text-white'}`}>
                                    {lang === 'en' ? 'ENG' : lang === 'ms' ? 'MAY' : 'CHN'}
                                </button>
                            ))}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] text-green-500 font-mono">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                             ONLINE
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};