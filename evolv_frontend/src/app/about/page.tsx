'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { aboutApi } from '@/lib/api/courses';
import Link from 'next/link';

interface AboutData {
  title: string;
  description: string;
  mission: string;
  vision: string;
  image?: string;
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const data = await aboutApi.get();
      setAboutData(data);
    } catch (error) {
      console.error('Failed to fetch about data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const coreValues = [
    {
      title: 'Rigour',
      description: 'We train researchers to ask the right questions and use the right methods — not just to produce results, but to produce results that hold up.',
      icon: '🔬',
      color: 'from-primary-gold to-yellow-600',
    },
    {
      title: 'Accessibility',
      description: 'Geography and income should never stop a good researcher from learning. We design our pricing and delivery with African researchers in mind.',
      icon: '🌐',
      color: 'from-igbo-red to-red-700',
    },
    {
      title: 'Community',
      description: 'Research can be lonely. We build cohorts so that students learn together, support each other, and stay connected long after the course ends.',
      icon: '🤝',
      color: 'from-success to-green-700',
    },
    {
      title: 'Integrity',
      description: 'We say what we mean. Real numbers, honest teaching, and no shortcuts. If we do not know something, we say so.',
      icon: '🛡️',
      color: 'from-hausa-indigo to-purple-900',
    },
  ];

  const teamMembers = [
    { 
      name: 'Moshood Owolabi', 
      role: 'Founder & Lead Instructor', 
      image: '/images/team/moshood.jpeg',
      bio: 'A Nigerian researcher based in Europe, Moshood started Evolv because he saw how many talented African scientists were held back not by intelligence, but by access to proper research methods training. He teaches every cohort himself and is committed to keeping the quality personal.',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white py-20 pattern-adire relative">
        <div className="kente-strip absolute top-0 left-0 right-0"></div>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-heading font-bold mb-4">
            {aboutData?.title || 'About Evolv'}
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {aboutData?.description || 'Research methods training built from honest experience'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Mission */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-primary-gold">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
              Our Mission
            </h2>
            <div className="kente-strip mb-4"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {aboutData?.mission || 'To make high-quality, practical research methods training accessible to students and scientists across Africa — starting with the tools most needed for quantitative research and growing from there.'}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-igbo-red">
            <div className="text-5xl mb-4">🌟</div>
            <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
              Our Vision
            </h2>
            <div className="kente-strip mb-4"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {aboutData?.vision || 'A future where every researcher in Africa has access to the methodological training they need to produce rigorous, credible, and world-class science — regardless of where they study or how much they earn.'}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-secondary-blue mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              These principles guide everything we do at Evolv
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-full flex items-center justify-center text-3xl mb-4`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-secondary-blue mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-secondary-blue mb-4">
              The Person Behind Evolv
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Evolv is currently a one-person operation, built on a clear conviction that good training should not be a privilege
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col md:flex-row"
              >
                <div className="md:w-64 w-full h-64 md:h-auto bg-gradient-to-br from-primary-gold to-primary-gold-dark flex-shrink-0 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-8xl">👨🏾‍🎓</div>';
                    }}
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-heading font-bold text-secondary-blue mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-gold font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-secondary-blue to-secondary-blue-dark text-white rounded-2xl p-12 mb-20 pattern-adire">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '30+', label: 'Researchers Trained' },
              { number: '2', label: 'Cohorts Completed' },
              { number: '3', label: 'Nigerian States Reached' },
              { number: '11', label: 'Course Modules' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold text-primary-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-heading font-bold text-secondary-blue mb-4">
            Ready to Join the Next Cohort?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Applications for the next R for Quantitative Research cohort are open. Spots are limited.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/admission">
              <Button variant="primary" size="lg">
                Apply Now
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg">
                View Programmes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
