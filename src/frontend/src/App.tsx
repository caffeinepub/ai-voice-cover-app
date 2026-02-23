import { useState } from 'react';
import { Layout } from './components/Layout';
import { ModeSelector } from './components/ModeSelector';
import { VoiceInput } from './components/VoiceInput';
import { SongUpload } from './components/SongUpload';
import { GenerationMode } from './components/GenerationMode';
import { ProcessingStatus } from './components/ProcessingStatus';
import { DownloadButton } from './components/DownloadButton';
import { FormatSelector } from './components/FormatSelector';
import { Library } from './components/Library';
import { Personas } from './components/Personas';
import { ExternalBlob } from './backend';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

type Step = 'mode' | 'voice' | 'song' | 'lyrics' | 'processing' | 'complete';
type WorkflowMode = 'cover' | 'generation';
type AudioFormat = 'mp3' | 'wav';
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
  const [audioFormat, setAudioFormat] = useState<AudioFormat>('mp3');

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
    setAppState(prev => ({ ...prev, coverId, finalMix }));
    setCurrentStep('complete');
    toast.success(appState.workflowMode === 'generation' ? 'Your song is ready!' : 'Your cover is ready!');
  };

  const handleStartOver = () => {
    setAppState({});
    setCurrentStep('mode');
    setAudioFormat('mp3');
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
            { key: 'processing', label: 'Processing' },
            { key: 'complete', label: 'Download' }
          ]
        : [
            { key: 'voice', label: 'Voice' },
            { key: 'song', label: 'Song' },
            { key: 'processing', label: 'Processing' },
            { key: 'complete', label: 'Download' }
          ];
    } else {
      return hasPreselectedPersona
        ? [
            { key: 'lyrics', label: 'Lyrics' },
            { key: 'processing', label: 'Processing' },
            { key: 'complete', label: 'Download' }
          ]
        : [
            { key: 'voice', label: 'Voice' },
            { key: 'lyrics', label: 'Lyrics' },
            { key: 'processing', label: 'Processing' },
            { key: 'complete', label: 'Download' }
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
                
                {currentStep === 'complete' && appState.finalMix && (
                  <div className="space-y-6">
                    <div className="rounded-lg border-2 border-primary/20 bg-card p-8 text-center">
                      <div className="mb-6">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                          <svg
                            className="h-10 w-10 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h2 className="mb-2 text-3xl font-bold">
                          {appState.workflowMode === 'generation' ? 'Your Song is Ready!' : 'Your Cover is Ready!'}
                        </h2>
                        <p className="text-muted-foreground">
                          {appState.workflowMode === 'generation'
                            ? 'Your AI-generated song with your voice is complete'
                            : appState.songTitle && appState.songArtist
                            ? `"${appState.songTitle}" by ${appState.songArtist} - covered with your voice`
                            : 'Your AI-generated voice cover is complete'}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <FormatSelector
                          selectedFormat={audioFormat}
                          onFormatChange={setAudioFormat}
                        />
                        
                        <DownloadButton
                          finalMix={appState.finalMix}
                          filename={`${appState.songTitle || appState.lyrics?.slice(0, 20) || 'song'}-${appState.workflowMode}.${audioFormat}`}
                          format={audioFormat}
                        />
                      </div>
                      
                      <button
                        onClick={handleStartOver}
                        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Create another {appState.workflowMode === 'generation' ? 'song' : 'cover'}
                      </button>
                    </div>
                  </div>
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
