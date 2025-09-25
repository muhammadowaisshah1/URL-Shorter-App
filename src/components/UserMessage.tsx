import { FC } from 'react';
import { ExternalLink } from 'lucide-react';

interface UserMessageProps {
  url: string;
}

const UserMessage: FC<UserMessageProps> = ({ url }) => {
  return (
    <div className="flex justify-end mb-4 animate-slide-right">
      <div className="max-w-[80%] md:max-w-[70%] chat-bubble-user rounded-2xl rounded-br-md px-4 py-3 transition-smooth">
        <div className="flex items-center gap-2 text-sm font-medium mb-1">
          <ExternalLink size={16} />
          <span>Long URL</span>
        </div>
        <p className="text-sm break-all leading-relaxed opacity-95">
          {url}
        </p>
      </div>
    </div>
  );
};

export default UserMessage;