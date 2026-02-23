import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface LyricsInputProps {
  onSubmit: (lyrics: string) => void;
  isSubmitting?: boolean;
}

export function LyricsInput({ onSubmit, isSubmitting = false }: LyricsInputProps) {
  const [lyrics, setLyrics] = useState('');
  const minLength = 20;
  const maxLength = 2000;

  const handleSubmit = () => {
    const trimmedLyrics = lyrics.trim();
    if (trimmedLyrics.length >= minLength && trimmedLyrics.length <= maxLength) {
      onSubmit(trimmedLyrics);
    }
  };

  const isValid = lyrics.trim().length >= minLength && lyrics.trim().length <= maxLength;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lyrics" className="text-base font-semibold">
          Enter Your Lyrics
        </Label>
        <p className="text-sm text-muted-foreground">
          Write the lyrics for your song. Be creative and express yourself!
        </p>
      </div>

      <div className="relative">
        <Textarea
          id="lyrics"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Verse 1:&#10;Walking down the street...&#10;&#10;Chorus:&#10;This is my song..."
          className="min-h-[300px] resize-none text-base"
          disabled={isSubmitting}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span className={lyrics.length > maxLength ? 'text-destructive' : ''}>
            {lyrics.length} / {maxLength}
          </span>
        </div>
      </div>

      {lyrics.trim().length > 0 && lyrics.trim().length < minLength && (
        <p className="text-sm text-muted-foreground">
          Please write at least {minLength} characters (currently {lyrics.trim().length})
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        className="w-full rounded-lg bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Generate Song'}
      </button>
    </div>
  );
}
