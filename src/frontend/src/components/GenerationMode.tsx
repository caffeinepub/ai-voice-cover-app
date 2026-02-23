import { useState } from 'react';
import { LyricsInput } from './LyricsInput';
import { StyleKeywords } from './StyleKeywords';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface GenerationModeProps {
  voiceSampleId: string;
  onComplete: (requestId: string, lyrics: string) => void;
}

export function GenerationMode({ voiceSampleId, onComplete }: GenerationModeProps) {
  const { actor } = useActor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stylePrompt, setStylePrompt] = useState('');

  const handleKeywordClick = (keyword: string) => {
    setStylePrompt((prev) => {
      if (prev.trim() === '') {
        return keyword;
      }
      return `${prev} ${keyword}`;
    });
  };

  const handleLyricsSubmit = async (lyrics: string) => {
    console.group('[GenerationMode] handleSubmit called');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Lyrics length:', lyrics.length);
    console.log('Style prompt:', stylePrompt || '(none)');
    console.log('Voice sample ID:', voiceSampleId);
    
    if (!actor) {
      console.error('[GenerationMode] Actor not available');
      console.groupEnd();
      toast.error('Backend not ready');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestId = `lyrics-${Date.now()}`;
      // Use the voiceSampleId as the userId for consistent filtering
      const userId = voiceSampleId;
      
      console.log('[GenerationMode] Generated request ID:', requestId);
      console.log('[GenerationMode] Using userId:', userId);
      console.log('[GenerationMode] Preparing to call actor.submitLyricsRequest with parameters:');
      console.log('  - requestId:', requestId);
      console.log('  - userId:', userId);
      console.log('  - lyrics:', lyrics.substring(0, 50) + '...');
      console.log('  - voiceSampleId:', voiceSampleId);
      console.log('  - stylePrompt:', stylePrompt.trim() === '' ? null : stylePrompt);
      
      console.log('[GenerationMode] Calling actor.submitLyricsRequest...');
      await actor.submitLyricsRequest(
        requestId,
        userId,
        lyrics,
        voiceSampleId,
        stylePrompt.trim() === '' ? null : stylePrompt
      );
      
      console.log('[GenerationMode] Backend submitLyricsRequest successful');
      console.log('[GenerationMode] Invoking onComplete callback with requestId:', requestId);
      
      toast.success('Lyrics submitted! Generating your song...');
      onComplete(requestId, lyrics);
      
      console.log('[GenerationMode] handleSubmit complete');
    } catch (err) {
      console.error('[GenerationMode] Error submitting lyrics:', err);
      console.error('[GenerationMode] Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      
      toast.error('Failed to submit lyrics. Please try again.');
      setIsSubmitting(false);
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.65_0.25_280)] to-[oklch(0.55_0.27_260)]">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-2 text-3xl font-bold">Step 2: Write Your Lyrics</h2>
        <p className="text-muted-foreground">
          Express yourself through words - our AI will compose the music and sing it with your voice
        </p>
      </div>

      <div className="rounded-xl border-2 border-border bg-card p-8 shadow-lg">
        <div className="space-y-6">
          {/* Style Prompt Section */}
          <div className="space-y-3">
            <Label htmlFor="style-prompt" className="text-base font-semibold">
              Music Style (Optional)
            </Label>
            <p className="text-sm text-muted-foreground">
              Describe how you want your music to sound. Use keywords to define the style, instruments, vocal effects, and mood.
            </p>
            <Textarea
              id="style-prompt"
              placeholder="e.g., 808 Auto-Tune deep bass trap male voice reverb upbeat"
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            <StyleKeywords onKeywordClick={handleKeywordClick} />
          </div>

          {/* Lyrics Input Section */}
          <div className="space-y-3 border-t pt-6">
            <Label className="text-base font-semibold">Your Lyrics</Label>
            <LyricsInput onSubmit={handleLyricsSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        <p>💡 Tip: Structure your lyrics with verses, choruses, and bridges for the best results</p>
      </div>
    </div>
  );
}
