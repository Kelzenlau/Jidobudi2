import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { ArrowLeft, Zap, Clock, Trophy, Loader, CheckCircle, RefreshCw, Mail, Play, Home, Gamepad2 } from 'lucide-react';
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { JidoBudiLogo } from './Layout';
import { UserProfile, GameConfig } from '../types';
import { DEFAULT_GAME_CONFIG, THEME_SETS } from '../constants';
import { LanguageContext } from '../LanguageContext';

// --- HELPERS ---
const sendVoucherToEmail = async (code: string, score: number, currentUser: UserProfile, setStatus: any, db: any, appId: string, gameType: string) => {
    if (!currentUser || !code) return;
    setStatus('sending');
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const voucherData = { 
            code: code, 
            email: currentUser.email || 'anonymous', 
            name: currentUser.displayName || 'User',
            score: score, 
            sentAt: new Date(), 
            status: 'delivered', 
            gameType: gameType || 'game'
        };
        // Optimistic: Just simulate sending in demo mode
        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'vouchers'), voucherData);
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'admin_vouchers'), voucherData);
        } catch(e) { console.warn("Voucher save failed (Demo Mode)"); }
        setStatus('sent');
    } catch (e) {
        console.error("Error sending email:", e);
        setStatus('error');
    }
};

const updateLeaderboard = async (score: number, user: UserProfile, db: any, appId: string) => {
    if (!user) return;
    try {
        const leaderboardRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid);
        const docSnap = await getDoc(leaderboardRef);
        let shouldUpdate = true;
        if (docSnap.exists()) {
            const currentData = docSnap.data();
            if (currentData.score >= score) shouldUpdate = false;
        }
        if (shouldUpdate) {
            await setDoc(leaderboardRef, {
                name: user.displayName || 'Anonymous', score: score, photoURL: user.photoURL, updatedAt: serverTimestamp()
            });
        }
    } catch (e) { console.warn("Leaderboard update failed (Demo Mode)"); }
};

const createBoard = (theme: string) => {
  const randomBoard = [];
  const WIDTH = 8;
  const colors = THEME_SETS[theme] || THEME_SETS['default'];
  for (let i = 0; i < WIDTH * WIDTH; i++) randomBoard.push(colors[Math.floor(Math.random() * colors.length)]);
  return randomBoard;
};

// --- AUDIO MANAGER ---
const playSound = (type: 'match' | 'swap' | 'error' | 'win' | 'collect' | 'gameover' | 'click') => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    try {
        // Polyfill for broader compatibility
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime;
        
        switch(type) {
            case 'match':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'swap':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(500, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
             case 'collect':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, now);
                osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'win':
                 // Victory Arpeggio
                 [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'triangle';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0.1, now + i*0.1);
                    g.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.3);
                    o.start(now + i*0.1);
                    o.stop(now + i*0.1 + 0.3);
                 });
                 return;
            case 'gameover':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
                osc.start(now);
                osc.stop(now + 1);
                break;
            case 'click':
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'error':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
        }
    } catch(e) { console.error("Audio error", e); }
};

// --- COMPONENTS ---

