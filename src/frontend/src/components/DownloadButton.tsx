import { useState } from 'react';
import { ExternalBlob } from '../backend';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadButtonProps {
  finalMix: ExternalBlob;
  filename: string;
  format: 'mp3' | 'wav';
}

export function DownloadButton({ finalMix, filename, format }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const bytes = await finalMix.getBytes();
      
      // Set MIME type based on format
      const mimeType = format === 'wav' ? 'audio/wav' : 'audio/mpeg';
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Ensure filename has correct extension
      const fileExtension = format === 'wav' ? '.wav' : '.mp3';
      const finalFilename = filename.endsWith(fileExtension) 
        ? filename 
        : filename.replace(/\.(mp3|wav)$/i, '') + fileExtension;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (err) {
      toast.error('Failed to download file');
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] px-8 py-4 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="h-5 w-5" />
          Download Your {format.toUpperCase()}
        </>
      )}
    </button>
  );
}
