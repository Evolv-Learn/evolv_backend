import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import CTALink from '@/components/ui/CTALink';

const services = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Data Audit',
    tagline: 'Understand your data before you act on it',
    description:
      'We review your existing data collection, storage, and management systems, identify bottlenecks and risks, and deliver a clear written report with prioritised recommendations.',
    deliverables: [
      'Full assessment of your current data systems',
      'Identification of data quality issues and gaps',
      'Prioritised recommendations report',
      'One-hour debrief call with your team',
    ],
    suitable: 'Research institutes, NGOs, and university labs that have data but no clear picture of its quality or structure.',
    price: 'From $500',
    accent: 'border-primary-gold',
    iconBg: 'bg-primary-gold',
    badge: 'Most popular starting point',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    title: 'Pipeline Build',
    tagline: 'From raw field data to clean, analysis-ready outputs',
    description:
      'We design and build a custom data pipeline tailored to your research workflow — from data collection (ODK, KoboToolbox, surveys) through cleaning, transformation, storage, and reporting.',
    deliverables: [
      'Custom data pipeline design and build',
      'Automated cleaning and transformation scripts (Python / R)',
      'PostgreSQL database setup and schema design',
      'Documentation and handover training for your team',
    ],
    suitable: 'Research programmes, NGO M&E teams, and university departments running field trials or multi-site surveys.',
    price: 'From $2,000',
    accent: 'border-secondary-blue',
    iconBg: 'bg-secondary-blue',
    badge: 'Core service',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Dashboard & Reporting',
    tagline: 'Turn your data into decisions',
    description:
      'We build clean, interactive dashboards that let your PI, management team, or donors see programme data in real time — without needing to open a spreadsheet.',
    deliverables: [
      'Interactive dashboard (R Shiny or Power BI)',
      'Automated monthly or quarterly report generation',
      'Donor-ready visualisations and summary outputs',
      'Training session for your team',
    ],
    suitable: 'NGOs with donor reporting requirements, research programmes tracking multi-site outcomes, and university labs presenting results to funders.',
    price: 'From $1,500',
    accent: 'border-success',
    iconBg: 'bg-success',
    badge: 'High impact',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Ongoing Retainer',
    tagline: 'A data partner, not just a one-off consultant',
    description:
      'We work with your organisation on an ongoing monthly basis — maintaining pipelines, updating dashboards, cleaning incoming data, and advising as your programmes evolve.',
    deliverables: [
      'Monthly data cleaning and pipeline maintenance',
      'Dashboard and report updates',
      'Ad hoc data queries and analysis support',
      'Priority response time (within 24 hours)',
    ],
    suitable: 'Organisations that need consistent data support without hiring a full-time data engineer.',
    price: 'From $300/month',
    accent: 'border-hausa-indigo',
    iconBg: 'bg-hausa-indigo',
    badge: 'Best value over time',
  },
];

const process = [
  { step: '01', title: 'Discovery Call', desc: 'A free 30-minute call to understand your data challenges and what outcomes matter most to your organisation.' },
  { step: '02', title: 'Proposal', desc: 'We send a clear, itemised proposal within 48 hours — no jargon, no hidden costs.' },
  { step: '03', title: 'Build', desc: 'We do the work, keep you updated at every stage, and flag anything that needs your input before proceeding.' },
  { step: '04', title: 'Handover', desc: 'We document everything, train your team, and stay available for questions after delivery.' },
];

