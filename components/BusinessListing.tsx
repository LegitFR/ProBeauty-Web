import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Store, TrendingUp, Users, Award, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export function BusinessListing() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    location: "",
    contact: "",
    email: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Business listing form submitted:", formData);
    toast.success(
      "Business registration submitted! We'll contact you within 24 hours."
    );

    // Reset form
    setFormData({
      name: "",
      businessName: "",
      location: "",
      contact: "",
      email: "",
      description: "",
    });
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Your Revenue",
      description: "Get 40% more bookings on average",
    },
    {
      icon: Users,
      title: "Location-Based Discovery",
      description: "Reach customers in your area",
    },
    {
      icon: Award,
      title: "Professional Profile",
      description: "Showcase your services beautifully",
    },
  ];

  return (
    <section
      id="list-business"
      className="py-12 sm:py-16 lg:py-20 bg-[#ECE3DC]"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            {/* Heading */}
            <div className="mb-8 sm:mb-10">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1E1E1E] mb-2">
                List Your Business
              </h2>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#FF6A00]">
                Grow with ProBeauty
              </h2>

              <p className="text-sm sm:text-base text-[#1E1E1E] mt-4 sm:mt-6 leading-relaxed max-w-xl">
                Join our premium network of beauty professionals and reach
                thousands of potential clients.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-3 sm:gap-4"
                >
                  <div className="flex-shrink-0 p-2 sm:p-2.5 bg-[#FF6A00] rounded-full">
                    <benefit.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h3 className="font-semibold text-[#1E1E1E] text-sm sm:text-base mb-0.5 sm:mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-[#616161] text-xs sm:text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button - All screens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 sm:mt-8"
            >
              <Button
                onClick={() => {
                  const formSection = document.getElementById("business-form");
                  formSection?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-1/2"
              >
                List your Business
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
            id="business-form"
          >
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-[#ECE3DC]">
              <CardHeader className="bg-transparent px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-2">
                <CardTitle className="font-display text-3xl lg:text-4xl font-semibold text-[#1E1E1E] text-center mb-1">
                  Register Your Salon
                </CardTitle>
                <CardDescription className="text-xs sm:text-md text-[#616161] text-center">
                  Fill out the form below to get started
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10 pt-4">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-5"
                >
                  {/* Two Column Layout for Name Fields - Desktop only */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Business Name
                      </label>
                      <Input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Salon Beauty Pro"
                        className="h-11 lg:h-12 rounded-lg border-[#B6B6B6] bg-transparent text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Owner Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="h-11 lg:h-12 rounded-lg bg-transparent border-[#B6B6B6] text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                        required
                      />
                    </div>
                  </div>

                  {/* Business Address */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Business Address
                    </label>
                    <Input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="123 Beauty Street, City, State..."
                      className="h-11 lg:h-12 rounded-lg bg-transparent border-[#B6B6B6] text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                      required
                    />
                  </div>

                  {/* Phone and Email - Desktop only two columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        placeholder="1 (555) 123-4567"
                        className="h-11 lg:h-12 rounded-lg bg-transparent border-[#B6B6B6] text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="contact@salon.com"
                        className="h-11 lg:h-12 rounded-lg bg-transparent border-[#B6B6B6] text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                      />
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      Services Offered
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Haircut, Styling, Coloring, Facial, Massage, Manicure..."
                      rows={4}
                      className="rounded-lg border-[#B6B6B6] bg-transparent text-[#1E1E1E] placeholder:text-gray-400 text-sm resize-none focus:border-[#FF6A00] focus:ring-[#FF6A00] min-h-[80px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white h-12 lg:h-13 text-base rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Submit Application
                  </Button>

                  {/* Terms Text */}
                  <p className="text-xs text-[#616161] text-center leading-relaxed pt-1">
                    By submitting, you agree to our Terms of Service and Privacy
                    Policy
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
