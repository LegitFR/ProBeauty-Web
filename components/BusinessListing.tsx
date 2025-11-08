import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Store, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from "sonner";

export function BusinessListing() {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    location: '',
    contact: '',
    description: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Business listing form submitted:', formData);
    toast.success('Business registration submitted! We\'ll contact you within 24 hours.');
    
    // Reset form
    setFormData({
      name: '',
      businessName: '',
      location: '',
      contact: '',
      description: ''
    });
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Get 30% more bookings through our platform"
    },
    {
      icon: Users,
      title: "Reach New Customers",
      description: "Access thousands of beauty-conscious customers"
    },
    {
      icon: Award,
      title: "Build Your Brand",
      description: "Showcase your services with professional listings"
    }
  ];

  return (
    <section id="list-business" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <div className="inline-flex items-center px-3 py-1.5 bg-orange-100 rounded-full text-orange-700 mb-4 text-sm">
                <Store className="h-3 w-3 mr-1.5" />
                For Business Owners
              </div>
              
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4">
                List your business
              </h2>
              
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                Join thousands of beauty professionals who trust ProBeauty to grow their business. 
                Get more customers and increase bookings.
              </p>
            </div>

            {/* Benefits - Smaller design */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="p-1.5 bg-orange-600 rounded-md">
                    <benefit.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black mb-0.5 text-sm">{benefit.title}</h3>
                    <p className="text-gray-600 text-xs">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats - Smaller */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200"
            >
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600 mb-1">500+</div>
                <div className="text-xs text-gray-600">Partner Salons</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600 mb-1">50K+</div>
                <div className="text-xs text-gray-600">Monthly Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600 mb-1">4.8★</div>
                <div className="text-xs text-gray-600">Average Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Form Side - Smaller, cleaner */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
                <CardTitle className="font-display text-xl font-bold">
                  Start Your Journey Today
                </CardTitle>
                <CardDescription className="text-orange-100 text-sm">
                  Fill out the form below and we'll get you set up in 24 hours
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Your Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Business Name
                      </label>
                      <Input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Your salon/spa name"
                        className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Location
                    </label>
                    <Input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, State"
                      className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Contact Number
                    </label>
                    <Input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Tell us about your business
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your services and specialties..."
                      rows={3}
                      className="rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-sm rounded-lg group transition-all duration-300 hover:shadow-lg"
                  >
                    Register Your Business
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    By registering, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}