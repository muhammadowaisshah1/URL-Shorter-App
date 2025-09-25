import { useState, useRef, useEffect } from 'react';
import { Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserMessage from './UserMessage';
import BotMessage from './BotMessage';
import TypingIndicator from './TypingIndicator';
import confetti from 'canvas-confetti';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'typing';
  content: string;
  isError?: boolean;
}

const URLShortener = () => {
  const [url, setUrl] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const shortenUrl = async () => {
    if (!url.trim()) return;
    
    if (!isValidUrl(url)) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), type: 'user', content: url },
        { id: (Date.now() + 1).toString(), type: 'bot', content: 'Please enter a valid URL (including http:// or https://)', isError: true }
      ]);
      setUrl('');
      return;
    }

    setIsLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: url
    };
    
    // Add typing indicator
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'typing',
      content: ''
    };
    
    setMessages(prev => [...prev, userMessage, typingMessage]);
    setUrl('');

    try {
      const response = await fetch('https://muhammadowais12.app.n8n.cloud/webhook-test/shorten-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const data = await response.json();
      const shortUrl = data.shortUrl || data.shortened_url || data.url;
      
      if (!shortUrl) {
        throw new Error('No short URL received');
      }

      // Remove typing indicator and add bot response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.type !== 'typing');
        return [...withoutTyping, {
          id: Date.now().toString(),
          type: 'bot',
          content: shortUrl
        }];
      });

      // Success confetti after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.3 },
          colors: ['#3b82f6', '#8b5cf6', '#06d6a0']
        });
      }, 300);

    } catch (error) {
      console.error('Error shortening URL:', error);
      
      // Remove typing indicator and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.type !== 'typing');
        return [...withoutTyping, {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Failed to shorten URL',
          isError: true
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      shortenUrl();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="text-primary" size={32} />
            <h1 className="text-3xl font-bold gradient-text">Tiny URL Generator</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Transform long URLs into short, shareable links instantly
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-primary" size={24} />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ready to shorten URLs!</h2>
              <p className="text-muted-foreground text-sm">
                Paste your long URL below and I'll generate a short link for you.
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message) => {
          if (message.type === 'user') {
            return <UserMessage key={message.id} url={message.content} />;
          } else if (message.type === 'bot') {
            return (
              <BotMessage 
                key={message.id} 
                shortUrl={message.content} 
                isError={message.isError}
              />
            );
          } else if (message.type === 'typing') {
            return <TypingIndicator key={message.id} />;
          }
          return null;
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border/50 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto">
          <Input
            type="url"
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 h-12 text-base bg-card border-input-border focus:border-primary transition-smooth"
          />
          <Button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth"
          >
            <Send size={18} className="mr-2" />
            Generate
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to generate • Powered by Lovable
        </p>
      </div>
    </div>
  );
};

export default URLShortener;