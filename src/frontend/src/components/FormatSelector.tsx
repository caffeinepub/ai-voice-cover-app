import { Music } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormatSelectorProps {
  selectedFormat: 'mp3' | 'wav';
  onFormatChange: (format: 'mp3' | 'wav') => void;
}

export function FormatSelector({ selectedFormat, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Download Format</Label>
      <RadioGroup
        value={selectedFormat}
        onValueChange={(value) => onFormatChange(value as 'mp3' | 'wav')}
        className="flex gap-4 justify-center"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="mp3" id="mp3" />
          <Label
            htmlFor="mp3"
            className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-border bg-background px-4 py-2 transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <Music className="h-4 w-4" />
            <div>
              <div className="font-semibold">MP3</div>
              <div className="text-xs text-muted-foreground">Compressed, smaller file</div>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="wav" id="wav" />
          <Label
            htmlFor="wav"
            className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-border bg-background px-4 py-2 transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <Music className="h-4 w-4" />
            <div>
              <div className="font-semibold">WAV</div>
              <div className="text-xs text-muted-foreground">Uncompressed, high quality</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
