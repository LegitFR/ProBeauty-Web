import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="policy-page">
      <Header />

      <main className="page-shell">
        <div className="policy-container">
          <p className="eyebrow-label">Privacy Policy</p>
          <h1 className="policy-title">Pro Beauty Privacy Policy</h1>
          <p className="policy-lead">
            This Privacy Policy explains how Pro Beauty collects, uses, shares,
            and protects personal data when you use our website and services.
          </p>

          <section className="policy-section">
            <h2 className="policy-section-title">Introduction</h2>
            <p className="policy-text">
              Pro Beauty is committed to protecting the privacy of customers,
              partners, and visitors. This policy applies to our website and any
              Pro Beauty services, including booking and ordering.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Contacting us</h2>
            <p className="policy-text">
              If you have any questions, comments, or requests regarding this
              policy, please contact us at
              <a className="policy-highlight" href="mailto:privacy@probeautyapp.net"> privacy@probeautyapp.net</a>.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">
              What information do we collect and how do we use it?
            </h2>
            <p className="policy-text">
              We collect information you provide directly, such as your name,
              email address, phone number, and booking or order details. We also
              collect technical data and usage information when you browse our
              site, including device identifiers, IP address, and interaction
              data. We use this information to deliver our services, improve the
              platform, and keep your account secure.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Legal bases for processing</h2>
            <p className="policy-text">
              We process personal data when it is necessary to perform a
              contract with you, when we have legitimate interests, when you
              consent, or when we are required to comply with legal obligations.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Who we share data with</h2>
            <p className="policy-text">
              We share relevant information with salons and service providers so
              they can fulfill your bookings, orders, and support requests. We
              also work with trusted service providers for hosting, analytics,
              communications, and payments. We do not sell personal data.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Where we store data</h2>
            <p className="policy-text">
              Data may be processed and stored in regions where we or our
              service providers operate. We put appropriate safeguards in place
              to protect personal data when transferred internationally.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">How we protect data</h2>
            <p className="policy-text">
              We use administrative, technical, and physical safeguards to help
              protect personal data. While we work to secure your data, no
              method of transmission or storage is entirely secure.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Payment processing</h2>
            <p className="policy-text">
              Payments are processed by trusted payment providers. Card details
              are handled by those providers; Pro Beauty only receives limited
              payment metadata necessary to complete your transaction.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">External sites</h2>
            <p className="policy-text">
              Our services may include links to third-party sites. We are not
              responsible for their privacy practices. Please review their
              policies before providing any personal data.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">How long we keep data</h2>
            <p className="policy-text">
              We retain personal data only for as long as necessary to provide
              our services, comply with legal obligations, resolve disputes, and
              enforce agreements. Some data may be retained longer if required
              by law.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Aggregated data</h2>
            <p className="policy-text">
              We may anonymize data and use aggregated information for
              analytics and service improvements. This information does not
              identify you.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Your rights</h2>
            <p className="policy-text">
              Depending on your location, you may have rights to access,
              correct, delete, or restrict the processing of your personal data,
              and to object to certain processing. You may also withdraw consent
              where applicable. Contact us at
              <span className="policy-highlight"> privacy@probeautyapp.net </span>
              {" "}to exercise these rights.
            </p>
          </section>

          <section className="policy-section">
            <h2 className="policy-section-title">Updating this policy</h2>
            <p className="policy-text">
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated effective date.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
