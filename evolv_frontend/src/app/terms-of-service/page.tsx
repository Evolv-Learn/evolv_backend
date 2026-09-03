import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <section className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Terms of Service</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            The basic terms for using EvolvLearn courses, accounts, payments, and learning materials.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-14">
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border-t-4 border-primary-gold p-6 md:p-10">
          <div className="kente-strip mb-8"></div>
          <p className="text-sm text-gray-500 mb-8">Last updated: September 2026</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Using EvolvLearn</h2>
              <p>
                By creating an account, enrolling in a course, or using EvolvLearn, you agree to use the platform responsibly and provide accurate information during registration, application, payment, and communication with our team.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Accounts</h2>
              <p>
                You are responsible for keeping your login details secure and for activities carried out through your account. Please contact us promptly if you believe your account has been accessed without permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Course Access</h2>
              <p>
                Course access may depend on successful enrolment, application review, payment confirmation, cohort availability, and any requirements listed for the specific course. We may update schedules, materials, or delivery details when necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Payments And Refunds</h2>
              <p>
                Payments must be completed through approved payment channels. Refund eligibility may depend on the course, timing of the request, and whether access to live sessions or materials has already started. Contact us before payment if you need clarification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Learning Materials</h2>
              <p>
                Course materials are provided for personal learning. You may not resell, redistribute, publish, or share restricted materials outside your cohort without written permission from EvolvLearn.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Acceptable Use</h2>
              <p>
                Do not misuse the platform, attempt unauthorised access, disrupt services, upload harmful content, impersonate another person, or use EvolvLearn in a way that harms other learners, instructors, or the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">Contact</h2>
              <p>
                Questions about these terms can be sent through the <Link href="/contact" className="text-primary-gold font-semibold hover:underline">contact page</Link> or by email at <a href="mailto:evolvngo@gmail.com" className="text-primary-gold font-semibold hover:underline">evolvngo@gmail.com</a>.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}