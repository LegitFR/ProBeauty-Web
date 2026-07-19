import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="policy-page">
      <Header />

      <main className="page-shell">
        <div className="policy-container">
          <p className="eyebrow-label">Terms of Service</p>
          <h1 className="policy-title">ProBeauty Terms of Service</h1>
          <p className="policy-lead">
            These Terms of Service govern your use of the ProBeauty website and services. By accessing or using our platform, you agree to be bound by these terms.
          </p>

          <section className="policy-section">
            <h2 className="policy-section-title">1. Acceptance of Terms</h2>
            <p className="policy-text">
              By creating an account, booking a service, or otherwise using ProBeauty, you accept and agree to comply with these Terms of Service. If you do not agree, you must not use our services.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">2. User Accounts</h2>
            <p className="policy-text">
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">3. Bookings and Payments</h2>
            <p className="policy-text">
              When you book a service through ProBeauty, you agree to pay the specified price. Cancellations and refunds are subject to the individual policies of the salon or service provider. Prices for services may change at any time, but such changes will not affect bookings that have already been confirmed.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">4. Prohibited Conduct</h2>
            <p className="policy-text">
              You agree not to use our platform for any unlawful purpose, to harass or abuse others, to interfere with the operation of the service, or to attempt to gain unauthorized access to our systems. You must not upload or transmit any viruses, malware, or other malicious code.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">5. Intellectual Property</h2>
            <p className="policy-text">
              All content, trademarks, and data on the ProBeauty platform are the property of ProBeauty or its licensors. You may not use, copy, or distribute this content without explicit permission. User-generated content remains your property, but by posting it, you grant ProBeauty a worldwide license to use and display it.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">6. Limitation of Liability</h2>
            <p className="policy-text">
              ProBeauty is a platform connecting users with service providers. We are not liable for the quality of services provided by third parties, nor for any indirect, incidental, or consequential damages arising from your use of the platform. We make no warranties regarding the accuracy or reliability of any information provided by service providers.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">7. Changes to Terms</h2>
            <p className="policy-text">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. Continued use of the service constitutes acceptance of the revised terms. We encourage you to review these terms periodically for any updates.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Contact Us</h2>
            <p className="policy-text">
              If you have any questions about these Terms of Service, please contact us at 
              <a className="policy-highlight" href="mailto:support@probeautyapp.net"> support@probeautyapp.net</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
