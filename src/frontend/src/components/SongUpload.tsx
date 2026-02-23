import { useState, useRef } from 'react';
import { ExternalBlob, ModeType } from '../backend';
import { useActor } from '../hooks/useActor';
import { Upload, Music, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SongUploadProps {
  onComplete: (id: string, title: string, artist: string) => void;
  voiceSampleId?: string;
}

export function SongUpload({ onComplete, voiceSampleId }: SongUploadProps) {
  const { actor } = useActor();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a', 'audio/m4a'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
      toast.error('Please upload an MP3, WAV, or M4A file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB');
      return;
    }

    setSelectedFile(file);
    
    // Auto-fill title from filename
    if (!title) {
      const filename = file.name.replace(/\.[^/.]+$/, '');
      setTitle(filename);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !actor || !title.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const audioBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // For now, use the same blob for both audio and instrumental
      // In a real implementation, the backend would separate vocals
      const instrumentalBlob = audioBlob;

      const id = `song-${Date.now()}`;
      await actor.uploadSong(
        id, 
        title.trim(), 
        artist.trim() || 'Unknown Artist', 
        audioBlob, 
        instrumentalBlob,
        voiceSampleId || null,
        ModeType.cover
      );
      
      toast.success('Song uploaded successfully!');
      onComplete(id, title.trim(), artist.trim() || 'Unknown Artist');
    } catch (err) {
      toast.error('Failed to upload song');
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold">Step 2: Upload Song</h2>
        <p className="text-muted-foreground">
          Choose the song you want to cover with your voice
        </p>
      </div>

      <div className="rounded-xl border-2 border-border bg-card p-8 shadow-lg">
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-border bg-muted/50 p-12 text-center transition-colors hover:border-primary hover:bg-muted"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Music className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <p className="text-lg font-semibold">Click to upload song</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  MP3, WAV, or M4A (max 100MB)
                </p>
              </div>
            </div>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata Form */}
          {selectedFile && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Song Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter song title"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Enter artist name (optional)"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !isUploading && (
            <button
              onClick={handleUpload}
              disabled={!title.trim()}
              className="w-full rounded-lg bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Processing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
