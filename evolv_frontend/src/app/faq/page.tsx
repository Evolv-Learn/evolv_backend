import Link from 'next/link';

const faqs = [
  {
    question: 'Who are EvolvLearn courses designed for?',
    answer: 'Our courses are designed for students, researchers, lecturers, and early-career professionals who want practical technology and research methods skills they can apply immediately.',
  },
  {
    question: 'How are classes delivered?',
    answer: 'Most cohorts combine live online teaching, guided practice, course materials, and community support. Specific delivery details are shared on each course page before enrolment.',
  },
  {
    question: 'Do I need prior coding experience?',
    answer: 'Not for beginner-friendly courses. Where a course requires prior experience, we state that clearly in the course description.',
  },
  {
    question: 'How do I enrol in a course?',
    answer: 'Create an account, choose a course, complete the application or enrolment steps, and follow the payment instructions where payment is required.',
  },
  {
    question: 'Which payment methods are accepted?',
    answer: 'Payments are processed through Paystack, which may support cards, bank transfer, and other regional payment methods depending on your location and the course currency.',
  },
  {
    question: 'Can I request support before enrolling?',
    answer: 'Yes. Use the contact page to ask about course fit, schedules, payment, or accessibility before you enrol.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <section className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            Clear answers about learning with EvolvLearn, enrolment, payments, and support.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-14">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border-t-4 border-primary-gold p-6 md:p-10">
          <div className="kente-strip mb-8"></div>
          <div className="space-y-6">
            {faqs.map((item) => (
              <section key={item.question} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h2 className="text-xl font-heading font-bold text-secondary-blue mb-2">{item.question}</h2>
                <p className="text-gray-700 leading-relaxed">{item.answer}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 bg-warm-white rounded-lg p-6 text-center">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-2">Still have a question?</h2>
            <p className="text-gray-700 mb-4">Send us a message and we will help you choose the right next step.</p>
            <Link href="/contact" className="inline-flex items-center justify-center bg-primary-gold text-secondary-blue-dark font-semibold px-5 py-3 rounded-lg hover:bg-yellow-400 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}