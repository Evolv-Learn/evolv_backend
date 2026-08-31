'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

interface FormData {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string;
  country_of_birth: string;
  diploma_level: string;
  job_status: string;
  english_level: number;
  has_laptop: boolean;
  how_heard: string;
  courses: number[];
}

const CURRENCIES = [
  { code: 'NGN', label: 'NGN — Nigerian Naira' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GHS', label: 'GHS — Ghanaian Cedi' },
  { code: 'KES', label: 'KES — Kenyan Shilling' },
  { code: 'ZAR', label: 'ZAR — South African Rand' },
];

const COUNTRIES = [
  { code: 'NG', label: 'Nigeria' }, { code: 'GH', label: 'Ghana' },
  { code: 'KE', label: 'Kenya' }, { code: 'ZA', label: 'South Africa' },
  { code: 'ET', label: 'Ethiopia' }, { code: 'TZ', label: 'Tanzania' },
  { code: 'UG', label: 'Uganda' }, { code: 'RW', label: 'Rwanda' },
  { code: 'SN', label: 'Senegal' }, { code: 'CI', label: 'Ivory Coast' },
  { code: 'CM', label: 'Cameroon' }, { code: 'MA', label: 'Morocco' },
  { code: 'EG', label: 'Egypt' }, { code: 'DZ', label: 'Algeria' },
  { code: 'TN', label: 'Tunisia' }, { code: 'GB', label: 'United Kingdom' },
  { code: 'US', label: 'United States' }, { code: 'CA', label: 'Canada' },
  { code: 'DE', label: 'Germany' }, { code: 'FR', label: 'France' },
  { code: 'NL', label: 'Netherlands' }, { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' }, { code: 'IN', label: 'India' },
  { code: 'AU', label: 'Australia' }, { code: 'BR', label: 'Brazil' },
];

const STEPS = [
  { id: 1, label: 'Your Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 2, label: 'Choose Course', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 3, label: 'Review & Pay', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const ENGLISH_LABELS: Record<number, string> = { 1: 'Beginner', 2: 'Elementary', 3: 'Intermediate', 4: 'Upper-Intermediate', 5: 'Fluent / Native' };

export default function AdmissionPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [currency, setCurrency] = useState('NGN');
  const [discountCode, setDiscountCode] = useState('');
  const [isReturning, setIsReturning] = useState(false);

  const [form, setForm] = useState<FormData>({
    email: user?.email || '',
    phone: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    gender: '',
    birth_date: '',
    country_of_birth: '',
    diploma_level: '',
    job_status: '',
    english_level: 3,
    has_laptop: false,
    how_heard: '',
    courses: [],
  });

  useEffect(() => {
    fetchCourses();
    checkExistingApplication();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/courses/');
      setCourses(res.data.results || res.data);
    } catch { /* silent */ }
  };

  const checkExistingApplication = async () => {
    try {
      const [studentRes, coursesRes] = await Promise.all([
        apiClient.get('/students/me/'),
        apiClient.get('/courses/'),
      ]);
      if (studentRes.data) {
        setIsReturning(true);
        const existingNames = studentRes.data.courses || [];
        const allCourses = coursesRes.data.results || coursesRes.data;
        const ids = allCourses.filter((c: any) => existingNames.includes(c.name)).map((c: any) => c.id);
        setForm(prev => ({ ...prev, ...studentRes.data, courses: ids }));
        setStep(2);
      }
    } catch { /* new student */ }
  };

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleCourse = (id: number) => {
    setForm(prev => ({
      ...prev,
      courses: prev.courses.includes(id) ? prev.courses.filter(c => c !== id) : [...prev.courses, id],
    }));
    setError('');
  };

  const validate = (): boolean => {
    if (step === 1) {
      if (!form.first_name.trim()) return setError('First name is required'), false;
      if (!form.last_name.trim()) return setError('Last name is required'), false;
      if (!form.email.trim()) return setError('Email is required'), false;
      if (!form.phone.trim()) return setError('Phone number is required'), false;
      if (!form.gender) return setError('Gender is required'), false;
      if (!form.birth_date) return setError('Date of birth is required'), false;
      if (!form.country_of_birth) return setError('Country is required'), false;
      if (!form.diploma_level) return setError('Education level is required'), false;
      if (!form.job_status) return setError('Job status is required'), false;
    }
    if (step === 2) {
      if (form.courses.length === 0) return setError('Please select at least one course'), false;
    }
    return true;
  };

  const next = () => { if (validate()) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const back = () => { setStep(s => s - 1); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleSubmit = async () => {
    if (!isAuthenticated) { router.push('/login?redirect=/admission'); return; }
    setIsLoading(true);
    setError('');
    try {
      const validIds = form.courses.filter(id => typeof id === 'number');
      if (!validIds.length) { setError('Please select at least one course'); setIsLoading(false); return; }

      let enrollments: any[] = [];
      try {
        const existing = await apiClient.get('/students/me/');
        const existingNames = existing.data.courses || [];
        const allCourses = (await apiClient.get('/courses/')).data.results || [];
        const existingIds = allCourses.filter((c: any) => existingNames.includes(c.name)).map((c: any) => c.id);
        const merged = [...new Set([...existingIds, ...validIds])];
        await apiClient.patch('/students/me/', { courses: merged });
      } catch (e: any) {
        if (e.response?.status === 404) {
          await apiClient.post('/students/', {
            ...form,
            courses: validIds,
            nationality: form.country_of_birth,
            zip_code: 'N/A',
            motivation: '',
            future_goals: '',
            proudest_moment: '',
          });
        } else throw e;
      }

      const fresh = await apiClient.get('/students/me/');
      enrollments = fresh.data.enrollments || [];
      const unpaid = enrollments.filter((e: any) => validIds.includes(e.course_id) && e.payment_status !== 'paid');

      if (!unpaid.length) { router.push('/dashboard?success=already-enrolled'); return; }

      const payRes = await apiClient.post('/payments/initiate/', {
        enrollment_id: unpaid[0].id,
        currency,
        ...(discountCode.trim() && { discount_code: discountCode.trim().toUpperCase() }),
      });

      const payData = payRes.data;
      sessionStorage.setItem('evolv_payment_id', String(payData.id));
      if (payData.authorization_url) {
        window.location.href = payData.authorization_url;
      } else {
        router.push('/dashboard?success=application-submitted');
      }
    } catch (err: any) {
      const d = err?.response?.data;
      if (d && typeof d === 'object') {
        const msg = Object.entries(d).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join(' | ');
        setError(msg || 'Please check your form and try again.');
      } else {
        setError(d?.detail ?? 'Submission failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Not authenticated ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-secondary-blue/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-secondary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-2">Login Required</h2>
          <p className="text-gray-500 text-sm mb-6">Create an account or log in to start your application.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login?redirect=/admission">
              <button className="bg-secondary-blue text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-secondary-blue-dark transition-colors text-sm">Login</button>
            </Link>
            <Link href="/register?redirect=/admission">
              <button className="border border-secondary-blue text-secondary-blue font-semibold px-6 py-2.5 rounded-lg hover:bg-secondary-blue hover:text-white transition-colors text-sm">Register</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step progress bar ────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              step > s.id ? 'bg-success text-white' : step === s.id ? 'bg-secondary-blue text-white ring-4 ring-secondary-blue/20' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s.id
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon}/></svg>
              }
            </div>
            <span className={`text-xs font-semibold mt-1.5 hidden sm:block ${step >= s.id ? 'text-secondary-blue' : 'text-gray-400'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 mb-4 transition-all duration-500 ${step > s.id ? 'bg-success' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ─── Field helpers ────────────────────────────────────────────────────────
  const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const inputClass = "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-blue/30 focus:border-secondary-blue transition-colors bg-white";
  const selectClass = inputClass;

  // ─── STEP 1: Details ──────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-heading font-bold text-secondary-blue">Personal Details</h2>
        <p className="text-sm text-gray-500 mt-0.5">Tell us a little about yourself</p>
      </div>

      {isReturning && (
        <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex gap-2 items-start">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
          We found your existing profile. Your details are pre-filled — jump to course selection if nothing has changed.
        </div>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="First Name *">
          <input className={inputClass} value={form.first_name} onChange={e => update('first_name', e.target.value)} placeholder="Ada" />
        </Field>
        <Field label="Last Name *">
          <input className={inputClass} value={form.last_name} onChange={e => update('last_name', e.target.value)} placeholder="Okonkwo" />
        </Field>
      </div>

      {/* Contact row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Email Address *">
          <input className={inputClass} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" />
        </Field>
        <Field label="Phone Number *">
          <input className={inputClass} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+234 800 000 0000" />
        </Field>
      </div>

      {/* Gender / DOB row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Gender *">
          <select className={selectClass} value={form.gender} onChange={e => update('gender', e.target.value)}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </Field>
        <Field label="Date of Birth *">
          <input className={inputClass} type="date" value={form.birth_date} onChange={e => update('birth_date', e.target.value)} />
        </Field>
      </div>

      {/* Country */}
      <div className="mb-5">
        <Field label="Country *">
          <select className={selectClass} value={form.country_of_birth} onChange={e => update('country_of_birth', e.target.value)}>
            <option value="">Select your country</option>
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </Field>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-5 flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Academic Background</span>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      {/* Education / Job row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Highest Education Level *">
          <select className={selectClass} value={form.diploma_level} onChange={e => update('diploma_level', e.target.value)}>
            <option value="">Select</option>
            <option value="Secondary School">Secondary School</option>
            <option value="Bachelor">Bachelor's Degree</option>
            <option value="Master">Master's Degree</option>
            <option value="PhD">PhD</option>
            <option value="No Option">Other</option>
          </select>
        </Field>
        <Field label="Current Job Status *">
          <select className={selectClass} value={form.job_status} onChange={e => update('job_status', e.target.value)}>
            <option value="">Select</option>
            <option>Student</option>
            <option>Employed</option>
            <option>Unemployed</option>
            <option>Self-employed</option>
            <option>Freelancer</option>
            <option>Retired</option>
          </select>
        </Field>
      </div>

      {/* English level slider */}
      <div className="mb-5">
        <Field label={`English Proficiency — ${ENGLISH_LABELS[form.english_level]}`}>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-400 w-16">Beginner</span>
            <input
              type="range" min={1} max={5} value={form.english_level}
              onChange={e => update('english_level', Number(e.target.value))}
              className="flex-1 accent-secondary-blue"
            />
            <span className="text-xs text-gray-400 w-16 text-right">Fluent</span>
            <span className="w-7 h-7 rounded-full bg-secondary-blue text-white text-xs font-bold flex items-center justify-center shrink-0">{form.english_level}</span>
          </div>
        </Field>
      </div>

      {/* Laptop + How heard */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-warm-white transition-colors" onClick={() => update('has_laptop', !form.has_laptop)}>
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${form.has_laptop ? 'bg-secondary-blue border-secondary-blue' : 'border-gray-300'}`}>
            {form.has_laptop && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
          </div>
          <span className="text-sm text-gray-700 font-medium">I have a laptop/computer</span>
        </div>
        <Field label="How did you hear about us? (optional)">
          <select className={selectClass} value={form.how_heard} onChange={e => update('how_heard', e.target.value)}>
            <option value="">Select</option>
            <option value="Social Media">Social Media</option>
            <option value="Google Search">Google Search</option>
            <option value="Friend/Family">Friend / Family</option>
            <option value="Event/Workshop">Event / Workshop</option>
            <option value="Advertisement">Advertisement</option>
            <option value="Other">Other</option>
          </select>
        </Field>
      </div>
    </div>
  );

  // ─── STEP 2: Course Selection ─────────────────────────────────────────────
  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-heading font-bold text-secondary-blue">Choose Your Course</h2>
        <p className="text-sm text-gray-500 mt-0.5">Select one or more courses you'd like to enrol in</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          <p className="text-sm">No courses available right now. Check back soon.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map(course => {
            const selected = form.courses.includes(course.id);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => toggleCourse(course.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  selected
                    ? 'border-secondary-blue bg-secondary-blue/5 shadow-md'
                    : 'border-gray-200 hover:border-secondary-blue/40 hover:shadow-sm bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selected ? 'bg-secondary-blue border-secondary-blue' : 'border-gray-300'
                  }`}>
                    {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                  </div>
                  {course.registration_deadline && (
                    <span className="text-[11px] font-semibold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0">
                      Deadline: {new Date(course.registration_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <h3 className={`font-bold text-base leading-snug mb-1 ${selected ? 'text-secondary-blue' : 'text-gray-800'}`}>{course.name}</h3>
                {course.category && <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{course.category}</p>}
                {course.description && <p className="text-xs text-gray-500 line-clamp-2">{course.description}</p>}
                {course.start_date && (
                  <p className="text-xs text-success font-semibold mt-2">
                    Starts {new Date(course.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {form.courses.length > 0 && (
        <p className="text-xs text-secondary-blue font-semibold mt-4 text-center">
          {form.courses.length} course{form.courses.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );

  // ─── STEP 3: Review & Pay ─────────────────────────────────────────────────
  const renderStep3 = () => {
    const selectedCourses = courses.filter(c => form.courses.includes(c.id));
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-heading font-bold text-secondary-blue">Review & Pay</h2>
          <p className="text-sm text-gray-500 mt-0.5">Confirm your details and complete payment to submit your application</p>
        </div>

        {/* Summary card */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Application Summary</p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
            {[
              ['Name', `${form.first_name} ${form.last_name}`],
              ['Email', form.email],
              ['Phone', form.phone],
              ['Country', COUNTRIES.find(c => c.code === form.country_of_birth)?.label || form.country_of_birth],
              ['Education', form.diploma_level],
              ['English Level', `${form.english_level}/5 — ${ENGLISH_LABELS[form.english_level]}`],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-gray-400 shrink-0">{k}:</span>
                <span className="font-medium text-gray-800">{v}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Selected Courses</p>
            <div className="flex flex-wrap gap-2">
              {selectedCourses.map(c => (
                <span key={c.id} className="bg-secondary-blue text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Payment options */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <p className="text-sm font-bold text-gray-700 mb-4">Payment Details</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Currency">
              <select className={selectClass} value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Discount Code (optional)">
              <input
                className={inputClass}
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="e.g. EVOLVLEARN10"
              />
            </Field>
          </div>
        </div>

        {/* Note */}
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          <span>You will be redirected to Paystack to complete payment securely. Once paid, your application goes to our team for review — we respond within <strong>2–3 business days</strong>.</span>
        </div>
      </div>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-warm-white py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-secondary-blue transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back to home
          </Link>
          <h1 className="text-3xl font-heading font-bold text-secondary-blue">Apply to EvolvLearn</h1>
          <p className="text-gray-500 text-sm mt-1">Takes less than 5 minutes. Spots are limited.</p>
        </div>

        {/* Step bar */}
        <StepBar />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* Error banner */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start text-sm text-red-700">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          {step > 1 ? (
            <button onClick={back} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-secondary-blue font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={next}
              className="bg-secondary-blue hover:bg-secondary-blue-dark text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-primary-gold hover:bg-yellow-500 text-secondary-blue-dark font-bold text-sm px-8 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Processing…
                </>
              ) : (
                <>
                  Pay & Submit Application
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </>
              )}
            </button>
          )}
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-gray-400 mt-4">Step {step} of {STEPS.length}</p>

      </div>
    </div>
  );
}
