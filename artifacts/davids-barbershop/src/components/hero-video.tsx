import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { mediaUrl } from '@/lib/format';

function useReducedMotion() {
  const [r, setR] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
}

/** Fixed full-viewport video layer behind page content. */
export function HeroVideo() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const showVideo = !reduced && !failed;

  // Pause when tab hidden
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const on = () => {
      if (document.hidden) v.pause();
      else if (!userPaused) v.play().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, [userPaused, showVideo]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (userPaused) v.pause();
    else v.play().catch(() => undefined);
  }, [userPaused]);

  // Desktop-only subtle parallax drift
  useEffect(() => {
    if (reduced) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = layerRef.current;
      if (!el) return;
      if (!mq.matches) { el.style.transform = ''; return; }
      const y = window.scrollY;
      el.style.transform = `translate3d(0, ${(Math.sin(y / 850) * 18 - y * 0.08).toFixed(1)}px, 0) scale(1.06)`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener('scroll', on, { passive: true });
    tick();
    return () => { window.removeEventListener('scroll', on); if (raf) cancelAnimationFrame(raf); };
  }, [reduced]);

  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-0 overflow-hidden bg-ink" style={{ zIndex: 0 }}>
        <div ref={layerRef} className="absolute inset-0 will-change-transform">
          {showVideo ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover object-[70%_center]"
              src={mediaUrl('hero.mp4')}
              poster={mediaUrl('hero-poster.jpg')}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setFailed(true)}
            />
          ) : (
            <img src={mediaUrl('hero-poster.jpg')} alt="" className="h-full w-full object-cover object-[70%_center]" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink" />
      </div>
      {showVideo && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? 'Play background video' : 'Pause background video'}
          aria-pressed={userPaused}
          data-testid="button-video-toggle"
          className="absolute right-5 bottom-28 lg:bottom-8 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-ink/60 text-gold backdrop-blur hover:bg-gold hover:text-ink transition-colors"
        >
          {userPaused ? <Play className="h-4 w-4 translate-x-px" /> : <Pause className="h-4 w-4" />}
        </button>
      )}
    </>
  );
}
