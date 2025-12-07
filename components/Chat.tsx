import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, X, Send, Loader } from 'lucide-react';
import { LanguageContext } from '../App';

const JIDO_SYSTEM_INSTRUCTION = `You are Jido, the friendly AI mascot for "Jido Budi - Snack Match & Arcade". 
Your goal is to help users navigate the website and feel excited about winning snacks.

**Website Context:**
- **Games:** "Snack Match" (Match-3 puzzle) and "Snack Swipe" (Catch falling items).
- **Winning:** Score **1000 points** within **60 seconds** to win a real voucher.
- **Prizes:** Vouchers for Maggi Hot Cup, Milo, Mineral Water, and 7 Days Croissant.
- **Features:** Leaderboard, Admin Console, User Profile (to view vouchers).
- **Location:** Faculty of Economics and Management (FEP).

**Guidelines:**
1. **Be Concise:** Keep answers SHORT (max 2-3 sentences). Users are here to play, not read.
2. **Be Relevant:** If asked about topics outside of snacks, games, or the website, playfully steer the conversation back to Jido Budi.
3. **Be Helpful:** Explain game rules clearly if asked.
4. **No Hallucinations:** Do not invent features (like "Jido Maps") that do not exist in the context above.

**Example Interaction:**
User: "How do I win?"
Jido: "Just score 1000 points in 60 seconds in either Snack Match or Snack Swipe! Good luck! 🎮"
`;

export const ChatWithJido = () => {
    const { t } = useContext(LanguageContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => { 
        setMessages([{ role: 'assistant', text: t('chat_intro') }]); 
    }, [t]); 
    
    // Auto-scroll
    useEffect(() => { 
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        const userMessage = inputText;
        
        // Optimistic UI update
        const newMessages = [...messages, { role: 'user', text: userMessage }];
        setMessages(newMessages);
        setInputText('');
        setIsLoading(true);

        try {
            const apiKey = process.env.API_KEY;
            
            // Demo mode fallback if no key is present
            if (!apiKey) {
                setTimeout(() => {
                     setMessages(prev => [...prev, { role: 'assistant', text: "I'm currently in demo mode! I recommend the Maggi Hot Cup or the 7 Days Croissant. They are yummy! 😋 (Configure API Key for full AI chat)" }]);
                     setIsLoading(false);
                }, 800);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Prepare history for context awareness
            // Map 'assistant' (UI) to 'model' (API)
            const history = newMessages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            // We use 'gemini-2.5-flash' for fast, smart, and concise chat interactions.
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: history,
                config: {
                    systemInstruction: JIDO_SYSTEM_INSTRUCTION,
                    maxOutputTokens: 150, // Enforce brevity
                    temperature: 0.7,
                }
            });
            
            const botResponse = response.text;

            if (!botResponse) {
                throw new Error("EMPTY_RESPONSE");
            }
            
            setMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);
        } catch (error: any) {
            console.error("Gemini Error:", error);
            
            let errorMessage = "Beep boop! My connection is a bit fuzzy. Did you know we have special vouchers today? 🎟️";
            
            if (error.message === "EMPTY_RESPONSE") {
                errorMessage = "I heard you, but I'm not sure what to say. Could you ask that differently?";
            } else if (error.message?.includes("403") || error.message?.includes("API key")) {
                errorMessage = "My API Key seems to be invalid. Please check the configuration.";
            } else if (error.message?.includes("429")) {
                errorMessage = "I'm getting too many questions! Give me a second to cool down. 🧊";
            } else if (error.message?.includes("503") || error.message?.includes("500")) {
                errorMessage = "My brain is taking a quick nap. Try again shortly!";
            }
            
            setMessages(prev => [...prev, { role: 'assistant', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 border-4 border-white/20 animate-bounce-slow group">{isOpen ? <X size={28} /> : <Bot size={28} />}</button>
            {isOpen && <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-10 fade-in duration-300"><div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3"><Bot className="text-white" size={24} /><h3 className="text-white font-bold">{t('chat_header')}</h3></div><div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 min-h-[300px]">{messages.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-100 text-slate-800'}`}>{msg.text}</div></div>))}<div ref={messagesEndRef} /></div><form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2"><input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={t('chat_placeholder')} className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2 text-sm outline-none text-slate-900" /><button type="submit" disabled={isLoading} className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50">{isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}</button></form></div>}
        </>
    );
};