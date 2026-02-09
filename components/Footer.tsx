import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Linkedin,
} from "lucide-react";
import footerLogo from "../public/probeauty-footer.svg";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "#" },
      { name: "Our Story", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
    services: [
      { name: "Book Salon", href: "#book" },
      { name: "Shop Products", href: "#shop" },
      { name: "AI Recommendations", href: "#" },
      { name: "Business Listing", href: "#list-business" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "Shipping Info", href: "#" },
      { name: "Returns", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "GDPR", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-[#1E1E1E] text-white pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-10 lg:gap-12">
            {/* Brand Section */}
            <div className="col-span-2 md:col-span-2 lg:col-span-2">
              <div className="mb-5">
                <h3 className="font-display text-2xl sm:text-3xl font-bold mb-4">
                  <img src={footerLogo.src} alt="ProBeauty Logo" />
                </h3>
                <p className="text-[#ECE3DC] text-sm leading-relaxed max-w-sm">
                  Your ultimate destination for premium beauty products and
                  professional salon services. Powered by AI to give you
                  personalized recommendations that work.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-6 mb-5">
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-[#F44A01] flex-shrink-0 mt-0.5" />
                  <span className="text-[#ECE3DC] text-sm">
                    hello@probeauty.com
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-[#F44A01] flex-shrink-0 mt-0.5" />
                  <span className="text-[#ECE3DC] text-sm">
                    (555) - 123-4567
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#F44A01] flex-shrink-0 mt-0.5" />
                  <span className="text-[#ECE3DC] text-sm">
                    123 Beauty Street, NYC 10001
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-2.5">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-8 h-8 bg-[#2E2E2E] rounded-lg flex items-center justify-center text-[#BCBFC3] hover:bg-[#FF6A00] hover:text-white transition-all duration-300"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-[#F44A01] text-sm mb-4 lg:mb-5 pb-3">
                Company
              </h4>
              <ul className="space-y-8">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[#ECE3DC] hover:text-white transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-[#F44A01] text-sm mb-4 lg:mb-5 pb-3">
                Services
              </h4>
              <ul className="space-y-8">
                {footerLinks.services.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[#ECE3DC] hover:text-white transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-[#F44A01] text-sm mb-4 lg:mb-5 pb-3">
                Support
              </h4>
              <ul className="space-y-8">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[#ECE3DC] hover:text-white transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-[#F44A01] text-sm mb-4 lg:mb-5 pb-3">
                Legal
              </h4>
              <ul className="space-y-8">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[#ECE3DC] hover:text-white transition-colors duration-200 text-sm block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-[#3D3D3D] mt-10 py-10 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            {/* Copyright */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 order-1 sm:order-2 text-[#ECE3DC] text-xs sm:text-sm">
              © {currentYear} ProBeauty. All rights reserved. Made with care
              <div className="flex items-center gap-1.5 text-xs text-[#ECE3DC]">
                <span className="text-red-500">❤️</span>
                <span>for beauty enthusiasts.</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 order-1 sm:order-2">
              <div className="text-xs text-[#ECE3DC]">
                Trusted by{" "}
                <span className="text-white font-semibold">50,000+</span>{" "}
                customers
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#ECE3DC]">
                <span className="text-green-500">●</span>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
