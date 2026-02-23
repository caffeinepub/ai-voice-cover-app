import { Music, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModeSelectorProps {
  onSelect: (mode: 'cover' | 'generation') => void;
  selectedPersonaId?: string;
}

export function ModeSelector({ onSelect, selectedPersonaId }: ModeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-4xl font-bold">Welcome to AI Voice Studio</h2>
        <p className="text-lg text-muted-foreground">
          {selectedPersonaId 
            ? 'Choose how you want to create with your selected persona'
            : 'Choose how you want to create your music'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-xl"
          onClick={() => onSelect('cover')}
        >
          <CardHeader>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] transition-transform group-hover:scale-110">
              <Music className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Cover a Song</CardTitle>
            <CardDescription className="text-base">
              Upload an existing song and transform it with your voice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Upload any song file (MP3, WAV, M4A)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>AI extracts vocals and instrumentals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Your voice replaces the original vocals</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-xl"
          onClick={() => onSelect('generation')}
        >
          <CardHeader>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] transition-transform group-hover:scale-110">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Generate from Lyrics</CardTitle>
            <CardDescription className="text-base">
              Write your own lyrics and let AI create a complete song
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Write or paste your lyrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>AI composes music to match your words</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>Your voice brings the song to life</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
