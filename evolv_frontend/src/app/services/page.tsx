import { Button } from '@/components/ui/Button';
import CTALink from '@/components/ui/CTALink';

const services = [
  {
    number: '01',
    action: 'ASSESS',
    title: 'Data Audit',
    description:
      'We review your existing data systems, find bottlenecks and gaps, then deliver a clear written report with practical recommendations.',
    outcome: 'A prioritized plan for improving your data workflow.',
    accent: 'border-primary-gold',
  },
  {
    number: '02',
    action: 'AUTOMATE',
    title: 'Pipeline Build',
    description:
      'We automate handoffs between collection, storage, your analysis tools, and reporting. Your team stays in control of the analysis.',
    outcome: 'A reliable data flow your team can understand and maintain.',
    accent: 'border-secondary-blue',
  },
  {
    number: '03',
    action: 'SUPPORT',
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
      <section className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-16 md:py-20 pattern-adire relative overflow-hidden">
        <div className="kente-strip absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-12 lg:gap-12 items-center">
            <div className="text-center">
              <p className="text-primary-gold font-bold uppercase tracking-widest text-sm mb-5">
                EvolvLearn Consultancy
              </p>
              <h1 className="text-5xl sm:text-6xl xl:text-6xl xl:whitespace-nowrap font-heading font-bold mb-6 leading-[1.05]">
                Research Data Engineering
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed">
                We connect research data systems and automate the flow from collection to reporting.
              </p>
              <div className="flex justify-center">
                <CTALink href="/contact" ctaName="contact_us">
                  <Button variant="primary" size="lg" className="px-8">
                    Talk About Your Data Workflow
                  </Button>
                </CTALink>
              </div>
            </div>

            <div className="border-l-2 border-primary-gold pl-6 md:pl-8 py-2 max-w-lg lg:ml-auto w-full">
              <p className="text-primary-gold text-xs font-bold uppercase tracking-widest mb-2">
                One connected workflow
              </p>
              <p className="text-white text-lg font-semibold mb-5">
                Less manual movement. Clear handoffs.
              </p>
              <ol className="divide-y divide-white/15">
                {['Collection', 'Storage', 'Analysis tools', 'Reporting'].map((step, index) => (
                  <li key={step} className="grid grid-cols-[2rem_1fr] items-center gap-3 py-3">
                    <span className="text-xs font-bold text-primary-gold">0{index + 1}</span>
                    <span className="text-gray-100 font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-20 bg-warm-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
            <div>
              <p className="text-igbo-red text-xs font-bold uppercase tracking-widest mb-3">
                What we do
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-blue">
                Better systems for research data
              </h2>
            </div>
            <p className="text-gray-600 max-w-sm leading-relaxed">
              Audit what exists, automate what is repetitive, and keep it working.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {services.map((service) => (
              <article
                key={service.number}
                className={`flex min-h-full flex-col bg-white border-t-4 ${service.accent} p-6 md:p-7 shadow-sm`}
              >
                <div className="flex items-start justify-between gap-4 mb-8">
                  <span className="font-heading text-4xl leading-none font-bold text-gray-200">
                    {service.number}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary-blue pt-1">
                    {service.action}
                  </span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {service.description}
                </p>
                <p className="mt-auto border-t border-gray-100 pt-4 text-sm font-semibold text-gray-700">
                  {service.outcome}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-igbo-red text-xs font-bold uppercase tracking-widest mb-3">
                Proof in practice
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-blue mb-4">
                What we build
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We build and use the kinds of connected systems we bring to research teams.
              </p>
            </div>

            <article className="bg-warm-white border-l-4 border-primary-gold p-6 md:p-8">
              <p className="text-xs font-bold text-secondary-blue uppercase tracking-widest mb-5">
                Field data pipeline
              </p>
              <div className="grid sm:grid-cols-[auto_1fr] gap-5 sm:gap-8 items-start">
                <div className="sm:border-r sm:border-gray-200 sm:pr-8">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                    Data preparation
                  </p>
                  <p className="text-3xl font-heading font-bold text-secondary-blue whitespace-nowrap">
                    3 days to &lt;2 hours
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-blue mb-2">
                    Five-location plant breeding trial
                  </h3>
                </div>
              </div>
              <p className="mt-6 border-t border-gray-200 pt-5 text-gray-600 text-sm leading-relaxed">
                The workflow replaced monthly spreadsheet merges with automated cleaning, PostgreSQL storage, and an R-ready export, reducing data preparation from three days to under two hours. Future builds will prioritize open-source, low-cost tools for collection.
              </p>
            </article>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6 grid md:grid-cols-[0.8fr_1.2fr] gap-4 md:gap-16">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary-blue">
              Built by our team
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The EvolvLearn platform brings together Django REST Framework, Next.js, PostgreSQL, automated email, payments, and production deployment on Render and Vercel.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-secondary-blue text-white pattern-adire">
        <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between gap-7">
          <div>
            <p className="text-primary-gold text-xs font-bold uppercase tracking-widest mb-3">
              Start with your workflow
            </p>
            <h2 className="text-3xl font-heading font-bold mb-2">
              Ready to make your data flow better?
            </h2>
            <p className="text-gray-200">
              Bring us the bottleneck. We will help map the next step.
            </p>
          </div>
          <CTALink href="/contact" ctaName="contact_us">
            <Button variant="primary" size="lg" className="px-8 whitespace-nowrap">
              Start a Conversation
            </Button>
          </CTALink>
        </div>
      </section>
    </div>
  );
}
