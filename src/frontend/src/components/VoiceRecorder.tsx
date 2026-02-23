import { useState } from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { ExternalBlob } from '../backend';
import { useActor } from '../hooks/useActor';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onComplete: (id: string, blob: ExternalBlob) => void;
}

export function VoiceRecorder({ onComplete }: VoiceRecorderProps) {
  const { actor } = useActor();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { isRecording, duration, audioLevel, startRecording, stopRecording, error } = useVoiceRecorder();

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      toast.error('Failed to access microphone. Please grant permission.');
    }
  };

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording();
    if (!audioBlob || !actor) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const externalBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const id = `voice-${Date.now()}`;
      await actor.uploadVoiceSample(id, 'user', externalBlob);
      
      onComplete(id, externalBlob);
    } catch (err) {
      toast.error('Failed to upload voice sample');
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card p-8 shadow-lg">
      <div className="flex flex-col items-center space-y-6">
        {/* Microphone Icon */}
        <div className="relative">
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full transition-all ${
              isRecording
                ? 'animate-pulse bg-gradient-to-br from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] shadow-2xl'
                : 'bg-gradient-to-br from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] shadow-xl'
            }`}
          >
            <img
              src="/assets/generated/microphone-icon.dim_256x256.png"
              alt="Microphone"
              className="h-16 w-16"
            />
          </div>
          
          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary transition-all"
                  style={{
                    height: `${Math.max(4, audioLevel * 24 * (1 + i * 0.2))}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Duration Display */}
        {isRecording && (
          <div className="text-center">
            <div className="text-4xl font-bold tabular-nums">{formatDuration(duration)}</div>
            <div className="mt-1 text-sm text-muted-foreground">Recording...</div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="w-full space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Control Button */}
        {!isUploading && (
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isUploading}
            className={`flex items-center gap-2 rounded-lg px-8 py-4 font-semibold transition-all ${
              isRecording
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] text-white hover:shadow-lg'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="h-5 w-5" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Start Recording
              </>
            )}
          </button>
        )}

        {/* Tips */}
        {!isRecording && !isUploading && (
          <div className="text-center text-sm text-muted-foreground">
            <p>💡 Tip: Record at least 10 seconds in a quiet environment</p>
          </div>
        )}
      </div>
    </div>
  );
}
