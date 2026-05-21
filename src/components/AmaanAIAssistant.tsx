import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, AlertCircle, RefreshCw, ChevronDown, Bot, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const STARTER_PROMPTS = [
  { text: "Ka raadi guryo ku yaal Jigjiga", query: "Ma haysaan guryo ama dhul iib ah oo ku yaalla Jigjiga?" },
  { text: "Kala dooro khubaro la aqoonsaday", query: "Ma haysaan khubaro certified ah ama madaalayaal la hubiyay?" },
  { text: "Sideen ku noqdaa wakiil (Agent)?", query: "Waa maxay shuruudaha ama hannaanka loo maro si aan u noqdo verified agent?" },
  { text: "Wararkii ugu dambeeyay ee suuqa", query: "Waa maxay warbixintii ugu dambaysay ee ku saabsan suuqa hantida maguurtada ah ee gobolka?" }
];

export default function AmaanAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Kusoo dhawaada AmaanEstate AI Concierge! Waxaan halkan u joogaa inaan kugu caawiyo helitaanka hantida ugu fiican, dhul banaan, guryaha kireysan ama xirfadlayaal la awoodi karo oo ku yaal deegaanka. Maxaan maanta kuu caawin karaa?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom of the conversation on updates
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Handle message submission
  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = (customMessage || inputValue).trim();
    if (!messageToSend) return;

    if (!customMessage) {
      setInputValue('');
    }

    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error("Backend response failed");
      }

      const data = await response.json();
      
      if (data && data.text) {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        throw new Error("Unexpected answer structure");
      }
    } catch (err) {
      console.error("[AmaanAIAssistant] Error sending chat:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const parseBoldText = (text: string, parentKey: string | number) => {
    // Splits text into bold intervals
    const parts = text.split(/\*\*([^*]+)\*\*/);
    return (
      <span key={parentKey}>
        {parts.map((part, i) => (
          i % 2 === 1 ? (
            <strong key={`bold-${parentKey}-${i}`} className="font-extrabold text-white text-shadow-sm">
              {part}
            </strong>
          ) : (
            <span key={`text-${parentKey}-${i}`}>{part}</span>
          )
        ))}
      </span>
    );
  };

  const renderMessageContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed text-white/90">
        {lines.map((line, idx) => {
          let content = line.trim();
          
          // Handle itemization / Bullet list
          const isBullet = content.startsWith('- ') || content.startsWith('* ');
          if (isBullet) {
            content = content.substring(2);
          }

          // Relative URL extraction
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          const parts = [];
          let lastIndex = 0;
          let match;

          while ((match = linkRegex.exec(content)) !== null) {
            const [_, linkText, linkUrl] = match;
            const textBefore = content.substring(lastIndex, match.index);
            
            if (textBefore) {
              parts.push(parseBoldText(textBefore, `before-${idx}-${match.index}`));
            }
            
            parts.push(
              <Link
                key={`link-${idx}-${match.index}`}
                to={linkUrl}
                onClick={() => setIsOpen(false)} // close assistant sheet on route navigate
                className="text-[#C5A059] hover:text-[#e0b86e] font-bold underline transition-colors inline-flex items-center gap-0.5"
              >
                {linkText}
              </Link>
            );
            
            lastIndex = linkRegex.lastIndex;
          }

          if (lastIndex < content.length) {
            parts.push(parseBoldText(content.substring(lastIndex), `after-${idx}-${lastIndex}`));
          }

          const renderedLine = parts.length > 0 ? parts : parseBoldText(content, `plain-${idx}`);

          if (isBullet) {
            return (
              <div key={`bullet-line-${idx}`} className="flex items-start gap-2.5 pl-2">
                <span className="text-[#C5A059] mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C5A059] animate-pulse" />
                <span className="flex-1">{renderedLine}</span>
              </div>
            );
          }

          return content ? (
            <p key={`p-line-${idx}`}>{renderedLine}</p>
          ) : (
            <div key={`empty-line-${idx}`} className="h-2" />
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Sparkly Golden Launcher Button */}
      <motion.button
        id="amaan-ai-assistant-trigger"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#201F1D] text-[#C5A059] shadow-2xl border border-[#C5A059]/30 hover:bg-[#2F2D2A] transition-all cursor-pointer group hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="h-6 w-6 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C5A059]"></span>
        </span>
      </motion.button>

      {/* Slide-out Glass Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="amaan-ai-assistant-container"
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 flex h-[620px] w-full max-w-md flex-col rounded-[2.5rem] bg-[#141312]/98 border border-[#C5A059]/20 shadow-2xl overflow-hidden backdrop-blur-md"
          >
            {/* Header section with brand insignia */}
            <div className="flex items-center justify-between border-b border-white/5 bg-[#201F1D]/80 px-6 py-4.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059]">
                  <Bot className="h-5 w-5 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">Amaan AI Concierge</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Online Platform Advisor</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Conversation Container */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, idx) => (
                <div
                  key={`chat-msg-${idx}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 ${
                      msg.role === 'user'
                        ? 'bg-[#C5A059]/10 text-white rounded-br-sm border border-[#C5A059]/20'
                        : 'bg-white/5 text-white/90 rounded-bl-sm border border-white/5'
                    }`}
                  >
                    {renderMessageContent(msg.text)}
                  </div>
                </div>
              ))}

              {/* Loader during API invocation */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-[1.5rem] rounded-bl-sm px-5 py-3.5 bg-white/5 border border-white/5 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#C5A059]" />
                    <span className="text-xs text-white/40">Adeegga AI ayaa diyaarinaya jawaabta...</span>
                  </div>
                </div>
              )}

              {/* Graceful Error Display */}
              {hasError && (
                <div className="rounded-[1.5rem] bg-rose-500/10 border border-rose-500/20 p-4 space-y-3">
                  <div className="flex gap-2.5 text-rose-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Cilad ayaa dhacday</p>
                      <p className="text-xs text-white/60">Adeegga AI concierge kuma xiriiri karo server-ka. Fadlan hubi khadkaaga internetka ama dib isku day.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSendMessage()}
                      className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold px-3 py-1.5 transition-all"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Hadda isku day
                    </button>
                  </div>
                </div>
              )}

              <div ref={listEndRef} />
            </div>

            {/* Starter Suggestion Prompts */}
            {messages.length === 1 && !isLoading && (
              <div className="px-6 pb-2.5 space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/30 ml-1">Kala dooro talooyinka bilowga:</span>
                <div className="grid grid-cols-2 gap-2">
                  {STARTER_PROMPTS.map((prompt, i) => (
                    <button
                      key={`prompt-${i}`}
                      onClick={() => handleSendMessage(prompt.query)}
                      className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#C5A059]/30 rounded-2xl p-3 text-white/60 hover:text-white transition-all duration-300"
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Input Area */}
            <div className="border-t border-white/5 bg-[#141312] p-4.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#C5A059]/40 transition-colors px-4 py-1.5"
              >
                <input
                  type="text"
                  placeholder="Ma haysaan guri ku yaala Jigjiga?"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none h-10 pr-12 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 flex items-center justify-center h-8 w-8 rounded-xl bg-[#C5A059] text-black hover:bg-[#e0b86e] disabled:opacity-30 disabled:hover:bg-[#C5A059] transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
