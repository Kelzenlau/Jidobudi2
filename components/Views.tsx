import React, { useState, useEffect, useContext } from 'react';
import { ChevronRight, MapPin, Calendar, Shield, Ticket, Gamepad2, Loader } from 'lucide-react';
import { getDoc, doc, collection, onSnapshot, query, addDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { JidoBudiLogo } from './Layout';
import { LanguageContext } from '../App';
import { DEFAULT_HOME_CONFIG, DEFAULT_ADS_CONFIG } from '../constants';
import { UserProfile } from '../types';

export const Hero = ({ onPlay }: { onPlay: () => void }) => {
  const { t } = useContext(LanguageContext);
  const [config, setConfig] = useState<any>(DEFAULT_HOME_CONFIG);
  
  useEffect(() => { 
      const fetchConfig = async () => {
        try {
            const s = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'home'));
            if(s.exists()) {
                const data = s.data();
                setConfig({ ...DEFAULT_HOME_CONFIG, ...data });
            }
        } catch(e) {}
      };
      fetchConfig();
  }, []);

  const activeMediaUrl = config.mediaUrl || config.heroImage || DEFAULT_HOME_CONFIG.mediaUrl;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[#0f0c29] text-white pt-24">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 text-center md:text-left mb-12 md:mb-0">
                <span className="text-yellow-400 font-bold tracking-widest text-sm uppercase mb-2 block animate-pulse">Jido Budi Games</span>
                <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">{config.title}</h1>
                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">{config.subtitle}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4"><button onClick={onPlay} className="px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-300 font-bold rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:bg-cyan-400 hover:text-slate-900 transition-all duration-300 group"><span className="flex items-center">{t('play_now')} <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span></button></div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center relative"><div className="relative w-72 h-[450px] md:w-80 md:h-[500px] bg-gradient-to-b from-purple-200 to-indigo-300 rounded-[2.5rem] p-4 shadow-2xl border-r-8 border-b-8 border-indigo-900 transform rotate-y-12 hover:scale-105 transition-transform duration-500">
                <div className="w-full h-3/5 bg-sky-200/50 backdrop-blur-sm rounded-xl border-4 border-white/40 shadow-inner flex items-center justify-center p-2 overflow-hidden relative">
                    {config.mediaType === 'video' ? (
                        <video src={activeMediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover rounded-lg opacity-90" onError={(e: any) => {
                             e.target.style.display='none';
                             if(e.target.parentElement) {
                                e.target.parentElement.style.backgroundImage = `url('https://images.unsplash.com/photo-1625699414476-47b1b369527d?auto=format&fit=crop&w=800&q=80')`;
                                e.target.parentElement.style.backgroundSize = 'cover';
                                e.target.parentElement.style.backgroundPosition = 'center';
                             }
                        }} />
                    ) : (
                        <img src={activeMediaUrl} alt="Vending Machine" className="w-full h-full object-cover rounded-lg opacity-90" onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1625699414476-47b1b369527d?auto=format&fit=crop&w=800&q=80";
                        }}/>
                    )}
                </div>
                <div className="w-full h-1/3 mt-4 bg-white/20 rounded-xl p-3 flex flex-col justify-between">
                     <div className="flex justify-between items-start"><div className="bg-indigo-900/80 w-16 h-8 rounded mb-2 flex items-center justify-center text-green-400 font-mono text-xs border border-white/20 shadow-inner">$1.50</div><div className="grid grid-cols-3 gap-1">{[1,2,3,4,5,6].map(n => <div key={n} className="w-3 h-3 bg-indigo-900 rounded-full"></div>)}</div></div>
                     <div className="w-full h-12 bg-indigo-950/50 rounded-b-lg border-t-4 border-indigo-800 shadow-inner"></div>
                </div>
            </div></div>
        </div>
    </section>
  );
};

export const AdsSection = () => {
    const [config, setConfig] = useState(DEFAULT_ADS_CONFIG);
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'ads'), (d) => {
            if(d.exists()) setConfig(d.data() as any);
        });
        return () => unsub();
    }, []);

    if (!config.active || !config.url) return null;

    const Content = () => (
        <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative group bg-black">
            {config.type === 'video' ? (
                <video src={config.url} autoPlay loop muted playsInline className="w-full h-auto max-h-[500px] object-contain" />
            ) : (
                <img src={config.url} alt="Advertisement" className="w-full h-auto max-h-[500px] object-contain" />
            )}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm">Sponsored</div>
        </div>
    );

    return (
        <section className="py-8 px-6 bg-[#0f0c29]">
            {config.link ? (
                <a href={config.link} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:scale-[1.01]">
                    <Content />
                </a>
            ) : (
                <Content />
            )}
        </section>
    );
};

