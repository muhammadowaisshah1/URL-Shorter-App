import { FC } from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator: FC = () => {
  return (
    <div className="flex justify-start mb-4 animate-slide-left">
      <div className="chat-bubble-bot rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-3">
          <Bot size={16} className="text-primary" />
          <div className="typing-dots">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <span className="text-sm text-muted-foreground">Generating short URL...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;