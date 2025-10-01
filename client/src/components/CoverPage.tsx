import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Heart, Camera, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-sri-lanka.jpg';

interface CoverPageProps {
  onStartJourney: () => void;
}

const CoverPage: React.FC<CoverPageProps> = ({ onStartJourney }) => {
  // Reset scroll position when cover page is mounted/displayed
  useEffect(() => {
    // Reset scroll position to top
    window.scrollTo(0, 0);
    
    // Also reset any scrollable container that might exist
    const scrollableElements = document.querySelectorAll('[data-scrollable]');
    scrollableElements.forEach(element => {
      element.scrollTop = 0;
    });
    
    // Reset body scroll position
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  return (
    <div className="relative w-full h-[99svh] md:h-screen overflow-hidden touch-none overscroll-none max-w-[100vw] top-0 left-0" style={{ transform: 'translateY(0px)' }}>
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Sri Lankan landscape with Sigiriya Rock and golden sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* Cultural Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, currentColor 2px, transparent 2px),
                           radial-gradient(circle at 80% 80%, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px, 40px 40px',
          color: '#ff8c00'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 py-4 md:py-0 overflow-hidden max-w-full">
        {/* Floating Icons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-16 left-4 md:top-20 md:left-20 text-primary/60"
        >
          <MapPin className="w-6 h-6 md:w-8 md:h-8" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute top-24 right-4 md:top-32 md:right-32 text-cultural-gold/60"
        >
          <Camera className="w-6 h-6" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="absolute bottom-32 left-4 md:bottom-40 md:left-32 text-lotus-pink/60"
        >
          <Heart className="w-6 h-6 md:w-7 md:h-7" />
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-4 md:mb-8"
        >
          <h1 className="book-title text-white drop-shadow-2xl mb-4 max-w-full">
            Discover
            <br />
            <span className="text-gradient-saffron">Sri Lanka</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light tracking-wide max-w-2xl mx-auto drop-shadow-lg px-2">
            Journey through the Pearl of the Indian Ocean
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-6 md:mb-12"
        >
          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed px-2">
            Explore ancient temples, pristine beaches, misty mountains, and incredible wildlife
            in this interactive journey through Sri Lanka's most enchanting destinations.
          </p>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Button
            onClick={onStartJourney}
            size="lg"
            className="bg-gradient-saffron hover:shadow-cultural text-white font-medium px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105 saffron-glow"
          >
            Begin Your Journey
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <span className="whitespace-nowrap">Interactive Travel Guide</span>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
        </motion.div>

        {/* Sliding Animation Hint */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: [0, 1, 1, 0], x: [-20, 0, 0, 20] }}
          transition={{ 
            delay: 2,
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1, // Reduced from 4 to 2 seconds
            ease: "easeInOut"
          }}
          className="absolute bottom-12 md:bottom-20 right-4 md:right-16 flex items-center gap-3 text-white/80"
        >
          <motion.div
            animate={{ x: [0, 12, 0] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "easeInOut"
            }}
            className="flex items-center gap-2"
          >
            <span className="text-lg md:text-xl font-light">Swipe to explore</span>
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
          </motion.div>
        </motion.div>

        {/* Page Corner Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{
            delay: 3,
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3, // Reduced from 5 to 3 seconds
            ease: "easeInOut"
          }}
          className="absolute top-4 right-4 w-20 h-20 md:w-24 md:h-24 pointer-events-none"
        >
          <div className="absolute top-0 right-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-bl from-white/25 to-transparent rounded-bl-3xl transform rotate-45 origin-top-right" />
          <motion.div
            animate={{ 
              scaleX: [1, 1.15, 1],
              scaleY: [1, 1.15, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute top-0 right-0 w-8 h-8 md:w-10 md:h-10 border-r-3 border-t-3 border-white/40 rounded-tr-xl"
          />
        </motion.div>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 10,
              opacity: 0,
            }}
            animate={{
              y: -10,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CoverPage;