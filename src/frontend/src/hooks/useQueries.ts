import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type { Cover, LyricsRequest, Song, VoicePersona } from '../backend';

export function useGetCover(id: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Cover | null>({
    queryKey: ['cover', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getCover(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetLyricsRequest(requestId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<LyricsRequest | null>({
    queryKey: ['lyricsRequest', requestId],
    queryFn: async () => {
      if (!actor || !requestId) return null;
      return actor.getLyricsRequest(requestId);
    },
    enabled: !!actor && !isFetching && !!requestId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 2 seconds if status is pending or processing
      if (data?.status.__kind__ === 'pending' || data?.status.__kind__ === 'processing') {
        return 2000;
      }
      return false;
    },
  });
}

export function useGetAllLyricsRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<LyricsRequest[]>({
    queryKey: ['lyricsRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLyricsRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserLibrary(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Song[]>({
    queryKey: ['userLibrary', userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserLibrary(userId);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refresh library every 5 seconds to show newly created songs
  });
}

export function useVoicePersonas(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<VoicePersona[]>({
    queryKey: ['voicePersonas', userId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVoicePersonas(userId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateVoicePersona() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, voiceSampleId }: { name: string; voiceSampleId: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      const id = `persona-${Date.now()}`;
      await actor.createVoicePersona(id, 'user', name, voiceSampleId);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voicePersonas'] });
    },
  });
}

export function useDeleteVoicePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personaId: string) => {
      // Note: Backend doesn't have delete method yet, this is a placeholder
      // In a real implementation, you would call actor.deleteVoicePersona(personaId)
      console.log('Delete persona:', personaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voicePersonas'] });
    },
  });
}
