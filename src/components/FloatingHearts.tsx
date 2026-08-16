import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const FloatingHearts = () => {
  const hearts = Array.from({ length: 12 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
      {hearts.map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute"
          style={{
            color: `hsla(${330 + Math.random() * 60}, 80%, 70%, ${0.15 + Math.random() * 0.2})`,
          }}
          initial={{
            x: Math.random() * 100 + '%',
            y: '110%',
            scale: Math.random() * 0.6 + 0.3,
            rotate: Math.random() * 360,
          }}
          animate={{
            y: '-10%',
            x: [
              Math.random() * 100 + '%',
              `${50 + (Math.random() - 0.5) * 20}%`,
              Math.random() * 100 + '%',
            ],
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        >
          <Heart size={Math.random() * 30 + 15} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
