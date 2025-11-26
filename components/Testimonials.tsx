import { Card, CardContent } from "./ui/card";
import { Star, Quote } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Beauty Enthusiast",
      image:
        "https://images.unsplash.com/photo-1696960181436-1b6d9576354e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY3VzdG9tZXIlMjByZXZpZXd8ZW58MXx8fHwxNzU4MDI2NzU1fDA&ixlib=rb-4.0&q=80&w=1080",
      rating: 5,
      review:
        "ProBeauty transformed my beauty routine! The AI recommendations are spot-on, and I discovered products I never knew I needed. The salon booking feature saved me so much time.",
      location: "Mumbai",
    },
    {
      name: "Priya Sharma",
      role: "Working Professional",
      image:
        "https://images.unsplash.com/photo-1706087467412-993607b6a390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYWlyc3R5bGlzdCUyMHdvbWFufGVufDF8fHx8MTc1Nzk1MjM4Nnww&ixlib=rb-4.0&q=80&w=1080",
      rating: 5,
      review:
        "As a busy professional, ProBeauty is a lifesaver. I can book appointments during my lunch break and the product delivery is always on time. The quality is exceptional!",
      location: "Delhi",
    },
    {
      name: "Anita Reddy",
      role: "Salon Owner",
      image:
        "https://images.unsplash.com/photo-1594736797933-d0c62c7e155e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJ1c2luZXNzJTIwb3duZXJ8ZW58MXx8fHwxNzU4MDI2NzY2fDA&ixlib=rb-4.0&q=80&w=1080",
      rating: 5,
      review:
        "Joining ProBeauty was the best decision for my salon. My bookings increased by 40% in just 3 months. The platform is easy to use and customers love the convenience.",
      location: "Bangalore",
    },
    {
      name: "Kavya Patel",
      role: "College Student",
      image:
        "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3R1ZGVudHxlbnwxfHx8fDE3NTgwMjY3NzJ8MA&ixlib=rb-4.0&q=80&w=1080",
      rating: 5,
      review:
        "Love the app! The student discounts and beauty tips helped me maintain my skincare routine on a budget. The AI suggestions actually understand my skin type perfectly.",
      location: "Pune",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#ECE3DC]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-[#1E1E1E] mb-3 sm:mb-4">
            Hear it straight from{" "}
            <span className="text-[#FF6A00]">our customers</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#616161] max-w-2xl mx-auto leading-relaxed px-4">
            Join thousands of satisfied customers who have transformed their
            beauty routine with ProBeauty.
          </p>
        </motion.div>

        {/* Testimonials Grid - 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-20 sm:mb-16 lg:mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="h-full group hover:shadow-2xl transition-all duration-300 border-0 bg-[#ECE3DC] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                  {/* Rating */}
                  <div className="flex justify-end items-center gap-0.5 mb-3 sm:mb-4 w-full">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-[#FF6A00] text-[#FF6A00]"
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-[#1E1E1E] mb-4 sm:mb-5 leading-relaxed text-xs sm:text-sm flex-grow">
                    "{testimonial.review}"
                  </p>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="relative flex-shrink-0">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-[#1E1E1E] text-xs sm:text-sm truncate">
                        {testimonial.name}
                      </h4>
                    </div>
                  </div>
                </CardContent>
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
          className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12"
        >
          <div className="flex flex-wrap justify-between gap-y-4 items-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] w-3/4 p-10 rounded-lg flex-col sm:flex-row">
            {/* Rating */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      i < 4
                        ? "fill-[#FF6A00] text-[#FF6A00]"
                        : "fill-[#FF6A00]/50 text-[#FF6A00]/50"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xl sm:text-2xl font-medium text-[#1E1E1E]">
                4.5/5
              </span>
            </div>

            {/* Customers */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#FF6A00] mb-1">
                50,000+
              </div>
              <div className="text-xs sm:text-sm text-[#616161]">Customers</div>
            </div>

            {/* Reviews */}
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#FF6A00] mb-1">
                25,000+
              </div>
              <div className="text-xs sm:text-sm text-[#616161]">Reviews</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
