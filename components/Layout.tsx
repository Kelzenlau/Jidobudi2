import React, { useState, useEffect, useContext } from 'react';
import { Menu, X, Home, Package, Gamepad2, Trophy, Users, Shield, LogOut, Globe, MessageCircle, Megaphone, Instagram } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { UserProfile } from '../types';
import { DEFAULT_ANNOUNCEMENT } from '../constants';
import { LanguageContext } from '../LanguageContext';

export const JidoBudiLogo = ({ className }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        <circle cx="60" cy="60" r="48" fill="none" stroke="#FDE047" strokeWidth="4" />
        <circle cx="60" cy="60" r="42" fill="none" stroke="#60A5FA" strokeWidth="4" />
        <circle cx="60" cy="60" r="36" fill="#000000" />
        <g transform="translate(45, 30)">
           <path d="M0 5 L5 0 L35 0 L35 48 L30 53 L0 53 Z" fill="#374151" transform="translate(-4, 2)" />
           <rect x="0" y="0" width="30" height="50" rx="3" fill="#F87171" stroke="#374151" strokeWidth="0.5" />
           <rect x="4" y="4" width="22" height="28" rx="1" fill="#111" />
           <path d="M4 4 L26 4 L4 26 Z" fill="white" opacity="0.15" />
           <path d="M10 10 L20 10 L10 20 Z" fill="white" opacity="0.1" />
           <rect x="23" y="34" width="4" height="12" rx="0.5" fill="#374151" opacity="0.4" />
           <circle cx="25" cy="36" r="0.5" fill="white" />
           <circle cx="25" cy="38" r="0.5" fill="white" />
           <circle cx="25" cy="40" r="0.5" fill="white" />
           <rect x="4" y="38" width="16" height="6" rx="1" fill="#7F1D1D" />
        </g>
      </svg>
      <div className="-mt-2"><span className="font-bold text-2xl leading-none tracking-tight" style={{ fontFamily: 'Arial Rounded MT Bold, ui-rounded, system-ui, sans-serif', color: '#60A5FA', textShadow: '0px 0px 0px rgba(0,0,0,0)' }}>JIDO BUDI</span></div>
  </div>
);

export const AnnouncementBar = () => {
    const [config, setConfig] = useState(DEFAULT_ANNOUNCEMENT);
    useEffect(() => { 
        const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'announcement'), (d) => { if(d.exists()) setConfig(d.data() as any); }); 
        return () => unsub();
    }, []);
    if (!config.active || !config.text) return null;
    return ( <div className={`${config.color || 'bg-blue-600'} text-white px-4 py-2 text-center text-sm font-bold animate-in slide-in-from-top duration-300 relative z-50`}><div className="flex items-center justify-center gap-2"><Megaphone size={16} className="animate-bounce" /><span>{config.text}</span></div></div>);
};

export const WhatsAppFloat = () => (
    <a href="https://wa.me/60149877462" target="_blank" rel="noreferrer" className="fixed bottom-28 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 border-4 border-white/20 animate-bounce-slow" title="Chat on WhatsApp">
        <MessageCircle size={28} />
    </a>
);

