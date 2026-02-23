import { useState, useCallback } from 'react';
import { ExternalBlob } from '../backend';
import { useActor } from './useActor';

interface Stage {
  key: string;
  label: string;
  duration: number;
}

export function useProcessingStatus() {
  const { actor } = useActor();
  const [currentStage, setCurrentStage] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const startProcessing = useCallback(
    async (
      voiceSampleId: string,
      songId: string,
      stages: Stage[],
      onComplete: (coverId: string, finalMix: ExternalBlob) => void
    ) => {
      if (!actor) return;

      let totalProgress = 0;
      const progressPerStage = 100 / stages.length;

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setCurrentStage(stage.key);

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

      // Create a dummy final mix (in reality, this would come from backend processing)
      // Since the backend doesn't actually process audio, we create a minimal audio file
      const dummyAudioData = new Uint8Array(1024).fill(0);
      const finalMix = ExternalBlob.fromBytes(dummyAudioData);

      const coverId = `cover-${Date.now()}`;
      
      try {
        await actor.createCover(coverId, songId, voiceSampleId, finalMix);
        setProgress(100);
        // Only invoke the callback, no automatic download
        onComplete(coverId, finalMix);
      } catch (err) {
        console.error('Failed to create cover:', err);
      }
    },
    [actor]
  );

  return {
    currentStage,
    progress,
    startProcessing,
  };
}
