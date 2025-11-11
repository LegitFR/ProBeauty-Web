import { Button } from "./ui/button";
import { ArrowRight, ShoppingBag, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { navigationActions } from "./ScrollManager";

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-black"
    >
      {/* Minimalist Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(255, 106, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 106, 0, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "80px 80px",
          }}
        ></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center min-h-screen py-16 sm:py-20">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-center md:text-left"
          >
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6"
            >
              <span className="text-white font-display">AI-Powered</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Beauty Ecosystem
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 max-w-lg mx-auto md:mx-0 leading-relaxed"
            >
              Discover personalized beauty products and book premium salon
              services with our intelligent recommendation system.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="flex flex-col sm:flex-row gap-4 mb-12 sm:mb-16 justify-center md:justify-start"
            >
              {/* Shop Products Button */}
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  onClick={() => navigationActions.shop()}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base font-bold px-8 py-6 h-14 rounded-2xl group transition-all duration-300 shadow-lg hover:shadow-2xl border-0 min-w-[160px]"
                >
                  <ShoppingBag className="h-5 w-5 mr-2.5" />
                  Shop Now
                  <ArrowRight className="h-4 w-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              {/* Book Appointment Button */}
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  onClick={() => navigationActions.bookSalon()}
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-orange-400/50 text-white hover:bg-orange-500/20 hover:border-orange-400 hover:text-orange-200 text-base font-bold px-8 py-6 h-14 rounded-2xl group transition-all duration-300 min-w-[160px]"
                >
                  <Calendar className="h-5 w-5 mr-2.5" />
                  Book Salon
                  <ArrowRight className="h-4 w-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="grid grid-cols-3 gap-4 sm:gap-8"
            >
              <div className="text-center md:text-left">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  50K+
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">
                  Beauty Scans
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  1K+
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">
                  Partner Salons
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  10K+
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">Products</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Futuristic 3D Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative sm:flex justify-center items-center lg:flex"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {/* Central AI Orb */}
              <motion.div
                animate={{
                  rotateY: [0, 360],
                  rotateX: [0, 15, -15, 0],
                }}
                transition={{
                  rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                  rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48"
              >
                {/* Core Sphere */}
                <motion.div
                  className="absolute inset-0 rounded-full backdrop-blur-sm border border-orange-500/30"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255, 106, 0, 0.3), rgba(255, 106, 0, 0.1), transparent)",
                    boxShadow:
                      "0 0 60px rgba(255, 106, 0, 0.4), inset 0 0 60px rgba(255, 106, 0, 0.2)",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 60px rgba(255, 106, 0, 0.4), inset 0 0 60px rgba(255, 106, 0, 0.2)",
                      "0 0 100px rgba(255, 106, 0, 0.6), inset 0 0 80px rgba(255, 106, 0, 0.3)",
                      "0 0 60px rgba(255, 106, 0, 0.4), inset 0 0 60px rgba(255, 106, 0, 0.2)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Inner Glow */}
                  <motion.div
                    className="absolute inset-8 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  {/* Core Light */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Orbital Rings */}
              {[...Array(3)].map((_, i) => {
                const size = 200 + i * 60;
                const duration = 15 + i * 5;

                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 border border-orange-400/20 rounded-full"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      marginLeft: `${-size / 2}px`,
                      marginTop: `${-size / 2}px`,
                    }}
                    animate={{ rotate: i % 2 === 0 ? [0, 360] : [360, 0] }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    {/* Ring Particles */}
                    {[...Array(8)].map((_, j) => {
                      const angle = j * 45 * (Math.PI / 180);
                      const radius = size / 2;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;

                      return (
                        <motion.div
                          key={j}
                          className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                          style={{
                            left: "50%",
                            top: "50%",
                            marginLeft: `${x}px`,
                            marginTop: `${y}px`,
                            boxShadow: "0 0 10px rgba(255, 106, 0, 0.8)",
                          }}
                          animate={{
                            opacity: [0.4, 1, 0.4],
                            scale: [0.5, 1.5, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: j * 0.2,
                          }}
                        />
                      );
                    })}
                  </motion.div>
                );
              })}

              {/* Floating Data Fragments */}
              {[...Array(6)].map((_, i) => {
                const angle = i * 60 * (Math.PI / 180);
                const radius = 180;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-8 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full opacity-70"
                    style={{
                      left: "50%",
                      top: "50%",
                      marginLeft: `${x}px`,
                      marginTop: `${y}px`,
                    }}
                    animate={{
                      rotate: [0, 360],
                      y: [0, -20, 0, 20, 0],
                      opacity: [0.4, 0.9, 0.4],
                    }}
                    transition={{
                      rotate: {
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear",
                      },
                      y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                      opacity: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5,
                      },
                    }}
                  />
                );
              })}

              {/* Ambient Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-orange-500/20 via-orange-500/5 to-transparent blur-3xl"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ambient Light Effects - Updated to Orange */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-40 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>

      {/* Floating Particles - Updated to Orange */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-orange-400/50 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + i * 8}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.2,
          }}
        />
      ))}
    </section>
  );
}
