import { Button } from "./ui/button";
import { ArrowRight, ShoppingBag, Calendar, Star } from "lucide-react";
import { motion } from "motion/react";
import { navigationActions } from "./ScrollManager";

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-hero"
    >
      {/* Orange Gradient - Left Center Hemisphere */}
      <div
        className="absolute bg-[#FF6B0233] -left-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[198.1px] pointer-events-none"
        // style={{
        //   background:
        //     "radial-gradient(circle, rgba(255, 106, 0, 0.3) 0%, rgba(255, 106, 0, 0.15) 40%, transparent 70%)",
        // }}
      ></div>

      {/* Orange Gradient - Bottom Right Hemisphere */}
      <div
        className="absolute bg-[#FF6B0233] -bottom-20 -right-8 w-96 h-96 rounded-full blur-[198.1px] pointer-events-none"
        // style={{
        //   background:
        //     "radial-gradient(circle, rgba(255, 106, 0, 0.3) 0%, rgba(255, 106, 0, 0.15) 40%, transparent 70%)",
        // }}
      ></div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-screen py-16 sm:py-20">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-left max-w-2xl mx-auto lg:mx-0"
          >
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-5xl sm:text-6xl md:text-6xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-white font-display">Book Beauty</span>
              <br />
              <span className="text-[#FF6A00] font-display">
                Services Nearby
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-base sm:text-lg text-gray-400 mb-10 max-w-xl leading-relaxed"
            >
              Discover personalized beauty products and book premium salon
              services with our intelligent recommendation system.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              {/* Shop Products Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  onClick={() => navigationActions.shop()}
                  className="w-full sm:w-auto bg-[#FF6A00] hover:bg-[#FF7A00] text-white text-base font-semibold px-8 py-6 h-14 rounded-lg group transition-all duration-300 border-0"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Shop Product
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              {/* Book Appointment Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  onClick={() => navigationActions.bookSalon()}
                  className="w-full sm:w-auto bg-transparent border-2 border-[#F44A01] text-[#F44A01] hover:bg-[#FF6A00]/10 text-base font-semibold px-8 py-6 h-14 rounded-lg group transition-all duration-300"
                >
                  <Calendar className="h-5 w-5 mr-2 text-[#F44A01]" />
                  Book Appointment
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform text-[#F44A01]" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="grid grid-cols-3 gap-6 sm:gap-12 mb-10 max-w-xl"
            >
              <div className="text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-regular text-white mb-1">
                  50K+
                </div>
                <div className="text-white text-xs sm:text-sm font-normal">
                  Beauty Scans
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-regular text-white mb-1">
                  1K+
                </div>
                <div className="text-white text-xs sm:text-sm font-normal">
                  Partner Salons
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-regular text-white mb-1">
                  10K+
                </div>
                <div className="text-white text-xs sm:text-sm font-normal">
                  Products
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative flex justify-center items-center"
          >
            <div className="hero-svg-wrap relative">
              <img
                src="/probeauty-hero-desktop-svg.svg"
                alt="Beauty service showcase"
                className="hero-svg-image"
              />
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 sm:-left-6 rounded-xl sm:rounded-2xl bg-white/15 px-4 py-3 sm:px-6 sm:py-4 min-w-[170px] sm:min-w-[210px] text-white backdrop-blur-2xl border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Hair Spa
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] sm:text-sm font-semibold">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#FF6A00]" />
                  Today · 4:30 PM
                </div>
              </div>
              <div className="absolute bottom-8 -right-3 sm:bottom-12 sm:-right-6 rounded-xl sm:rounded-2xl bg-white/15 px-4 py-3 sm:px-6 sm:py-4 min-w-[170px] sm:min-w-[210px] text-white backdrop-blur-2xl border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-2 text-[11px] sm:text-sm font-semibold">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-[#FF6A00]" />
                    4.9
                  </span>
                  <span className="text-white/70">Customer Rating</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
