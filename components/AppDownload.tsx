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
    { value: "4.8★", label: "App Store Rating" },
    { value: "100K+", label: "Downloads" },
    { value: "5K+", label: "Reviews" },
  ];

  return (
    <section
      id="app"
      className="py-20 bg-gradient-to-br from-[#FF6A00] via-orange-600 to-red-600 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Get the ProBeauty{" "}
                <span className="text-orange-200">
                  Mobile App
                </span>
              </h2>

              <p className="text-xl text-orange-100 mb-10 leading-relaxed">
                Take your beauty journey with you. Shop, book,
                and discover new looks wherever you are.
              </p>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6 mb-10"
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
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300"
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1 group-hover:text-orange-200 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-orange-100 text-sm">
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
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Button
                size="lg"
                onClick={() =>
                  toast.info("Redirecting to App Store...")
                }
                className="bg-white text-black hover:bg-gray-100 px-6 py-4 rounded-2xl group transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <Download className="h-6 w-6 mr-3 text-[#FF6A00]" />
                <div className="text-left">
                  <div className="text-xs text-gray-600">
                    Download for
                  </div>
                  <div className="text-sm font-semibold">
                    iOS
                  </div>
                </div>
              </Button>

              <Button
                size="lg"
                onClick={() =>
                  toast.info(
                    "Redirecting to Google Play Store...",
                  )
                }
                className="bg-white text-black hover:bg-gray-100 px-6 py-4 rounded-2xl group transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <Download className="h-6 w-6 mr-3 text-[#FF6A00]" />
                <div className="text-left">
                  <div className="text-xs text-gray-600">
                    Download for
                  </div>
                  <div className="text-sm font-semibold">
                    Android
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
              className="grid grid-cols-3 gap-6"
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
                  whileHover={{ scale: 1.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-orange-200">
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
            className="relative"
          >
            <div className="relative max-w-sm mx-auto">
              {/* Main Phone Frame */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ y: -10, rotateY: 5 }}
                className="relative bg-gray-900 p-3 rounded-[2.5rem] shadow-2xl"
                style={{ transform: "perspective(1000px)" }}
              >
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-inner">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-6 py-3 bg-white">
                    <span className="text-black text-sm font-medium">
                      9:41
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-[#FF6A00] to-orange-600">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-white">
                        ProBeauty
                      </h3>
                      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="px-6 py-6 bg-white h-96 relative">
                    {/* Product Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.4,
                            delay: 0.8 + i * 0.1,
                          }}
                          className="bg-gray-50 rounded-xl p-3 aspect-square"
                        >
                          <div className="w-full h-16 bg-gradient-to-br from-[#FF6A00]/20 to-orange-300/20 rounded-lg mb-2"></div>
                          <div className="text-xs font-medium text-black mb-1">
                            Product {i + 1}
                          </div>
                          <div className="text-xs text-[#FF6A00] font-semibold">
                            ₹{299 + i * 100}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                      <div className="flex justify-around">
                        {[
                          "Home",
                          "Shop",
                          "Book",
                          "Profile",
                        ].map((item, i) => (
                          <div
                            key={item}
                            className="text-center"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.3,
                                delay: 1.2 + i * 0.1,
                              }}
                              className={`w-6 h-6 rounded-md mx-auto mb-1 ${
                                i === 0
                                  ? "bg-[#FF6A00]"
                                  : "bg-gray-300"
                              }`}
                            ></motion.div>
                            <div
                              className={`text-xs ${
                                i === 0
                                  ? "text-[#FF6A00] font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              {item}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Second Phone (Background) */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 20, opacity: 0.8 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute top-10 -right-8 w-48 h-80 bg-gray-800 rounded-[2rem] shadow-xl z-[-1] transform rotate-12"
              >
                <div className="bg-gradient-to-b from-white to-gray-100 rounded-[1.5rem] m-2 h-[calc(100%-1rem)]">
                  <div className="p-4">
                    <div className="w-full h-20 bg-gradient-to-r from-[#FF6A00]/30 to-orange-300/30 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-full h-4 bg-gray-200 rounded"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 -left-6 w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}