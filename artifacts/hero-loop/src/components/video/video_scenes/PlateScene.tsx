import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;
const EASE = [0.22, 1, 0.36, 1] as const;

export interface PlateProps {
  img: string;
  from: { s: number; x: number; r?: number };
  to: { s: number; x: number; r?: number };
  dur: number;
  origin?: string;
  steam?: boolean;
  glintAt?: number;
}

const WISPS = [0, 0.6, 1.2, 1.8, 2.4, 3.0].map((d, i) => ({ d, x: 64 + ((i * 37) % 26), w: 14 + ((i * 7) % 10) }));

export function PlateScene({ img, from, to, dur, origin = '70% 50%', steam, glintAt = 1.4 }: PlateProps) {
  const s = dur / 1000;
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <motion.img
        src={`${BASE}images/${img}`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transformOrigin: origin, filter: 'sepia(0.25) saturate(0.9) contrast(1.05)' }}
        initial={{ scale: from.s, x: `${from.x}%`, rotate: from.r ?? 0 }}
        animate={{ scale: to.s, x: `${to.x}%`, rotate: to.r ?? 0 }}
        transition={{ duration: s + 0.7, ease: 'linear' }}
      />
      {/* warm grade */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 72% 40%, rgba(200,164,100,0.18), transparent 60%), linear-gradient(90deg, rgba(13,11,9,0.55), rgba(13,11,9,0) 55%)' }} />
      {/* glint sweep */}
      <motion.div
        className="absolute top-0 bottom-0"
        style={{ left: '40%', width: '18%', background: 'linear-gradient(100deg, transparent, rgba(234,227,213,0.16), transparent)', mixBlendMode: 'screen' }}
        initial={{ x: '-60%', opacity: 0 }}
        animate={{ x: ['-60%', '320%'], opacity: [0, 1, 0] }}
        transition={{ delay: glintAt, duration: 1.6, ease: 'easeInOut' }}
      />
      {/* gold hairline */}
      <motion.div
        className="absolute h-px"
        style={{ top: '78%', left: '52%', width: '40%', background: 'linear-gradient(90deg, transparent, #C8A464, transparent)', transformOrigin: 'left' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1], opacity: [0, 0.8, 0] }}
        transition={{ delay: glintAt + 0.6, duration: 2, times: [0, 0.4, 1] }}
      />
      {steam && WISPS.map((w, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ left: `${w.x}%`, bottom: '30%', width: `${w.w}vmin`, height: `${w.w * 1.6}vmin`, background: 'radial-gradient(closest-side, rgba(234,227,213,0.22), transparent)', filter: 'blur(14px)' }}
          initial={{ y: 0, opacity: 0, scale: 0.6 }}
          animate={{ y: '-55vmin', opacity: [0, 0.9, 0], scale: 1.5, x: '4vmin' }}
          transition={{ delay: w.d, duration: 3.2, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  );
}
