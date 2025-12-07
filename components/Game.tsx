import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { ArrowLeft, Zap, Clock, Trophy, Loader, CheckCircle, RefreshCw, Mail, Play } from 'lucide-react';
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { JidoBudiLogo } from './Layout';
import { UserProfile, GameConfig } from '../types';
import { DEFAULT_GAME_CONFIG, THEME_SETS } from '../constants';
import { LanguageContext } from '../App';

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

// --- COMPONENTS ---

export const GameOverScreen = ({ score, voucherCode, user, onOpenAuth, onPlayAgain, emailStatus, onResendEmail }: any) => {
    const { t } = useContext(LanguageContext);
    useEffect(() => { if(voucherCode && user) updateLeaderboard(score, user, db, appId); }, [voucherCode, user, score]);
    return (
    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center rounded-2xl text-center p-6 animate-in fade-in zoom-in duration-300">
        {voucherCode ? (
            <>
                <div className="relative"><div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse"></div><Trophy size={56} className="text-yellow-400 mb-4 animate-bounce relative z-10" /></div>
                <h3 className="text-3xl font-black text-white mb-1">{t('you_won')}</h3>
                <p className="text-slate-300 mb-6 text-sm">{t('you_scored')} {score} points!</p>
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-4 rounded-xl w-full border-2 border-yellow-400 border-dashed mb-4 relative overflow-hidden transform hover:scale-105 transition-transform"><p className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-1">{t('voucher_code')}</p><p className="text-2xl font-mono font-black text-slate-900 tracking-wider">{voucherCode}</p></div>
                {user ? (
                    <div className="flex flex-col items-center w-full mb-6">
                        {emailStatus === 'sending' && <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-4 py-2 rounded-full border border-yellow-400/20 animate-pulse"><Loader size={16} className="animate-spin" /><span className="text-xs font-bold">{t('sending')}</span></div>}
                        {emailStatus === 'sent' && <div className="flex flex-col items-center"><div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20 mb-2"><CheckCircle size={16} /><span className="text-xs font-bold">{t('sent_to')} {user.email || "your email"}</span></div></div>}
                        {emailStatus === 'error' && <button onClick={onResendEmail} className="flex items-center gap-2 text-red-300 bg-red-500/10 px-4 py-2 rounded-full border border-red-400/20 hover:bg-red-500/20"><RefreshCw size={16} /><span className="text-xs font-bold">{t('retry')}</span></button>}
                        {emailStatus === 'idle' && <button onClick={onResendEmail} className="flex items-center gap-2 text-blue-300 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-400/20 hover:bg-blue-500/20"><Mail size={16} /><span className="text-xs font-bold">{t('email_voucher')}</span></button>}
                    </div>
                ) : null}
            </>
        ) : (
            <>
                <Clock size={48} className="text-slate-500 mb-4" />
                <h3 className="text-3xl font-black text-white mb-2">{t('times_up')}</h3>
                <p className="text-slate-300 mb-6">{t('you_scored')} <span className="text-yellow-400 font-bold text-xl">{score}</span> points.</p>
            </>
        )}
        <button onClick={onPlayAgain} className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform">{t('play_again')}</button>
    </div>
    );
};

export const GameSelection = ({ onSelectGame }: { onSelectGame: (game: string) => void }) => {
    const { t } = useContext(LanguageContext);
    return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-8 text-center">{t('choose_game')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div onClick={() => onSelectGame('match3')} className="group relative bg-white rounded-[2rem] p-8 shadow-xl border-2 border-slate-100 hover:border-pink-400 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-pink-200 transition-colors"></div><div className="relative z-10 flex flex-col items-center text-center"><div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform">🧩</div><h3 className="text-2xl font-black text-slate-800 mb-2">{t('game_match')}</h3><span className="px-6 py-2 bg-pink-100 text-pink-600 font-bold rounded-full text-sm group-hover:bg-pink-500 group-hover:text-white transition-colors">{t('play_now')}</span></div></div>
            <div onClick={() => onSelectGame('swipe')} className="group relative bg-white rounded-[2rem] p-8 shadow-xl border-2 border-slate-100 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-200 transition-colors"></div><div className="relative z-10 flex flex-col items-center text-center"><div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform">🛒</div><h3 className="text-2xl font-black text-slate-800 mb-2">{t('game_swipe')}</h3><span className="px-6 py-2 bg-blue-100 text-blue-600 font-bold rounded-full text-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">{t('play_now')}</span></div></div>
        </div>
    </div>
    );
};

export const Match3Game = ({ user, onOpenAuth, onBack }: { user: UserProfile | null, onOpenAuth: () => void, onBack: () => void }) => {
  const { t } = useContext(LanguageContext);
  const WIDTH = 8;
  const [gameConfig, setGameConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG);
  const [board, setBoard] = useState<string[]>([]);
  const [squareBeingDragged, setSquareBeingDragged] = useState<any>(null);
  const [squareBeingReplaced, setSquareBeingReplaced] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState('idle');

  useEffect(() => {
      getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'game')).then(s => {
          const config = s.exists() ? s.data() : DEFAULT_GAME_CONFIG;
          setGameConfig(config as GameConfig);
          setTimeLeft(config.timeLimit || 60);
          setBoard(createBoard(config.theme || 'default'));
      }).catch(e => {
          setBoard(createBoard('default')); // Fallback
      });
  }, []);

  const checkForMatch = useCallback(() => {
    let matchFound = false;
    const newBoard = [...board];
    for (let i = 0; i < 64; i++) {
        const rowOf3 = [i, i + 1, i + 2];
        const colOf3 = [i, i + WIDTH, i + WIDTH * 2];
        
        if (i % 8 < 6 && rowOf3.every(s => newBoard[s] === newBoard[i] && newBoard[i])) { 
            matchFound = true; 
            rowOf3.forEach(s => newBoard[s] = ''); 
        }
        if (i < 48 && colOf3.every(s => newBoard[s] === newBoard[i] && newBoard[i])) { 
            matchFound = true; 
            colOf3.forEach(s => newBoard[s] = ''); 
        }
    }
    if (matchFound) {
        setScore(s => s + 50);
        setBoard(newBoard);
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
    }, 100);
    return () => clearInterval(timer);
  }, [checkForMatch, moveBelow, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => setTimeLeft(p => {
        if(p<=1) { setIsPlaying(false); setIsGameOver(true); return 0; }
        return p-1;
    }), 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => { if (isPlaying && score >= gameConfig.winScore && !voucherCode) { setIsPlaying(false); setIsGameOver(true); setVoucherCode('MATCH-' + Math.random().toString(36).substr(2, 6).toUpperCase()); } }, [score, isPlaying, voucherCode, gameConfig]);
  useEffect(() => { if (voucherCode && user && emailStatus === 'idle') sendVoucherToEmail(voucherCode, score, user, setEmailStatus, db, appId, 'match3'); }, [voucherCode, user, emailStatus, score]);

  const dragStart = (e: any) => setSquareBeingDragged(e.target);
  const dragDrop = (e: any) => setSquareBeingReplaced(e.target);
  const dragEnd = () => {
      if(!squareBeingDragged || !squareBeingReplaced) return;
      const draggedId = parseInt(squareBeingDragged.getAttribute('data-id'));
      const replacedId = parseInt(squareBeingReplaced.getAttribute('data-id'));
      const validMoves = [draggedId - 1, draggedId - WIDTH, draggedId + 1, draggedId + WIDTH];
      if(validMoves.includes(replacedId)) {
        const newBoard = [...board];
        newBoard[replacedId] = squareBeingDragged.getAttribute('data-src');
        newBoard[draggedId] = squareBeingReplaced.getAttribute('data-src');
        setBoard(newBoard);
      }
      setSquareBeingDragged(null);
      setSquareBeingReplaced(null);
  };

  const startGame = () => { setIsPlaying(true); setIsGameOver(false); setScore(0); setTimeLeft(gameConfig.timeLimit || 60); setBoard(createBoard(gameConfig.theme)); setVoucherCode(null); setEmailStatus('idle'); };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-3xl shadow-2xl border-4 border-slate-700/50 relative overflow-hidden max-w-lg mx-auto w-full">
      <button onClick={onBack} className="absolute top-4 left-4 text-slate-400 hover:text-indigo-900 z-20 flex items-center gap-1 text-xs font-bold uppercase"><ArrowLeft size={14}/> Back</button>
      <div className="w-full flex justify-between items-center mb-4 bg-indigo-900 p-3 rounded-xl border border-white/10 mt-8">
        <div className="flex items-center space-x-2"><div className="bg-yellow-400 p-1.5 rounded-lg shadow-lg shadow-yellow-400/20"><Zap size={20} className="text-yellow-900" fill="currentColor" /></div><div><div className="text-xs text-indigo-200 font-bold uppercase tracking-wider">{t('score')}</div><div className="text-xl font-black text-white leading-none">{score}</div></div></div>
        <div className="flex items-center space-x-2"><div className="text-right"><div className="text-xs text-indigo-200 font-bold uppercase tracking-wider">{t('timer')}</div><div className={`text-xl font-black leading-none ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div></div><div className="bg-blue-500 p-1.5 rounded-lg shadow-lg shadow-blue-500/20"><Clock size={20} className="text-white" /></div></div>
      </div>
      <div className="relative bg-slate-900/50 p-3 rounded-2xl border border-white/5">
        <div className="grid grid-cols-8 gap-1 sm:gap-2">
          {board.map((candy, index) => (
            <div key={index} data-id={index} data-src={candy} draggable={true} onDragStart={dragStart} onDragOver={e => e.preventDefault()} onDragEnter={e => e.preventDefault()} onDragLeave={e => e.preventDefault()} onDrop={dragDrop} onDragEnd={dragEnd} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl sm:text-3xl bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg cursor-pointer transition-all duration-200 shadow-sm border border-white/5 hover:scale-105 hover:brightness-110 active:scale-95"><span className="drop-shadow-md select-none pointer-events-none">{candy}</span></div>
          ))}
        </div>
        {(!isPlaying && !isGameOver) && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl"><h3 className="text-2xl font-bold text-white mb-4">Snack Match</h3><button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform">{t('start_game')}</button></div>}
        {isGameOver && <GameOverScreen score={score} voucherCode={voucherCode} user={user} onOpenAuth={onOpenAuth} onPlayAgain={startGame} emailStatus={emailStatus} onResendEmail={() => sendVoucherToEmail(voucherCode!, score, user!, setEmailStatus, db, appId, 'match3')} />}
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
        if (time - lastSpawnTime.current > 800) {
            setSnacks(prev => [...prev, { id: Math.random(), x: Math.random() * 90 + 5, y: -10, char: SNACK_TYPES[Math.floor(Math.random() * 4)].char, score: 100 }]);
            lastSpawnTime.current = time;
        }
        setSnacks(prev => prev.map(s => ({ ...s, y: s.y + 1.5 })).filter(s => {
            if (s.y > 85 && s.y < 95 && Math.abs(s.x - cartX) < 15) { setScore(p => p + s.score); return false; }
            return s.y < 105;
        }));
        requestRef.current = requestAnimationFrame(gameLoop);
    }, [isPlaying, isGameOver, cartX, gameConfig]);

    useEffect(() => { if (isPlaying && !isGameOver) requestRef.current = requestAnimationFrame(gameLoop); return () => cancelAnimationFrame(requestRef.current!); }, [isPlaying, isGameOver, gameLoop]);
    useEffect(() => { if (!isPlaying) return; const timer = setInterval(() => setTimeLeft(p => { if(p<=1){setIsPlaying(false);setIsGameOver(true);return 0} return p-1 }), 1000); return () => clearInterval(timer); }, [isPlaying]);
    useEffect(() => { if (score >= gameConfig.winScore && !voucherCode) { setIsPlaying(false); setIsGameOver(true); setVoucherCode('SWIPE-' + Math.random().toString(36).substr(2, 6).toUpperCase()); } }, [score, voucherCode, gameConfig]);
    useEffect(() => { if (voucherCode && user && emailStatus === 'idle') sendVoucherToEmail(voucherCode, score, user, setEmailStatus, db, appId, 'swipe'); }, [voucherCode, user, emailStatus, score]);

    const startGame = () => { setIsPlaying(true); setIsGameOver(false); setScore(0); setTimeLeft(gameConfig.timeLimit || 60); setSnacks([]); setVoucherCode(null); setEmailStatus('idle'); lastSpawnTime.current = performance.now(); };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-3xl shadow-2xl border-4 border-slate-700/50 relative overflow-hidden max-w-lg mx-auto w-full h-[600px]">
            <button onClick={onBack} className="absolute top-4 left-4 text-slate-400 hover:text-white z-20 flex items-center gap-1 text-xs font-bold uppercase"><ArrowLeft size={14}/> Back</button>
            <div className="absolute top-12 left-4 right-4 flex justify-between items-center z-10">
                <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2"><div className="text-xs text-slate-400 font-bold uppercase">{t('score')}</div><div className="text-xl font-black text-white">{score}</div></div>
                <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2"><Clock size={16} className="text-white"/><div className={`text-xl font-black ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</div></div>
            </div>
            <div ref={containerRef} className="relative w-full h-full bg-gradient-to-b from-indigo-900 to-slate-900 rounded-2xl overflow-hidden cursor-crosshair touch-none border border-white/5" onTouchMove={e => handleMove(e.touches[0].clientX)} onMouseMove={e => handleMove(e.clientX)}>
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                <div className="absolute bottom-4 w-16 h-16 transition-transform duration-75 ease-out" style={{ left: `${cartX}%`, transform: 'translateX(-50%)' }}><div className="bg-white/10 backdrop-blur-md p-1 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]"><JidoBudiLogo className="transform scale-[0.4] origin-center" /></div></div>
                {snacks.map(s => (<div key={s.id} className="absolute text-3xl drop-shadow-lg animate-pulse" style={{ left: `${s.x}%`, top: `${s.y}%` }}>{s.char}</div>))}
                {(!isPlaying && !isGameOver) && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6"><h3 className="text-3xl font-black text-white mb-2">{t('game_swipe')}</h3><button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform flex items-center gap-2"><Play size={20} fill="currentColor" /> {t('play_now')}</button></div>}
                {isGameOver && <GameOverScreen score={score} voucherCode={voucherCode} user={user} onOpenAuth={onOpenAuth} onPlayAgain={startGame} emailStatus={emailStatus} onResendEmail={() => sendVoucherToEmail(voucherCode!, score, user!, setEmailStatus, db, appId, 'swipe')} />}
            </div>
        </div>
    );
};