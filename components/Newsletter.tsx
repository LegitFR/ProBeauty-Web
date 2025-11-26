import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mail, Gift, Star, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Newsletter subscription:", email);
      setIsSubscribed(true);
      setEmail("");
      // Reset after 3 seconds for demo
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: "10% Off First Order",
      description: "Exclusive welcome discount",
    },
    {
      icon: Star,
      title: "Early Access",
      description: "Be first to try new products",
    },
    {
      icon: Mail,
      title: "Beauty Tips",
      description: "Weekly expert advice",
    },
  ];

  const letterBadges = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <section className="py-20 bg-[#ECE3DC] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Email Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-[#FF6A00] to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <Mail className="h-8 w-8 text-white" />
          </motion.div>

          {/* Header */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6"
          >
            Stay in the Beauty Loop
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-md text-gray-600 max-w-2xl mx-auto leading-relaxed mb-20"
          >
            Subscribe to our newsletter and get exclusive beauty tips, product
            launches, and special offers delivered to your inbox.
          </motion.p>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col justify-between items-center gap-8 mb-20 md:flex-row"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="text-center group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-[#FFEEE580] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300"
                >
                  <benefit.icon className="h-8 w-8 text-[#F44A01]" />
                </motion.div>
                <h3 className="font-medium text-[#020000] mb-2 group-hover:text-[#FF6A00] transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-[#616161] text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Newsletter Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="max-w-md mx-auto mb-8"
          >
            {!isSubscribed ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="relative flex-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="h-12 pl-4 pr-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all duration-300"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 px-8 bg-[#FF6A00] hover:bg-orange-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Subscribe
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg"
              >
                <CheckCircle className="h-16 w-16 text-[#FF6A00] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-black mb-2">
                  Welcome to ProBeauty!
                </h3>
                <p className="text-gray-600">
                  Check your email for your exclusive discount code. Get ready
                  to discover amazing beauty products!
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Privacy Text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-sm text-gray-500 mb-8"
          >
            By subscribing, you agree to our Privacy Policy and Terms of
            Service. Unsubscribe anytime.
          </motion.p>

          {/* Subscriber Count */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-4">
              Join 25,000+ beauty enthusiasts already subscribed
            </p>

            Letter Badges
            <div className="flex justify-center items-center space-x-2">
              {letterBadges.map((letter, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {letter}
                </motion.div>
              ))}
            </div>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
}
