import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Song, Cover, LyricsRequest, VoicePersona } from '../backend';

// Export query key for manual invalidation
export const USER_LIBRARY_QUERY_KEY = 'userLibrary';

export function useUserLibrary(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Song[]>({
    queryKey: [USER_LIBRARY_QUERY_KEY, userId],
    queryFn: async () => {
      if (!actor) return [];
      console.log('[useUserLibrary] Fetching library for userId:', userId);
      const library = await actor.getUserLibrary(userId);
      console.log('[useUserLibrary] Fetched library:', {
        count: library.length,
        songs: library.map(s => ({ id: s.id, title: s.title, modeType: s.modeType }))
      });
      return library;
    },
    enabled: !!actor && !isFetching && !!userId,
    refetchInterval: 5000,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: 'always', // Always refetch when component mounts
  });
}

export function useGetCover(coverId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Cover | null>({
    queryKey: ['cover', coverId],
    queryFn: async () => {
      if (!actor) return null;
      console.log('[useGetCover] Fetching cover:', coverId);
      const cover = await actor.getCover(coverId);
      console.log('[useGetCover] Fetched cover:', cover);
      return cover;
    },
    enabled: !!actor && !isFetching && !!coverId,
  });
}

export function useGetLyricsRequest(requestId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<LyricsRequest | null>({
    queryKey: ['lyricsRequest', requestId],
    queryFn: async () => {
      if (!actor) return null;
      console.log('[useGetLyricsRequest] Fetching request:', requestId);
      const request = await actor.getLyricsRequest(requestId);
      console.log('[useGetLyricsRequest] Fetched request:', request);
      return request;
    },
    enabled: !!actor && !isFetching && !!requestId,
  });
}

export function useVoicePersonas(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<VoicePersona[]>({
    queryKey: ['voicePersonas', userId],
    queryFn: async () => {
      if (!actor) return [];
      console.log('[useVoicePersonas] Fetching personas for userId:', userId);
      const personas = await actor.getAllVoicePersonas(userId);
      console.log('[useVoicePersonas] Fetched personas:', personas);
      return personas;
    },
    enabled: !!actor && !isFetching && !!userId,
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
      if (!actor) throw new Error('Actor not initialized');
      console.log('[useCreateVoicePersona] Creating persona:', { id, userId, name, voiceSampleId });
      await actor.createVoicePersona(id, userId, name, voiceSampleId);
      console.log('[useCreateVoicePersona] Persona created successfully');
    },
    onSuccess: (_, variables) => {
      console.log('[useCreateVoicePersona] Invalidating queries for userId:', variables.userId);
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
      console.log('[useDeleteVoicePersona] Delete requested for persona:', personaId);
      // Note: Backend doesn't have a delete method yet, so this is a placeholder
      // In a real implementation, this would call actor.deleteVoicePersona(personaId)
      throw new Error('Delete functionality not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      console.log('[useDeleteVoicePersona] Invalidating queries for userId:', variables.userId);
      queryClient.invalidateQueries({ queryKey: ['voicePersonas', variables.userId] });
    },
    onError: (error) => {
      console.error('[useDeleteVoicePersona] Error deleting persona:', error);
    },
  });
}
