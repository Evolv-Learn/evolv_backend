import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import FeaturedCourses from '@/components/home/FeaturedCourses';

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
              Empower Yourself By Learning Without Limits
            </h1>
            
            {/* Subtitle/Description */}
            <p className="text-base md:text-lg lg:text-xl mb-10 text-gray-100 max-w-4xl mx-auto leading-relaxed">
              Transform your future with world-class tech education accessible globally
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="shadow-2xl w-full sm:w-auto px-8 py-4 text-base font-semibold">
                  Register Now →
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="text-white border-2 border-white hover:bg-white hover:text-secondary-blue shadow-2xl w-full sm:w-auto px-8 py-4 text-base font-semibold backdrop-blur-sm">
                  Browse Courses
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
              { number: '500+', label: 'Students Trained', icon: '👨‍🎓' },
              { number: '95%', label: 'Success Rate', icon: '📈' },
              { number: '50+', label: 'Countries', icon: '🌍' },
              { number: '200+', label: 'Alumni Employed', icon: '💼' },
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We won't promise you'll become a professional overnight, but you'll gain the confidence and foundation to continue building your skills independently
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Apply', desc: 'Fill out our simple application form', icon: '📝', color: 'from-primary-gold to-yellow-600', hoverColor: 'hover:from-primary-gold-dark hover:to-yellow-700' },
              { step: '2', title: 'Get Selected', desc: 'Our team reviews your application', icon: '✅', color: 'from-igbo-red to-red-700', hoverColor: 'hover:from-red-600 hover:to-red-800' },
              { step: '3', title: 'Start Learning', desc: 'Access courses and resources', icon: '📚', color: 'from-success to-green-700', hoverColor: 'hover:from-green-600 hover:to-green-800' },
              { step: '4', title: 'Launch Career', desc: 'Get hired by top companies', icon: '🚀', color: 'from-hausa-indigo to-purple-900', hoverColor: 'hover:from-purple-700 hover:to-purple-950' },
            ].map((item, index) => (
              <div key={index} className="group">
                <div className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full transform hover:-translate-y-2 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-${item.color.split('-')[1]}-500`}>
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} ${item.hoverColor} rounded-full flex items-center justify-center text-4xl mb-6 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-primary-gold to-yellow-500 text-white text-xs font-bold rounded-full mb-3 group-hover:scale-110 transition-transform">
                      STEP {item.step}
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-3 group-hover:text-primary-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-900 transition-colors">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-secondary-blue to-secondary-blue-dark text-white pattern-adire">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-200">
              Hear from our alumni who transformed their careers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Data Scientist at Google', quote: 'EvolvLearn gave me the skills and confidence to land my dream job!', rating: 5 },
              { name: 'Michael Chen', role: 'Security Engineer', quote: 'The hands-on approach and expert instructors made all the difference.', rating: 5 },
              { name: 'Amina Hassan', role: 'Dynamics Consultant', quote: 'From zero experience to a thriving career in just 6 months!', rating: 5 },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-primary-gold text-2xl">★</span>
                  ))}
                </div>
                <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-gold rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-gray-300">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-warm-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-gold to-primary-gold-dark rounded-2xl p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
              Join thousands of learners worldwide transforming their careers through tech
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Register Now - It's Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="bg-white hover:bg-gray-100">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
