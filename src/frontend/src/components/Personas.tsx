import { useState } from 'react';
import { useVoicePersonas, useCreateVoicePersona, useDeleteVoicePersona } from '../hooks/useQueries';
import { VoiceInput } from './VoiceInput';
import { Users, Trash2, Loader2, Plus, Mic, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

interface PersonasProps {
  onPersonaSelect?: (personaId: string, voiceSampleId: string) => void;
}

export function Personas({ onPersonaSelect }: PersonasProps) {
  const { data: personas, isLoading, error } = useVoicePersonas('user');
  const createPersona = useCreateVoicePersona();
  const deletePersona = useDeleteVoicePersona();
  const [isCreating, setIsCreating] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [voiceSampleId, setVoiceSampleId] = useState<string | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<ExternalBlob | null>(null);

  const handleVoiceComplete = (id: string, blob: ExternalBlob) => {
    setVoiceSampleId(id);
    setVoiceBlob(blob);
  };

  const handleCreatePersona = async () => {
    if (!personaName.trim()) {
      toast.error('Please enter a persona name');
      return;
    }
    if (!voiceSampleId) {
      toast.error('Please record or upload a voice sample');
      return;
    }

    try {
      await createPersona.mutateAsync({
        name: personaName,
        voiceSampleId,
      });
      toast.success('Persona created successfully!');
      setIsCreating(false);
      setPersonaName('');
      setVoiceSampleId(null);
      setVoiceBlob(null);
    } catch (err) {
      toast.error('Failed to create persona');
      console.error(err);
    }
  };

  const handleDeletePersona = async (personaId: string, personaName: string) => {
    if (!confirm(`Are you sure you want to delete "${personaName}"?`)) {
      return;
    }

    try {
      await deletePersona.mutateAsync(personaId);
      toast.success('Persona deleted');
    } catch (err) {
      toast.error('Failed to delete persona');
      console.error(err);
    }
  };

  const handlePersonaClick = (personaId: string, voiceSampleId: string) => {
    if (onPersonaSelect) {
      onPersonaSelect(personaId, voiceSampleId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your personas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load personas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Voice Personas</h2>
          <p className="mt-2 text-muted-foreground">
            {onPersonaSelect 
              ? 'Select a persona to start creating or manage your voice samples'
              : 'Save and manage your voice samples for quick access'}
          </p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg">
              <Plus className="h-5 w-5" />
              Create Persona
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Persona</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="persona-name">Persona Name</Label>
                <Input
                  id="persona-name"
                  placeholder="e.g., My Singing Voice, Podcast Voice..."
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Voice Sample</Label>
                <VoiceInput onComplete={handleVoiceComplete} />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="rounded-lg border border-border px-6 py-2 font-medium transition-colors hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePersona}
                  disabled={createPersona.isPending || !personaName.trim() || !voiceSampleId}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] px-6 py-2 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {createPersona.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Persona'
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!personas || personas.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-2xl font-bold">No Personas Yet</h3>
            <p className="text-muted-foreground">
              Create your first voice persona to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className={`group rounded-xl border-2 border-border bg-card p-6 shadow-lg transition-all hover:border-primary/50 hover:shadow-xl ${
                onPersonaSelect ? 'cursor-pointer' : ''
              }`}
              onClick={() => onPersonaSelect && handlePersonaClick(persona.id, persona.voiceSampleId)}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-bold line-clamp-1">{persona.name}</h3>
                  <p className="text-sm text-muted-foreground">Voice Sample</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)]">
                  <Mic className="h-5 w-5 text-white" />
                </div>
              </div>

              {onPersonaSelect && (
                <button
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePersonaClick(persona.id, persona.voiceSampleId);
                  }}
                >
                  <Play className="h-4 w-4" />
                  Use This Persona
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePersona(persona.id, persona.name);
                }}
                disabled={deletePersona.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 disabled:opacity-50"
              >
                {deletePersona.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
