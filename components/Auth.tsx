import React, { useState, useContext } from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { signInAnonymously, signInWithCustomToken, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, appId } from '../services/firebase';
import { JidoBudiLogo } from './Layout';
import { LanguageContext } from '../App';
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
        <div className="min-h-screen bg-[#0f0c29] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] z-0"></div>
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8"><div className="inline-block bg-white/5 p-4 rounded-3xl backdrop-blur-sm mb-4"><JidoBudiLogo className="transform scale-100" /></div><h1 className="text-3xl font-black text-white mb-2">{t('login_welcome')}</h1><p className="text-slate-300">{t('login_subtitle')}</p></div>
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                     <div className="p-1 bg-slate-100 m-6 mb-2 rounded-xl flex"><button onClick={() => {setIsLogin(true); setError('');}} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('login_btn')}</button><button onClick={() => {setIsLogin(false); setError('');}} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('signup_btn')}</button></div>
                    <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('enter_username')}</label><div className="relative"><User className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={18} /><input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={isLogin ? "Username (ID)" : "Create Username (ID)"} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"/></div></div>
                        {!isLogin && (<div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('enter_email')} <span className="text-slate-400 font-normal normal-case">(Optional)</span></label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For recovery (optional)" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"/></div></div>)}
                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">{t('enter_password')}</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={18} /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"/></div></div>
                        {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group">{isLoading ? t('processing') : (<span className="flex items-center">{isLogin ? t('login_btn') : t('signup_btn')} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>)}</button>
                    </form>
                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center gap-4"><button onClick={() => setLanguage('en')} className={`text-xs font-bold ${language === 'en' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>English</button><button onClick={() => setLanguage('ms')} className={`text-xs font-bold ${language === 'ms' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Bahasa Melayu</button><button onClick={() => setLanguage('zh')} className={`text-xs font-bold ${language === 'zh' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>中文</button></div>
                </div>
            </div>
        </div>
    );
};