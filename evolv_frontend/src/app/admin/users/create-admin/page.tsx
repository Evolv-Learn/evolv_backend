'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function CreateAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/admin/create-admin/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      alert('Admin account created successfully!');
      router.push('/admin/users');
    } catch (error: any) {
      console.error('Failed to create admin:', error);
      const errorMsg = error.response?.data?.error || 'Failed to create admin account. Please try again.';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            className="flex items-center gap-2"
          >
            <span>←</span> Back to Users
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
            Create Admin Account 👨‍💼
          </h1>
          <p className="text-gray-600">Create a new administrator account with full permissions</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div className="bg-primary-gold bg-opacity-10 border-l-4 border-primary-gold p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                <strong>⚠️ Important:</strong> Admin accounts have full access to all platform features including user management, course management, and system settings.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                required
              />

              <Input
                label="Last Name"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>

            <Input
              label="Username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="admin_username"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@evolvlearn.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 8 characters"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              required
            />

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={isLoading}
              >
                Create Admin Account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/users')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
