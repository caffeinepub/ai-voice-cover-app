import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { SiYoutube } from 'react-icons/si';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { Song } from '../backend';

interface YouTubeUploadDialogProps {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PrivacyStatus = 'public' | 'unlisted' | 'private';

export function YouTubeUploadDialog({ song, open, onOpenChange }: YouTubeUploadDialogProps) {
  const [title, setTitle] = useState(song.title);
  const [description, setDescription] = useState(
    `${song.modeType === 'cover' ? 'Cover' : 'Original song'} by ${song.artist}\n\nCreated with AI Voice Studio`
  );
  const [privacy, setPrivacy] = useState<PrivacyStatus>('unlisted');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Note: YouTube Data API requires OAuth2 authentication and server-side implementation
      // This is a client-side placeholder that demonstrates the UI flow
      // In production, this would call a backend endpoint that handles YouTube API authentication
      
      await new Promise((resolve) => setTimeout(resolve, 5000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(
        'YouTube upload initiated! Note: Full YouTube integration requires OAuth2 authentication setup.',
        { duration: 5000 }
      );

      // Show instructions for manual upload as fallback
      const audioUrl = song.audioFile.getDirectURL();
      toast.info(
        `To upload manually, download your song and upload it to YouTube Studio. Audio URL: ${audioUrl}`,
        { duration: 10000 }
      );

      setTimeout(() => {
        onOpenChange(false);
        setIsUploading(false);
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      console.error('YouTube upload failed:', err);
      toast.error('Failed to upload to YouTube. Please try downloading and uploading manually.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SiYoutube className="h-6 w-6 text-red-600" />
            Upload to YouTube
          </DialogTitle>
          <DialogDescription>
            Configure your video settings before uploading to YouTube
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="youtube-title">Video Title</Label>
            <Input
              id="youtube-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube-description">Description</Label>
            <Textarea
              id="youtube-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={4}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label>Privacy Settings</Label>
            <RadioGroup
              value={privacy}
              onValueChange={(value) => setPrivacy(value as PrivacyStatus)}
              disabled={isUploading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="font-normal cursor-pointer">
                  Public - Anyone can search for and view
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unlisted" id="unlisted" />
                <Label htmlFor="unlisted" className="font-normal cursor-pointer">
                  Unlisted - Anyone with the link can view
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="font-normal cursor-pointer">
                  Private - Only you can view
                </Label>
              </div>
            </RadioGroup>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !title.trim()}
              className="bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload to YouTube
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Note:</p>
            <p>
              YouTube upload requires OAuth2 authentication. This demo shows the UI flow.
              For production use, implement server-side YouTube Data API integration with proper authentication.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
