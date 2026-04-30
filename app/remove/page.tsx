import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AccountDeletionPage() {
  return (
    <div className="min-h-screen bg-[#ECE3DC] text-[#1E1E1E]">
      <Header />

      <main className="page-shell">
        <div className="policy-container">
          <section className="p-6 sm:p-10">
            <div className="space-y-3">
              <p className="eyebrow-label">
                Account Deletion
              </p>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Request Account Deletion
            </h1>
            <p className="text-sm sm:text-base text-gray-700 max-w-3xl">
              We take account deletion requests seriously and process them
              securely. Please follow the instructions below to request the
              deletion of your Pro Beauty account.
            </p>
          </div>

          <div className="mt-8 space-y-6 text-sm sm:text-base text-gray-700">
            <section className="space-y-2">
              <h2 className="text-lg sm:text-xl font-semibold text-[#1E1E1E]">
                Before You Delete
              </h2>
              <p>
                Incase you want to change your profile details you can go to
                edit profile page and do it. Otherwise if you are surely
                wanting to delete the account mail us with the email of your
                account we&apos;ll process the deletion within 5-7 business days.
              </p>
            </section>

            <section className="rounded-2xl border-2 border-[#1E1E1E]/20 bg-[#ECE3DC] p-5">
              <p className="text-sm text-gray-700">
                Email your request to
                <span className="font-semibold text-[#FF6A00]">
                  {" "}support@probeauty.com
                </span>
                . Include the email address associated with your account so we
                can verify ownership and complete the request.
              </p>
            </section>
          </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
