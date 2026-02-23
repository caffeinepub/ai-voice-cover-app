import { useState, useRef } from 'react';
import { ExternalBlob } from '../backend';
import { useActor } from '../hooks/useActor';
import { Upload, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceUploadProps {
  onComplete: (id: string, blob: ExternalBlob) => void;
}

export function VoiceUpload({ onComplete }: VoiceUploadProps) {
  const { actor } = useActor();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a', 'audio/m4a'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
      toast.error('Please upload an MP3, WAV, or M4A file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !actor) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const externalBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const id = `voice-${Date.now()}`;
      await actor.uploadVoiceSample(id, 'user', externalBlob);
      
      toast.success('Voice sample uploaded successfully!');
      onComplete(id, externalBlob);
    } catch (err) {
      toast.error('Failed to upload voice sample');
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
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
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <p className="text-lg font-semibold">Click to upload voice sample</p>
              <p className="mt-1 text-sm text-muted-foreground">
                MP3, WAV, or M4A (max 50MB)
              </p>
            </div>
          </div>
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {!isUploading && (
              <button
                onClick={() => setSelectedFile(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            )}
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
            className="w-full rounded-lg bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            Upload Voice Sample
          </button>
        )}

        {/* Tips */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Tips for best results:</p>
          <ul className="mt-2 space-y-1 pl-4">
            <li>• Use a clear recording with minimal background noise</li>
            <li>• Include at least 10 seconds of speech</li>
            <li>• Speak naturally with varied intonation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
