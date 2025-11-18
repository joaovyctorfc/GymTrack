import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToCoach, initializeChat } from '../services/geminiService';

const AICoach: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Olá! Eu sou o IronCoach. Como posso ajudar você a atingir seus objetivos de treino hoje?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Reset chat history when component mounts
  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const stream = sendMessageToCoach(userMsg.text);
      
      let fullResponse = "";
      // Add a placeholder message for streaming updates
      setMessages(prev => [...prev, { role: 'model', text: '', isThinking: true }]);
      
      for await (const chunk of stream) {
          fullResponse += chunk;
          setMessages(prev => {
              const newArr = [...prev];
              const lastMsg = newArr[newArr.length - 1];
              if (lastMsg.role === 'model') {
                  lastMsg.text = fullResponse;
                  lastMsg.isThinking = false;
              }
              return newArr;
          });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, encontrei um erro. Por favor, tente novamente." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-lg z-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-emerald-500/20 shadow-lg">
          <Bot size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">IronCoach</h2>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase rounded-full border border-amber-200 dark:border-amber-800">Beta</span>
          </div>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            Online • Powered by Gemini
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
            }`}>
               {msg.role === 'model' && msg.text === '' && msg.isThinking ? (
                   <div className="flex space-x-1 h-6 items-center">
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                       <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                   </div>
               ) : (
                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                </div>
               )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-24 transition-colors">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Peça uma rotina, dica ou conselho..."
            disabled={isTyping}
            className="w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-inner transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors shadow-lg"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3">
            O IronCoach está em fase beta. Informações podem ser imprecisas. Consulte sempre um profissional.
        </p>
      </div>
    </div>
  );
};

export default AICoach;