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
      if (!actor) {
        console.log('[useUserLibrary] Actor not available');
        return [];
      }
      console.log('[useUserLibrary] Fetching library for userId:', userId);
      const songs = await actor.getUserLibrary(userId);
      console.log('[useUserLibrary] Fetched songs:', songs.length, songs);
      return songs;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Refetch every 5 seconds to catch new songs
  });
}

export function useCreateVoicePersona() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      userId,
      name,
      voiceSampleId,
    }: {
      id: string;
      userId: string;
      name: string;
      voiceSampleId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useCreateVoicePersona] Creating persona:', { id, userId, name, voiceSampleId });
      await actor.createVoicePersona(id, userId, name, voiceSampleId);
      console.log('[useCreateVoicePersona] Persona created successfully');
    },
    onSuccess: (_, variables) => {
      console.log('[useCreateVoicePersona] Invalidating personas query for userId:', variables.userId);
      queryClient.invalidateQueries({ queryKey: ['voicePersonas', variables.userId] });
    },
    onError: (error) => {
      console.error('[useCreateVoicePersona] Error creating persona:', error);
    },
  });
}

export function useDeleteVoicePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ personaId, userId }: { personaId: string; userId: string }) => {
      console.log('[useDeleteVoicePersona] Deleting persona:', { personaId, userId });
      // Backend doesn't have a delete method yet, so this is a placeholder
      // In production, you would call: await actor.deleteVoicePersona(personaId);
      throw new Error('Delete not implemented in backend');
    },
    onSuccess: (_, variables) => {
      console.log('[useDeleteVoicePersona] Invalidating personas query for userId:', variables.userId);
      queryClient.invalidateQueries({ queryKey: ['voicePersonas', variables.userId] });
    },
    onError: (error) => {
      console.error('[useDeleteVoicePersona] Error deleting persona:', error);
    },
  });
}

export function useVoicePersonas(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<VoicePersona[]>({
    queryKey: ['voicePersonas', userId],
    queryFn: async () => {
      if (!actor) {
        console.log('[useVoicePersonas] Actor not available');
        return [];
      }
      console.log('[useVoicePersonas] Fetching personas for userId:', userId);
      const personas = await actor.getAllVoicePersonas(userId);
      console.log('[useVoicePersonas] Fetched personas:', personas.length);
      return personas;
    },
    enabled: !!actor && !isFetching,
  });
}
