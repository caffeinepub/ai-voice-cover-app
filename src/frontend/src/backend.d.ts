import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface VoicePersona {
    id: string;
    userId: string;
    name: string;
    voiceSampleId: string;
}
export interface VoiceSample {
    id: string;
    voiceFile: ExternalBlob;
    userId: string;
}
export interface LyricsRequest {
    id: string;
    status: LyricsStatus;
    lyrics: string;
    stylePrompt?: string;
    userId: string;
    generatedCoverId?: string;
    voiceSampleId: string;
}
export interface Cover {
    id: string;
    originalSong: Song;
    userVoice: VoiceSample;
    finalMix: ExternalBlob;
}
export interface Song {
    id: string;
    title: string;
    audioFile: ExternalBlob;
    creationDate: bigint;
    instrumentalFile: ExternalBlob;
    artist: string;
    modeType: ModeType;
    voiceSampleId?: string;
}
export type LyricsStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "complete";
    complete: null;
} | {
    __kind__: "processing";
    processing: null;
} | {
    __kind__: "failed";
    failed: string;
};
export enum ModeType {
    cover = "cover",
    original = "original"
}
export interface backendInterface {
    createCover(coverId: string, songId: string, voiceSampleId: string, finalMix: ExternalBlob): Promise<void>;
    createVoicePersona(id: string, userId: string, name: string, voiceSampleId: string): Promise<void>;
    getAllLyricsRequests(): Promise<Array<LyricsRequest>>;
    getAllVoicePersonas(userId: string): Promise<Array<VoicePersona>>;
    getCover(id: string): Promise<Cover | null>;
    getLyricsRequest(requestId: string): Promise<LyricsRequest | null>;
    getUserLibrary(userId: string): Promise<Array<Song>>;
    submitLyricsRequest(requestId: string, userId: string, lyrics: string, voiceSampleId: string, finalMix: ExternalBlob, stylePrompt: string | null): Promise<void>;
    uploadSong(id: string, title: string, artist: string, audioFile: ExternalBlob, instrumentalFile: ExternalBlob, voiceSampleId: string | null, modeType: ModeType): Promise<void>;
    uploadVoiceSample(id: string, userId: string, voiceFile: ExternalBlob): Promise<void>;
}
