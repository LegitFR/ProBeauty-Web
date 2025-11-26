import { Button } from "./ui/button";
import {
  Smartphone,
  Star,
  Download,
  Apple,
  Calendar,
  Brain,
  Users,
  CheckCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export function AppDownload() {
  const features = [
    {
      icon: Calendar,
      title: "Instant Booking",
      description: "Book appointments in just 3 taps",
    },
    {
      icon: Brain,
      title: "AI Recommendations",
      description: "Personalized product suggestions",
    },
    {
      icon: Users,
      title: "Community Reviews",
      description: "Real reviews from beauty enthusiasts",
    },
  ];

  const stats = [
    { value: "4.7★", label: `App Store Rating` },
    { value: "100K+", label: "Downloads" },
    { value: "3K+", label: "Reviews" },
  ];

  return (
    <section
      id="app"
      className="py-16 sm:py-20 lg:py-24 bg-linear-to-r from-[#4D1C00] via-[#792800] to-[#F44A01] relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-[#F8F7FA]">
                Get the ProBeauty
              </h2>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[#F44A01]">Mobile App</span>
              </h2>

              <p className="text-base sm:text-lg text-[#F1E5D5] mb-8 sm:mb-10 leading-relaxed max-w-lg">
                Take your beauty journey with you! Shop, book, and discover new
                looks wherever you are.
              </p>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4 sm:space-y-5 mb-8 sm:mb-10"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.6 + index * 0.1,
                  }}
                  className="flex items-start gap-3 sm:gap-4"
                >
                  <motion.div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFFFFF1A] rounded-full flex items-center justify-center flex-shrink-0 p-2">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#F44A01]" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-[#ECE3DC] mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-[#B8B8B8] text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10"
            >
              <Button
                size="lg"
                onClick={() => toast.info("Redirecting to App Store...")}
                className="bg-[#FFFFFF1A] text-white hover:bg-black px-5 py-3 sm:px-6 sm:py-4 rounded-2xl group transition-all duration-300 transform hover:scale-105 shadow-lg h-auto"
              >
                <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2.5 sm:mr-3 text-white flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs text-gray-300">Download for iOS</div>
                </div>
              </Button>

              <Button
                size="lg"
                onClick={() =>
                  toast.info("Redirecting to Google Play Store...")
                }
                className="bg-[#FFFFFF1A] text-white hover:bg-black px-5 py-3 sm:px-6 sm:py-4 rounded-2xl group transition-all duration-300 transform hover:scale-105 shadow-lg h-auto"
              >
                <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2.5 sm:mr-3 text-white flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs text-gray-300">
                    Download for Android
                  </div>
                </div>
              </Button>
            </motion.div>

            {/* App Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-wrap justify-center sm:justify-start items-center gap-6 sm:gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 1.2 + index * 0.1,
                  }}
                  className="text-left"
                >
                  <div className="text-xl sm:text-2xl font-bold font-display text-[#F44A01] mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/90">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Phone Mockups Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mt-12 lg:mt-0"
          >
            <div className="relative max-w-lg mx-auto flex items-center justify-center">
              {/* Center Phone with Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative z-20 bg-black p-2.5 sm:p-3 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl w-64 sm:w-80 mx-4"
              >
                <div className="bg-gradient-to-br from-[#FF6A00] to-[#FF8A00] rounded-[2.2rem] sm:rounded-[2.7rem] overflow-hidden shadow-inner aspect-[9/19]">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 sm:px-6 py-2 sm:py-3 bg-black/20">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      9:41
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 sm:w-4 h-1.5 sm:h-2 bg-white/80 rounded-sm"></div>
                      <div className="w-4 sm:w-5 h-1.5 sm:h-2 bg-white/60 rounded-sm"></div>
                    </div>
                  </div>

                  {/* ProBeauty Logo Center */}
                  <div className="flex items-center justify-center h-[calc(100%-60px)] sm:h-[calc(100%-70px)]">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="relative"
                    >
                      {/* Circular background */}
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white/30 border-dashed"
                      ></motion.div>

                      {/* P Logo */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center">
                          <span className="text-white font-display text-4xl sm:text-5xl font-bold">
                            P
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom notch */}
                  <div className="h-1.5 sm:h-2 bg-black/20"></div>
                </div>
              </motion.div>

              {/* Left Phone (Background) */}
              <motion.div
                initial={{ x: -50, opacity: 0, rotate: -15 }}
                whileInView={{ x: 0, opacity: 0.9, rotate: -12 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black p-2 sm:p-2.5 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl w-48 sm:w-60 hidden sm:block"
              >
                <div className="bg-white rounded-[1.7rem] sm:rounded-[2.2rem] overflow-hidden aspect-[9/19]">
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="w-full h-16 sm:h-20 bg-gradient-to-br from-[#FF6A00]/20 to-[#FF8A00]/20 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gray-100 rounded-lg"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Phone (Background) */}
              <motion.div
                initial={{ x: 50, opacity: 0, rotate: 15 }}
                whileInView={{ x: 0, opacity: 0.9, rotate: 12 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black p-2 sm:p-2.5 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl w-48 sm:w-60 hidden sm:block"
              >
                <div className="bg-white rounded-[1.7rem] sm:rounded-[2.2rem] overflow-hidden aspect-[9/19]">
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-[#FF6A00]/30 to-[#FF8A00]/30 rounded-full"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-2 bg-gray-100 rounded w-full"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating circle animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border-2 border-white/20 z-0"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