export const ProductShowcase = () => {
  const { t } = useContext(LanguageContext);
  const [products, setProducts] = useState<any[]>([]);
  
  const DEFAULTS = [
       { id: '1', name: "Maggi Hot Cup", price: "2.50", image: "https://www.maggi.my/sites/default/files/styles/home_stage_944_531/public/2020-10/MAGGI%20HOT%20CUP%20Curry%2059g.png" },
       { id: '2', name: "Milo Kotak", price: "1.80", image: "https://www.milo.com.my/sites/default/files/2023-06/MILO_UHT_125ml_0.png" },
       { id: '3', name: "Air Mineral", price: "1.20", image: "https://www.spritzer.com.my/wp-content/uploads/2022/07/Mineral-Water-550ml-1.png" },
       { id: '4', name: "Roti 7 Days", price: "1.50", image: "https://www.7days.com/sites/default/files/2021-02/croissant_chocolate_0.png" }
  ];

  useEffect(() => {
    try {
        const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'products'), (snap) => {
            if (!snap.empty) setProducts(snap.docs.map(d => ({id: d.id, ...d.data()})));
            else setProducts(DEFAULTS);
        }, (error) => {
            setProducts(DEFAULTS);
        });
        return () => unsub();
    } catch (e) {
        setProducts(DEFAULTS);
    }
  }, []);

  return (
    <section className="py-20 px-6 bg-indigo-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16"><h2 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-2">{t('restocked')}</h2><h3 className="text-4xl font-black text-slate-900 mb-4">{t('whats_inside')}</h3><p className="text-slate-500 max-w-2xl mx-auto">{t('grab_snacks')}</p></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
                <div key={product.id || Math.random()} className={`group relative p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-100">RM {product.price}</div>
                    <div className="h-40 flex items-center justify-center mb-4 p-2 relative"><img src={product.image} alt={product.name} className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300" onError={(e: any) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x400/f3f4f6/94a3b8?text=${encodeURIComponent(product.name)}`; }} /></div>
                    <div className="text-center"><h4 className={`text-lg font-black text-slate-800 mb-1`}>{product.name}</h4><button className="mt-3 w-full py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 shadow-sm border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all flex items-center justify-center gap-2"><span>{t('select')}</span></button></div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export const AboutUs = () => {
  const { t } = useContext(LanguageContext);
  const team = [
    { name: "Livis", role: "CEO", color: "bg-purple-100 text-purple-600" },
    { name: "Yuan Kang", role: "CFO", color: "bg-blue-100 text-blue-600" },
    { name: "Aiman", role: "COO", color: "bg-green-100 text-green-600" },
    { name: "Premi", role: "CMO", color: "bg-pink-100 text-pink-600" },
    { name: "Yi Han", role: "CPO", color: "bg-orange-100 text-orange-600" },
  ];
  return (
    <section className="py-24 px-6 bg-indigo-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16"><h2 className="text-4xl font-black text-slate-900 mb-4">{t('about_title')}</h2><p className="text-slate-500 max-w-2xl mx-auto text-lg">{t('about_desc')}</p><div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600"><MapPin size={18} className="text-red-500" /><span className="font-medium">Faculty of Economics and Management (FEP)</span></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">{team.map((member, index) => (<div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300 relative group"><div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-slate-100 border-4 border-white shadow-md"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" /></div><h3 className="text-xl font-bold text-slate-800 mb-1">{member.name}</h3><span className={`px-3 py-1 rounded-full text-xs font-bold ${member.color}`}>{member.role}</span></div>))}</div>
            <div className="mt-20 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-center text-white relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div><h3 className="text-2xl font-bold mb-4 relative z-10">{t('mission_title')}</h3><p className="max-w-3xl mx-auto text-slate-300 leading-relaxed relative z-10">{t('mission_desc')}</p></div>
            <div className="mt-20"><h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">{t('visit_us')}</h3><div className="w-full h-96 bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 relative group"><iframe title="Jido Budi Location" width="100%" height="100%" id="gmap_canvas" src="https://maps.google.com/maps?q=Faculty%20of%20Economics%20%26%20Management%2C%2043600%20Bangi%2C%20Selangor&t=&z=15&ie=UTF8&iwloc=&output=embed" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-500"></iframe><div className="absolute inset-0 pointer-events-none border-[12px] border-white/20 rounded-[2.5rem]"></div></div></div>
        </div>
    </section>
  );
};

export const LeaderboardPage = () => {
    const { t } = useContext(LanguageContext);
    const [leaders, setLeaders] = useState<any[]>([]);
    useEffect(() => {
        try {
            onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard')), (s) => {
                 let data = s.docs.map(d => ({ id: d.id, ...d.data() }));
                 data.sort((a: any,b: any) => b.score - a.score);
                 setLeaders(data.slice(0,10));
            }, (err) => console.log("Leaderboard offline"));
        } catch(e) {}
    }, []);
    return (
        <section className="py-24 px-6 bg-indigo-50 min-h-screen flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10"><h2 className="text-4xl font-black text-slate-900 mb-2">{t('top_snackers')}</h2></div>
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative"><div className="p-6 space-y-1">{leaders.length > 0 ? leaders.map((p, i) => (<div key={p.id} className="flex items-center justify-between py-4 px-4 border-b border-slate-100 last:border-0"><div className="flex items-center gap-4"><span className="font-black text-lg w-6">{i + 1}</span><img src={p.photoURL} className="w-10 h-10 rounded-full" /><span className="text-base font-bold text-slate-700">{p.name}</span></div><span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{p.score}</span></div>)) : <div className="text-center py-8 text-slate-400">{t('no_scores')}</div>}</div></div>
            </div>
        </section>
    );
};

export const ProfilePage = ({ user }: { user: UserProfile }) => {
    const { t } = useContext(LanguageContext);
    const [profileData, setProfileData] = useState<any>(null);
    const [userVouchers, setUserVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [redeemCode, setRedeemCode] = useState('');

    useEffect(() => {
        if (user?.uid) {
            getDoc(doc(db, 'artifacts', appId, 'users', user.uid)).then(s => setProfileData(s.exists() ? s.data() : { name: user.displayName, email: user.email, role: 'Guest', joinedAt: new Date() }));
            const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'vouchers'));
            onSnapshot(q, (s) => {
                let vouchers = s.docs.map(d => ({id: d.id, ...d.data()}));
                vouchers.sort((a: any,b: any) => (b.sentAt?.toDate ? b.sentAt.toDate() : 0) - (a.sentAt?.toDate ? a.sentAt.toDate() : 0));
                setUserVouchers(vouchers);
                setLoading(false); 
            }, () => setLoading(false));
        }
    }, [user]);

    const handleRedeem = async () => {
        if(!redeemCode) return;
        try {
            const codeRef = doc(db, 'artifacts', appId, 'public', 'data', 'flash_codes', redeemCode);
            const codeSnap = await getDoc(codeRef);
            if(codeSnap.exists() && codeSnap.data().active && codeSnap.data().used < codeSnap.data().limit) {
                const reward = codeSnap.data().reward;
                await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'vouchers'), {
                    code: `FLASH-${redeemCode}`, name: user.displayName, email: user.email, score: 'N/A', sentAt: new Date(), status: 'redeemed', gameType: 'flash-event', reward
                });
                await updateDoc(codeRef, { used: codeSnap.data().used + 1 });
                alert(t('code_success'));
                setRedeemCode('');
            } else {
                alert(t('invalid_code'));
            }
        } catch(e) { alert("Error redeeming"); }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-500" /></div>;

    return (
        <section className="py-24 px-6 bg-indigo-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12"><h2 className="text-4xl font-black text-slate-900 mb-4">{t('profile_title')}</h2><p className="text-slate-500">{t('profile_desc')}</p></div>
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -mt-16 mb-6 flex justify-center"><div className="p-2 bg-white rounded-full"><img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="Profile" className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white shadow-md" /></div></div>
                        <div className="text-center mb-8"><h3 className="text-2xl font-bold text-slate-800">{profileData?.name}</h3><p className="text-slate-500">{profileData?.email}</p><span className="inline-block mt-2 px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">{profileData?.role || 'User'}</span></div>
                        
                        <div className="max-w-md mx-auto mb-8 flex gap-2">
                             <input type="text" placeholder={t('redeem_code')} value={redeemCode} onChange={e => setRedeemCode(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                             <button onClick={handleRedeem} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800">{t('redeem_btn')}</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4"><div className="p-3 bg-white rounded-xl shadow-sm text-blue-500"><Calendar size={24} /></div><div><p className="text-xs text-slate-400 font-bold uppercase">{t('member_since')}</p><p className="font-semibold text-slate-700">{profileData?.joinedAt?.toDate ? profileData.joinedAt.toDate().toLocaleDateString() : 'N/A'}</p></div></div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4"><div className="p-3 bg-white rounded-xl shadow-sm text-purple-500"><Shield size={24} /></div><div><p className="text-xs text-slate-400 font-bold uppercase">{t('account_type')}</p><p className="font-semibold text-slate-700">Standard</p></div></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100"><div className="p-8"><div className="flex items-center gap-3 mb-6"><div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Ticket size={24}/></div><h3 className="text-2xl font-bold text-slate-800">{t('my_vouchers')}</h3></div>
                    {userVouchers.length === 0 ? <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300"><p className="text-slate-400 mb-4">{t('no_vouchers')}</p><Gamepad2 size={48} className="text-slate-200 mx-auto" /></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{userVouchers.map((v) => (<div key={v.id} className="relative p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-2xl flex flex-col justify-between overflow-hidden group hover:border-blue-300 transition-colors"><div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Ticket size={80} /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('voucher_code')}</p><p className="text-xl font-mono font-black text-slate-800 tracking-widest">{v.code}</p></div><div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end"><div><p className="text-[10px] text-slate-400 uppercase font-bold">{t('voucher_won')}</p><p className="text-sm font-medium text-slate-600">{v.sentAt?.toDate ? v.sentAt.toDate().toLocaleDateString() : 'Just now'}</p></div><div className="text-right"><p className="text-[10px] text-slate-400 uppercase font-bold">{t('game_played')}</p><p className="text-sm font-medium text-blue-600 capitalize">{v.gameType || 'Arcade'}</p></div></div></div>))}</div>}
                </div></div>
            </div>
        </section>
    );
};