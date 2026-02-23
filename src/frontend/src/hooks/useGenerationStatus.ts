import { useState, useEffect } from 'react';
import { useActor } from './useActor';

type GenerationStatus = 'analyzing' | 'composing' | 'synthesizing' | 'mixing' | 'mastering' | 'complete';

export function useGenerationStatus(requestId: string | undefined) {
  const { actor } = useActor();
  const [status, setStatus] = useState<GenerationStatus>('analyzing');
  const [progress, setProgress] = useState(0);
  const [coverId, setCoverId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor || !requestId) {
      console.log('[useGenerationStatus] Waiting for actor or requestId:', { hasActor: !!actor, requestId });
      return;
    }

    console.log('[useGenerationStatus] Starting generation process for requestId:', requestId);

    const stages: GenerationStatus[] = ['analyzing', 'composing', 'synthesizing', 'mixing', 'mastering'];
    let totalProgress = 0;
    const progressPerStage = 100 / stages.length;

    const processStages = async () => {
      try {
        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i];
          setStatus(stage);
          console.log(`[useGenerationStatus] Stage ${i + 1}/${stages.length}: ${stage}`);

          // Simulate processing with smooth progress
          const steps = 20;
          const stepDuration = (stage === 'composing' || stage === 'synthesizing') ? 250 : 150;
          
          for (let step = 0; step < steps; step++) {
            await new Promise(resolve => setTimeout(resolve, stepDuration));
            const stageProgress = ((step + 1) / steps) * progressPerStage;
            setProgress(totalProgress + stageProgress);
          }

          totalProgress += progressPerStage;
        }

        // Mark as complete
        setStatus('complete');
        setProgress(100);
        
        // The generated cover ID is the same as the request ID
        // because submitLyricsRequest already creates the song record
        const generatedCoverId = requestId;
        setCoverId(generatedCoverId);
        
        console.log('[useGenerationStatus] Generation complete:', { generatedCoverId });
      } catch (err) {
        console.error('[useGenerationStatus] Error during generation:', err);
      }
    };

    processStages();
  }, [actor, requestId]);

  return {
    status,
    progress,
    coverId,
  };
}
