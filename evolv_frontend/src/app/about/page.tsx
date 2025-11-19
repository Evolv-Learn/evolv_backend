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
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from curriculum design to student support.',
      icon: '⭐',
      color: 'from-primary-gold to-yellow-600',
    },
    {
      title: 'Innovation',
      description: 'We embrace innovation and stay ahead of industry trends to provide cutting-edge education.',
      icon: '💡',
      color: 'from-igbo-red to-red-700',
    },
    {
      title: 'Community',
      description: 'We build a supportive community where learners can grow together and support each other.',
      icon: '🤝',
      color: 'from-success to-green-700',
    },
    {
      title: 'Integrity',
      description: 'We operate with honesty, transparency, and ethical practices in all our interactions.',
      icon: '🛡️',
      color: 'from-hausa-indigo to-purple-900',
    },
  ];

  const teamMembers = [
    { name: 'Adebayo Johnson', role: 'CEO & Founder', image: '👨🏿‍💼' },
    { name: 'Chioma Okafor', role: 'Head of Curriculum', image: '👩🏿‍🏫' },
    { name: 'Fatima Abdullahi', role: 'Lead Instructor', image: '👩🏿‍💻' },
    { name: 'Emeka Nwosu', role: 'Technical Director', image: '👨🏿‍💻' },
    { name: 'Aisha Mohammed', role: 'Student Success Manager', image: '👩🏿‍💼' },
    { name: 'Oluwaseun Adeyemi', role: 'Community Manager', image: '👨🏿‍🎓' },
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
            {aboutData?.title || 'About EvolvLearn'}
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {aboutData?.description || 'Transforming Lives Through Learning'}
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
              {aboutData?.mission || 'To provide accessible, high-quality tech education that empowers learners worldwide to build successful careers in technology and drive digital transformation globally.'}
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
              {aboutData?.vision || 'A world where everyone has access to world-class tech education, enabling them to compete globally and drive innovation worldwide.'}
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
              These principles guide everything we do at EvolvLearn
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
              Meet Our Team
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Passionate educators and tech professionals from across Nigeria
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="h-48 bg-gradient-to-br from-primary-gold to-primary-gold-dark flex items-center justify-center text-8xl">
                  {member.image}
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-heading font-bold text-secondary-blue mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-gold font-semibold mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600">
                    {member.role}
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
              { number: '500+', label: 'Students Trained' },
              { number: '50+', label: 'Alumni Success Stories' },
              { number: '10+', label: 'Expert Instructors' },
              { number: '95%', label: 'Success Rate' },
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
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of learners worldwide who are transforming their careers through tech education
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg">
                Apply Now
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
