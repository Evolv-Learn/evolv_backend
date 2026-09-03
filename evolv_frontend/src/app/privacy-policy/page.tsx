export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <section className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            How EvolvLearn collects, uses, and protects information shared through our learning platform.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-14">
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border-t-4 border-primary-gold p-6 md:p-10">
          <div className="kente-strip mb-8"></div>
          <p className="text-sm text-gray-500 mb-8">Last updated: September 2026</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Information We Collect</h2>
              <p>
                We collect information you provide when you create an account, apply for a course, make a payment, contact us, or participate in learning activities. This may include your name, email address, profile details, course choices, application information, payment references, and messages sent to our team.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">How We Use Your Information</h2>
              <p>
                We use your information to provide access to courses, manage enrolments, process payments, send important account and course updates, respond to support requests, improve our services, and protect the security of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Payments</h2>
              <p>
                Payments are processed by Paystack or other approved payment providers. EvolvLearn does not store your full card details. Payment providers may process payment information under their own privacy and security policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Sharing Information</h2>
              <p>
                We do not sell your personal information. We may share limited information with trusted service providers who help us operate the platform, deliver email, process payments, host services, or provide support, only where needed for those services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Data Security</h2>
              <p>
                We use reasonable technical and organisational measures to protect your information. No online service can guarantee absolute security, but we work to keep access limited, systems monitored, and sensitive configuration protected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Your Choices</h2>
              <p>
                You may contact us to request correction, deletion, or review of personal information associated with your account, subject to legal, payment, or operational records we may need to retain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Contact</h2>
              <p>
                For privacy questions, contact us at <a href="mailto:evolvngo@gmail.com" className="text-primary-gold font-semibold hover:underline">evolvngo@gmail.com</a>.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}