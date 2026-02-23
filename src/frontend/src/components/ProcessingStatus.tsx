import { useEffect, useState } from 'react';
import { ExternalBlob } from '../backend';
import { useProcessingStatus } from '../hooks/useProcessingStatus';
import { useGenerationStatus } from '../hooks/useGenerationStatus';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProcessingStatusProps {
  workflowMode: 'cover' | 'generation';
  voiceSampleId: string;
  songId?: string;
  lyricsRequestId?: string;
  onComplete: (coverId: string, finalMix: ExternalBlob) => void;
}

const coverStages = [
  { key: 'analyzing', label: 'Analyzing voice characteristics', duration: 3000 },
  { key: 'separating', label: 'Separating vocals from instrumental', duration: 4000 },
  { key: 'synthesizing', label: 'Generating AI vocals with your voice', duration: 5000 },
  { key: 'mixing', label: 'Mixing vocals with instrumental', duration: 3000 },
  { key: 'mastering', label: 'Mastering final track', duration: 2000 },
];

const generationStages = [
  { key: 'analyzing', label: 'Analyzing voice characteristics', duration: 3000 },
  { key: 'composing', label: 'Composing music from lyrics', duration: 5000 },
  { key: 'synthesizing', label: 'Synthesizing vocals with your voice', duration: 5000 },
  { key: 'mixing', label: 'Mixing vocals with instrumental', duration: 3000 },
  { key: 'mastering', label: 'Mastering final track', duration: 2000 },
];

export function ProcessingStatus({ 
  workflowMode, 
  voiceSampleId, 
  songId, 
  lyricsRequestId, 
  onComplete 
}: ProcessingStatusProps) {
  const { currentStage: coverStage, progress: coverProgress, startProcessing } = useProcessingStatus();
  const { status: generationStatus, progress: generationProgress, coverId: generatedCoverId } = useGenerationStatus(lyricsRequestId);

  const stages = workflowMode === 'cover' ? coverStages : generationStages;
  const currentStage = workflowMode === 'cover' ? coverStage : generationStatus;
  const progress = workflowMode === 'cover' ? coverProgress : generationProgress;

  useEffect(() => {
    if (workflowMode === 'cover' && songId) {
      startProcessing(voiceSampleId, songId, coverStages, onComplete);
    }
  }, [workflowMode, voiceSampleId, songId]);

  useEffect(() => {
    if (workflowMode === 'generation' && generationStatus === 'complete' && generatedCoverId) {
      // Create a dummy final mix for the generated song
      const dummyAudioData = new Uint8Array(1024).fill(0);
      const finalMix = ExternalBlob.fromBytes(dummyAudioData);
      onComplete(generatedCoverId, finalMix);
    }
  }, [workflowMode, generationStatus, generatedCoverId]);

  const currentStageIndex = stages.findIndex(s => s.key === currentStage);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold">Step 3: Processing</h2>
        <p className="text-muted-foreground">
          {workflowMode === 'generation' 
            ? 'Generating your original song... This may take a minute'
            : 'Creating your AI voice cover... This may take a minute'}
        </p>
      </div>

      <div className="rounded-xl border-2 border-border bg-card p-8 shadow-lg">
        <div className="space-y-8">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stage List */}
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isActive = currentStageIndex === index;
              const isComplete = currentStageIndex > index;

              return (
                <div
                  key={stage.key}
                  className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5'
                      : isComplete
                      ? 'border-border bg-muted/50'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : isActive ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </p>
                  </div>

                  {isActive && (
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-2 w-2 animate-pulse rounded-full bg-primary"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Message */}
          <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            <p>
              {workflowMode === 'generation' 
                ? '🎵 Our AI is composing your original song with your voice'
                : '🎵 Our AI is working hard to create your perfect voice cover'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
