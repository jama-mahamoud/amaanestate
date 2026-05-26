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

      const data = await response.json();
      const aiMessage: Message = { role: 'assistant', content: data.text || 'Sorry, I encountered an issue. Please try again.' };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Waan ka xunnahay, cilad ayaa ku timid adeegga AI. Fadlan xiriirka internetka hubi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        id="amaanchat-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#7C3AED] text-white shadow-2xl flex items-center justify-center z-[9999] group overflow-hidden"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: [0, -8, 0],
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles size={24} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
        
        {/* Soft Premium Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-white"
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="amaanchat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            className={`fixed bottom-24 right-0 sm:right-6 w-full sm:w-[400px] h-[calc(100vh-120px)] sm:h-[600px] max-h-[80vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[9998] backdrop-blur-xl ${
              isOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Amaan AI Assistant</h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-black">Find properties instantly</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {chatHistory.length === 0 && (
                <div className="space-y-6 pt-4">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-tr from-[#1E3A8A]/10 to-[#7C3AED]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#1E3A8A]/10">
                      <Sparkles size={32} className="text-[#1E3A8A]" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 italic">Iska warran?</h2>
                    <p className="text-sm text-zinc-500 max-w-[240px] mx-auto">
                      Halkan waxaad ka heli kartaa guryaha, dhulka iyo adeegyada magaalada ee AmaanEstate.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTED_QUERIES.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q.label)}
                        className="flex items-center gap-3 p-3 text-left text-sm bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center text-zinc-500 group-hover:text-[#1E3A8A] transition-colors">
                          <q.icon size={16} />
                        </div>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{q.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#1E3A8A] text-white rounded-tr-none' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-[#C5A059] prose-a:no-underline hover:prose-a:underline">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-[#1E3A8A]" />
                    <span className="text-xs font-medium text-zinc-500">Amaan AI is searching...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="absolute right-2 top-2 bottom-2 w-10 h-10 flex items-center justify-center rounded-xl bg-[#1E3A8A] text-white disabled:opacity-50 disabled:grayscale transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="mt-3 text-center">
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-[0.2em]">Crafted by AmaanEstate</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