const clients = [
  { type: 'Research Institutes', examples: 'IITA, ILRI, IAR, ICRISAT, University research labs', icon: '🔬' },
  { type: 'NGOs & Development Organisations', examples: 'Field programmes, M&E teams, donor-funded projects', icon: '🌍' },
  { type: 'University Departments', examples: 'Agriculture, Social Sciences, Life Sciences, Public Health', icon: '🎓' },
  { type: 'Government Research Bodies', examples: 'National statistics agencies, agricultural development bodies', icon: '🏛️' },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-warm-white">

      {/* Hero */}
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-20 pattern-adire relative overflow-hidden">
        <div className="kente-strip absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-primary-gold font-bold uppercase tracking-widest text-sm mb-4">
            EvolvLearn Data Services
          </p>
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
            Research Data Engineering<br />
            <span className="text-primary-gold">for African Institutions</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10">
            We help research institutes, universities, and NGOs turn raw field and survey data
            into clean, usable, reportable systems — so your team spends less time fixing spreadsheets
            and more time doing science.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTALink href="/contact" ctaName="contact_us">
              <Button variant="primary" size="lg" className="px-8">
                Book a Free Discovery Call →
              </Button>
            </CTALink>
            <Link href="#services">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-secondary-blue px-8">
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Problem statement */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { emoji: '📂', problem: 'Years of field data sitting in messy Excel files nobody can query' },
              { emoji: '📊', problem: 'Monthly reports that take days to compile manually from multiple sources' },
              { emoji: '❓', problem: 'Donors asking for data you have, but can\'t present in a usable format' },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-warm-white rounded-2xl">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <p className="text-gray-700 font-medium leading-relaxed">{item.problem}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-secondary-blue font-semibold text-lg mt-10">
            These are data engineering problems. We solve them.
          </p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-warm-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-secondary-blue mb-3">
              What We Offer
            </h2>
            <div className="w-16 h-1 bg-primary-gold mx-auto mb-4 rounded-full" />
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Four service tiers designed around how research organisations actually work
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((s, i) => (
              <div key={i} className={`bg-white rounded-2xl shadow-lg p-8 border-t-4 ${s.accent} hover:shadow-xl transition-shadow`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${s.iconBg} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                    {s.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {s.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-1">{s.title}</h3>
                <p className="text-primary-gold font-semibold text-sm mb-3">{s.tagline}</p>
                <p className="text-gray-600 mb-5 leading-relaxed">{s.description}</p>

                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">What's included:</p>
                  <ul className="space-y-1.5">
                    {s.deliverables.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-warm-white rounded-lg p-3 mb-5 text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Best for: </span>{s.suitable}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-2xl font-bold text-secondary-blue">{s.price}</span>
                  <CTALink href="/contact" ctaName="contact_us">
                    <Button variant="outline" size="sm">Get a quote →</Button>
                  </CTALink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-3">
              Who We Work With
            </h2>
            <p className="text-gray-600">
              We work with organisations that generate research and programme data across Africa and the diaspora
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clients.map((c, i) => (
              <div key={i} className="bg-warm-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-secondary-blue mb-2">{c.type}</h3>
                <p className="text-sm text-gray-500">{c.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-br from-secondary-blue to-secondary-blue-dark text-white pattern-adire">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold mb-3">How It Works</h2>
            <p className="text-gray-200 text-lg">Simple, transparent, no surprises</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {process.map((p, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-primary-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-900 font-bold text-lg">{p.step}</span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{p.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why EvolvLearn */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-3">
              Why EvolvLearn Data Services?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'We understand research data',
                body: 'We\'re not a generic IT consultancy. We train researchers — so we understand experimental designs, field trial data, survey structures, and the unique messiness of African research datasets.',
                color: 'border-primary-gold',
              },
              {
                title: 'African context built in',
                body: 'We understand the data challenges specific to research in Nigeria, East Africa, and the diaspora — unreliable connectivity, mixed-language data, multi-site coordination, and donor reporting requirements.',
                color: 'border-igbo-red',
              },
              {
                title: 'We leave your team stronger',
                body: 'Every engagement includes documentation and a handover session. We build your capacity, not dependency. Your team should understand what we built and be able to maintain it.',
                color: 'border-success',
              },
            ].map((w, i) => (
              <div key={i} className={`bg-warm-white rounded-2xl p-6 border-t-4 ${w.color}`}>
                <h3 className="font-bold text-secondary-blue mb-2">{w.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-warm-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="bg-gradient-to-r from-primary-gold to-yellow-500 rounded-2xl p-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Let's Talk About Your Data
            </h2>
            <p className="text-gray-800 text-lg mb-8">
              Book a free 30-minute discovery call. No commitment, no sales pressure —
              just an honest conversation about what's possible.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <CTALink href="/contact" ctaName="contact_us">
                <Button variant="secondary" size="lg" className="px-8">
                  Book a Free Discovery Call
                </Button>
              </CTALink>
              <Link href="mailto:evolvngo@gmail.com">
                <Button variant="outline" size="lg" className="bg-white hover:bg-gray-50 px-8">
                  Email Us Directly
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
