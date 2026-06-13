import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import ProgrammesCarousel from '@/components/home/ProgrammesCarousel';
import WhyEvolvRotator from '@/components/home/WhyEvolvRotator';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[700px] md:min-h-[800px] flex items-center overflow-hidden">
        <div className="kente-strip absolute top-0 left-0 right-0 z-10"></div>
        
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero/hero-student.jpg"
            alt="Student learning with books"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-blue via-secondary-blue/90 to-secondary-blue/70"></div>
          {/* Pattern Overlay */}
          <div className="absolute inset-0 pattern-adire opacity-30"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-8 leading-tight text-white drop-shadow-2xl">
              Equipping Researchers with the Tools Their Science Demands
            </h1>
            
            {/* Subtitle/Description */}
            <p className="text-base md:text-lg lg:text-xl mb-10 text-gray-100 max-w-4xl mx-auto leading-relaxed">
              Practical, affordable research methods training — starting with R for quantitative data analysis. Built by a researcher, for researchers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/admission">
                <Button variant="primary" size="lg" className="shadow-2xl w-full sm:w-auto px-8 py-4 text-base font-semibold">
                  Apply for Next Cohort →
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="text-white border-2 border-white hover:bg-white hover:text-secondary-blue shadow-2xl w-full sm:w-auto px-8 py-4 text-base font-semibold backdrop-blur-sm">
                  View Programmes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-white border-y-4 border-primary-gold">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            <div className="px-6 py-4 text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-secondary-blue">30+</div>
              <div className="text-gray-500 mt-1 text-sm uppercase tracking-wide">Researchers Trained</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-secondary-blue">2</div>
              <div className="text-gray-500 mt-1 text-sm uppercase tracking-wide">Cohorts Completed</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-secondary-blue">3</div>
              <div className="text-gray-500 mt-1 text-sm uppercase tracking-wide">Nigerian States Reached</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-secondary-blue">11</div>
              <div className="text-gray-500 mt-1 text-sm uppercase tracking-wide">Course Modules</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-warm-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-3">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              From application to your first published analysis — here is what to expect
            </p>
          </div>

          {/* Process flow */}
          <div className="relative">
            {/* Connecting dashed line — desktop only */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-primary-gold/50 z-0" />

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="group flex flex-col items-center text-center cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-gold shadow-md mb-4 relative flex-shrink-0 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Image src="/images/team/moshood-working.jpeg" alt="Apply" fill className="object-cover object-[center_30%]" />
                  <div className="absolute inset-0 bg-secondary-blue/30 group-hover:bg-secondary-blue/10 transition-colors duration-300" />
                  <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary-gold text-gray-900 text-xs font-bold flex items-center justify-center">01</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-secondary-blue mb-2">Apply</h3>
                <p className="text-gray-600 text-sm leading-relaxed md:opacity-0 md:translate-y-2 md:max-h-0 md:overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-20 transition-all duration-500 ease-out">Tell us about your research background and what you want to do differently.</p>
              </div>

              {/* Step 2 */}
              <div className="group flex flex-col items-center text-center cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-igbo-red shadow-md mb-4 relative flex-shrink-0 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Image src="/images/programmes/get-accepted.png" alt="Get Accepted" fill className="object-cover object-center" />
                  <div className="absolute inset-0 bg-igbo-red/20 group-hover:bg-igbo-red/5 transition-colors duration-300" />
                  <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-igbo-red text-white text-xs font-bold flex items-center justify-center">02</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-secondary-blue mb-2">Get Accepted</h3>
                <p className="text-gray-600 text-sm leading-relaxed md:opacity-0 md:translate-y-2 md:max-h-0 md:overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-20 transition-all duration-500 ease-out">We read every application. If you are a good fit, your spot is confirmed and materials sent.</p>
              </div>

              {/* Step 3 */}
              <div className="group flex flex-col items-center text-center cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-success shadow-md mb-4 relative flex-shrink-0 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Image src="/images/programmes/learn.png" alt="Learn Live" fill className="object-cover object-[center_20%]" />
                  <div className="absolute inset-0 bg-success/20 group-hover:bg-success/5 transition-colors duration-300" />
                  <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-success text-white text-xs font-bold flex items-center justify-center">03</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-secondary-blue mb-2">Learn Live on Discord</h3>
                <p className="text-gray-600 text-sm leading-relaxed md:opacity-0 md:translate-y-2 md:max-h-0 md:overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-20 transition-all duration-500 ease-out">Every module taught live. You ask questions. Real data problems, solved together.</p>
              </div>

              {/* Step 4 */}
              <div className="group flex flex-col items-center text-center cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-hausa-indigo shadow-md mb-4 relative bg-white flex-shrink-0 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Image src="/images/programmes/apply_to_research.png" alt="Apply It" fill className="object-contain p-2" />
                  <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-hausa-indigo text-white text-xs font-bold flex items-center justify-center">04</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-secondary-blue mb-2">Apply It to Your Research</h3>
                <p className="text-gray-600 text-sm leading-relaxed md:opacity-0 md:translate-y-2 md:max-h-0 md:overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-20 transition-all duration-500 ease-out">Use what you learn in your thesis, paper, or lab. Skills that show up in your actual science.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-3">
              Our Programmes
            </h2>
            <div className="w-16 h-1 bg-primary-gold mx-auto mb-4 rounded-full"></div>
            <p className="text-xl text-gray-600">
              Research methods training designed for scientists who work with data
            </p>
          </div>
          <ProgrammesCarousel />
          <div className="mt-8 text-center">
            <Link href="/courses">
              <Button variant="outline" size="lg">
                View All Programmes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Researchers Choose Evolv */}
      <section className="py-20 bg-gradient-to-br from-secondary-blue to-secondary-blue-dark text-white pattern-adire">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="text-primary-gold font-bold uppercase tracking-widest text-xl mb-4">Why Evolv</p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
              Built for people serious about their research
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Not for people looking for shortcuts. Not for people who want a certificate. For researchers who need to actually understand their data.
            </p>
          </div>

          <WhyEvolvRotator />
        </div>
      </section>

      {/* Teaching Team */}
      <section className="py-20 bg-warm-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-primary-gold font-semibold uppercase tracking-wider text-sm mb-3 text-center">
              The Teaching Team
            </p>
            <h2 className="text-4xl font-heading font-bold text-secondary-blue mb-4 text-center">
              Learn from people who do the work
            </h2>
            <p className="text-gray-600 text-lg text-center mb-14 max-w-2xl mx-auto">
              Every tutor at Evolv is an active researcher or practitioner — not a career teacher. You learn from people who use these tools in the field every day.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

              {/* Moshood */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 group">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src="/images/team/moshood-working.jpeg"
                    alt="Moshood Owolabi teaching"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 bg-primary-gold text-gray-900 rounded-lg px-3 py-1.5 text-xs font-semibold shadow">
                    Live on Discord every week
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-2xl font-heading font-bold text-secondary-blue">
                      Moshood Owolabi
                    </h3>
                    <span className="inline-block bg-secondary-blue text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                      Founder · R &amp; Statistics
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm md:opacity-0 md:translate-y-2 md:max-h-0 md:overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-40 transition-all duration-500 ease-out">
                    Nigerian researcher based in Europe. He started Evolv after watching brilliant researchers stall because no one had taught them to handle their data. Every cohort he teaches personally — live, every session, every question answered.
                  </p>
                </div>
              </div>

              {/* Ridwan */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src="/images/team/ridwan.jpeg"
                    alt="Ridwan Alade"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-2xl font-heading font-bold text-secondary-blue">
                      Ridwan Alade
                    </h3>
                    <span className="inline-block bg-hausa-indigo text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                      QGIS · Spatial Analysis
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm md:opacity-0 md:translate-y-2 md:max-h-0 md:overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-40 transition-all duration-500 ease-out">
                    Based in Nigeria, Ridwan is a videographer with deep expertise in QGIS and spatial analysis. He brings visual storytelling and technical precision to every lesson — making spatial data feel intuitive and practical.
                  </p>
                </div>
              </div>

            </div>

            <div className="text-center mt-10">
              <Link href="/about">
                <Button variant="outline" size="md">
                  Read more about Evolv →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary-blue relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 pattern-adire opacity-10"></div>
        <div className="kente-strip absolute bottom-0 left-0 right-0"></div>

        <div className="container mx-auto px-4 relative z-10">
          <p className="text-primary-gold text-sm font-semibold uppercase tracking-widest text-center mb-2">
            From Our Researchers
          </p>
          <h2 className="text-4xl font-heading font-bold text-white mb-4 text-center">
            What participants say
          </h2>
          <p className="text-gray-300 text-lg text-center mb-14 max-w-2xl mx-auto">
            Real words from people who came in with messy data and left with clean, analysed results.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Testimonial 1 — Amaka (female) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl pt-10 pb-8 px-8 flex flex-col items-center gap-5 hover:bg-white/10 transition-colors duration-300">
              {/* Portrait oval */}
              <div className="w-24 h-32 rounded-full overflow-hidden border-2 border-primary-gold/50 flex-shrink-0">
                <img
                  src="/images/testimonials/testimonial-female-1.jpeg"
                  alt="Amaka Chukwu"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Quote */}
              <p className="text-gray-200 leading-relaxed flex-1 italic text-center text-sm">
                "Working with R used to feel like reading a foreign language. After two months with Evolv, I analysed my entire dissertation dataset myself — no statistician needed."
              </p>
              {/* Attribution */}
              <div className="flex flex-col items-center gap-1 pt-3 border-t border-white/10 w-full">
                <p className="text-white font-semibold text-sm">Fatima Aliyu</p>
                <p className="text-gray-400 text-xs">MSc Agronomy · University of Ibadan</p>
                <span className="mt-1 text-xs bg-primary-gold/20 text-primary-gold px-3 py-1 rounded-full font-medium">
                  Cohort 1
                </span>
              </div>
            </div>

            {/* Testimonial 2 — Ibrahim (male) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl pt-10 pb-8 px-8 flex flex-col items-center gap-5 hover:bg-white/10 transition-colors duration-300">
              <div className="w-24 h-32 rounded-full overflow-hidden border-2 border-primary-gold/50 flex-shrink-0">
                <img
                  src="/images/testimonials/testimonial-male-1.jpeg"
                  alt="Ibrahim Bello"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="text-gray-200 leading-relaxed flex-1 italic text-center text-sm">
                "The live sessions on Discord made all the difference. I could ask questions in real time and watch the exact code being typed. It felt like sitting beside a mentor, not watching a recording."
              </p>
              <div className="flex flex-col items-center gap-1 pt-3 border-t border-white/10 w-full">
                <p className="text-white font-semibold text-sm">Ibrahim Bello</p>
                <p className="text-gray-400 text-xs">PhD Candidate · ABU Zaria</p>
                <span className="mt-1 text-xs bg-primary-gold/20 text-primary-gold px-3 py-1 rounded-full font-medium">
                  Cohort 2
                </span>
              </div>
            </div>

            {/* Testimonial 3 — Fatima (female) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl pt-10 pb-8 px-8 flex flex-col items-center gap-5 hover:bg-white/10 transition-colors duration-300">
              <div className="w-24 h-32 rounded-full overflow-hidden border-2 border-primary-gold/50 flex-shrink-0">
                <img
                  src="/images/testimonials/testimonial-male-2.jpeg"
                  alt="Fatima Aliyu"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="text-gray-200 leading-relaxed flex-1 italic text-center text-sm">
                "I had tried YouTube tutorials before and nothing stuck. Evolv's structure — the assignments, the feedback, the follow-through — that is what made it work for me this time."
              </p>
              <div className="flex flex-col items-center gap-1 pt-3 border-t border-white/10 w-full">
                <p className="text-white font-semibold text-sm">Emeka Okafor</p>
                <p className="text-gray-400 text-xs">Research Officer · IITA Kano</p>
                <span className="mt-1 text-xs bg-primary-gold/20 text-primary-gold px-3 py-1 rounded-full font-medium">
                  Cohort 1
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-warm-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-gold to-primary-gold-dark rounded-2xl p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              The Next Cohort Is Coming
            </h2>
            <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
              Spots are limited and go quickly. If you are a student, researcher, or scientist ready to level up your data analysis skills — apply today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/admission">
                <Button variant="secondary" size="lg">
                  Apply for the Next Cohort
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="bg-white hover:bg-gray-100">
                  Ask a Question
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
