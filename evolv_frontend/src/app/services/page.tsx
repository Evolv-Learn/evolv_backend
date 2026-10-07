import { Button } from '@/components/ui/Button';
import CTALink from '@/components/ui/CTALink';

const services = [
  {
    number: '01',
    title: 'Data Audit',
    description:
      'We review your existing data systems, find bottlenecks and gaps, then deliver a clear written report with practical recommendations.',
    outcome: 'A prioritized plan for improving your data workflow.',
    accent: 'border-primary-gold',
  },
  {
    number: '02',
    title: 'Pipeline Build',
    description:
      'We automate handoffs between collection, storage, your analysis tools, and reporting. Your team stays in control of the analysis.',
    outcome: 'A reliable data flow your team can understand and maintain.',
    accent: 'border-secondary-blue',
  },
  {
    number: '03',
    title: 'Retainer',
    description:
      'Ongoing monthly support for data cleaning, recurring reports, dashboard updates, and small improvements to your workflows.',
    outcome: 'Consistent support as your data needs change.',
    accent: 'border-success',
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-20 pattern-adire relative overflow-hidden">
        <div className="kente-strip absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-primary-gold font-bold uppercase tracking-widest text-sm mb-4">
            EvolvLearn Consultancy
          </p>
          <h1 className="text-5xl font-heading font-bold mb-6 leading-tight max-w-4xl mx-auto">
            Research Data Engineering
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            We connect research data systems and automate the flow from collection to reporting.
          </p>
          <CTALink href="/contact" ctaName="contact_us">
            <Button variant="primary" size="lg" className="px-8">
              Talk About Your Data Workflow
            </Button>
          </CTALink>
        </div>
      </div>

      <section id="services" className="py-20 bg-warm-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-secondary-blue">
              Three ways to improve your data flow
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <article key={i} className={`bg-white border-t-4 ${s.accent} p-7`}>
                <div className="font-heading text-sm font-bold text-primary-gold mb-6">
                  {s.number}
                </div>
                <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{s.description}</p>
                <p className="border-t border-gray-100 pt-4 text-sm font-semibold text-gray-700">
                  {s.outcome}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-gray-100 py-10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-secondary-blue font-semibold text-lg mb-2">
            Practical systems. Clear handover. Your team stays in control.
          </p>
          <p className="text-gray-600">
            We scope each engagement around your existing tools, data, and workflow.
          </p>
        </div>
      </section>

      {/* Example work */}
      <section className="py-16 bg-warm-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-2 text-center">
            What we build
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            Real systems. Every tool we recommend, we have built ourselves.
          </p>
          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-white p-7 border-l-4 border-primary-gold">
              <p className="text-xs font-bold text-primary-gold uppercase tracking-wide mb-3">
                EvolvLearn Platform — Built by our team
              </p>
              <h3 className="text-lg font-bold text-secondary-blue mb-2">
                Full-stack learning platform with PostgreSQL, REST API, and live deployment
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We designed and built the EvolvLearn platform from scratch — a Django REST Framework backend, Next.js frontend, PostgreSQL database, JWT authentication, multi-currency payment integration, email automation, and production deployment on Render and Vercel. Every system we recommend to clients, we have engineered ourselves.
              </p>
            </div>

            <div className="bg-white p-7 border-l-4 border-secondary-blue">
              <p className="text-xs font-bold text-secondary-blue uppercase tracking-wide mb-3">
                What a typical research engagement looks like
              </p>
              <h3 className="text-lg font-bold text-secondary-blue mb-2">
                Multi-site field trial data — from manual Excel merges to an automated pipeline
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                A plant breeding team running trials across 5 locations was manually merging spreadsheets every month before analysis — 3 days of work before the science could begin. The solution: structured data collection via KoboToolbox, an automated cleaning script, PostgreSQL storage, and a direct R export ready for ANOVA. Data prep now takes under 2 hours.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
            Ready to talk about your data?
          </h2>
          <p className="text-gray-600 mb-6">
            A free 30-minute call — no commitment, no sales pressure.
          </p>
          <CTALink href="/contact" ctaName="contact_us">
            <Button variant="primary" size="lg" className="px-10">
              Book a Free Discovery Call →
            </Button>
          </CTALink>
        </div>
      </section>
    </div>
  );
}
