import { Card } from './ui/card';
import { Brain, MapPin, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

export function FeaturesOverview() {
  const features = [
    {
      icon: Brain,
      title: "AI Product Recommendations",
      subtitle: "Smart beauty suggestions just for you",
      description: "Our advanced AI analyzes your skin type, hair type, and preferences to recommend products that work best for you.",
      iconColor: "text-[#FF6A00]"
    },
    {
      icon: MapPin,
      title: "Salon Booking System", 
      subtitle: "Location-based search & date picker",
      description: "Find and book appointments at premium salons near you with real-time availability and instant confirmation.",
      iconColor: "text-blue-500"
    },
    {
      icon: ShoppingCart,
      title: "E-commerce Store",
      subtitle: "Best-selling beauty products", 
      description: "Shop premium shampoos, conditioners, skincare, and grooming tools from top brands with same-day delivery.",
      iconColor: "text-green-500"
    }
  ];

  const stats = [
    { label: "Happy Customers", value: "50K+" },
    { label: "Premium Products", value: "1000+" },
    { label: "Partner Salons", value: "500+" },
    { label: "Average Rating", value: "4.8★" }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-black mb-4">
            Everything You Need for{' '}
            <span className="text-[#FF6A00]">Beautiful You</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of beauty with our comprehensive platform combining AI technology, premium products, and professional services.
          </p>
        </motion.div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl p-8 h-full text-center">
                <div className="flex flex-col items-center">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors duration-300"
                  >
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </motion.div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:text-[#FF6A00] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Subtitle */}
                  <p className="text-[#FF6A00] font-medium mb-4 text-sm">
                    {feature.subtitle}
                  </p>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-[#FF6A00] mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}