import React, { useState, useEffect, useContext } from 'react';
import { Shield, LayoutDashboard, Megaphone, Home, Package, Settings, Users, Ticket, Loader, Plus, Trash2, Save, MonitorPlay } from 'lucide-react';
import { getDocs, query, collection, setDoc, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../services/firebase';
import { LanguageContext } from '../LanguageContext';
import { DEFAULT_HOME_CONFIG, DEFAULT_GAME_CONFIG, DEFAULT_ANNOUNCEMENT, DEFAULT_ADS_CONFIG } from '../constants';

const MOCK_USERS = [
    { name: 'Ali', email: 'ali@example.com', createdAt: { toDate: () => new Date('2024-01-15') } },
    { name: 'Siti', email: 'siti@example.com', createdAt: { toDate: () => new Date('2024-02-20') } },
    { name: 'Ah Hock', email: 'ahhock@example.com', createdAt: { toDate: () => new Date('2024-03-10') } },
    { name: 'Sarah', email: 'sarah@example.com', createdAt: { toDate: () => new Date('2024-03-12') } },
];
const MOCK_VOUCHERS = [
    { code: 'MATCH-X9D2', name: 'Ali', score: 1200, sentAt: { toDate: () => new Date() } },
    { code: 'SWIPE-K2L1', name: 'Siti', score: 1550, sentAt: { toDate: () => new Date(Date.now() - 86400000) } },
    { code: 'MATCH-P0P0', name: 'Ah Hock', score: 1100, sentAt: { toDate: () => new Date(Date.now() - 172800000) } },
];
const MOCK_PRODUCTS = [
    { id: '1', name: "Maggi Hot Cup", price: "2.50", image: "https://www.maggi.my/sites/default/files/styles/home_stage_944_531/public/2020-10/MAGGI%20HOT%20CUP%20Curry%2059g.png" },
    { id: '2', name: "Milo Kotak", price: "1.80", image: "https://www.milo.com.my/sites/default/files/2023-06/MILO_UHT_125ml_0.png" },
];

// Helper to race a promise against a timeout
const fetchWithTimeout = async <T,>(promise: Promise<T>, fallback: T, timeoutMs = 200): Promise<T> => {
    let timeoutHandle: any;
    const timeoutPromise = new Promise<T>((resolve) => {
        timeoutHandle = setTimeout(() => resolve(fallback), timeoutMs);
    });
    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutHandle);
        return result;
    } catch (e) {
        clearTimeout(timeoutHandle);
        return fallback;
    }
};