interface NavbarProps {
  onOpenAuth: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Navbar = ({ onOpenAuth, user, onLogout, activePage, setActivePage }: NavbarProps) => {
  const { language, setLanguage, t } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const NavLink = ({ page, label, icon: Icon }: { page: string; label: string; icon?: any }) => (
    <button onClick={() => setActivePage(page)} className={`flex items-center gap-2 font-medium text-sm transition-colors ${activePage === page ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );

  return (
    <nav className="fixed top-0 w-full z-50 px-6 h-12 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex items-center">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center h-full">
        <div className="flex items-center -ml-4 h-full"><button onClick={() => setActivePage('home')} className="p-1 hover:bg-white/10 transition-colors rounded-2xl flex items-center h-full"><JidoBudiLogo className="transform scale-[0.3] origin-left" /></button></div>
        {user && <div className="hidden md:flex items-center space-x-8"><NavLink page="home" label={t('nav_home')} icon={Home} /><NavLink page="products" label={t('nav_products')} icon={Package} /><NavLink page="game" label={t('nav_game')} icon={Gamepad2} /><NavLink page="leaderboard" label={t('nav_leaderboard')} icon={Trophy} /><NavLink page="about" label={t('nav_about')} icon={Users} />{user.role === 'admin' && <NavLink page="admin" label="Admin" icon={Shield} />}</div>}
        <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
                <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10 flex items-center gap-2">
                    <Globe size={20} />
                    <span className="text-sm font-bold uppercase">{language}</span>
                </button>
                {langMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden py-1 w-32 z-50 ring-1 ring-black ring-opacity-5">
                        <button onClick={() => {setLanguage('en'); setLangMenuOpen(false)}} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-900 font-medium">English</button>
                        <button onClick={() => {setLanguage('ms'); setLangMenuOpen(false)}} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-900 font-medium">Bahasa Melayu</button>
                        <button onClick={() => {setLanguage('zh'); setLangMenuOpen(false)}} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-900 font-medium">中文</button>
                    </div>
                )}
            </div>
            {user && (<><div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer hover:bg-white/20 transition-colors" onClick={() => setActivePage('profile')}><img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="User" className="w-8 h-8 rounded-full bg-slate-700" /><div className="flex flex-col"><span className="text-xs text-slate-400 leading-none">{t('hello')},</span><span className="text-sm text-white font-bold leading-none">{user.displayName || 'Gamer'}</span></div></div><button onClick={onLogout} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full border border-red-500/20 transition-colors ml-2" title={t('nav_logout')}><LogOut size={18} /></button></>)}
        </div>
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
      </div>
       {isOpen && (<div className="absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 p-4 md:hidden flex flex-col space-y-4 shadow-xl z-40"><button onClick={() => { setActivePage('home'); setIsOpen(false); }} className="text-left text-slate-300">{t('nav_home')}</button><button onClick={() => { setActivePage('products'); setIsOpen(false); }} className="text-left text-slate-300">{t('nav_products')}</button><button onClick={() => { setActivePage('game'); setIsOpen(false); }} className="text-left text-slate-300">{t('nav_game')}</button><button onClick={() => { setActivePage('leaderboard'); setIsOpen(false); }} className="text-left text-slate-300">{t('nav_leaderboard')}</button><button onClick={() => { setActivePage('about'); setIsOpen(false); }} className="text-left text-slate-300">{t('nav_about')}</button><button onClick={() => { setActivePage('profile'); setIsOpen(false); }} className="text-left text-slate-300">{t('nav_profile')}</button><div className="h-px bg-slate-800 my-2"></div><div className="flex gap-4 mb-2"><button onClick={() => setLanguage('en')} className={`text-sm ${language === 'en' ? 'text-white font-bold' : 'text-slate-400'}`}>EN</button><button onClick={() => setLanguage('ms')} className={`text-sm ${language === 'ms' ? 'text-white font-bold' : 'text-slate-400'}`}>BM</button><button onClick={() => setLanguage('zh')} className={`text-sm ${language === 'zh' ? 'text-white font-bold' : 'text-slate-400'}`}>CN</button></div>{user ? (<div className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-white/5" onClick={() => { setActivePage('profile'); setIsOpen(false); }}><div className="flex items-center gap-2"><img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="User" className="w-8 h-8 rounded-full bg-slate-700" /><span className="text-white font-bold">{user.displayName}</span></div><button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="text-red-400 text-sm font-bold flex items-center gap-1"><LogOut size={14}/> {t('nav_logout')}</button></div>) : null}</div>)}
    </nav>
  );
};

export const Footer = () => {
    const { t } = useContext(LanguageContext);
    return (
        <footer className="bg-[#6b5ce7] text-white py-12 px-6 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0 flex flex-col items-start"><JidoBudiLogo className="transform scale-75 origin-left bg-white rounded-lg p-2" /><p className="text-white/70 text-sm max-w-xs mt-3">{t('mobile_friendly')}</p></div>
                <div className="flex space-x-6"><a href="https://www.instagram.com/jidobudi/" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition-colors"><Instagram size={20} /></a><a href="https://www.tiktok.com/@jido_budi" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0 1-7.6 6.83 6.83 0 0 0 4.46 1.68v3.91Z"></path></svg></a></div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/20 text-center text-xs text-white/50">© 2025 Jido Budi {t('footer_rights')}</div>
        </footer>
    );
};