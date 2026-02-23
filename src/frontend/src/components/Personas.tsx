import { useState } from 'react';
import { Plus, Trash2, Mic, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceInput } from './VoiceInput';
import { useVoicePersonas, useCreateVoicePersona, useDeleteVoicePersona } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

interface PersonasProps {
  userId: string;
  onPersonaSelect?: (personaId: string, voiceSampleId: string) => void;
}

export function Personas({ userId, onPersonaSelect }: PersonasProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [voiceSampleId, setVoiceSampleId] = useState<string | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<ExternalBlob | null>(null);

  const { data: personas = [], isLoading } = useVoicePersonas(userId);
  const createPersona = useCreateVoicePersona();
  const deletePersona = useDeleteVoicePersona();

  const handleVoiceComplete = (id: string, blob: ExternalBlob) => {
    console.log('[Personas] Voice sample uploaded:', id);
    setVoiceSampleId(id);
    setVoiceBlob(blob);
  };

  const handleCreatePersona = async () => {
    if (!personaName.trim() || !voiceSampleId) {
      toast.error('Please provide a name and voice sample');
      return;
    }

    try {
      const personaId = `persona_${Date.now()}`;

      console.log('[Personas] Creating persona:', { personaId, userId, personaName, voiceSampleId });

      await createPersona.mutateAsync({
        id: personaId,
        userId,
        name: personaName,
        voiceSampleId,
      });

      console.log('[Personas] Persona created successfully');
      toast.success('Voice persona created successfully!');
      setIsCreateDialogOpen(false);
      setPersonaName('');
      setVoiceSampleId(null);
      setVoiceBlob(null);
    } catch (error) {
      console.error('[Personas] Error creating persona:', error);
      toast.error('Failed to create voice persona');
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    try {
      console.log('[Personas] Deleting persona:', personaId);
      await deletePersona.mutateAsync({ personaId, userId });
      toast.success('Voice persona deleted');
    } catch (error) {
      console.error('[Personas] Error deleting persona:', error);
      toast.error('Delete functionality not yet available');
    }
  };

  const handlePersonaClick = (personaId: string, voiceSampleId: string) => {
    console.log('[Personas] Persona selected:', { personaId, voiceSampleId });
    if (onPersonaSelect) {
      onPersonaSelect(personaId, voiceSampleId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading personas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voice Personas</h2>
          <p className="text-muted-foreground">Manage your voice samples for quick access</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Voice Persona</DialogTitle>
              <DialogDescription>
                Give your voice sample a name and record or upload an audio file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="persona-name">Persona Name</Label>
                <Input
                  id="persona-name"
                  placeholder="e.g., My Voice, Studio Recording"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Voice Sample</Label>
                <VoiceInput onComplete={handleVoiceComplete} />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreatePersona}
                disabled={!personaName.trim() || !voiceSampleId || createPersona.isPending}
              >
                {createPersona.isPending ? 'Creating...' : 'Create Persona'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {personas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mic className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No voice personas yet. Create one to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <Card
              key={persona.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handlePersonaClick(persona.id, persona.voiceSampleId)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{persona.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePersona(persona.id);
                    }}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Voice Sample</CardDescription>
              </CardHeader>
              <CardContent>
                {onPersonaSelect && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePersonaClick(persona.id, persona.voiceSampleId);
                    }}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Use This Persona
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
