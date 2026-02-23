import { useState, useCallback } from 'react';
import { ExternalBlob } from '../backend';
import { useActor } from './useActor';
import { toast } from 'sonner';

interface Stage {
  key: string;
  label: string;
  duration: number;
}

export function useProcessingStatus() {
  const { actor } = useActor();
  const [currentStage, setCurrentStage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const startProcessing = useCallback(
    async (
      voiceSampleId: string,
      songId: string,
      stages: Stage[],
      onComplete: (coverId: string, finalMix: ExternalBlob) => void
    ) => {
      console.group('[useProcessingStatus] Starting processing');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Voice Sample ID:', voiceSampleId);
      console.log('Song ID:', songId);
      console.log('Stages:', stages.map(s => s.key));
      
      if (!actor) {
        console.error('[useProcessingStatus] Actor not available');
        console.groupEnd();
        toast.error('Backend not ready. Please try again.');
        return;
      }

      let totalProgress = 0;
      const progressPerStage = 100 / stages.length;

      try {
        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i];
          setCurrentStage(stage.key);
          console.log(`[useProcessingStatus] Stage ${i + 1}/${stages.length}: ${stage.key} (duration: ${stage.duration}ms)`);

          // Simulate processing with smooth progress
          const steps = 20;
          const stepDuration = stage.duration / steps;
          
          for (let step = 0; step < steps; step++) {
            await new Promise(resolve => setTimeout(resolve, stepDuration));
            const stageProgress = ((step + 1) / steps) * progressPerStage;
            setProgress(totalProgress + stageProgress);
          }

          totalProgress += progressPerStage;
        }

        console.log('[useProcessingStatus] All stages complete, creating cover in backend');

        // Create a dummy final mix (in reality, this would come from backend processing)
        // Since the backend doesn't actually process audio, we create a minimal audio file
        const dummyAudioData = new Uint8Array(1024).fill(0);
        const finalMix = ExternalBlob.fromBytes(dummyAudioData);

        const coverId = `cover-${Date.now()}`;
        
        console.log('[useProcessingStatus] Validating parameters before backend call:');
        console.log('  - coverId:', coverId, '(type:', typeof coverId, ')');
        console.log('  - songId:', songId, '(type:', typeof songId, ')');
        console.log('  - voiceSampleId:', voiceSampleId, '(type:', typeof voiceSampleId, ')');
        console.log('  - finalMix:', finalMix, '(type:', typeof finalMix, ')');
        console.log('  - finalMix is ExternalBlob:', finalMix instanceof ExternalBlob);
        
        console.log('[useProcessingStatus] Calling actor.createCover...');
        await actor.createCover(coverId, songId, voiceSampleId, finalMix);
        
        console.log('[useProcessingStatus] Backend createCover call successful');
        setProgress(100);
        
        console.log('[useProcessingStatus] Invoking onComplete callback with coverId:', coverId);
        onComplete(coverId, finalMix);
        
        console.log('[useProcessingStatus] Processing workflow complete');
      } catch (err) {
        console.error('[useProcessingStatus] Error during processing:', err);
        console.error('[useProcessingStatus] Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
        
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error('Failed to save your cover. Please try again.');
      } finally {
        console.groupEnd();
      }
    },
    [actor]
  );

  return {
    currentStage,
    progress,
    error,
    startProcessing,
  };
}
