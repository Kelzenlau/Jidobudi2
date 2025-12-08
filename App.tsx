import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithCustomToken } from 'firebase/auth';
import { Loader } from 'lucide-react';
import { auth } from './services/firebase';
import { UserProfile } from './types';
import { LanguageProvider } from './LanguageContext';

// Components
import { Navbar, Footer, AnnouncementBar, WhatsAppFloat } from './components/Layout';
import { LoginPage } from './components/Auth';
import { AdminConsole } from './components/Admin';
import { ChatWithJido } from './components/Chat';
import { Hero, ProductShowcase, AboutUs, LeaderboardPage, ProfilePage, AdsSection } from './components/Views';
import { GameSelection, Match3Game, SnackSwipeGame } from './components/Game';

function AppContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); 
  const [activeGameMode, setActiveGameMode] = useState<string | null>(null); 
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser as unknown as UserProfile); setAuthLoading(false); });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => { await signOut(auth); setUser(null); };

  if (authLoading) return <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center"><Loader className="animate-spin text-white" size={48} /></div>;
  if (!user) return <LoginPage setUser={setUser} />;

  // Admin Route
  if (user.role === 'admin') {
      return <div className="font-sans antialiased bg-slate-900 overflow-x-hidden w-full flex flex-col min-h-screen"><Navbar user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} activePage="admin" setActivePage={() => {}} /><AdminConsole user={user} /></div>;
  }

  const renderPage = () => {
    switch(currentPage) {
        case 'home': return <><Hero onPlay={() => setCurrentPage('game')} /><AdsSection /></>;
        case 'products': return <div className="pt-20"><ProductShowcase /></div>;
        case 'game': return (<div className="pt-24 pb-20 bg-indigo-50 min-h-screen flex flex-col items-center">{!activeGameMode ? (<GameSelection onSelectGame={setActiveGameMode} />) : (activeGameMode === 'match3' ? <Match3Game user={user} onOpenAuth={() => setIsAuthOpen(true)} onBack={() => setActiveGameMode(null)} /> : <SnackSwipeGame user={user} onOpenAuth={() => setIsAuthOpen(true)} onBack={() => setActiveGameMode(null)} />)}</div>);
        case 'leaderboard': return <div className="pt-20"><LeaderboardPage /></div>;
        case 'about': return <div className="pt-20"><AboutUs /></div>;
        case 'profile': return <div className="pt-20"><ProfilePage user={user} /></div>;
        default: return <Hero onPlay={() => setCurrentPage('game')} />;
    }
  };

  return (
    <div className="font-sans antialiased bg-slate-50 overflow-x-hidden w-full flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar user={user} onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} activePage={currentPage} setActivePage={(page) => { setCurrentPage(page); setActiveGameMode(null); }} />
      <main className="flex-grow">{renderPage()}</main>
      <Footer />
      <WhatsAppFloat />
      <ChatWithJido />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
  );
}