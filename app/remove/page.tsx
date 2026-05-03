import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AccountDeletionPage() {
  return (
    <div className="policy-page">
      <Header />

      <main className="page-shell">
        <div className="policy-container">
          <section className="p-6 sm:p-10">
            <div className="space-y-3">
              <p className="eyebrow-label">
                Account Deletion
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold">
              Request Account Deletion for Pro Beauty
              </h1>
            <p className="policy-lead">
              We take account deletion requests seriously and process them
              securely. Please follow the steps below to request deletion of
              your Pro Beauty account.
            </p>
            </div>

          <div className="mt-8 space-y-8">
            <section className="policy-section">
              <h2 className="policy-section-title">How to request deletion</h2>
              <ol className="policy-list">
                <li>
                  Incase you want to change your profile details you can go to
                  edit profile page and do it.
                </li>
                <li>
                  Otherwise if you are surely wanting to delete the account mail
                  us with the email of your account we&apos;ll process the deletion
                  within 5-7 business days.
                </li>
              </ol>
              <p className="policy-text mt-4">
                Email your request to
                <span className="policy-highlight"> support@probeauty.com</span>
                {" "}and include the email address associated with your account
                so we can verify ownership.
              </p>
            </section>

            <section className="policy-section">
              <h2 className="policy-section-title">Data deleted</h2>
              <p className="policy-text">
                When your account is deleted, we remove or anonymize your
                profile data such as your name, phone number, saved addresses,
                preferences, and account settings. We also remove access to your
                account and login credentials.
              </p>
            </section>

            <section className="policy-section">
              <h2 className="policy-section-title">Data retained</h2>
              <p className="policy-text">
                We may retain limited records required for legal, tax, and fraud
                prevention purposes, such as transaction metadata and support
                correspondence. These records are kept only as long as required
                by applicable law or legitimate business needs.
              </p>
            </section>

            <section className="policy-section">
              <h2 className="policy-section-title">Retention period</h2>
              <p className="policy-text">
                If retention is required, records are typically kept for up to
                6 years. After that period, retained data is deleted or
                anonymized.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="policy-section-title">Disclosures for Pro Beauty</h3>
              <ul className="policy-list">
                <li>
                  <strong>Required user data types collected and/or shared: </strong>
                  Identifiers (name, email, phone), booking and order details,
                  saved addresses, payment metadata, and account preferences.
                </li>
                <li>
                  <strong>Data sent off the device by SDKs:</strong> Google
                  Identity Services is used for Google sign-in and transmits the
                  ID token to Google for authentication. No other client SDKs in
                  this app transmit personal data off-device.
                </li>
                <li>
                  <strong>Data transferred from server to third parties: </strong>
                  Payment processing data for MB WAY via If-Then Pay, order and
                  booking details shared with the selected salon, and email
                  delivery for OTP or account communications.
                </li>
                <li>
                  <strong>Data collected or transferred through webviews: </strong>
                  The app does not embed webviews that collect or transfer user
                  data. Links open the user&apos;s browser to the open web.
                </li>
              </ul>
            </section>
          </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
