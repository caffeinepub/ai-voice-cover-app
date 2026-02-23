import { Badge } from '@/components/ui/badge';

interface StyleKeywordsProps {
  onKeywordClick: (keyword: string) => void;
}

const KEYWORDS = [
  '808',
  'Auto-Tune',
  'deep bass',
  'male voice',
  'female voice',
  'reverb',
  'distortion',
  'trap',
  'R&B',
  'pop',
  'rock',
  'hip-hop',
  'electronic',
  'acoustic',
  'melodic',
  'aggressive',
  'smooth',
  'upbeat',
  'slow tempo',
  'fast tempo',
];

export function StyleKeywords({ onKeywordClick }: StyleKeywordsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Suggested keywords (click to add):
      </p>
      <div className="flex flex-wrap gap-2">
        {KEYWORDS.map((keyword) => (
          <Badge
            key={keyword}
            variant="outline"
            className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => onKeywordClick(keyword)}
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
}
