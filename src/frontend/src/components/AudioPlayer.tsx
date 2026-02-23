import { useEffect } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { Song } from '../backend';

interface AudioPlayerProps {
  song: Song;
  onClose: () => void;
}

export function AudioPlayer({ song, onClose }: AudioPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    togglePlayPause,
    seek,
    setVolume,
    loadAudio,
  } = useAudioPlayer();

  useEffect(() => {
    const audioUrl = song.audioFile.getDirectURL();
    loadAudio(audioUrl);
  }, [song.id]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center gap-4">
        {/* Song Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)]">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-semibold">{song.title}</h4>
            <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          <div className="flex flex-1 items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
