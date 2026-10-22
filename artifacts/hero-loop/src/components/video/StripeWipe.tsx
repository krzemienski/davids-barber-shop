import { motion } from 'framer-motion';

/** Diagonal barber-pole band that sweeps across each cut. Keyed by scene so it replays. */
export function StripeWipe() {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top: '-30%', bottom: '-30%', width: '22%', left: 0,
        transform: 'skewX(-18deg)',
        background: 'repeating-linear-gradient(135deg, #C8A464 0 2.2vmin, #0D0B09 2.2vmin 4.4vmin, #91263A 4.4vmin 6.6vmin, #EAE3D5 6.6vmin 7.2vmin, #0D0B09 7.2vmin 9.4vmin)',
        mixBlendMode: 'soft-light',
      }}
      initial={{ x: '-30vw', opacity: 0 }}
      animate={{ x: ['-30vw', '125vw'], opacity: [0, 0.9, 0.9, 0] }}
      transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], times: [0, 0.2, 0.8, 1] }}
    />
  );
}
