"use client";

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
import { useLanguage } from "@/lib/hooks/useLanguage";

export function BusinessListing() {
  const language = useLanguage();
  const text =
      language === "pt"
        ? {
            submitToast:
              "Registo da empresa enviado! Entraremos em contacto dentro de 24 horas.",
            headingPrimary: "Registe a sua empresa",
            headingSecondary: "Cresça com a ProBeauty",
            lead: "Junte-se à nossa rede premium de profissionais de beleza e alcance milhares de potenciais clientes.",
            benefits: [
              {
                icon: TrendingUp,
                title: "Aumente a sua receita",
                description: "Obtenha, em média, mais 40% de reservas",
              },
              {
                icon: Users,
                title: "Descoberta baseada na localização",
                description: "Alcance clientes na sua região",
              },
              {
                icon: Award,
                title: "Perfil profissional",
                description: "Apresente os seus serviços de forma atrativa",
              },
            ],
            cta: "Liste a sua empresa",
            formTitle: "Registe o seu salão",
            formSubtitle: "Preencha o formulário abaixo para começar",
            labels: {
              businessName: "Nome da empresa",
              ownerName: "Nome do proprietário",
              businessAddress: "Endereço da empresa",
              phoneNumber: "Número de telefone",
              emailAddress: "Endereço de Email",
              services: "Serviços oferecidos",
            },
            placeholders: {
              businessName: "Salão Beauty Pro",
              ownerName: "João Silva",
              businessAddress: "Rua da Beleza 123, Cidade, Distrito...",
              phoneNumber: "+351 912 345 678",
              emailAddress: "contact@salon.com",
              services:
                "Corte, styling, coloração, facial, massagem, manicure...",
            },
            submit: "Submeter candidatura",
            terms:
              "Ao submeter, concorda com os nossos Termos de Serviço e Política de Privacidade",
          }
      : {
          submitToast:
            "Business registration submitted! We'll contact you within 24 hours.",
          headingPrimary: "List Your Business",
          headingSecondary: "Grow with ProBeauty",
          lead: "Join our premium network of beauty professionals and reach thousands of potential clients.",
          benefits: [
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
          ],
          cta: "List your Business",
          formTitle: "Register Your Salon",
          formSubtitle: "Fill out the form below to get started",
          labels: {
            businessName: "Business Name",
            ownerName: "Owner Name",
            businessAddress: "Business Address",
            phoneNumber: "Phone Number",
            emailAddress: "Email Address",
            services: "Services Offered",
          },
          placeholders: {
            businessName: "Salon Beauty Pro",
            ownerName: "John Doe",
            businessAddress: "123 Beauty Street, City, State...",
            phoneNumber: "1 (555) 123-4567",
            emailAddress: "contact@salon.com",
            services:
              "Haircut, Styling, Coloring, Facial, Massage, Manicure...",
          },
          submit: "Submit Application",
          terms:
            "By submitting, you agree to our Terms of Service and Privacy Policy",
        };
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    location: "",
    contact: "",
    email: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Business listing form submitted:", formData);
    toast.success(text.submitToast);

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

  const benefits = text.benefits;

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
                {text.headingPrimary}
              </h2>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#FF6A00]">
                {text.headingSecondary}
              </h2>

              <p className="text-sm sm:text-base text-[#1E1E1E] mt-4 sm:mt-6 leading-relaxed max-w-xl">
                {text.lead}
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
                className="bg-[#FF6A00] hover:bg-[#FF6A00]/90 text-white px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                {text.cta}
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
                  {text.formTitle}
                </CardTitle>
                <CardDescription className="text-xs sm:text-md text-[#616161] text-center">
                  {text.formSubtitle}
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
                        {text.labels.businessName}
                      </label>
                      <Input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder={text.placeholders.businessName}
                        className="h-11 lg:h-12 rounded-lg border-[#B6B6B6] bg-transparent text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        {text.labels.ownerName}
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={text.placeholders.ownerName}
                        className="h-11 lg:h-12 rounded-lg bg-transparent border-[#B6B6B6] text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                        required
                      />
                    </div>
                  </div>

                  {/* Business Address */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      {text.labels.businessAddress}
                    </label>
                    <Input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder={text.placeholders.businessAddress}
                      className="h-11 lg:h-12 rounded-lg bg-transparent border-[#B6B6B6] text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                      required
                    />
                  </div>

                  {/* Phone and Email - Desktop only two columns */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        {text.labels.phoneNumber}
                      </label>
                      <Input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        placeholder={text.placeholders.phoneNumber}
                        className="h-11 lg:h-12 rounded-lg bg-transparent border-[#B6B6B6] text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                        {text.labels.emailAddress}
                      </label>
                      <Input
                        type="email"
                        name="email"
                        placeholder={text.placeholders.emailAddress}
                        className="h-11 lg:h-12 rounded-lg bg-transparent border-[#B6B6B6] text-[#1E1E1E] placeholder:text-gray-400 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
                      />
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2">
                      {text.labels.services}
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={text.placeholders.services}
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
                    <span>{text.submit}</span>
                  </Button>

                  {/* Terms Text */}
                  <p className="text-xs text-[#616161] text-center leading-relaxed pt-1">
                    {text.terms}
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
