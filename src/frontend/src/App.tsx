import { useState } from 'react';
import { Layout } from './components/Layout';
import { ModeSelector } from './components/ModeSelector';
import { VoiceInput } from './components/VoiceInput';
import { SongUpload } from './components/SongUpload';
import { GenerationMode } from './components/GenerationMode';
import { ProcessingStatus } from './components/ProcessingStatus';
import { Library } from './components/Library';
import { Personas } from './components/Personas';
import { ExternalBlob } from './backend';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

type Step = 'mode' | 'voice' | 'song' | 'lyrics' | 'processing';
type WorkflowMode = 'cover' | 'generation';
type View = 'create' | 'library' | 'personas';

interface AppState {
  workflowMode?: WorkflowMode;
  voiceSampleId?: string;
  voiceBlob?: ExternalBlob;
  songId?: string;
  songTitle?: string;
  songArtist?: string;
  lyrics?: string;
  lyricsRequestId?: string;
  coverId?: string;
  finalMix?: ExternalBlob;
  selectedPersonaId?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('create');
  const [currentStep, setCurrentStep] = useState<Step>('mode');
  const [appState, setAppState] = useState<AppState>({});

  const handleModeSelect = (mode: WorkflowMode) => {
    setAppState(prev => ({ ...prev, workflowMode: mode }));
    
    // If persona is pre-selected, skip voice input
    if (appState.selectedPersonaId) {
      if (mode === 'cover') {
        setCurrentStep('song');
      } else {
        setCurrentStep('lyrics');
      }
    } else {
      setCurrentStep('voice');
    }
  };

  const handlePersonaSelect = (personaId: string, voiceSampleId: string) => {
    setAppState(prev => ({ 
      ...prev, 
      selectedPersonaId: personaId,
      voiceSampleId 
    }));
    setCurrentStep('mode');
    setCurrentView('create');
    toast.success('Persona selected! Choose your creation mode.');
  };

  const handleVoiceComplete = (id: string, blob: ExternalBlob) => {
    setAppState(prev => ({ ...prev, voiceSampleId: id, voiceBlob: blob }));
    
    if (appState.workflowMode === 'cover') {
      setCurrentStep('song');
    } else {
      setCurrentStep('lyrics');
    }
    
    toast.success('Voice sample uploaded successfully!');
  };

  const handleSongComplete = (id: string, title: string, artist: string) => {
    setAppState(prev => ({ ...prev, songId: id, songTitle: title, songArtist: artist }));
    setCurrentStep('processing');
  };

  const handleLyricsComplete = (requestId: string, lyrics: string) => {
    setAppState(prev => ({ ...prev, lyricsRequestId: requestId, lyrics }));
    setCurrentStep('processing');
  };

  const handleProcessingComplete = (coverId: string, finalMix: ExternalBlob) => {
    console.log('[App] Processing complete:', { coverId, workflowMode: appState.workflowMode });
    
    setAppState(prev => ({ ...prev, coverId, finalMix }));
    
    // Navigate to Library view after processing completes
    setCurrentView('library');
    
    // Show success message
    const message = appState.workflowMode === 'generation' 
      ? 'Your song is ready! Check it out in your library.' 
      : 'Your cover is ready! Check it out in your library.';
    toast.success(message);
    
    // Reset the creation workflow after a short delay to allow library to load
    setTimeout(() => {
      setCurrentStep('mode');
      setAppState({});
    }, 500);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    if (view === 'create') {
      setCurrentStep('mode');
      setAppState({});
    }
  };

  const getProgressSteps = () => {
    const hasPreselectedPersona = !!appState.selectedPersonaId;
    
    if (appState.workflowMode === 'cover') {
      return hasPreselectedPersona
        ? [
            { key: 'song', label: 'Song' },
            { key: 'processing', label: 'Processing' }
          ]
        : [
            { key: 'voice', label: 'Voice' },
            { key: 'song', label: 'Song' },
            { key: 'processing', label: 'Processing' }
          ];
    } else {
      return hasPreselectedPersona
        ? [
            { key: 'lyrics', label: 'Lyrics' },
            { key: 'processing', label: 'Processing' }
          ]
        : [
            { key: 'voice', label: 'Voice' },
            { key: 'lyrics', label: 'Lyrics' },
            { key: 'processing', label: 'Processing' }
          ];
    }
  };

  const getStepIndex = (step: Step) => {
    const steps = getProgressSteps();
    return steps.findIndex(s => s.key === step);
  };

  return (
    <Layout currentView={currentView} onViewChange={handleViewChange}>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Library View */}
          {currentView === 'library' && <Library />}

          {/* Personas View */}
          {currentView === 'personas' && (
            <Personas onPersonaSelect={handlePersonaSelect} />
          )}

          {/* Create View */}
          {currentView === 'create' && (
            <>
              {/* Progress Steps */}
              {currentStep !== 'mode' && (
                <div className="mb-12 flex justify-center">
                  <div className="flex items-center gap-4">
                    {getProgressSteps().map((step, index) => (
                      <div key={step.key} className="flex items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                            currentStep === step.key
                              ? 'border-primary bg-primary text-primary-foreground'
                              : index < getStepIndex(currentStep)
                              ? 'border-primary bg-primary/20 text-primary'
                              : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span
                          className={`ml-2 text-sm font-medium ${
                            currentStep === step.key ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </span>
                        {index < getProgressSteps().length - 1 && (
                          <div
                            className={`mx-4 h-0.5 w-12 ${
                              index < getStepIndex(currentStep)
                                ? 'bg-primary'
                                : 'bg-muted-foreground/30'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="mx-auto max-w-3xl">
                {currentStep === 'mode' && (
                  <ModeSelector 
                    onSelect={handleModeSelect}
                    selectedPersonaId={appState.selectedPersonaId}
                  />
                )}
                
                {currentStep === 'voice' && <VoiceInput onComplete={handleVoiceComplete} />}
                
                {currentStep === 'song' && (
                  <SongUpload 
                    onComplete={handleSongComplete}
                    voiceSampleId={appState.voiceSampleId}
                  />
                )}
                
                {currentStep === 'lyrics' && (
                  <GenerationMode
                    voiceSampleId={appState.voiceSampleId!}
                    onComplete={handleLyricsComplete}
                  />
                )}
                
                {currentStep === 'processing' && (
                  <ProcessingStatus
                    workflowMode={appState.workflowMode!}
                    voiceSampleId={appState.voiceSampleId!}
                    songId={appState.songId}
                    lyricsRequestId={appState.lyricsRequestId}
                    onComplete={handleProcessingComplete}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Toaster />
    </Layout>
  );
}

export default App;
