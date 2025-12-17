import React, { useState } from 'react';
import { X, ShoppingCart, Trash2, CreditCard, CheckCircle, Loader, Smartphone, Building, QrCode, ChevronLeft, Lock } from 'lucide-react';
import { useCart } from '../CartContext';

export const CartDrawer = () => {
    const { items, removeFromCart, total, isCartOpen, setIsCartOpen, clearCart } = useCart();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    if (!isCartOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ShoppingCart size={24} className="text-cyan-400" />
                        <h2 className="text-xl font-black tracking-wide">MY CART</h2>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <ShoppingCart size={64} className="mb-4 opacity-20" />
                            <p>Your cart is empty.</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.cartId} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-slate-50 rounded-lg" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                                    <p className="text-cyan-600 font-mono text-sm">RM {parseFloat(item.price).toFixed(2)} x {item.quantity}</p>
                                </div>
                                <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-500 font-bold">Total</span>
                        <span className="text-3xl font-black text-slate-900">RM {total.toFixed(2)}</span>
                    </div>
                    <button 
                        disabled={items.length === 0}
                        onClick={() => { setIsCartOpen(false); setIsPaymentOpen(true); }}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        CHECKOUT
                    </button>
                </div>
            </div>
            {isPaymentOpen && <PaymentModal total={total} onClose={() => { setIsPaymentOpen(false); clearCart(); }} />}
        </>
    );
};

const PaymentModal = ({ total, onClose }: { total: number, onClose: () => void }) => {
    // Steps: 'select' -> 'details' -> 'processing' -> 'success'
    const [step, setStep] = useState<'select' | 'details' | 'processing' | 'success'>('select');
    const [selectedMethod, setSelectedMethod] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

    const handleSelectMethod = (method: string) => {
        setSelectedMethod(method);
        setStep('details');
    };

    const handleConfirmPayment = () => {
        setStep('processing');
        // Simulate processing time
        setTimeout(() => setStep('success'), 2500);
    };

    const renderDetails = () => {
        switch (selectedMethod) {
            case 'Card':
                return (
                    <div className="space-y-4 text-left">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-cyan-500 transition-colors" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Expiry</label>
                                <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-cyan-500 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">CVC</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <input type="text" placeholder="123" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-cyan-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'QR':
            case 'TNG':
                return (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-inner">
                            {/* Generating a static QR for visual effect */}
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=JidoBudiPayment-${total}-${Date.now()}`} alt="Payment QR" className="mix-blend-multiply w-[150px] h-[150px]" />
                        </div>
                        <p className="text-sm text-slate-500 text-center max-w-[220px]">
                            Scan this QR code with your {selectedMethod === 'TNG' ? 'TNG eWallet' : 'Banking App'} to pay <strong className="text-slate-900 block text-lg mt-1">RM {total.toFixed(2)}</strong>
                        </p>
                    </div>
                );
            case 'FPX':
                return (
                    <div className="space-y-4 text-left">
                        <label className="text-xs font-bold text-slate-500 uppercase">Select Bank</label>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer text-slate-700"
                            onChange={(e) => setSelectedBank(e.target.value)}
                            value={selectedBank}
                        >
                            <option value="">-- Choose Bank --</option>
                            <option value="maybank2u">Maybank2u</option>
                            <option value="cimbclicks">CIMB Clicks</option>
                            <option value="publicbank">Public Bank</option>
                            <option value="rhb">RHB Now</option>
                            <option value="hongleong">Hong Leong Connect</option>
                            <option value="ambank">AmBank</option>
                            <option value="islam">Bank Islam</option>
                        </select>
                        <div className="p-4 bg-blue-50 text-blue-700 text-xs rounded-xl flex items-start gap-2 border border-blue-100">
                            <Building size={16} className="shrink-0 mt-0.5" />
                            <p>You will be redirected to your bank's secure login page to complete the transaction.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header for steps other than success */}
                {step !== 'success' && (
                    <div className="mb-6 flex items-center justify-center relative min-h-[32px]">
                        {step !== 'select' && step !== 'processing' && (
                            <button onClick={() => setStep('select')} className="absolute left-0 p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <h3 className="text-xl font-black text-slate-800">
                            {step === 'select' ? 'Select Payment' : step === 'processing' ? 'Processing...' : `Pay via ${selectedMethod}`}
                        </h3>
                    </div>
                )}

                {/* Content based on step */}
                {step === 'select' && (
                    <div className="space-y-4 overflow-y-auto">
                        <p className="text-slate-500 mb-4">Total Amount: <span className="font-bold text-slate-900">RM {total.toFixed(2)}</span></p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleSelectMethod('Card')} className="p-4 rounded-xl border-2 border-slate-100 hover:border-cyan-400 hover:bg-cyan-50 transition-all flex flex-col items-center gap-2 group">
                                <CreditCard className="text-slate-400 group-hover:text-cyan-500" size={32} />
                                <span className="font-bold text-sm text-slate-600 group-hover:text-cyan-600">Credit Card</span>
                            </button>
                            <button onClick={() => handleSelectMethod('FPX')} className="p-4 rounded-xl border-2 border-slate-100 hover:border-cyan-400 hover:bg-cyan-50 transition-all flex flex-col items-center gap-2 group">
                                <Building className="text-slate-400 group-hover:text-cyan-500" size={32} />
                                <span className="font-bold text-sm text-slate-600 group-hover:text-cyan-600">FPX Banking</span>
                            </button>
                            <button onClick={() => handleSelectMethod('TNG')} className="p-4 rounded-xl border-2 border-slate-100 hover:border-cyan-400 hover:bg-cyan-50 transition-all flex flex-col items-center gap-2 group">
                                <Smartphone className="text-slate-400 group-hover:text-cyan-500" size={32} />
                                <span className="font-bold text-sm text-slate-600 group-hover:text-cyan-600">TNG eWallet</span>
                            </button>
                             <button onClick={() => handleSelectMethod('QR')} className="p-4 rounded-xl border-2 border-slate-100 hover:border-cyan-400 hover:bg-cyan-50 transition-all flex flex-col items-center gap-2 group">
                                <QrCode className="text-slate-400 group-hover:text-cyan-500" size={32} />
                                <span className="font-bold text-sm text-slate-600 group-hover:text-cyan-600">DuitNow QR</span>
                            </button>
                        </div>
                        <button onClick={onClose} className="mt-6 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors block mx-auto py-2">Cancel Transaction</button>
                    </div>
                )}

                {step === 'details' && (
                    <div className="animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
                        <div className="flex-1 mb-6">
                            {renderDetails()}
                        </div>
                        <button 
                            onClick={handleConfirmPayment}
                            disabled={selectedMethod === 'FPX' && !selectedBank}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {selectedMethod === 'Card' ? `Pay RM ${total.toFixed(2)}` : selectedMethod === 'FPX' ? 'Proceed Securely' : 'I Have Paid'}
                        </button>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="py-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                             <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                             {selectedMethod === 'Card' && <CreditCard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />}
                             {selectedMethod === 'FPX' && <Building className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />}
                             {selectedMethod === 'TNG' && <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />}
                             {selectedMethod === 'QR' && <QrCode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />}
                        </div>
                        <p className="text-slate-500 font-medium">Verifying payment details...</p>
                        <p className="text-xs text-slate-400 mt-2">Please do not close this window.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-8 animate-in zoom-in duration-300">
                        <div className="mx-auto w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 animate-[bounce_1s_infinite]">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Payment Successful!</h3>
                        <p className="text-slate-500 mb-8">You have paid <span className="font-bold text-slate-900">RM {total.toFixed(2)}</span> via {selectedMethod}</p>
                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};