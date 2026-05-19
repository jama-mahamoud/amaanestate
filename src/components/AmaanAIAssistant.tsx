import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Search, 
  Languages 
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export default function AmaanAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"so" | "en">("so");
  
  // Voice input / Speech-to-Text state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Selected quick questions
  const quickSearches = {
    so: [
      { label: "Guriga kiro jigjiga", text: "Waxaan rabaa guri kiro ah oo Jigjiga kuyaala" },
      { label: "Dhul iib ah", text: "Ma haysaan dhul iib ah oo laga iibsado deegaanka?" },
      { label: "Madaaliyiinta korontada", text: "Koronto yaqaan ama farsamayaqaan ma haysaan?" },
      { label: "Gawaari iib ah", text: "Nirig ama baabuur iib ah ma kuu hayaan?" }
    ],
    en: [
      { label: "Rent house in Jigjiga", text: "Waxaan rabaa guri kiro ah oo Jigjiga kuyaala" },
      { label: "Land for sale", text: "Show me land for sale" },
      { label: "Find electricians", text: "Find verified engineers and electricians in Dire Dawa" },
      { label: "Apartments under $500", text: "Find comfortable apartments under $500" }
    ]
  };

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setUserInput(prev => prev + (prev ? " " : "") + transcript);
          toast.success(language === "so" ? "Codkii waa la duubay!" : "Speech captured successfully!");
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast.error(language === "so" ? "Fashil ku yimid aqoonsiga codka." : "Speech recognition failed: " + event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Adjust recognition language dynamically
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "so" ? "so-SO" : "en-US";
    }
  }, [language]);

  // Handle first-time welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = language === "so" 
        ? "Walaal soo dhawoow! Anigu waxaan ahay kaaliyaha caqliga badan ee AmaanEstate. Waxaan kaa caawin karaa guryaha, dhulka, gawaarida, ama madaaliyiinta ku yaal Deegaanka Soomaalida. Maxaan kuu qabtaa maanta? ❤️ \n\n*Tusaale: 'Waxaan rabaa guri kiro ah oo Jigjiga kuyaala' ama 'Find land for sale'*"
        : "Welcome to AmaanEstate Portal! I am your smart AI marketplace concierge. Ask me in Somali or English to discover properties, rentals, land, vehicles, or verified pros in the Somali Region dynamically!\n\n*Try: 'Guri kiro ah oo Jigjiga' or 'Find apartments under $500'*";
      setMessages([{ role: "model", text: welcomeText }]);
    }
  }, [isOpen, language]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!speechSupported) {
      toast.error(language === "so" ? "Qalabkaaga ama biraawsarku ma taageerayo codka." : "Speech-to-text is not supported on this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        toast.info(language === "so" ? "Dhegeysanaya... Fadlan dhowr kalmadood ku hadal." : "Listening... Please speak now.");
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim()) return;

    // Append user message
    const updatedMessages = [...messages, { role: "user", text: textToSend } as ChatMessage];
    setMessages(updatedMessages);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: updatedMessages.slice(1, -1) // slice to exclude general welcome and last prompt
        })
      });

      if (!response.ok) {
        let errMsg = "Chat api response error";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "model", text: data.text || "I apologize, but I couldn't understand that." }]);
    } catch (err: any) {
      console.error("AI assistant network failure:", err);
      setMessages(prev => [
        ...prev, 
        { 
          role: "model", 
          text: language === "so" 
            ? "Waan pashilnay in aan xiriir la samaynno serverka. Fadlan hubi khadka internetkaaga." 
            : "Connection error. Please try again later." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive link and markdown line compiler
  const parseLine = (line: string) => {
    let isBullet = false;
    let content = line;
    if (line.startsWith("- ") || line.startsWith("* ")) {
      isBullet = true;
      content = line.substring(2);
    }

    const segments: React.ReactNode[] = [];
    const combinedRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = content.split(combinedRegex);

    parts.forEach((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        segments.push(
          <strong key={i} className="font-extrabold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
        const titleMatch = part.match(/\[(.*?)\]/);
        const urlMatch = part.match(/\((.*?)\)/);
        if (titleMatch && urlMatch) {
          const title = titleMatch[1];
          const url = urlMatch[1];
          if (url.startsWith("/")) {
            segments.push(
              <Link
                key={i}
                to={url}
                className="text-luxury-gold hover:text-white underline font-bold transition-colors inline cursor-pointer py-0.5"
                onClick={() => setIsOpen(false)} // close chat on link navigation
              >
                {title}
              </Link>
            );
          } else {
            segments.push(
              <a
                key={i}
                href={url}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                className="text-luxury-gold hover:text-white underline font-bold transition-colors inline cursor-pointer py-0.5"
              >
                {title}
              </a>
            );
          }
        } else {
          segments.push(part);
        }
      } else {
        segments.push(part);
      }
    });

    if (isBullet) {
      return (
        <span className="flex items-start gap-2 pl-1 mb-1.5 md:pl-2">
          <span className="text-luxury-gold mt-1 text-sm select-none">•</span>
          <span className="flex-1 text-white/90 font-light text-sm md:text-base leading-relaxed">{segments}</span>
        </span>
      );
    }

    return <span className="text-white/90 font-light text-sm md:text-base leading-relaxed">{segments}</span>;
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => (
      <div key={idx} className="mb-2">
        {parseLine(line)}
      </div>
    ));
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-luxury-gold text-luxury-black shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:shadow-[0_0_35px_rgba(197,160,89,0.6)] border border-white/20 transition-all cursor-pointer relative overflow-hidden group"
          id="amaan-ai-assistant-btn"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:animate-shimmer" />
          {isOpen ? (
            <X size={26} className="text-luxury-black font-extrabold" />
          ) : (
            <div className="flex flex-col items-center">
              <Sparkles size={26} className="text-luxury-black animate-pulse" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Expandable Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 80 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 80 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-[480px] h-[calc(100vh-14rem)] md:h-[650px] bg-luxury-black/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col"
            id="amaan-ai-assistant-drawer"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center">
                  <Sparkles size={18} className="text-luxury-gold" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Amaan<span className="text-luxury-gold">AI</span> Concierge
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                      Online Contextualized Real-Time
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Language Selector */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                <Languages size={14} className="text-white/40 ml-1" />
                <button
                  onClick={() => setLanguage("so")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    language === "so" ? "bg-luxury-gold text-black" : "text-white/50 hover:text-white"
                  }`}
                >
                  SO
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    language === "en" ? "bg-luxury-gold text-black" : "text-white/50 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Chat list viewport */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-4 rounded-[1.8rem] text-sm md:text-base ${
                      msg.role === "user"
                        ? "bg-luxury-gold text-luxury-black font-semibold rounded-tr-sm"
                        : "bg-luxury-charcoal/60 border border-white/5 text-white/95 rounded-tl-sm shadow-md"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      renderFormattedText(msg.text)
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-luxury-charcoal/60 border border-white/5 p-4 rounded-[1.8rem] rounded-tl-sm flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-luxury-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-luxury-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-luxury-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested quick searches tags */}
            <div className="p-3 bg-white/5 border-t border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
              {quickSearches[language].map((search, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(search.text)}
                  className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/75 hover:bg-luxury-gold/10 hover:border-luxury-gold/30 text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer"
                >
                  {search.label}
                </button>
              ))}
            </div>

            {/* Controls Input Area */}
            <div className="p-5 bg-luxury-charcoal/80 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-2xl h-14 pl-4 pr-2"
              >
                <input
                  type="text"
                  placeholder={
                    language === "so" 
                      ? "Wax ku qor halkan ama taabo codka..." 
                      : "Type your query or speak click standard voice mic..."
                  }
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 bg-transparent text-white border-0 focus:outline-none focus:ring-0 text-sm md:text-base placeholder:text-white/30 h-full"
                />

                {/* Voice button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                    isListening 
                      ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/40" 
                      : "text-white/40 hover:text-white"
                  }`}
                  title="Speech-to-Text Voice input"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!userInput.trim() && !isLoading}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                    userInput.trim() 
                      ? "bg-luxury-gold text-black shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:scale-105" 
                      : "bg-white/5 text-white/20"
                  }`}
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="text-[9px] text-white/30 text-center mt-2 font-bold tracking-widest uppercase">
                AmaanEstate Trust-Certified Security Shield
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
