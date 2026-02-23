import { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { SiFacebook, SiYoutube } from 'react-icons/si';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { YouTubeUploadDialog } from './YouTubeUploadDialog';
import { toast } from 'sonner';
import type { Song } from '../backend';

interface SocialShareProps {
  song: Song;
}

export function SocialShare({ song }: SocialShareProps) {
  const [isYouTubeDialogOpen, setIsYouTubeDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleFacebookShare = async () => {
    setIsSharing(true);
    try {
      const shareUrl = song.audioFile.getDirectURL();
      
      // Try Web Share API first (works on mobile and some desktop browsers)
      if (navigator.share) {
        try {
          await navigator.share({
            title: song.title,
            text: `Check out my ${song.modeType === 'cover' ? 'cover' : 'song'}: "${song.title}" by ${song.artist}`,
            url: shareUrl,
          });
          toast.success('Shared successfully!');
          return;
        } catch (err: any) {
          // User cancelled or share failed, fall through to Facebook dialog
          if (err.name !== 'AbortError') {
            console.error('Web Share API failed:', err);
          }
        }
      }

      // Fallback to Facebook Share Dialog
      const fbShareUrl = `https://www.facebook.com/dialog/share?app_id=145634995501895&display=popup&href=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(window.location.href)}`;
      
      const width = 600;
      const height = 400;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      window.open(
        fbShareUrl,
        'facebook-share-dialog',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      toast.success('Opening Facebook share dialog...');
    } catch (err) {
      console.error('Facebook share failed:', err);
      toast.error('Failed to share to Facebook');
    } finally {
      setIsSharing(false);
    }
  };

  const handleYouTubeClick = () => {
    setIsYouTubeDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full"
            disabled={isSharing}
          >
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleFacebookShare}>
            <SiFacebook className="mr-2 h-4 w-4" />
            Share to Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleYouTubeClick}>
            <SiYoutube className="mr-2 h-4 w-4" />
            Upload to YouTube
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <YouTubeUploadDialog
        song={song}
        open={isYouTubeDialogOpen}
        onOpenChange={setIsYouTubeDialogOpen}
      />
    </>
  );
}
