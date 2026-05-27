import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, Loader2, Home, Building, Hotel, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUERIES = [
  { label: "Find houses in Jigjiga", icon: Home },
  { label: "Cheap apartments", icon: Building },
  { label: "Commercial buildings", icon: Landmark },
  { label: "Hotels nearby", icon: Hotel },
];

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (input?: string) => {
    const textToSend = input || message;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      const aiMessage: Message = { role: 'assistant', content: data.text || 'I encountered an issue processing your request.' };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setChatHistory((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Waan ka xunnahay, adeegga AI hadda ma heli karno. Fadlan dib iskugu day ama hubi xiriirkaaga.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button - Mini Premium Design */}
      <motion.button
        id="amaanchat-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-9 h-9 rounded-xl bg-[#1E3A8A] text-white shadow-lg shadow-[#1E3A8A]/20 transition-all z-[9999] flex items-center justify-center group"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: [0, -4, 0],
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: { duration: 0.3 },
          opacity: { duration: 0.3 }
        }}
        whileHover={{ scale: 1.1, backgroundColor: '#1e40af' }}
        whileTap={{ scale: 0.9 }}
      >
        <Sparkles size={16} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="amaanchat-window"
            initial={{ opacity: 0, y: 30, scale: 0.95, x: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 30, scale: 0.95, x: 10 }}
            className={`fixed bottom-20 right-0 sm:right-6 w-full sm:w-[320px] h-[480px] sm:h-[480px] max-h-[80vh] bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[9998] backdrop-blur-xl ${
              isOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-zinc-900 dark:bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center shadow-inner">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xs tracking-tight">Amaan Chatbot</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">AI System Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="space-y-6 pt-4">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Sparkles size={24} className="text-[#1E3A8A]" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Smart AI Property Assistant</h2>
                  
                  <div className="bg-[#1E3A8A]/5 dark:bg-[#1E3A8A]/10 p-4 rounded-2xl border border-[#1E3A8A]/10">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      Smart AI property assistant coming soon. We are preparing an advanced real estate intelligence system for Somalia and Ethiopia.
                    </p>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Planned Features</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['Valuation', 'Matchmaking', 'Deep Search'].map((feat) => (
                        <span key={feat} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area (Disabled for Coming Soon) */}
            <div className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
              <div className="relative group grayscale">
                <input
                  type="text"
                  placeholder="System upgrading..."
                  className="w-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-4 pr-12 text-sm text-zinc-400 cursor-not-allowed"
                  disabled
                />
                <div className="absolute right-2 top-2 bottom-2 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-400">
                  <Send size={14} />
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.3em]">AmaanEstate Premium</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
