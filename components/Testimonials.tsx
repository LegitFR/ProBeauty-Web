import { Card, CardContent } from './ui/card';
import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Beauty Enthusiast",
      image: "https://images.unsplash.com/photo-1696960181436-1b6d9576354e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwY3VzdG9tZXIlMjByZXZpZXd8ZW58MXx8fHwxNzU4MDI2NzU1fDA&ixlib=rb-4.0&q=80&w=1080",
      rating: 5,
      review: "ProBeauty transformed my beauty routine! The AI recommendations are spot-on, and I discovered products I never knew I needed. The salon booking feature saved me so much time.",
      location: "Mumbai"
    },
    {
      name: "Priya Sharma", 
      role: "Working Professional",
      image: "https://images.unsplash.com/photo-1706087467412-993607b6a390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYWlyc3R5bGlzdCUyMHdvbWFufGVufDF8fHx8MTc1Nzk1MjM4Nnww&ixlib=rb-4.0&q=80&w=1080",
      rating: 5,
      review: "As a busy professional, ProBeauty is a lifesaver. I can book appointments during my lunch break and the product delivery is always on time. The quality is exceptional!",
      location: "Delhi"
    },
    {
      name: "Anita Reddy",
      role: "Salon Owner",
      image: "https://images.unsplash.com/photo-1594736797933-d0c62c7e155e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJ1c2luZXNzJTIwb3duZXJ8ZW58MXx8fHwxNzU4MDI2NzY2fDA&ixlib=rb-4.0&q=80&w=1080",
      rating: 5,
      review: "Joining ProBeauty was the best decision for my salon. My bookings increased by 40% in just 3 months. The platform is easy to use and customers love the convenience.",
      location: "Bangalore"
    },
    {
      name: "Kavya Patel",
      role: "College Student", 
      image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3R1ZGVudHxlbnwxfHx8fDE3NTgwMjY3NzJ8MA&ixlib=rb-4.0&q=80&w=1080",
      rating: 5,
      review: "Love the app! The student discounts and beauty tips helped me maintain my skincare routine on a budget. The AI suggestions actually understand my skin type perfectly.",
      location: "Pune"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6">
            What Our <span className="text-[#FF7A00]">Beautiful</span> Community Says
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have transformed their beauty journey with ProBeauty
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="h-8 w-8 text-[#FF7A00]/30" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#FF7A00] text-[#FF7A00]" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                    "{testimonial.review}"
                  </p>

                  {/* Customer Info */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                    <div className="relative">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FF7A00] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                      <p className="text-xs text-[#FF7A00] font-medium">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-[#FF7A00] mb-2">10,000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-[#FF7A00] mb-2">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-[#FF7A00] mb-2">500+</div>
              <div className="text-gray-600">Partner Salons</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-[#FF7A00] mb-2">50,000+</div>
              <div className="text-gray-600">Products Sold</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}