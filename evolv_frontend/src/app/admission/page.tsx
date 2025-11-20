'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

interface FormData {
  // Personal Information
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  zip_code: string;
  country_of_birth: string;
  nationality: string;
  
  // Education & Background
  diploma_level: string;
  job_status: string;
  english_level: number;
  
  // Motivation & Goals
  motivation: string;
  future_goals: string;
  proudest_moment: string;
  
  // Additional Info
  how_heard: string;
  referral_person: string;
  has_laptop: boolean;
  
  // Course Selection
  courses: number[];
}

const STEPS = [
  { id: 1, title: 'Personal Info', description: 'Tell us about yourself' },
  { id: 2, title: 'Education', description: 'Your background' },
  { id: 3, title: 'Motivation', description: 'Why join us?' },
  { id: 4, title: 'Courses', description: 'Select courses' },
  { id: 5, title: 'Review', description: 'Review & submit' },
];

export default function AdmissionPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormData>({
    email: user?.email || '',
    phone: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    gender: '',
    birth_date: '',
    zip_code: 'N/A',
    country_of_birth: '',
    nationality: '',
    diploma_level: '',
    job_status: '',
    english_level: 3,
    motivation: '',
    future_goals: '',
    proudest_moment: '',
    how_heard: '',
    referral_person: '',
    has_laptop: false,
    courses: [],
  });

  useEffect(() => {
    fetchCourses();
    checkExistingApplication();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/courses/');
      setCourses(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const [studentResponse, coursesResponse] = await Promise.all([
        apiClient.get('/students/me/'),
        apiClient.get('/courses/'),
      ]);
      
      if (studentResponse.data) {
        // Student profile exists - skip to course selection
        // Backend returns course names as strings, convert to IDs
        const existingCourseNames = studentResponse.data.courses || [];
        const allCourses = coursesResponse.data.results || coursesResponse.data;
        
        // Map course names to IDs
        const courseIds = allCourses
          .filter((course: any) => existingCourseNames.includes(course.name))
          .map((course: any) => course.id);
        
        setFormData(prev => ({
          ...prev,
          ...studentResponse.data,
          courses: courseIds,
        }));
        setCurrentStep(4); // Skip to course selection
      }
    } catch (error) {
      // No existing profile - start from beginning
      console.log('No existing application found, starting fresh');
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = () => {
    setError(''); // Clear previous errors
    
    switch (currentStep) {
      case 1:
        if (!formData.first_name?.trim()) {
          setError('First name is required');
          return false;
        }
        if (!formData.last_name?.trim()) {
          setError('Last name is required');
          return false;
        }
        if (!formData.email?.trim()) {
          setError('Email is required');
          return false;
        }
        if (!formData.phone?.trim()) {
          setError('Phone number is required');
          return false;
        }
        if (!formData.gender) {
          setError('Gender is required');
          return false;
        }
        if (!formData.birth_date) {
          setError('Date of birth is required');
          return false;
        }
        if (!formData.country_of_birth?.trim()) {
          setError('Country of birth is required');
          return false;
        }
        if (!formData.nationality?.trim()) {
          setError('Nationality is required');
          return false;
        }
        break;
      case 2:
        if (!formData.diploma_level) {
          setError('Education level is required');
          return false;
        }
        if (!formData.job_status) {
          setError('Job status is required');
          return false;
        }
        break;
      case 3:
        if (!formData.motivation?.trim()) {
          setError('Please tell us why you want to join');
          return false;
        }
        if (!formData.future_goals?.trim()) {
          setError('Please share your career goals');
          return false;
        }
        if (!formData.proudest_moment?.trim()) {
          setError('Please share your proudest achievement');
          return false;
        }
        if (!formData.how_heard) {
          setError('Please tell us how you heard about us');
          return false;
        }
        break;
      case 4:
        if (formData.courses.length === 0) {
          setError('Please select at least one course');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    console.log('Next button clicked, current step:', currentStep);
    console.log('Form data:', formData);
    
    if (validateStep()) {
      console.log('Validation passed, moving to next step');
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log('Validation failed');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admission');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate and clean course IDs - remove any null/undefined/invalid values
      const validCourseIds = formData.courses.filter(id => id !== null && id !== undefined && typeof id === 'number');
      
      if (validCourseIds.length === 0) {
        setError('Please select at least one course');
        setIsLoading(false);
        return;
      }

      const submissionData = {
        ...formData,
        courses: validCourseIds,
      };

      console.log('Submitting form data:', submissionData);
      
      // Check if student profile already exists
      let response;
      try {
        const existingProfile = await apiClient.get('/students/me/');
        
        // Profile exists - MERGE existing courses with new selections
        // Backend returns course names as strings, we need to get the actual course IDs
        const existingCourseNames = existingProfile.data.courses || [];
        
        // Fetch all courses to map names to IDs
        const coursesResponse = await apiClient.get('/courses/');
        const allCourses = coursesResponse.data.results || coursesResponse.data;
        
        // Convert existing course names to IDs
        const existingCourseIds = allCourses
          .filter((course: any) => existingCourseNames.includes(course.name))
          .map((course: any) => course.id);
        
        // Combine existing and new courses (remove duplicates)
        const allCourseIds = [...new Set([...existingCourseIds, ...validCourseIds])];
        
        response = await apiClient.patch('/students/me/', {
          courses: allCourseIds,
        });
        router.push('/dashboard?success=courses-updated');
      } catch (checkError: any) {
        if (checkError.response?.status === 404) {
          // No profile exists - CREATE new
          console.log('Creating new student profile');
          response = await apiClient.post('/students/', submissionData);
          console.log('Creation successful:', response.data);
          router.push('/dashboard?success=application-submitted');
        } else {
          throw checkError;
        }
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle specific error messages
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // Format validation errors
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('\n');
          setError(errorMessages || 'Please check your form data and try again.');
        } else {
          setError(errorData.detail || errorData.toString() || 'Failed to submit application.');
        }
      } else {
        setError('Failed to submit application. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="First Name *"
                value={formData.first_name}
                onChange={(e) => updateFormData('first_name', e.target.value)}
                required
              />
              <Input
                label="Last Name *"
                value={formData.last_name}
                onChange={(e) => updateFormData('last_name', e.target.value)}
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
              />
              <Input
                label="Phone Number *"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateFormData('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <Input
                label="Date of Birth *"
                type="date"
                value={formData.birth_date}
                onChange={(e) => updateFormData('birth_date', e.target.value)}
                required
              />
              <Input
                label="Zip Code"
                value={formData.zip_code}
                onChange={(e) => updateFormData('zip_code', e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Birth *
                </label>
                <select
                  value={formData.country_of_birth}
                  onChange={(e) => updateFormData('country_of_birth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold max-h-48 overflow-y-auto"
                  size={1}
                  required
                >
                  <option value="">Select Country</option>
                  <option value="NG">🇳🇬 Nigeria</option>
                  <option value="GH">🇬🇭 Ghana</option>
                  <option value="KE">🇰🇪 Kenya</option>
                  <option value="ZA">🇿🇦 South Africa</option>
                  <option value="EG">🇪🇬 Egypt</option>
                  <option value="ET">🇪🇹 Ethiopia</option>
                  <option value="TZ">🇹🇿 Tanzania</option>
                  <option value="UG">🇺🇬 Uganda</option>
                  <option value="RW">🇷🇼 Rwanda</option>
                  <option value="SN">🇸🇳 Senegal</option>
                  <option value="CI">🇨🇮 Ivory Coast</option>
                  <option value="CM">🇨🇲 Cameroon</option>
                  <option value="MA">🇲🇦 Morocco</option>
                  <option value="TN">🇹🇳 Tunisia</option>
                  <option value="DZ">🇩🇿 Algeria</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="ES">🇪🇸 Spain</option>
                  <option value="IT">🇮🇹 Italy</option>
                  <option value="NL">🇳🇱 Netherlands</option>
                  <option value="IN">🇮🇳 India</option>
                  <option value="CN">🇨🇳 China</option>
                  <option value="JP">🇯🇵 Japan</option>
                  <option value="BR">🇧🇷 Brazil</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="NZ">🇳🇿 New Zealand</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Click to open dropdown and scroll</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality *
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => updateFormData('nationality', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold max-h-48 overflow-y-auto"
                  size={1}
                  required
                >
                  <option value="">Select Nationality</option>
                  <option value="NG">🇳🇬 Nigerian</option>
                  <option value="GH">🇬🇭 Ghanaian</option>
                  <option value="KE">🇰🇪 Kenyan</option>
                  <option value="ZA">🇿🇦 South African</option>
                  <option value="EG">🇪🇬 Egyptian</option>
                  <option value="ET">🇪🇹 Ethiopian</option>
                  <option value="TZ">🇹🇿 Tanzanian</option>
                  <option value="UG">🇺🇬 Ugandan</option>
                  <option value="RW">🇷🇼 Rwandan</option>
                  <option value="SN">🇸🇳 Senegalese</option>
                  <option value="CI">🇨🇮 Ivorian</option>
                  <option value="CM">🇨🇲 Cameroonian</option>
                  <option value="MA">🇲🇦 Moroccan</option>
                  <option value="TN">🇹🇳 Tunisian</option>
                  <option value="DZ">🇩🇿 Algerian</option>
                  <option value="GB">🇬🇧 British</option>
                  <option value="US">🇺🇸 American</option>
                  <option value="CA">🇨🇦 Canadian</option>
                  <option value="DE">🇩🇪 German</option>
                  <option value="FR">🇫🇷 French</option>
                  <option value="ES">🇪🇸 Spanish</option>
                  <option value="IT">🇮🇹 Italian</option>
                  <option value="NL">🇳🇱 Dutch</option>
                  <option value="IN">🇮🇳 Indian</option>
                  <option value="CN">🇨🇳 Chinese</option>
                  <option value="JP">🇯🇵 Japanese</option>
                  <option value="BR">🇧🇷 Brazilian</option>
                  <option value="AU">🇦🇺 Australian</option>
                  <option value="NZ">🇳🇿 New Zealander</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Click to open dropdown and scroll</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
              Education & Background
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highest Education Level *
                </label>
                <select
                  value={formData.diploma_level}
                  onChange={(e) => updateFormData('diploma_level', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  required
                >
                  <option value="">Select Education Level</option>
                  <option value="Secondary School">Secondary School</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="No Option">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Job Status *
                </label>
                <select
                  value={formData.job_status}
                  onChange={(e) => updateFormData('job_status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  required
                >
                  <option value="">Select Job Status</option>
                  <option value="Student">Student</option>
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Proficiency Level (1-5) *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.english_level}
                  onChange={(e) => updateFormData('english_level', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-gold"
                />
                <span className="text-2xl font-bold text-primary-gold w-12 text-center">
                  {formData.english_level}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Native</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-warm-white p-4 rounded-lg">
              <input
                type="checkbox"
                id="has_laptop"
                checked={formData.has_laptop}
                onChange={(e) => updateFormData('has_laptop', e.target.checked)}
                className="w-5 h-5 text-primary-gold accent-primary-gold"
              />
              <label htmlFor="has_laptop" className="text-gray-700 font-medium">
                I have access to a laptop/computer for learning
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
              Motivation & Goals
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to join EvolvLearn? *
              </label>
              <textarea
                value={formData.motivation}
                onChange={(e) => updateFormData('motivation', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                placeholder="Tell us about your motivation to learn tech skills..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are your future career goals? *
              </label>
              <textarea
                value={formData.future_goals}
                onChange={(e) => updateFormData('future_goals', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                placeholder="Describe your career aspirations and how this program will help..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is your proudest achievement? *
              </label>
              <textarea
                value={formData.proudest_moment}
                onChange={(e) => updateFormData('proudest_moment', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                placeholder="Share an achievement you're proud of..."
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you hear about us? *
                </label>
                <select
                  value={formData.how_heard}
                  onChange={(e) => updateFormData('how_heard', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                  required
                >
                  <option value="">Select an option</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Friend/Family">Friend/Family</option>
                  <option value="Event/Workshop">Event/Workshop</option>
                  <option value="Website">Website</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                label="Referral Person (Optional)"
                value={formData.referral_person}
                onChange={(e) => updateFormData('referral_person', e.target.value)}
                placeholder="Name of person who referred you"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
              Course Selection
            </h2>
            <p className="text-gray-600 mb-4">
              Select the courses you're interested in. You can choose multiple courses.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((course: any) => (
                <div 
                  key={course.id} 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.courses.includes(course.id)
                      ? 'border-primary-gold bg-primary-gold bg-opacity-10'
                      : 'border-gray-300 hover:border-primary-gold'
                  }`}
                  onClick={() => {
                    if (formData.courses.includes(course.id)) {
                      updateFormData('courses', formData.courses.filter(id => id !== course.id));
                    } else {
                      updateFormData('courses', [...formData.courses, course.id]);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.courses.includes(course.id)}
                      onChange={() => {}}
                      className="mt-1 w-5 h-5 text-primary-gold accent-primary-gold"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-secondary-blue">{course.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.category}</p>
                      {course.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{course.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {courses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No courses available at the moment. Please check back later.</p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
              Review Your Application
            </h2>
            
            <div className="bg-white rounded-xl p-6 shadow-lg space-y-6">
              <div>
                <h3 className="text-lg font-bold text-secondary-blue mb-3">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Name:</strong> {formData.first_name} {formData.last_name}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                  <div><strong>Gender:</strong> {formData.gender}</div>
                  <div><strong>Date of Birth:</strong> {formData.birth_date}</div>
                  <div><strong>Country:</strong> {formData.country_of_birth}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-secondary-blue mb-3">Education & Background</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Education:</strong> {formData.diploma_level}</div>
                  <div><strong>Job Status:</strong> {formData.job_status}</div>
                  <div><strong>English Level:</strong> {formData.english_level}/5</div>
                  <div><strong>Has Laptop:</strong> {formData.has_laptop ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-secondary-blue mb-3">Motivation</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Why join us:</strong>
                    <p className="text-gray-700 mt-1">{formData.motivation}</p>
                  </div>
                  <div>
                    <strong>Career goals:</strong>
                    <p className="text-gray-700 mt-1">{formData.future_goals}</p>
                  </div>
                  <div>
                    <strong>How you heard about us:</strong> {formData.how_heard}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-bold text-secondary-blue mb-3">Selected Courses</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.courses.map(courseId => {
                    const course = courses.find(c => c.id === courseId);
                    return course ? (
                      <span key={courseId} className="bg-primary-gold text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                        {course.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>📧 Next Steps:</strong> After submitting your application, our team will review it and contact you within 3-5 business days via email.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-4">Login Required</h1>
          <p className="text-gray-600 mb-6">Please login or create an account to access the admission form.</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/login?redirect=/admission')} variant="primary">
              Login
            </Button>
            <Button onClick={() => router.push('/register?redirect=/admission')} variant="outline">
              Register
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
            {currentStep === 4 && formData.email ? 'Add More Courses' : 'Admission Application'}
          </h1>
          <p className="text-gray-600">
            {currentStep === 4 && formData.email 
              ? 'Select additional courses to add to your application' 
              : 'Complete your application to join EvolvLearn'}
          </p>
        </div>

        {/* Info message for existing students */}
        {currentStep === 4 && formData.email && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">ℹ️</span>
              <div>
                <h3 className="font-bold text-blue-800">Welcome Back!</h3>
                <p className="text-sm text-blue-700">
                  We found your existing application. You can add more courses to your selection below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep >= step.id
                        ? 'bg-primary-gold text-gray-900'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="text-center mt-2 hidden md:block">
                    <div className={`text-xs font-semibold ${currentStep >= step.id ? 'text-primary-gold' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-primary-gold' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            onClick={prevStep}
            variant="outline"
            disabled={currentStep === 1}
            className="px-6"
          >
            ← Previous
          </Button>
          
          <div className="text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={nextStep}
              variant="primary"
              className="px-6"
            >
              Next →
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              variant="primary"
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
