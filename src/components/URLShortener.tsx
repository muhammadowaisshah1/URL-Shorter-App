import { useState } from 'react';
import { Zap, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

const URLShortener = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const shortenUrl = async () => {
    if (!url.trim()) return;
    
    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (including http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setShortUrl('');

    try {
      const response = await fetch('http://localhost:5678/webhook/shorten-url', {
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
      console.log('Webhook response:', data);
      
      // Extract the short URL from webhook response
      const generatedShortUrl = data.short_url || data.shortUrl || data.shortened_url || data.url;
      
      if (!generatedShortUrl) {
        throw new Error('No short URL received');
      }

      setShortUrl(generatedShortUrl);

      // Success confetti
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
      toast({
        title: "Error",
        description: "Failed to shorten URL. Please try again.",
        variant: "destructive",
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

  const handleNewUrl = () => {
    setUrl('');
    setShortUrl('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Zap className="text-primary" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Tiny URL Generator</h1>
          <p className="text-muted-foreground text-lg">
            Transform long URLs into short, shareable links instantly
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
          {!shortUrl ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="url-input" className="text-sm font-medium text-foreground">
                    Enter your long URL
                  </label>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/very/long/url..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                    className="h-14 text-base bg-background border-border focus:border-primary transition-smooth"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={!url.trim() || isLoading}
                  className="w-full h-14 text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-smooth"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <>
                      <Zap size={20} className="mr-2" />
                      Generate Short URL
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Congratulations!</h2>
                <p className="text-muted-foreground">Here is your shortened link:</p>
              </div>

              {/* Generated URL */}
              <div className="bg-background/50 border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Short URL:</p>
                    <p className="text-lg font-mono text-primary break-all">{shortUrl}</p>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="lg"
                    className="shrink-0 h-12 px-4"
                  >
                    {copied ? (
                      <>
                        <Check size={18} className="mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} className="mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Original URL */}
              <div className="bg-muted/30 rounded-lg p-4 mb-6">
                <p className="text-xs text-muted-foreground mb-1">Original URL:</p>
                <p className="text-sm text-foreground break-all">{url}</p>
              </div>

              {/* New URL Button */}
              <Button
                onClick={handleNewUrl}
                variant="secondary"
                className="w-full h-12"
              >
                Shorten Another URL
              </Button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Powered by Lovable • Fast, secure, and reliable
          </p>
        </div>
      </div>
    </div>
  );
};

export default URLShortener;
