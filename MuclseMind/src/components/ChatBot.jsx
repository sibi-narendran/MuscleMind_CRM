import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import chatIcon from '../assets/robot.png';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi, how can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const buttonRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatRef.current && 
        !chatRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Replace with your AI API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button - Added bounce animation */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-7 inline-flex items-center justify-center text-sm font-medium 
          rounded-full w-14 h-14 bg-gradient-to-r from-slate-800 to-indigo-900 
          hover:from-slate-900 hover:to-indigo-950 shadow-lg transition-all duration-300
          animate-bounce-slow"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <img 
          src={chatIcon} 
          alt="AI Chat"
          className="w-8 h-8 object-contain"
        />
      </button>

      {/* Chat Window - Added responsive classes */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[calc(3.2rem+1.5rem)] right-0 mr-3 sm:mr-8 
              w-[95vw] sm:w-[320px] md:w-[380px] lg:w-[320px] 
              h-[80vh] sm:h-[500px] 
              rounded-2xl overflow-hidden shadow-2xl
              max-h-[500px]"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 -z-10" />

            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-800 to-indigo-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <img 
                    src={chatIcon} 
                    alt="AI Assistant"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-base text-white">Dental AI Assistant</h2>
                  <p className="text-xs text-white/70">Always here to help</p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="p-4 h-[calc(100%-8rem)] overflow-y-auto scrollbar-thin 
              scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 mb-16">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`flex items-start gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex flex-col w-full max-w-[320px] leading-1.5 ${
                      message.role === 'user' 
                        ? 'items-end' 
                        : 'items-start'
                    }`}>
                      <div className={`flex items-center space-x-2 rtl:space-x-reverse mb-1`}>
                        <span className="text-sm font-semibold text-white">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        <span className="text-sm font-normal text-gray-300">
                          {message.timestamp && format(message.timestamp, 'HH:mm')}
                        </span>
                      </div>
                      <div className={`flex flex-col leading-1.5 p-4 border-gray-200 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-s-xl rounded-ee-xl'
                          : 'bg-gray-700 text-white rounded-e-xl rounded-es-xl'
                      }`}>
                        <p className="text-sm font-normal text-white">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading Message with Robot Icon */}
              {isLoading && (
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex flex-col w-full max-w-[320px] leading-1.5">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                          <img 
                            src={chatIcon} 
                            alt="AI thinking"
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                        <p className="text-sm text-gray-500">AI is thinking...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Next Message Indicator */}
              {/* {messages.length > 0 && !isLoading && (
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center animate-bounce opacity-50">
                    <img 
                      src={chatIcon} 
                      alt="More messages"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                </div>
              )}
               */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Adjusted for both themes */}
            <div className="p-2 sm:p-2 bg-gradient-to-r from-slate-800 to-indigo-900 absolute bottom-0 left-0 right-0">
              <form onSubmit={handleSendMessage} className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 text-sm text-white bg-slate-700/50 rounded-lg border border-slate-600 
                    focus:ring-slate-500 focus:border-slate-500 
                    placeholder-slate-300 
                    dark:text-white dark:placeholder-slate-300"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="inline-flex justify-center p-3 text-white bg-slate-700 hover:bg-slate-800 
                    rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot; 