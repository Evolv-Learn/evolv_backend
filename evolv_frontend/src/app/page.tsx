import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import FeaturedInstructors from '@/components/home/FeaturedInstructors';
import ApiDebug from '@/components/debug/ApiDebug';

export default function Home() {
  return (
    <main className="min-h-screen">
      <ApiDebug />
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

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-warm-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-gold opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-blue opacity-5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4 animate-fade-in">
              Your Best Path to a New Tech Career
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-gold to-secondary-blue mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Item 1 */}
                <div className="group bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-secondary-blue hover:border-primary-gold">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-blue to-primary-gold rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide group-hover:text-secondary-blue transition-colors">
                        Make the Right Connections
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Tap into a network of alumni from diverse backgrounds and industries. Build meaningful relationships with employers and fellow learners who share your passion for growth and innovation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="group bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-primary-gold hover:border-secondary-blue">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-gold to-secondary-blue rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide group-hover:text-primary-gold transition-colors">
                        Learn from Industry Pros
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Learn from instructors with real-world experience at leading organizations. They've been there and know what employers are looking for in today's competitive job market.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Item 3 */}
                <div className="group bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-secondary-blue hover:border-primary-gold">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-blue to-primary-gold rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide group-hover:text-secondary-blue transition-colors">
                        Be Job-Ready from Day One
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Get the real, hands-on tech skills you need to start a new career or move into a new role — plus the soft skills you need to be job-ready before your first day even hits.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="group bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-primary-gold hover:border-secondary-blue">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-gold to-secondary-blue rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide group-hover:text-primary-gold transition-colors">
                        Get Career Coaching to Fuel Success
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Work with a team of career experts who provide personalized guidance, resume reviews, interview preparation, and ongoing support throughout your learning journey.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-blue rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary-gold rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-blue mb-6">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-secondary-blue to-primary-gold mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We won't promise you'll become a professional overnight, but you'll gain the confidence and foundation to continue building your skills independently
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto space-y-24">
            {/* Frame 1: Steps 1 and 2 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Large Image Frame 1 */}
              <div className="group relative h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-secondary-blue to-primary-gold transform transition-all duration-500 hover:scale-105">
                <img
                  src="/images/how-it-works/step1.jpeg"
                  alt="Apply and Get Selected"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Steps 1 & 2 Content */}
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-secondary-blue to-primary-gold rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-2xl">1</span>
                    </div>
                    <h3 className="text-3xl font-bold text-secondary-blue group-hover:text-primary-gold transition-colors">
                      Apply
                    </h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed pl-18">
                    Fill out our simple application form and tell us about your background, interests, and career goals. No prior tech experience required - we welcome learners from all backgrounds.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-gold to-secondary-blue rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-2xl">2</span>
                    </div>
                    <h3 className="text-3xl font-bold text-secondary-blue group-hover:text-primary-gold transition-colors">
                      Get Selected
                    </h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed pl-18">
                    Our team carefully reviews your application to ensure the program is the right fit for you. We look for passion, commitment, and eagerness to learn rather than prior experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Frame 2: Steps 3 and 4 */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Steps 3 & 4 Content */}
              <div className="space-y-12 md:order-1">
                {/* Step 3 */}
                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-secondary-blue to-primary-gold rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-2xl">3</span>
                    </div>
                    <h3 className="text-3xl font-bold text-secondary-blue group-hover:text-primary-gold transition-colors">
                      Start Learning
                    </h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed pl-18">
                    Access comprehensive courses, hands-on projects, and learning resources. Learn from industry professionals and build real-world skills through practical exercises and mentorship.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-gold to-secondary-blue rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-2xl">4</span>
                    </div>
                    <h3 className="text-3xl font-bold text-secondary-blue group-hover:text-primary-gold transition-colors">
                      Launch Career
                    </h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed pl-18">
                    Get hired by top companies with our career support services. We help you build your portfolio, prepare for interviews, and connect with employers looking for talented graduates like you.
                  </p>
                </div>
              </div>

              {/* Large Image Frame 2 */}
              <div className="group relative h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-gold to-secondary-blue md:order-2 transform transition-all duration-500 hover:scale-105">
                <img
                  src="/images/how-it-works/step2.jpeg"
                  alt="Start Learning and Launch Career"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <FeaturedCourses />

      {/* Featured Instructors */}
      <FeaturedInstructors />

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-warm-white to-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary-gold via-primary-gold-dark to-secondary-blue rounded-3xl p-12 md:p-20 text-center shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 drop-shadow-lg">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto leading-relaxed opacity-95">
              Join thousands of learners worldwide transforming their careers through tech education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button variant="secondary" size="lg" className="shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all w-full sm:w-auto px-10 py-4 text-lg font-semibold">
                  Register Now - It's Free →
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="bg-white text-secondary-blue border-2 border-white hover:bg-opacity-90 shadow-xl w-full sm:w-auto px-10 py-4 text-lg font-semibold">
                  Contact Us
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-white border-opacity-30">
              <p className="text-white text-sm opacity-90 mb-4">Trusted by learners in over 50 countries</p>
              <div className="flex justify-center gap-8 flex-wrap">
                <div className="text-white">
                  <div className="text-3xl font-bold">1000+</div>
                  <div className="text-sm opacity-80">Students</div>
                </div>
                <div className="text-white">
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-sm opacity-80">Courses</div>
                </div>
                <div className="text-white">
                  <div className="text-3xl font-bold">95%</div>
                  <div className="text-sm opacity-80">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