export const GameOverScreen = ({ score, voucherCode, user, onOpenAuth, onPlayAgain, emailStatus, onResendEmail }: any) => {
    const { t } = useContext(LanguageContext);
    useEffect(() => { if(voucherCode && user) updateLeaderboard(score, user, db, appId); }, [voucherCode, user, score]);
    return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-300">
        {voucherCode ? (
            <>
                <div className="relative"><div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 animate-pulse"></div><Trophy size={64} className="text-yellow-400 mb-6 animate-bounce relative z-10" /></div>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tight">{t('you_won')}</h3>
                <p className="text-slate-300 mb-8 text-lg">{t('you_scored')} <span className="text-white font-bold">{score}</span> points!</p>
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl w-full max-w-sm border-2 border-yellow-500/50 border-dashed mb-8 relative overflow-hidden transform hover:scale-105 transition-transform">
                    <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.2em] mb-2">{t('voucher_code')}</p>
                    <p className="text-3xl font-mono font-black text-white tracking-wider drop-shadow-lg">{voucherCode}</p>
                </div>
                {user ? (
                    <div className="flex flex-col items-center w-full mb-8 space-y-3">
                        {emailStatus === 'sending' && <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-5 py-2.5 rounded-full border border-yellow-400/20 animate-pulse"><Loader size={18} className="animate-spin" /><span className="text-sm font-bold">{t('sending')}</span></div>}
                        {emailStatus === 'sent' && <div className="flex flex-col items-center"><div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-5 py-2.5 rounded-full border border-green-400/20"><CheckCircle size={18} /><span className="text-sm font-bold">{t('sent_to')} {user.email || "your email"}</span></div></div>}
                        {emailStatus === 'error' && <button onClick={onResendEmail} className="flex items-center gap-2 text-red-300 bg-red-500/10 px-5 py-2.5 rounded-full border border-red-400/20 hover:bg-red-500/20 transition-colors"><RefreshCw size={18} /><span className="text-sm font-bold">{t('retry')}</span></button>}
                        {emailStatus === 'idle' && <button onClick={onResendEmail} className="flex items-center gap-2 text-blue-300 bg-blue-500/10 px-5 py-2.5 rounded-full border border-blue-400/20 hover:bg-blue-500/20 transition-colors"><Mail size={18} /><span className="text-sm font-bold">{t('email_voucher')}</span></button>}
                    </div>
                ) : null}
            </>
        ) : (
            <>
                <Clock size={64} className="text-slate-600 mb-6" />
                <h3 className="text-4xl font-black text-white mb-2">{t('times_up')}</h3>
                <p className="text-slate-400 mb-8 text-lg">{t('you_scored')} <span className="text-yellow-400 font-bold text-2xl mx-1">{score}</span> points.</p>
            </>
        )}
        <button onClick={() => { playSound('click'); onPlayAgain(); }} className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300">{t('play_again')}</button>
    </div>
    );
};

export const GameSelection = ({ onSelectGame }: { onSelectGame: (game: string) => void }) => {
    const { t } = useContext(LanguageContext);
    return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-8 text-center">{t('choose_game')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div onClick={() => { playSound('click'); onSelectGame('match3'); }} className="group relative bg-white rounded-[2rem] p-8 shadow-xl border-2 border-slate-100 hover:border-pink-400 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-pink-200 transition-colors"></div><div className="relative z-10 flex flex-col items-center text-center"><div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform">🧩</div><h3 className="text-2xl font-black text-slate-800 mb-2">{t('game_match')}</h3><span className="px-6 py-2 bg-pink-100 text-pink-600 font-bold rounded-full text-sm group-hover:bg-pink-500 group-hover:text-white transition-colors">{t('play_now')}</span></div></div>
            <div onClick={() => { playSound('click'); onSelectGame('swipe'); }} className="group relative bg-white rounded-[2rem] p-8 shadow-xl border-2 border-slate-100 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-200 transition-colors"></div><div className="relative z-10 flex flex-col items-center text-center"><div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform">🛒</div><h3 className="text-2xl font-black text-slate-800 mb-2">{t('game_swipe')}</h3><span className="px-6 py-2 bg-blue-100 text-blue-600 font-bold rounded-full text-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">{t('play_now')}</span></div></div>
        </div>
    </div>
    );
};

