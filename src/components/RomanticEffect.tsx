import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

interface RomanticEffectProps {
  active: boolean;
  onClose: () => void;
}

const RomanticEffect = ({ active, onClose }: RomanticEffectProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const messages = useMemo(() => [
    "Abra-cadabra! You've stolen my heart! ✨",
    "Watch closely... I'll love you forever! 🎩",
    "For my next trick, I'll make your worries disappear! 🪄",
    "Poof! You're the most beautiful girl in the world! 💖",
    "My greatest magic is having you by my side! 🌟"
  ], []);

  const images = [
    `${import.meta.env.BASE_URL}boy-magic-1.png`, // Stage 1: Wink & Heart
    `${import.meta.env.BASE_URL}boy-magic-2.png`, // Stage 2: Hearts from Hat
    `${import.meta.env.BASE_URL}boy-magic-3.png`, // Stage 3: Sparkles
    `${import.meta.env.BASE_URL}boy-magician.png`, // Stage 4: Surprise
    `${import.meta.env.BASE_URL}boy-magic-2.png`  // Stage 5: Celebration
  ];

  // Different animations for each step
  const reactions = [
    { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] },
    { rotateY: [0, 360], scale: [1, 1.1, 1] },
    { y: [0, -40, 0], scale: [1, 1.05, 0.95, 1] },
    { scale: [1, 1.15, 1], filter: ["brightness(1) sepia(0.2) saturate(1.1)", "brightness(1.3) sepia(0.2) saturate(1.1)", "brightness(1) sepia(0.2) saturate(1.1)"] },
    { scale: [1, 1.4, 1], y: [0, -20, 0], rotate: [0, 5, -5, 5, 0] } // 5th Stage: Grand Finale bounce
  ];

  const rainMessages = useMemo(() => [
    "Wishing you joy! ✨", "Infinite Love ❤️", "Stay Blessed 🌟", "Always Yours 💖",
    "Will you be mine? 💍", "Forever & Always ✨", "Marry me? 💖", "My Heart ❤️",
    "Success Always! 🚀", "Stay Amazing 💕", "Love You! 💖", "True Happiness ✨"
  ], []);

  const rainItems = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 4,
      text: rainMessages[Math.floor(Math.random() * rainMessages.length)],
      size: Math.random() * 0.5 + 0.8,
    }));
  }, [rainMessages]);

  const handleBoyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animating) return;
    setAnimating(true);
    setMessageIndex((prev) => (prev + 1) % messages.length);
    setTimeout(() => setAnimating(false), 800);
  };

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-40 pointer-events-auto flex items-center justify-center p-4 overflow-hidden"
            onClick={onClose}
          >
            {/* Rain of Wishes & Proposals */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {rainItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ y: '-10%', x: `${item.x}%`, opacity: 0 }}
                  animate={{ y: '110%', opacity: [0, 1, 1, 0] }}
                  transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'linear' }}
                  className="absolute text-pink-300 font-bold whitespace-nowrap"
                  style={{ fontSize: `${item.size}rem`, textShadow: '0 0 10px rgba(255,255,255,0.4)' }}
                >
                  {item.text}
                </motion.div>
              ))}
            </div>

            <div className="relative flex flex-col items-center z-10">
              {/* Chat Bubble */}
              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mb-6 relative"
              >
                <div className="bg-white px-8 py-5 rounded-3xl shadow-2xl border-4 border-purple-400 text-purple-700 font-bold text-xl md:text-2xl text-center max-w-[280px] md:max-w-md relative">
                  {messages[messageIndex]}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-white"></div>
                </div>
              </motion.div>

              {/* Interactive Magician Boy with changing images */}
              <motion.div
                key={`boy-${messageIndex}`} // Change key to trigger re-animation of entry if desired, or keep fixed
                animate={animating ? reactions[messageIndex] : {
                  y: [0, -8, 0],
                }}
                transition={animating ? { duration: 0.6 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
                onClick={handleBoyClick}
                className="cursor-pointer relative"
              >
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={images[messageIndex]}
                      src={images[messageIndex]}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        filter: 'sepia(0.3) saturate(1.2) brightness(0.85)'
                      }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      alt="Boy Magician"
                      className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(168,85,247,0.8)]"
                      />
                  </AnimatePresence>
                  
                  {/* Floating Magic Orbs */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {[0, 120, 240].map((angle, i) => (
                      <div 
                        key={i}
                        className="absolute w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_#A855F7]"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${angle}deg) translate(150px)`
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Magical Burst on Click */}
                {animating && (
                  <div className="absolute inset-0 -z-10">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, x: 0, y: 0 }}
                        animate={{ 
                          scale: [0, 1.8, 0],
                          x: Math.cos((i / 25) * Math.PI * 2) * (180 + Math.random() * 120),
                          y: Math.sin((i / 25) * Math.PI * 2) * (180 + Math.random() * 120),
                          rotate: 360
                        }}
                        transition={{ duration: 0.7 }}
                        className="absolute top-1/2 left-1/2 text-purple-300 text-3xl"
                      >
                        {['✨', '🌟', '💖', '🪄', '🎩'][i % 5]}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                className="text-purple-200 mt-10 text-lg font-bold animate-pulse"
                style={{ textShadow: '0 0 15px rgba(168,85,247,1)' }}
              >
                Tap him to see the next trick! 🪄
              </motion.p>
              
              <motion.button
                whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(168,85,247,0.5)" }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="mt-8 px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-2xl border-2 border-purple-300/30 transition-all font-bold text-lg"
              >
                Finish the Show ✨
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RomanticEffect;