export const AdminConsole = ({ user }: { user: any }) => {
    const { t } = useContext(LanguageContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ users: 0, vouchers: 0 });
    const [userList, setUserList] = useState<any[]>([]);
    const [voucherList, setVoucherList] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [homeConfig, setHomeConfig] = useState(DEFAULT_HOME_CONFIG);
    const [gameConfig, setGameConfig] = useState(DEFAULT_GAME_CONFIG);
    const [announcementConfig, setAnnouncementConfig] = useState(DEFAULT_ANNOUNCEMENT);
    const [adsConfig, setAdsConfig] = useState(DEFAULT_ADS_CONFIG);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '' });
    const [newFlashCode, setNewFlashCode] = useState({ code: '', reward: '', limit: 10 });

    useEffect(() => {
        const loadFast = async () => {
            setLoading(true);

            // Fetch Users
            const usersPromise = getDocs(query(collection(db, 'artifacts', appId, 'public', 'data', 'accounts')))
                .then(snap => snap.docs.map(d => d.data()));
            const usersData = await fetchWithTimeout(usersPromise, MOCK_USERS);
            setUserList(usersData);

            // Fetch Vouchers
            const vouchersPromise = getDocs(query(collection(db, 'artifacts', appId, 'public', 'data', 'admin_vouchers')))
                .then(snap => snap.docs.map(d => ({id: d.id, ...d.data()})));
            const vouchersData = await fetchWithTimeout(vouchersPromise, MOCK_VOUCHERS);
            setVoucherList(vouchersData);

            // Fetch Products
            const productsPromise = getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'products'))
                .then(snap => snap.empty ? MOCK_PRODUCTS : snap.docs.map(d => ({id: d.id, ...d.data()})));
            const productsData = await fetchWithTimeout(productsPromise, MOCK_PRODUCTS);
            setProducts(productsData);

            // Fetch Configs
            const homePromise = getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'home'))
                .then(snap => snap.exists() ? snap.data() : DEFAULT_HOME_CONFIG);
            const homeData = await fetchWithTimeout(homePromise, DEFAULT_HOME_CONFIG);
            setHomeConfig(homeData as any);
            
            // Fetch Ads Config
            const adsPromise = getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'ads'))
                .then(snap => snap.exists() ? snap.data() : DEFAULT_ADS_CONFIG);
            const adsData = await fetchWithTimeout(adsPromise, DEFAULT_ADS_CONFIG);
            setAdsConfig(adsData as any);

            setStats({ users: usersData.length, vouchers: vouchersData.length });
            setLoading(false);
        };
        loadFast();
    }, [activeTab]);

    const handleSaveHomeConfig = async () => { 
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'home'), homeConfig); } catch (e) {}
        alert("Done saved"); 
    };
    const handleSaveGameConfig = async () => { 
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'game'), gameConfig); } catch (e) {}
        alert("Done saved"); 
    };
    const handleAddProduct = async () => { 
        if (!newProduct.name) return; 
        const newItem = { id: 'demo-' + Date.now(), ...newProduct };
        setProducts([...products, newItem]);
        try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), newProduct); } catch (e) {}
        setNewProduct({ name: '', price: '', image: '' }); 
    };
    const handleDeleteProduct = async (id: string) => { 
        setProducts(prev => prev.filter(p => p.id !== id));
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id)); } catch (e) {}
    };
    const saveConfig = async (key: string, data: any) => { 
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', key), data); } catch(e) {}
        alert("Done saved"); 
    };
    const handleCreateFlashCode = async () => { 
        if(!newFlashCode.code) return; 
        alert(`Code ${newFlashCode.code} Created (Demo)`);
        setNewFlashCode({ code: '', reward: '', limit: 10 }); 
    };

    const TabButton = ({ id, icon: Icon, label }: any) => (<button onClick={() => setActiveTab(id)} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Icon size={20} /><span className="font-semibold">{label}</span></button>);

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden pt-16">
            <div className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col gap-2">
                <div className="mb-8 px-2"><h2 className="text-xl font-black text-white tracking-wider flex items-center gap-2"><Shield className="text-indigo-500" /> ADMIN <span className="text-indigo-500">PANEL</span></h2></div>
                <TabButton id="dashboard" icon={LayoutDashboard} label={t('admin_dashboard')} />
                <TabButton id="marketing" icon={Megaphone} label="Marketing" />
                <TabButton id="content" icon={Home} label={t('admin_content')} />
                <TabButton id="products" icon={Package} label={t('admin_products')} />
                <TabButton id="settings" icon={Settings} label={t('admin_settings')} />
                <TabButton id="users" icon={Users} label={t('admin_users')} />
                <TabButton id="vouchers" icon={Ticket} label={t('admin_vouchers')} />
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-900 p-8">
                {loading ? <div className="h-full flex items-center justify-center"><Loader className="animate-spin text-indigo-500" size={48} /></div> : (
                    <>
                        {activeTab === 'dashboard' && <div className="space-y-6"><h2 className="text-3xl font-bold text-white mb-6">Dashboard</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-slate-800 p-6 rounded-2xl border border-slate-700"><h3 className="text-4xl font-black text-white mb-1">{stats.users}</h3><p className="text-slate-400">Total Users</p></div><div className="bg-slate-800 p-6 rounded-2xl border border-slate-700"><h3 className="text-4xl font-black text-white mb-1">{stats.vouchers}</h3><p className="text-slate-400">Vouchers</p></div></div></div>}
                         {activeTab === 'marketing' && <div className="max-w-3xl space-y-8">
                             {/* Announcement Bar Config */}
                             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Megaphone className="text-indigo-400"/> Announcement Bar</h3><div className="flex gap-4"><input type="text" value={announcementConfig.text} onChange={e => setAnnouncementConfig({...announcementConfig, text: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Announcement Text" /><select value={announcementConfig.color} onChange={e => setAnnouncementConfig({...announcementConfig, color: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"><option value="bg-blue-600">Blue</option><option value="bg-red-600">Red</option><option value="bg-green-600">Green</option><option value="bg-yellow-600">Yellow</option></select><button onClick={() => setAnnouncementConfig({...announcementConfig, active: !announcementConfig.active})} className={`p-3 rounded-lg font-bold w-24 ${announcementConfig.active ? 'bg-green-600' : 'bg-slate-600'}`}>{announcementConfig.active ? 'ON' : 'OFF'}</button></div><button onClick={() => saveConfig('announcement', announcementConfig)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">Update Bar</button></div>
                             {/* Ads Config */}
                             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2"><MonitorPlay className="text-indigo-400"/> Ads Configuration</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <label className="text-slate-400 font-bold w-24">Status:</label>
                                        <button onClick={() => setAdsConfig({...adsConfig, active: !adsConfig.active})} className={`p-2 rounded-lg font-bold px-6 ${adsConfig.active ? 'bg-green-600' : 'bg-slate-600'}`}>{adsConfig.active ? 'Active' : 'Inactive'}</button>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-slate-400 font-bold w-24">Type:</label>
                                        <select value={adsConfig.type} onChange={e => setAdsConfig({...adsConfig, type: e.target.value as any})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white flex-1"><option value="image">Image</option><option value="video">Video</option></select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-slate-400 font-bold w-24">Media URL:</label>
                                        <input type="text" value={adsConfig.url} onChange={e => setAdsConfig({...adsConfig, url: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="https://..." />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="text-slate-400 font-bold w-24">Link URL:</label>
                                        <input type="text" value={adsConfig.link || ''} onChange={e => setAdsConfig({...adsConfig, link: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Optional click redirect" />
                                    </div>
                                    <button onClick={() => saveConfig('ads', adsConfig)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">Update Ads</button>
                                </div>
                             </div>
                             {/* Flash Voucher Config */}
                             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Ticket className="text-green-400"/> Create Flash Voucher</h3><div className="grid grid-cols-3 gap-4"><input type="text" placeholder="Code (e.g. FREECOKE)" value={newFlashCode.code} onChange={e => setNewFlashCode({...newFlashCode, code: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /><input type="text" placeholder="Reward Description" value={newFlashCode.reward} onChange={e => setNewFlashCode({...newFlashCode, reward: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /><input type="number" placeholder="Limit" value={newFlashCode.limit} onChange={e => setNewFlashCode({...newFlashCode, limit: parseInt(e.target.value)})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /></div><button onClick={handleCreateFlashCode} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">Create Code</button></div>
                        </div>}
                        {activeTab === 'content' && <div className="max-w-2xl"><h2 className="text-3xl font-bold text-white mb-6">Home Content</h2><div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4"><div><label className="block text-sm font-bold text-slate-400 mb-2">Title</label><input type="text" value={homeConfig.title} onChange={e => setHomeConfig({...homeConfig, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /></div><div><label className="block text-sm font-bold text-slate-400 mb-2">Subtitle</label><textarea value={homeConfig.subtitle} onChange={e => setHomeConfig({...homeConfig, subtitle: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-24" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-slate-400 mb-2">Media Type</label><select value={homeConfig.mediaType || 'image'} onChange={e => setHomeConfig({...homeConfig, mediaType: e.target.value as any})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"><option value="image">Image</option><option value="video">Video</option></select></div><div><label className="block text-sm font-bold text-slate-400 mb-2">Media URL</label><input type="text" value={homeConfig.heroImage || ''} onChange={e => setHomeConfig({...homeConfig, heroImage: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /></div></div><button onClick={handleSaveHomeConfig} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={18} /> Save</button></div></div>}
                        {activeTab === 'products' && <div><h2 className="text-3xl font-bold text-white mb-6">Products</h2><div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8"><h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus size={18}/> Add Product</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input type="text" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /><input type="text" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /><input type="text" placeholder="Image URL" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /></div><button onClick={handleAddProduct} className="mt-4 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold">Add</button></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{products.map((p) => (<div key={p.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex gap-4 items-center"><div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-1 shrink-0"><img src={p.image} alt={p.name} className="w-full h-full object-contain" onError={(e: any) => e.target.src='https://placehold.co/100'} /></div><div className="flex-1"><h4 className="font-bold text-white">{p.name}</h4><p className="text-indigo-400 font-mono">RM {p.price}</p></div><button type="button" onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg cursor-pointer z-10"><Trash2 size={18} /></button></div>))}</div></div>}
                        {activeTab === 'users' && <div><h2 className="text-3xl font-bold text-white mb-6">Users</h2><div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-950 text-slate-400 uppercase text-xs"><tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Joined</th></tr></thead><tbody className="divide-y divide-slate-700 text-sm">{userList.map((u, i) => (<tr key={i}><td className="p-4 text-white font-bold">{u.name}</td><td className="p-4 text-slate-300">{u.email}</td><td className="p-4 text-slate-500">{u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}</td></tr>))}</tbody></table></div></div>}
                        {activeTab === 'vouchers' && <div><h2 className="text-3xl font-bold text-white mb-6">Vouchers</h2><div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-950 text-slate-400 uppercase text-xs"><tr><th className="p-4">Code</th><th className="p-4">User</th><th className="p-4">Score</th></tr></thead><tbody className="divide-y divide-slate-700 text-sm">{voucherList.map((v, i) => (<tr key={i}><td className="p-4 text-yellow-400 font-mono font-bold">{v.code}</td><td className="p-4 text-white">{v.name}</td><td className="p-4 text-indigo-300">{v.score}</td></tr>))}</tbody></table></div></div>}
                        {activeTab === 'settings' && <div className="max-w-2xl"><h2 className="text-3xl font-bold text-white mb-6">Game Settings</h2><div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6"><div className="grid grid-cols-2 gap-6"><div><label className="block text-sm font-bold text-slate-400 mb-2">Winning Score</label><input type="number" value={gameConfig.winScore} onChange={e => setGameConfig({...gameConfig, winScore: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /></div><div><label className="block text-sm font-bold text-slate-400 mb-2">Time Limit (Sec)</label><input type="number" value={gameConfig.timeLimit} onChange={e => setGameConfig({...gameConfig, timeLimit: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" /></div></div><div><label className="block text-sm font-bold text-slate-400 mb-2">Game Theme</label><select value={gameConfig.theme || 'default'} onChange={e => setGameConfig({...gameConfig, theme: e.target.value as any})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"><option value="default">Default (Snacks)</option><option value="fruits">Healthy Fruits</option><option value="sports">Sports Day</option><option value="animals">Cute Animals</option></select></div><div><label className="block text-sm font-bold text-slate-400 mb-2">Voucher Probability (%)</label><input type="range" min="0" max="100" value={gameConfig.voucherProbability} onChange={e => setGameConfig({...gameConfig, voucherProbability: parseInt(e.target.value)})} className="w-full" /><div className="text-right text-indigo-400 font-mono">{gameConfig.voucherProbability}%</div></div><button onClick={() => saveConfig('game', gameConfig)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={18} /> Save Settings</button></div></div>}
                    </>
                )}
            </div>
        </div>
    );
};