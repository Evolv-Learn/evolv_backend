import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '30+', label: 'Researchers Trained', icon: '👨‍🔬' },
              { number: '2', label: 'Cohorts Completed', icon: '🎓' },
              { number: '3', label: 'Nigerian States Reached', icon: '🌍' },
              { number: '11', label: 'Course Modules', icon: '📊' },
            ].map((stat, index) => (
              <div key={index} className="group hover:scale-105 transition-transform">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold text-secondary-blue mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-warm-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From application to your first analysis — here is what to expect
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Apply', desc: 'Tell us about your research background and goals', icon: '📝', color: 'from-primary-gold to-yellow-600' },
              { step: '2', title: 'Get Accepted', desc: 'We review your application and confirm your spot in the cohort', icon: '✅', color: 'from-igbo-red to-red-700' },
              { step: '3', title: 'Learn Live', desc: 'Join weekly sessions on Discord and work through hands-on exercises', icon: '📡', color: 'from-success to-green-700' },
              { step: '4', title: 'Apply It', desc: 'Use what you learn directly in your thesis, paper, or lab work', icon: '🔬', color: 'from-hausa-indigo to-purple-900' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-shadow h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-3xl mb-4 mx-auto`}>
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-primary-gold font-bold mb-2">STEP {item.step}</div>
                    <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-primary-gold text-3xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-4">
              Our Programmes
            </h2>
            <p className="text-xl text-gray-600">
              Research methods training designed for scientists who work with data
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {[
              { 
                title: 'R for Quantitative Research', 
                icon: '📊', 
                color: 'bg-primary-gold', 
                badge: 'Now Open',
                badgeColor: 'bg-success text-white',
                desc: 'Learn to analyse experimental and field data using R. Covers statistics, data visualisation, and common experimental designs used in agricultural and biological sciences.' 
              },
              { 
                title: 'Qualitative Research Methods', 
                icon: '🗂️', 
                color: 'bg-igbo-red', 
                badge: 'Coming Soon',
                badgeColor: 'bg-gray-400 text-white',
                desc: 'Structured approaches to interviews, focus groups, and thematic analysis. For social scientists and mixed-methods researchers.' 
              },
              { 
                title: 'QGIS & Spatial Analysis', 
                icon: '🗺️', 
                color: 'bg-hausa-indigo', 
                badge: 'Coming Soon',
                badgeColor: 'bg-gray-400 text-white',
                desc: 'Geospatial data analysis for researchers working with land use, crop mapping, ecology, and environmental data using free open-source tools.' 
              },
            ].map((course, index) => (
              <div key={index} className="bg-warm-white rounded-xl p-8 hover:shadow-xl transition-shadow group relative">
                <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${course.badgeColor}`}>{course.badge}</span>
                <div className={`${course.color} w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                  {course.icon}
                </div>
                <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-6">{course.desc}</p>
                {index === 0 && (
                  <Link href="/courses" className="text-primary-gold font-semibold hover:underline">
                    See curriculum →
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/courses">
              <Button variant="outline" size="lg">
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-secondary-blue to-secondary-blue-dark text-white pattern-adire">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Why Researchers Choose Evolv
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              We built this for people who are serious about their research — not people looking for shortcuts
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: '🎙️', 
                title: 'Live, Interactive Sessions',
                desc: 'Every module is taught live on Discord. You ask questions, we work through problems together in real time. No pre-recorded videos you watch alone at midnight.' 
              },
              { 
                icon: '🌱', 
                title: 'Built for African Researchers',
                desc: 'Most R courses are made for Western data scientists. Ours uses datasets from agriculture, plant science, and biological research contexts familiar to African scientists.' 
              },
              { 
                icon: '💸', 
                title: 'Affordable Without Compromise',
                desc: 'Quality training should not be a luxury. We offer regional pricing so cost is never the reason you cannot develop your research skills.' 
              },
            ].map((item, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-heading font-bold mb-3">{item.title}</h3>
                <p className="text-gray-200 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Your Instructor */}
      <section className="py-20 bg-warm-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Photo side */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                  <img
                    src="/images/team/moshood-working.jpeg"
                    alt="Moshood Owolabi teaching"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-primary-gold text-gray-900 rounded-xl px-5 py-3 shadow-lg font-semibold text-sm">
                  Live on Discord every week
                </div>
              </div>

              {/* Text side */}
              <div>
                <p className="text-primary-gold font-semibold uppercase tracking-wider text-sm mb-3">
                  Your Instructor
                </p>
                <h2 className="text-4xl font-heading font-bold text-secondary-blue mb-6 leading-tight">
                  Moshood Owolabi
                </h2>
                <div className="kente-strip mb-6"></div>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  I am a Nigerian researcher based in Europe. I started Evolv because I kept seeing the same problem — brilliant researchers who could not move forward with their work simply because nobody had taught them how to handle their data properly.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  Every cohort I teach personally. Every session is live. Every question gets an answer. This is not a course you buy and forget — it is training that stays with you.
                </p>
                <Link href="/about">
                  <Button variant="outline" size="md">
                    Read more about Evolv →
                  </Button>
                </Link>
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
