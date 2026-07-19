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
import { useLanguage } from "@/lib/hooks/useLanguage";
import probeautyMobile from "/probeauty-mobile.png";

export function AppDownload() {
  const language = useLanguage();

  const content = language === "pt" ? {
    features: [
      {
        icon: Calendar,
        title: "Reserva Instantânea",
        description: "Reserve os seus compromissos em apenas 3 toques",
      },
      {
        icon: Brain,
        title: "Recomendações por IA",
        description: "Sugestões de produtos personalizados",
      },
      {
        icon: Users,
        title: "Reviews da comunidade",
        description: "Reviews reais de entusiastas de beleza",
      },
    ],
    stats: [
      { value: "4.7★", label: `Avaliação na App Store` },
      { value: "100K+", label: "Downloads" },
      { value: "3K+", label: "Reviews" },
    ],
    title1: "Descarregue a App Móvel",
    title2: "ProbeautyApp",
    subtitle: "Tenha a sua jornada de beleza consigo! Compre, reserve e descubra novos looks onde quer que esteja",
    downloadIos: "Download para iOS",
    downloadAndroid: "Download para Android",
  } : {
    features: [
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
    ],
    stats: [
      { value: "4.7★", label: `App Store Rating` },
      { value: "100K+", label: "Downloads" },
      { value: "3K+", label: "Reviews" },
    ],
    title1: "Get the ProBeauty",
    title2: "Mobile App",
    subtitle: "Take your beauty journey with you! Shop, book, and discover new looks wherever you are.",
    downloadIos: "Download for iOS",
    downloadAndroid: "Download for Android",
  };

  return (
    <section
      id="app"
      className="py-12 sm:py-20 lg:py-24 bg-linear-to-r from-[#2E1B05] via-[#563003] to-[#F7931D] relative overflow-hidden"
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
                {content.title1}
              </h2>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[#F44A01]">{content.title2}</span>
              </h2>

              <p className="text-base sm:text-lg text-[#F1E5D5] mb-6 sm:mb-10 leading-relaxed max-w-lg">
                {content.subtitle}
              </p>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6 sm:space-y-8 mb-6 sm:mb-10"
            >
              {content.features.map((feature, index) => (
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
                className="bg-[#FFFFFF1A] text-white hover:bg-black px-5 py-3 sm:px-6 sm:py-4 rounded-full group transition-all duration-300 transform hover:scale-105 shadow-lg h-auto"
              >
                <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2.5 sm:mr-3 text-white flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs text-gray-300">{content.downloadIos}</div>
                </div>
              </Button>

              <Button
                size="lg"
                onClick={() =>
                  toast.info("Redirecting to Google Play Store...")
                }
                className="bg-[#FFFFFF1A] text-white hover:bg-black px-5 py-3 sm:px-6 sm:py-4 rounded-full group transition-all duration-300 transform hover:scale-105 shadow-lg h-auto"
              >
                <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2.5 sm:mr-3 text-white flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs text-gray-300">
                    {content.downloadAndroid}
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
              className="flex flex-wrap justify-center sm:justify-start items-center gap-10 sm:gap-16"
            >
              {content.stats.map((stat, index) => (
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
                  <div className="text-xs sm:text-sm text-[#ECE3DC]">
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
