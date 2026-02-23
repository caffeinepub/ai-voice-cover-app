import { useState, useEffect } from 'react';
import { useUserLibrary } from '../hooks/useQueries';
import { Play, Pause, Download, Loader2, Music, Share2 } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { FormatSelector } from './FormatSelector';
import { SocialShare } from './SocialShare';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Song } from '../backend';

type AudioFormat = 'mp3' | 'wav';

export function Library() {
  // Use a consistent userId - in production this would come from authentication
  // For now, we use a hardcoded value that matches what's used throughout the app
  const userId = 'user';
  const { data: songs, isLoading, error, refetch } = useUserLibrary(userId);
  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>('mp3');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const { isPlaying, togglePlayPause, loadAudio } = useAudioPlayer();

  useEffect(() => {
    console.log('[Library] Component mounted/updated:', { 
      songsCount: songs?.length || 0, 
      isLoading, 
      hasError: !!error 
    });
  }, [songs, isLoading, error]);

  const handlePlayPause = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      setCurrentSong(song);
      loadAudio(song.audioFile.getDirectURL());
      // Small delay to ensure audio is loaded before playing
      setTimeout(() => {
        togglePlayPause();
      }, 100);
    }
  };

  const handleClosePlayer = () => {
    setCurrentSong(null);
  };

  const handleDownload = async (song: Song, format: AudioFormat) => {
    try {
      const audioBytes = await song.audioFile.getBytes();
      const blob = new Blob([audioBytes], { 
        type: format === 'mp3' ? 'audio/mpeg' : 'audio/wav' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title}-${song.artist}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Library] Download failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('[Library] Error loading library:', error);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load library</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Your Library</h2>
        <p className="mt-2 text-muted-foreground">
          All your created songs and covers in one place
        </p>
      </div>

      {!songs || songs.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Music className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">No Songs Yet</h3>
            <p className="text-muted-foreground">
              Create your first song to see it here
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <FormatSelector
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <div
                key={song.id}
                className="group rounded-xl border-2 border-border bg-card p-6 shadow-lg transition-all hover:border-primary/50 hover:shadow-xl"
              >
                <div className="mb-4">
                  <h3 className="mb-1 text-lg font-bold line-clamp-1">{song.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{song.artist}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {song.modeType === 'cover' ? 'Cover' : 'Original'}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handlePlayPause(song)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] px-4 py-2 font-medium text-white transition-all hover:shadow-lg"
                  >
                    {currentSong?.id === song.id && isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Play
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload(song, selectedFormat)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 font-medium transition-all hover:bg-accent"
                  >
                    <Download className="h-4 w-4" />
                    Download {selectedFormat.toUpperCase()}
                  </button>

                  <SocialShare song={song} />
                </div>
              </div>
            ))}
          </div>

          {currentSong && (
            <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <AudioPlayer song={currentSong} onClose={handleClosePlayer} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
