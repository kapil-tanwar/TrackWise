'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const INITIAL_GREETING = {
  role: 'assistant',
  message: 'Hi! I am your TrackWise AI. Ask me anything about your finances.'
};

// ── Lightweight markdown → JSX renderer ───────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line → spacer
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Bullet list item (* or -)
    if (/^[\*\-]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[\*\-]\s+/.test(lines[i])) {
        items.push(
          <li key={i} className="ml-4 list-disc">
            {inlineFormat(lines[i].replace(/^[\*\-]\s+/, ''))}
          </li>
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="space-y-0.5 my-1">{items}</ul>);
      continue;
    }

    // Numbered list item
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(
          <li key={i} className="ml-4 list-decimal">
            {inlineFormat(lines[i].replace(/^\d+\.\s+/, ''))}
          </li>
        );
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="space-y-0.5 my-1">{items}</ol>);
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={i} className="leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
}

// Handle **bold** and *italic* inline
function inlineFormat(text) {
  const parts = [];
  // Split on **bold** or *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[0].startsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
    } else {
      parts.push(<em key={match.index}>{match[3]}</em>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}
// ──────────────────────────────────────────────────────────────────────────────

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const cardRef = useRef(null);

  // Close when clicking outside the chat card
  useEffect(() => {
    function handleClickOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const nextMessages = [...messages, { role: 'user', message: userMessage }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      // Send active session history so context is scoped to current session
      const historyContext = nextMessages
        .filter(m => m.message !== INITIAL_GREETING.message)
        .slice(-8);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: historyContext
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', message: data.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', message: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'assistant', message: 'Network error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card ref={cardRef} className="fixed bottom-6 right-6 w-[340px] md:w-[420px] h-[520px] shadow-2xl flex flex-col border-purple-200 dark:border-purple-900 z-50">
      {/* Header */}
      <CardHeader className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg flex flex-row items-center justify-between shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          TrackWise AI
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            title="Clear chat"
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-3 min-h-0">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-2 mt-1 shrink-0">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
            }`}>
              {msg.role === 'assistant'
                ? <div className="space-y-1">{renderMarkdown(msg.message)}</div>
                : msg.message
              }
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-2 shrink-0">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <CardFooter className="p-3 bg-white dark:bg-gray-950 border-t shrink-0">
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances..."
            className="flex-1 focus-visible:ring-purple-500 text-sm"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

