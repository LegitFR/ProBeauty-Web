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
import probeautyMobile from "/probeauty-mobile.png";

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
      className="py-12 sm:py-20 lg:py-24 bg-linear-to-r from-[#4D1C00] via-[#792800] to-[#F44A01] relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
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

              <p className="text-base sm:text-lg text-[#F1E5D5] mb-6 sm:mb-10 leading-relaxed max-w-lg">
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
              className="space-y-3 sm:space-y-5 mb-6 sm:mb-10"
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
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-10"
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
            className="relative mt-8 lg:mt-0"
          >
            <div className="relative max-w-2xl mx-auto flex items-center justify-center">
              {/* ProBeauty Mobile Image */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative z-20"
              >
                <img
                  src="/probeauty-mobile.png"
                  alt="ProBeauty Mobile App"
                  className="w-full h-[350px] sm:h-[650px] lg:h-[750px] object-contain"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
