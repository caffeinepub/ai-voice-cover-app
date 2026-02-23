import { SiGithub } from 'react-icons/si';
import { Music, Library as LibraryIcon, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: 'create' | 'library' | 'personas';
  onViewChange?: (view: 'create' | 'library' | 'personas') => void;
}

export function Layout({ children, currentView = 'create', onViewChange }: LayoutProps) {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'voice-cover-studio'
  );

  return (
    <div className="relative min-h-screen">
      {/* Background with waveform */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: 'url(/assets/generated/waveform-bg.dim_1920x1080.png)' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-background to-accent/5" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.70_0.20_30)] to-[oklch(0.60_0.22_20)] shadow-lg">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Voice Cover Studio</h1>
                  <p className="text-xs text-muted-foreground">AI-Powered Voice Covers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <SiGithub className="h-5 w-5" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </div>
            </div>

            {/* Navigation Tabs */}
            {onViewChange && (
              <div className="flex gap-1 border-t border-border/40">
                <button
                  onClick={() => onViewChange('create')}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentView === 'create'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Music className="h-4 w-4" />
                  Create
                </button>
                <button
                  onClick={() => onViewChange('library')}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentView === 'library'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LibraryIcon className="h-4 w-4" />
                  Library
                </button>
                <button
                  onClick={() => onViewChange('personas')}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    currentView === 'personas'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Personas
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © {currentYear} Voice Cover Studio. Free forever.
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                Built with
                <svg className="h-4 w-4 text-[oklch(0.65_0.22_20)]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                using
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
