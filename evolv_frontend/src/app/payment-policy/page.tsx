import Link from 'next/link';

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <section className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Course Payment, Refund and Access Policy
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            Please review the payment, cancellation, refund, and learning access terms before enrolling.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-14">
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border-t-4 border-primary-gold p-6 md:p-10">
          <div className="kente-strip mb-8"></div>
          <p className="text-sm text-gray-500 mb-8">Last updated: November 2026</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                Payment options
              </h2>
              <p>
                The payment options available for a course are shown on that course&apos;s enrollment page.
                A place is confirmed after the required payment has been received.
              </p>
              <p className="mt-3">
                Installment payments are available only for cohorts that explicitly offer them. If a
                cohort offers installments, the installment terms below apply. Otherwise, the full
                course fee must be paid as shown at checkout.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                Paying in full
              </h2>
              <p>
                If you pay the full course fee before the course starts and later withdraw, the refund
                is based on when EvolvLearn receives your written withdrawal request:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>During Month 1 of the course: 90% of the course fee paid.</li>
                <li>During Month 2 of the course: 60% of the course fee paid.</li>
                <li>During Month 3 of the course: 30% of the course fee paid.</li>
              </ul>
              <p className="mt-3">
                Month 1 runs from the cohort start date through the day before its first monthly
                anniversary. Month 2 runs from that anniversary through the day before the second
                monthly anniversary. Month 3 runs from the second anniversary through the course end
                date. The refund tier is based on the date we receive your written withdrawal request.
                This refund schedule applies only to students who paid the full course fee upfront;
                it does not apply to installment payments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                Paying by installments
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Pay 50% of the course fee before the course starts to confirm your place. This applies to all currencies (NGN, USD, GBP, EUR).</li>
                <li>
                  After five weeks, EvolvLearn will remind you that the remaining 50% is due by the
                  end of Week 6. The deadline is <strong>11:59 PM WAT (West Africa Time, UTC+1)</strong> on the date stated in your cohort information.
                </li>
                <li>
                  If the balance is not paid by the deadline, you will be removed from the cohort
                  before Week 7. Your access to course sessions and materials will end.
                </li>
                <li>
                  You cannot rejoin that same cohort after removal, even if you offer to pay later.
                </li>
                <li>
                  The first 50% is not refundable if you withdraw or are removed from the cohort.
                </li>
                <li>
                  If you withdraw or are removed, the unpaid second 50% is waived. You will not be
                  charged for it.
                </li>
                <li>
                  Discount codes and promotional offers are <strong>not applicable</strong> to installment payments. They apply only to full upfront payments.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                Technical payment failures
              </h2>
              <p>
                If your second installment payment fails due to a documented technical issue (such as
                a card decline, bank error, or processor outage), you have <strong>48 hours</strong> from
                the Week 6 deadline to contact EvolvLearn with evidence of the failed transaction.
              </p>
              <p className="mt-3">
                You must contact us proactively within this window. EvolvLearn will review your case
                and, if the failure is verified as technical, work with you to complete the payment
                before access is revoked. This exception does not apply to payments not attempted by
                the deadline.
              </p>
              <p className="mt-3">
                To report a technical failure, email <a href="mailto:evolvngo@gmail.com" className="text-primary-gold font-semibold hover:underline">evolvngo@gmail.com</a> with
                your transaction reference and a screenshot or proof of the failed payment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                Course materials and module access
              </h2>
              <p>
                Course materials may be released progressively. For cohorts using module-by-module
                access, the next module becomes available after you complete the required lessons and
                activities in the current module. The cohort information or learning platform will
                explain the completion requirements. Access to course sessions and materials ends if
                you are removed from the cohort for non-payment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                Questions
              </h2>
              <p>
                Submit withdrawal requests or questions through the <Link href="/contact" className="text-primary-gold font-semibold hover:underline">contact page</Link> or
                email <a href="mailto:evolvngo@gmail.com" className="text-primary-gold font-semibold hover:underline">evolvngo@gmail.com</a>.
                Please contact us before paying if you have questions about a course&apos;s payment schedule or access terms.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
