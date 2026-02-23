import { useState, useEffect } from 'react';
import { useActor } from './useActor';

type GenerationStatus = 'analyzing' | 'composing' | 'synthesizing' | 'mixing' | 'mastering' | 'complete';

export function useGenerationStatus(requestId: string | undefined) {
  const { actor } = useActor();
  const [status, setStatus] = useState<GenerationStatus>('analyzing');
  const [progress, setProgress] = useState(0);
  const [coverId, setCoverId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor || !requestId) return;

    const stages: GenerationStatus[] = ['analyzing', 'composing', 'synthesizing', 'mixing', 'mastering'];
    let currentStageIndex = 0;
    let totalProgress = 0;
    const progressPerStage = 100 / stages.length;

    const processStages = async () => {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setStatus(stage);

        // Simulate processing with smooth progress
        const steps = 20;
        const stepDuration = (stage === 'composing' || stage === 'synthesizing') ? 250 : 150;
        
        for (let step = 0; step < steps; step++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          const stageProgress = ((step + 1) / steps) * progressPerStage;
          setProgress(totalProgress + stageProgress);
        }

        totalProgress += progressPerStage;
        currentStageIndex++;
      }

      // Mark as complete
      setStatus('complete');
      setProgress(100);
      
      // Create a simulated cover ID
      const generatedCoverId = `generated-cover-${Date.now()}`;
      setCoverId(generatedCoverId);

      // In a real implementation, we would poll the backend for the actual status
      // const lyricsRequest = await actor.getLyricsRequest(requestId);
      // if (lyricsRequest?.generatedCoverId) {
      //   setCoverId(lyricsRequest.generatedCoverId);
      // }
    };

    processStages();
  }, [actor, requestId]);

  return {
    status,
    progress,
    coverId,
  };
}
