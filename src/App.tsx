import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Stars, RefreshCw, MailOpen } from 'lucide-react';
import SpaceBackground from './components/SpaceBackground';
import FloatingHearts from './components/FloatingHearts';
import { useSparkles, SparkleDisplay } from './components/Sparkles';
import RomanticEffect from './components/RomanticEffect';

function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const startMusic = () => {
  if (audioRef.current) {
    audioRef.current.volume = 0.4;
    audioRef.current
    .play()
    .then(() => {
      setIsPlaying(true);
    })
    .catch((error) => {
      console.log('Music could not start:', error);
    });
  }
};
const toggleMusic = () => {
  if (!audioRef.current) return;
  
  if (audioRef.current.paused) {
    audioRef.current.play();
    setIsPlaying(true);
  } else {
    audioRef.current.pause();
    setIsPlaying(false);
  }
};
  const { sparkles, addSparkle } = useSparkles();
  const [currentPage, setCurrentPage] = useState(0);
  const [clickEffects, setClickEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [romanticMode, setRomanticMode] = useState(false);
  const [direction, setDirection] = useState(1);
  const [flowState, setFlowState] = useState<'intro' | 'question' | 'letter' | 'main'>('intro');
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [noAttempts, setNoAttempts] = useState(0);

  const handleRestart = useCallback(() => {
    setFlowState('intro');
    setCurrentPage(0);
    setRomanticMode(false);
    setNoAttempts(0);
  }, []);

  const handleSpaceClick = useCallback((e: React.MouseEvent) => {
    const clickX = e.clientX;
    const clickY = e.clientY;

    if ((window as any).checkPlanetClick) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const distToSun = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2));
      
      const hitPlanet = (window as any).checkPlanetClick(clickX, clickY);
      
      if (flowState === 'intro' && distToSun < 100) {
        setFlowState('question');
        addSparkle(clickX, clickY, 40);
        return;
      }

      if (hitPlanet) {
        addSparkle(clickX, clickY, 25);
        if ((window as any).triggerSpaceWave) {
          (window as any).triggerSpaceWave(clickX, clickY);
        }
        const newEffect = { id: Date.now(), x: clickX, y: clickY };
        setClickEffects((prev) => [...prev, newEffect]);
        setTimeout(() => {
          setClickEffects((prev) => prev.filter((eff) => eff.id !== newEffect.id));
        }, 1000);
        return;
      }
    }

    if ((window as any).triggerSpaceWave) {
      (window as any).triggerSpaceWave(clickX, clickY);
    }

    addSparkle(clickX, clickY, 15);

    const newEffect = { id: Date.now(), x: clickX, y: clickY };
    setClickEffects((prev) => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects((prev) => prev.filter((eff) => eff.id !== newEffect.id));
    }, 1000);
  }, [addSparkle, flowState]);

  const handleMakeMagic = useCallback(() => {
    setRomanticMode(true);
    addSparkle(window.innerWidth / 2, window.innerHeight / 2, 30);
    startMusic();
  }, [addSparkle, startMusic]);

  const moveNoButton = useCallback(() => {
    const maxX = window.innerWidth * 0.3;
    const maxY = window.innerHeight * 0.3;
    const newX = (Math.random() - 0.5) * maxX;
    const newY = (Math.random() - 0.5) * maxY;
    setNoButtonPos({ x: newX, y: newY });
    setNoAttempts(prev => prev + 1);
  }, []);

  const pages = [
    {
      title: "Hello My Love!",
      subtitle: "You are the center of my universe",
      image: `${import.meta.env.BASE_URL}couple-hugging.jpg`,
      message: "Every day I wake up feeling like the luckiest person just because you are in my life.",
      color: "from-pink-400 to-rose-500",
      hasHijab: true
    },
    {
      title: "I Love You",
      subtitle: "More than words can say",
      image: `${import.meta.env.BASE_URL}couple-love.png`,
      message: "You are my sunshine, my moonlight, and all my stars. I'm so lucky to have you.",
      color: "from-purple-400 to-indigo-500"
    },
    {
      title: "Cheer Up, Girl! ✨",
      subtitle: "I'm always here for you",
      image: `${import.meta.env.BASE_URL}couple-cheer-up.png`,
      message: "Don't let that beautiful smile fade. I'll always be the one to wipe your tears and hold your hand through anything.",
      color: "from-teal-400 to-blue-500"
    },
    {
      title: "Will You Be Mine? 💍",
      subtitle: "My beautiful girl in pink",
      image: `${import.meta.env.BASE_URL}couple-proposal.png`,
      message: "I want to spend every single second of my life making you happy. You are my greatest adventure and my home.",
      color: "from-rose-400 to-red-500",
      hasHijab: true
    },
    {
      title: "Forever Together",
      subtitle: "Our eternal bond",
      image: `${import.meta.env.BASE_URL}couple-forever.png`,
      message: "Across every galaxy and through every lifetime, I will always find my way back to you.",
      color: "from-indigo-400 to-purple-600",
      hasHijab: true
    }
  ];

  const handleMoveToNext = useCallback(() => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % pages.length);
  }, [pages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !romanticMode) {
        e.preventDefault();
        if (flowState === 'intro') {
          setFlowState('question');
        } else if (flowState === 'question') {
          // Do nothing or move to letter if you want space to count as yes
          setFlowState('letter');
        } else {
          (window as any).triggerSpaceWave?.(window.innerWidth / 2, window.innerHeight / 2);
          addSparkle(window.innerWidth / 2, window.innerHeight / 2, 20);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [romanticMode, addSparkle, flowState]);

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden"
      onClick={handleSpaceClick}
    >
      <audio
      ref={audioRef}
      src={`${import.meta.env.BASE_URL}Love Will Remember.mp3`}
      loop
    />
      <SpaceBackground />
      <FloatingHearts />
      <SparkleDisplay sparkles={sparkles} />
      <RomanticEffect active={romanticMode} onClose={() => setRomanticMode(false)} />

      {flowState === 'main' && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1, rotate: 180 }}
          onClick={(e) => {
            e.stopPropagation();
            handleRestart();
          }}
          className="fixed top-6 right-6 z-50 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition-all shadow-lg border border-white/30"
          title="Restart Journey"
        >
          <RefreshCw size={24} />
        </motion.button>
      )}

      <AnimatePresence>
        {clickEffects.map((effect) => (
          <React.Fragment key={effect.id}>
            <motion.div
              initial={{ scale: 0, opacity: 1, borderWidth: 4 }}
              animate={{ scale: 3, opacity: 0, borderWidth: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'fixed',
                left: effect.x,
                top: effect.y,
                width: 30,
                height: 30,
                border: '4px solid #FFD700',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9998,
                transform: 'translate(-50%, -50%)',
              }}
            />
          </React.Fragment>
        ))}
      </AnimatePresence>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pointer-events-none">
        <AnimatePresence mode="wait">
          {flowState === 'intro' && (
            <motion.div
              key="intro-hint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/20"
              >
                <p className="text-white text-lg font-serif">Tap the Sun to Begin ✨</p>
              </motion.div>
            </motion.div>
          )}

          {flowState === 'question' && (
            <motion.div
              key="love-question"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl max-w-sm w-full text-center border-4 border-pink-300 pointer-events-auto"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-6"
              >
                {noAttempts > 3 ? "T^T" : "🥺"}
              </motion.div>
              <h2 className="text-3xl font-bold text-pink-600 mb-8 font-serif">
                {noAttempts > 5 
                  ? "Do you really not love me? T^T" 
                  : noAttempts > 2 
                    ? "Please? Just say yes! 🥺" 
                    : "Do you love me?"}
              </h2>
              <div className="flex justify-center gap-6 relative h-20 items-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlowState('letter');
                    addSparkle(window.innerWidth / 2, window.innerHeight / 2, 40);
                  }}
                  className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg text-xl z-10"
                >
                  Yes! 💖
                </motion.button>
                
                <motion.button
                  animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                  onHoverStart={moveNoButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    // If they somehow click it (mobile), still move it
                    moveNoButton();
                  }}
                  className="bg-gray-200 text-gray-500 px-8 py-3 rounded-full font-bold text-xl cursor-not-allowed"
                >
                  No
                </motion.button>
              </div>
              
              {noAttempts > 10 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-pink-400 text-sm italic"
                >
                  Okay, fine... I won't let you say no anyway! 😤
                </motion.p>
              )}
            </motion.div>
          )}

          {flowState === 'letter' && (
            <motion.div
              key="letter-card"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -500 }}
              className="bg-[#fef9f3] p-10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-md w-full border-b-[12px] border-pink-200 pointer-events-auto relative"
              style={{
                fontFamily: "'Dancing Script', cursive",
                backgroundImage: "radial-gradient(#e5e5f7 0.5px, transparent 0.5px)",
                backgroundSize: "20px 20px"
              }}
            >
              <div className="absolute top-4 right-6 text-pink-300">
                <Heart size={32} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-bold text-pink-600 mb-6 border-b-2 border-pink-100 pb-2">My Dearest...</h2>
              <div className="space-y-4 text-gray-700 text-xl leading-relaxed italic">
                <p>I looked at the stars tonight and realized that none of them could ever shine as bright as you do in my life.</p>
                <p>You are my sun, my moon, and every planet in my orbit. Every moment with you feels like a beautiful dream.</p>
                <p>I have something special to tell you...</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setFlowState('main');
                  addSparkle(window.innerWidth / 2, window.innerHeight / 2, 30);
                }}
                className="mt-10 w-full bg-pink-500 text-white py-4 rounded-md font-bold shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-2 text-xl"
              >
                Read My Message <MailOpen size={24} />
              </motion.button>
            </motion.div>
          )}

          {flowState === 'main' && (
            <motion.div
              key="main-card"
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -300, scale: 0.8 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl max-w-lg w-full text-center border-4 border-pink-300 pointer-events-auto"
            >
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              >
                <div className="relative mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    className="rounded-2xl overflow-hidden shadow-xl border-4 border-white relative"
                  >
                    <img 
                      src={pages[currentPage].image} 
                      alt="Couple" 
                      className="w-full h-auto object-cover relative z-10" 
                      onError={(e) => { 
                        console.log("IMAGE FAILED:", e.currentTarget.src);
                      }}
                      onLoad={(e) => {
                        console.log("IMAGE LOADED:", e.currentTarget.src);
                      }}
                      style={{
                        filter: 'sepia(0.3) saturate(1.2) brightness(0.85)',
                      }}
                    />
                    {/* Subtle pink hijab/aura effect */}
                    {(pages[currentPage] as any).hasHijab && (
                      <div className="absolute inset-0 bg-pink-500/10 mix-blend-overlay z-20 pointer-events-none rounded-2xl border-4 border-pink-200/50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent pointer-events-none" />
                  </motion.div>
                  <motion.div className="absolute -top-4 -right-4 bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-full text-white shadow-lg"><Heart fill="currentColor" size={24} /></motion.div>
                </div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600 mb-2 font-serif">{pages[currentPage].title}</h1>
                <p className="text-pink-400 font-medium mb-4">{pages[currentPage].subtitle}</p>
                <p className="text-gray-700 text-lg mb-8 italic">"{pages[currentPage].message}"</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <motion.button whileHover={{ scale: 1.1, rotate: 2 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleMoveToNext(); }} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">Move to Next <Stars size={20} /></motion.button>
                  <motion.button whileHover={{ scale: 1.1, rotate: -2 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleMakeMagic(); }} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">Make Magic <Heart size={20} fill="currentColor" /></motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
        * { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' style='fill:pink;stroke:white;stroke-width:1'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/></svg>") 12 12, auto; }
      `}</style>
    </div>
  );
}

export default App;
