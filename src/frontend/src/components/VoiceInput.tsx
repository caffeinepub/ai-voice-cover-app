import { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { VoiceUpload } from './VoiceUpload';
import { ExternalBlob } from '../backend';

interface VoiceInputProps {
  onComplete: (id: string, blob: ExternalBlob) => void;
}

export function VoiceInput({ onComplete }: VoiceInputProps) {
  const [mode, setMode] = useState<'record' | 'upload'>('record');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold">Step 1: Your Voice</h2>
        <p className="text-muted-foreground">
          Record or upload a voice sample (at least 10 seconds for best results)
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-border bg-muted p-1">
          <button
            onClick={() => setMode('record')}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
              mode === 'record'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Record
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
              mode === 'upload'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl">
        {mode === 'record' ? (
          <VoiceRecorder onComplete={onComplete} />
        ) : (
          <VoiceUpload onComplete={onComplete} />
        )}
      </div>
    </div>
  );
}
