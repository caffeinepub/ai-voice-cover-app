import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';

type GenerationStatus = 'analyzing' | 'composing' | 'synthesizing' | 'mixing' | 'mastering' | 'complete';

export function useGenerationStatus(requestId: string | undefined) {
  const { actor } = useActor();
  const [status, setStatus] = useState<GenerationStatus>('analyzing');
  const [progress, setProgress] = useState(0);
  const [coverId, setCoverId] = useState<string | null>(null);

  useEffect(() => {
    if (!actor || !requestId) {
      console.log('[useGenerationStatus] Waiting for dependencies:', { 
        hasActor: !!actor, 
        requestId,
        timestamp: new Date().toISOString()
      });
      return;
    }

    console.group('[useGenerationStatus] Starting generation process');
    console.log('Request ID:', requestId);
    console.log('Timestamp:', new Date().toISOString());

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
        
        console.log('[useGenerationStatus] All stages complete, calling backend completeLyricsRequest');
        
        // Create a dummy final mix for the generated song
        const dummyAudioData = new Uint8Array(1024).fill(0);
        const finalMix = ExternalBlob.fromBytes(dummyAudioData);
        
        console.log('[useGenerationStatus] Calling actor.completeLyricsRequest with:', {
          requestId,
          finalMixType: typeof finalMix
        });
        
        await actor.completeLyricsRequest(requestId, finalMix);
        
        console.log('[useGenerationStatus] Backend completeLyricsRequest successful');
        
        // The generated cover ID is the same as the request ID
        const generatedCoverId = requestId;
        setCoverId(generatedCoverId);
        
        console.log('[useGenerationStatus] Generation complete, coverId set to:', generatedCoverId);
      } catch (err) {
        console.error('[useGenerationStatus] Error during generation:', err);
        console.error('[useGenerationStatus] Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        });
      } finally {
        console.groupEnd();
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
