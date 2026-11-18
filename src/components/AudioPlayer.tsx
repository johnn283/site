import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
  durationHint?: string;
  onPlayTrack?: () => void;
  compact?: boolean;
}

const AUDIO_PLAY_EVENT = 'javoz:audio-play';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  durationHint = '00:10',
  onPlayTrack,
  compact = false,
}) => {
  const playerId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const hasCountedPlayRef = useRef(false);

  // Deterministic acoustic waveform heights derived from title
  const waveformBars = useMemo(() => {
    const count = compact ? 28 : 40;
    let seed = 17;
    for (let i = 0; i < title.length; i++) {
      seed = (seed * 31 + title.charCodeAt(i)) % 9973;
    }
    return Array.from({ length: count }, (_, idx) => {
      const wave = Math.sin(idx * 0.45 + seed * 0.01) * 0.35 + Math.cos(idx * 0.85 + seed) * 0.25;
      const pct = Math.round(32 + Math.abs(wave) * 68);
      return Math.min(100, Math.max(22, pct));
    });
  }, [title, compact]);

  useEffect(() => {
    const handleOtherPlay = (e: Event) => {
      const custom = e as CustomEvent<{ id: string }>;
      if (custom.detail?.id !== playerId && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener(AUDIO_PLAY_EVENT, handleOtherPlay);
    return () => window.removeEventListener(AUDIO_PLAY_EVENT, handleOtherPlay);
  }, [playerId]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setLoadError(false);
    hasCountedPlayRef.current = false;
  }, [src]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el || !src) return;

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      return;
    }

    try {
      window.dispatchEvent(new CustomEvent(AUDIO_PLAY_EVENT, { detail: { id: playerId } }));
      await el.play();
      setIsPlaying(true);
      if (!hasCountedPlayRef.current && onPlayTrack) {
        hasCountedPlayRef.current = true;
        onPlayTrack();
      }
    } catch {
      setLoadError(true);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
    setCurrentTime(el.currentTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#0D0D10] px-3.5 py-3">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          setLoadError(false);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => setLoadError(true)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!src || loadError}
          aria-label={isPlaying ? `Pausar ${title}` : `Reproduzir ${title}`}
          className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
            isPlaying
              ? 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
              : 'bg-[#D4AF37] text-[#09090B] hover:bg-[#E5C158]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div
          onClick={handleSeek}
          role="slider"
          tabIndex={0}
          aria-label={`Linha do tempo de ${title}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 10)}
          aria-valuenow={Math.round(currentTime)}
          onKeyDown={(e) => {
            const el = audioRef.current;
            if (!el || !duration) return;
            if (e.key === 'ArrowRight') {
              el.currentTime = Math.min(duration, el.currentTime + 2);
            } else if (e.key === 'ArrowLeft') {
              el.currentTime = Math.max(0, el.currentTime - 2);
            }
          }}
          className="flex-1 flex items-center gap-[3px] h-9 cursor-pointer select-none group"
        >
          {waveformBars.map((heightPct, idx) => {
            const barPct = ((idx + 1) / waveformBars.length) * 100;
            const isActive = barPct <= progress;
            return (
              <span
                key={idx}
                style={{ height: `${heightPct}%` }}
                className={`flex-1 rounded-full transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#D4AF37]'
                    : 'bg-zinc-700/75 group-hover:bg-zinc-600'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs tabular-nums text-zinc-400">
            {currentTime > 0 ? formatTime(currentTime) : duration > 0 ? formatTime(duration) : durationHint}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {loadError && (
        <p className="mt-2 text-xs text-red-400">
          Não foi possível carregar este arquivo de áudio.
        </p>
      )}
    </div>
  );
};
