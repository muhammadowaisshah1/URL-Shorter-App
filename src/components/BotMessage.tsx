import { FC, useState } from 'react';
import { Link, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface BotMessageProps {
  shortUrl: string;
  isError?: boolean;
}

const BotMessage: FC<BotMessageProps> = ({ shortUrl, isError = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      
      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex justify-start mb-4 animate-slide-left">
      <div className="max-w-[80%] md:max-w-[70%] chat-bubble-bot rounded-2xl rounded-bl-md px-4 py-3">
        {isError ? (
          <div className="flex items-center gap-2 text-destructive">
            <span className="text-lg">❌</span>
            <p className="text-sm font-medium">
              Oops! Something went wrong. Please try again.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-2 text-muted-foreground">
              <Sparkles size={16} className="text-primary" />
              <span>Short URL Generated!</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <Link size={16} className="text-primary flex-shrink-0" />
              <a 
                href={shortUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-mono break-all text-primary hover:underline flex-1"
              >
                {shortUrl}
              </a>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-primary/10"
              >
                {copied ? (
                  <Check size={14} className="text-success" />
                ) : (
                  <Copy size={14} className="text-muted-foreground" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-success mt-1 text-center font-medium">
                Copied to clipboard! 🎉
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BotMessage;