export const Match3Game = ({ user, onOpenAuth, onBack }: { user: UserProfile | null, onOpenAuth: () => void, onBack: () => void }) => {
  const { t } = useContext(LanguageContext);
  const WIDTH = 8;
  const [gameConfig, setGameConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG);
  const [board, setBoard] = useState<string[]>(createBoard('default')); 
  const [squareBeingDragged, setSquareBeingDragged] = useState<any>(null);
  const [squareBeingReplaced, setSquareBeingReplaced] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState('idle');
  
  // Touch Handling State
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [activeSquareId, setActiveSquareId] = useState<number | null>(null);

  useEffect(() => {
      getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'game')).then(s => {
          const config = s.exists() ? s.data() : DEFAULT_GAME_CONFIG;
          setGameConfig(config as GameConfig);
          setTimeLeft(config.timeLimit || 60);
          setBoard(createBoard(config.theme || 'default'));
      }).catch(e => { });
  }, []);

  const checkForMatch = useCallback((currentBoard?: string[]) => {
    let matchFound = false;
    const workingBoard = currentBoard ? [...currentBoard] : [...board];
    for (let i = 0; i < 64; i++) {
        const rowOf3 = [i, i + 1, i + 2];
        const colOf3 = [i, i + WIDTH, i + WIDTH * 2];
        
        if (i % 8 < 6 && rowOf3.every(s => workingBoard[s] === workingBoard[i] && workingBoard[i])) { 
            matchFound = true; 
            rowOf3.forEach(s => workingBoard[s] = ''); 
        }
        if (i < 48 && colOf3.every(s => workingBoard[s] === workingBoard[i] && workingBoard[i])) { 
            matchFound = true; 
            colOf3.forEach(s => workingBoard[s] = ''); 
        }
    }
    if (matchFound) {
        playSound('match');
        setScore(s => s + 50);
        setBoard(workingBoard);
    }
    return matchFound;
  }, [board]);

  const moveBelow = useCallback(() => {
      const newBoard = [...board];
      const colors = THEME_SETS[gameConfig.theme] || THEME_SETS['default'];
      for(let i=0; i<56; i++) {
          if(newBoard[i + WIDTH] === '') { 
              newBoard[i + WIDTH] = newBoard[i]; 
              newBoard[i] = ''; 
          }
          if(i<8 && newBoard[i] === '') {
              newBoard[i] = colors[Math.floor(Math.random() * colors.length)];
          }
      }
      setBoard(newBoard);
  }, [board, gameConfig]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => { 
        if(!checkForMatch()) {
            moveBelow(); 
        }
    }, 60); 
    return () => clearInterval(timer);
  }, [checkForMatch, moveBelow, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => setTimeLeft(p => {
        if(p<=1) { setIsPlaying(false); setIsGameOver(true); playSound('gameover'); return 0; }
        return p-1;
    }), 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => { if (isPlaying && score >= gameConfig.winScore && !voucherCode) { setIsPlaying(false); setIsGameOver(true); playSound('win'); setVoucherCode('MATCH-' + Math.random().toString(36).substr(2, 6).toUpperCase()); } }, [score, isPlaying, voucherCode, gameConfig]);
  useEffect(() => { if (voucherCode && user && emailStatus === 'idle') sendVoucherToEmail(voucherCode, score, user, setEmailStatus, db, appId, 'match3'); }, [voucherCode, user, emailStatus, score]);

  // Unified Swap Logic
  const performSwap = (id1: number, id2: number) => {
    const validMoves = [id1 - 1, id1 - WIDTH, id1 + 1, id1 + WIDTH];
    if(validMoves.includes(id2)) {
        // Prevent wrapping logic
        const isHorizontal = Math.abs(id2 - id1) === 1;
        const isSameRow = Math.floor(id2 / WIDTH) === Math.floor(id1 / WIDTH);
        if (isHorizontal && !isSameRow) return;

        playSound('swap');
        const newBoard = [...board];
        newBoard[id2] = board[id1];
        newBoard[id1] = board[id2];
        setBoard(newBoard);
        setTimeout(() => checkForMatch(newBoard), 5);
    }
  };

  const dragStart = (e: any) => setSquareBeingDragged(e.target);
  const dragDrop = (e: any) => setSquareBeingReplaced(e.target);
  const dragEnd = () => {
      if(!squareBeingDragged || !squareBeingReplaced) return;
      const draggedId = parseInt(squareBeingDragged.getAttribute('data-id'));
      const replacedId = parseInt(squareBeingReplaced.getAttribute('data-id'));
      
      // Ensure IDs are valid numbers before swapping
      if (!isNaN(draggedId) && !isNaN(replacedId)) {
        performSwap(draggedId, replacedId);
      }
      
      setSquareBeingDragged(null);
      setSquareBeingReplaced(null);
  };

  // Touch handlers for mobile smooth play
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
      if (!isPlaying) return;
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setActiveSquareId(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      // Prevent scrolling the game board on mobile while playing
      if(activeSquareId !== null) e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!touchStart || activeSquareId === null) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStart.x;
      const diffY = touchEndY - touchStart.y;
      
      // Min threshold to count as swipe
      if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
          setTouchStart(null); setActiveSquareId(null); return; 
      }

      let targetId = null;
      if (Math.abs(diffX) > Math.abs(diffY)) {
          // Horizontal Swipe
          if (diffX > 0) targetId = activeSquareId + 1; // Right
          else targetId = activeSquareId - 1; // Left
      } else {
          // Vertical Swipe
          if (diffY > 0) targetId = activeSquareId + WIDTH; // Down
          else targetId = activeSquareId - WIDTH; // Up
      }

      if (targetId !== null && targetId >= 0 && targetId < 64) {
          performSwap(activeSquareId, targetId);
      }

      setTouchStart(null);
      setActiveSquareId(null);
  };

  const startGame = () => { playSound('click'); setIsPlaying(true); setIsGameOver(false); setScore(0); setTimeLeft(gameConfig.timeLimit || 60); setBoard(createBoard(gameConfig.theme)); setVoucherCode(null); setEmailStatus('idle'); };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#020617] to-[#020617] pointer-events-none"></div>
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50 max-w-lg mx-auto w-full">
         <button onClick={onBack} className="text-white/50 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm transition-all border border-white/5 hover:border-white/20">
            <ArrowLeft size={16}/> {t('nav_home')}
         </button>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6 animate-in zoom-in-95 duration-500">
        {/* Score & Timer Card */}
        <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
             <div className="flex items-center space-x-3 relative z-10">
                 <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20"><Zap size={24} className="text-white fill-white" /></div>
                 <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('score')}</div><div className="text-2xl font-black text-white leading-none">{score}</div></div>
             </div>
             <div className="flex items-center space-x-3 relative z-10">
                 <div className="text-right">
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('timer')}</div>
                     <div className={`text-2xl font-black leading-none tabular-nums ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
                 </div>
                 <div className="bg-slate-800 p-2 rounded-xl border border-white/10"><Clock size={24} className="text-slate-400" /></div>
             </div>
        </div>

        {/* Board */}
        <div className="relative bg-slate-900/40 p-2 sm:p-4 rounded-3xl border border-white/10 w-full aspect-square shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm touch-none">
          <div className="grid grid-cols-8 gap-1 sm:gap-2 h-full w-full">
            {board.map((candy, index) => (
              <div 
                key={index} 
                data-id={index} 
                data-src={candy} 
                draggable={true} 
                onDragStart={dragStart} 
                onDragOver={e => e.preventDefault()} 
                onDragEnter={e => e.preventDefault()} 
                onDragLeave={e => e.preventDefault()} 
                onDrop={dragDrop} 
                onDragEnd={dragEnd} 
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg sm:rounded-xl cursor-pointer shadow-inner border border-white/5 hover:brightness-125 active:scale-95 transform-gpu transition-all duration-75 select-none relative group touch-manipulation"
              >
                  {/* CRITICAL: pointer-events-none ensures drag events bubble to the parent container */}
                  <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <span className="drop-shadow-lg scale-90 group-hover:scale-100 transition-transform pointer-events-none">{candy}</span>
              </div>
            ))}
          </div>
          {(!isPlaying && !isGameOver) && <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-3xl p-6 text-center border border-white/10"><div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse"><Play size={40} className="text-indigo-400 fill-current ml-1" /></div><h3 className="text-3xl font-black text-white mb-3 tracking-tight">{t('game_match')}</h3><p className="text-slate-400 text-sm mb-8 max-w-[240px] leading-relaxed font-medium">{t('game_match_desc')}</p><button onClick={startGame} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all uppercase tracking-widest text-sm">{t('start_game')}</button></div>}
          {isGameOver && <GameOverScreen score={score} voucherCode={voucherCode} user={user} onOpenAuth={onOpenAuth} onPlayAgain={startGame} emailStatus={emailStatus} onResendEmail={() => sendVoucherToEmail(voucherCode!, score, user!, setEmailStatus, db, appId, 'match3')} />}
        </div>
      </div>
    </div>
  );
};

export const SnackSwipeGame = ({ user, onOpenAuth, onBack }: { user: UserProfile | null, onOpenAuth: () => void, onBack: () => void }) => {
    const { t } = useContext(LanguageContext);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(DEFAULT_GAME_CONFIG.timeLimit);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [cartX, setCartX] = useState(50);
    const [snacks, setSnacks] = useState<any[]>([]);
    const [voucherCode, setVoucherCode] = useState<string | null>(null);
    const [emailStatus, setEmailStatus] = useState('idle');
    const [gameConfig, setGameConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();
    const lastSpawnTime = useRef(0);

    const SNACK_TYPES = [{ char: '🥔', score: 100 }, { char: '🍫', score: 100 }, { char: '🥤', score: 100 }, { char: '🎁', score: 300, special: true }];
    
    // Load config
    useEffect(() => {
        getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'game')).then(s => {
            if(s.exists()) { setGameConfig(s.data() as GameConfig); setTimeLeft(s.data().timeLimit); }
        }).catch(e => {});
    }, []);

    const handleMove = (clientX: number) => {
        if (!containerRef.current || !isPlaying) return;
        const rect = containerRef.current.getBoundingClientRect();
        let x = clientX - rect.left;
        let percent = (x / rect.width) * 100;
        setCartX(Math.max(0, Math.min(100, percent)));
    };

    // Game Loop
    const gameLoop = useCallback((time: number) => {
        if (!isPlaying || isGameOver) return;
        if (time - lastSpawnTime.current > 700) { 
            setSnacks(prev => [...prev, { id: Math.random(), x: Math.random() * 90 + 5, y: -10, char: SNACK_TYPES[Math.floor(Math.random() * 4)].char, score: 100 }]);
            lastSpawnTime.current = time;
        }
        setSnacks(prev => prev.map(s => ({ ...s, y: s.y + 1.2 })).filter(s => { 
            if (s.y > 82 && s.y < 92 && Math.abs(s.x - cartX) < 12) { 
                setScore(p => p + s.score); 
                playSound('collect');
                return false; 
            }
            return s.y < 105;
        }));
        requestRef.current = requestAnimationFrame(gameLoop);
    }, [isPlaying, isGameOver, cartX, gameConfig]);

    useEffect(() => { if (isPlaying && !isGameOver) requestRef.current = requestAnimationFrame(gameLoop); return () => cancelAnimationFrame(requestRef.current!); }, [isPlaying, isGameOver, gameLoop]);
    useEffect(() => { if (!isPlaying) return; const timer = setInterval(() => setTimeLeft(p => { if(p<=1){setIsPlaying(false);setIsGameOver(true); playSound('gameover'); return 0; } return p-1 }), 1000); return () => clearInterval(timer); }, [isPlaying]);
    useEffect(() => { if (score >= gameConfig.winScore && !voucherCode) { setIsPlaying(false); setIsGameOver(true); playSound('win'); setVoucherCode('SWIPE-' + Math.random().toString(36).substr(2, 6).toUpperCase()); } }, [score, voucherCode, gameConfig]);
    useEffect(() => { if (voucherCode && user && emailStatus === 'idle') sendVoucherToEmail(voucherCode, score, user, setEmailStatus, db, appId, 'swipe'); }, [voucherCode, user, emailStatus, score]);

    const startGame = () => { playSound('click'); setIsPlaying(true); setIsGameOver(false); setScore(0); setTimeLeft(gameConfig.timeLimit || 60); setSnacks([]); setVoucherCode(null); setEmailStatus('idle'); lastSpawnTime.current = performance.now(); };

    return (
        <div className="fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a] pointer-events-none"></div>

            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50 max-w-2xl mx-auto w-full px-2">
                 <button onClick={onBack} className="text-white/50 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm transition-all border border-white/5 hover:border-white/20">
                    <ArrowLeft size={16}/> {t('nav_home')}
                 </button>
                 
                 <div className="flex gap-3">
                    <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 backdrop-blur-md">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('score')}</div>
                        <div className="text-xl font-black text-white leading-none">{score}</div>
                    </div>
                    <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 backdrop-blur-md">
                        <Clock size={16} className={`text-slate-400 ${timeLeft < 10 ? 'text-red-400 animate-pulse' : ''}`}/>
                        <div className={`text-xl font-black leading-none tabular-nums ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</div>
                    </div>
                 </div>
            </div>

            <div ref={containerRef} className="relative w-full h-full cursor-crosshair touch-none overflow-hidden" onTouchMove={e => handleMove(e.touches[0].clientX)} onMouseMove={e => handleMove(e.clientX)}>
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px', transform: 'perspective(500px) rotateX(20deg)'}}></div>
                
                {/* Cart */}
                <div className="absolute bottom-8 w-20 h-20 md:w-24 md:h-24 transition-transform duration-75 ease-out will-change-transform" style={{ left: `${cartX}%`, transform: 'translateX(-50%) translateZ(0)' }}>
                    <div className="w-full h-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center justify-center border-2 border-white/20 relative">
                        <div className="absolute -top-2 left-2 w-full h-full bg-blue-900 rounded-2xl -z-10 blur-sm"></div>
                        <JidoBudiLogo className="transform scale-[0.5] origin-center drop-shadow-md" />
                        <div className="absolute inset-x-0 -bottom-2 h-4 bg-black/50 blur-md rounded-full"></div>
                    </div>
                </div>

                {/* Falling Snacks */}
                {snacks.map(s => (
                    <div key={s.id} className="absolute text-4xl md:text-5xl drop-shadow-2xl will-change-transform" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translateZ(0)' }}>
                        {s.char}
                    </div>
                ))}

                {/* Start Overlay */}
                {(!isPlaying && !isGameOver) && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6">
                        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-8 rounded-full mb-8 border border-white/10 shadow-[0_0_60px_rgba(6,182,212,0.2)] animate-pulse">
                            <Gamepad2 size={64} className="text-cyan-400" />
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{t('game_swipe')}</h3>
                        <p className="text-slate-400 text-lg mb-10 max-w-sm">{t('game_swipe_desc')}</p>
                        <button onClick={startGame} className="px-12 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xl rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 hover:shadow-[0_0_50px_rgba(59,130,246,0.7)] transition-all flex items-center gap-3">
                            <Play size={24} fill="currentColor" /> {t('play_now')}
                        </button>
                    </div>
                )}
                
                {/* Game Over Overlay */}
                {isGameOver && <GameOverScreen score={score} voucherCode={voucherCode} user={user} onOpenAuth={onOpenAuth} onPlayAgain={startGame} emailStatus={emailStatus} onResendEmail={() => sendVoucherToEmail(voucherCode!, score, user!, setEmailStatus, db, appId, 'swipe')} />}
            </div>
        </div>
    );
};