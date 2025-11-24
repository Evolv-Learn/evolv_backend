'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api/client';

export default function CourseMaterialsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [course, setCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const [formData, setFormData] = useState({
    github_repository: '',
    discord_community: '',
  });
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    material_type: 'document',
    file: null as File | null,
  });

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseRes, materialsRes] = await Promise.all([
        apiClient.get(`/courses/${courseId}/`),
        apiClient.get(`/courses/${courseId}/materials/`),
      ]);
      
      const courseData = courseRes.data;
      setCourse(courseData);
      setFormData({
        github_repository: courseData.github_repository || '',
        discord_community: courseData.discord_community || '',
      });
      setMaterials(materialsRes.data || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load course materials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      await apiClient.patch(`/courses/${courseId}/`, {
        github_repository: formData.github_repository,
        discord_community: formData.discord_community,
      });
      
      setSuccess('Links updated successfully!');
      fetchData();
    } catch (err: any) {
      console.error('Failed to update links:', err);
      setError(err.response?.data?.detail || 'Failed to update links');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.title) {
      setError('Please provide a title and select a file');
      return;
    }

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('course', courseId as string);
      formDataToSend.append('title', uploadForm.title);
      formDataToSend.append('description', uploadForm.description);
      formDataToSend.append('material_type', uploadForm.material_type);
      formDataToSend.append('file', uploadForm.file);

      await apiClient.post(`/courses/${courseId}/materials/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('File uploaded successfully!');
      setUploadForm({
        title: '',
        description: '',
        material_type: 'document',
        file: null,
      });
      setShowUploadForm(false);
      fetchData();
    } catch (err: any) {
      console.error('Failed to upload file:', err);
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await apiClient.delete(`/course-materials/${materialId}/`);
      setSuccess('Material deleted successfully!');
      fetchData();
    } catch (err: any) {
      setError('Failed to delete material');
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'spreadsheet': return '📊';
      case 'archive': return '📦';
      default: return '📎';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-warm-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>Course not found</p>
            <Link href="/dashboard" className="inline-block mt-4">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/instructor/materials" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to Materials
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-secondary-blue mb-2">
            Learning Materials
          </h1>
          <p className="text-gray-600">
            {course.name} - {course.category}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Links Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-heading font-bold text-secondary-blue mb-6">
            External Links
          </h2>
          
          <form onSubmit={handleLinksSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📁</span>
                  <label className="text-sm font-medium text-gray-700">
                    GitHub Repository
                  </label>
                </div>
                <Input
                  type="url"
                  value={formData.github_repository}
                  onChange={(e) => setFormData({ ...formData, github_repository: e.target.value })}
                  placeholder="https://github.com/username/repository"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💬</span>
                  <label className="text-sm font-medium text-gray-700">
                    Discord Community
                  </label>
                </div>
                <Input
                  type="url"
                  value={formData.discord_community}
                  onChange={(e) => setFormData({ ...formData, discord_community: e.target.value })}
                  placeholder="https://discord.gg/invite-code"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={isSaving}>
              {isSaving ? 'Saving...' : 'Save Links'}
            </Button>
          </form>
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-secondary-blue">
              Course Files ({materials.length})
            </h2>
            <Button 
              variant="primary" 
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              {showUploadForm ? 'Cancel' : '+ Upload File'}
            </Button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <form onSubmit={handleFileUpload} className="mb-8 p-6 bg-warm-white rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upload New File</h3>
              
              <div className="space-y-4">
                <Input
                  label="Title *"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g., Week 1 Lecture Notes"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    placeholder="Brief description of this material..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Type *
                  </label>
                  <select
                    value={uploadForm.material_type}
                    onChange={(e) => setUploadForm({ ...uploadForm, material_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    required
                  >
                    <option value="video">🎥 Video</option>
                    <option value="document">📄 Document (PDF, Word)</option>
                    <option value="spreadsheet">📊 Spreadsheet (Excel, CSV)</option>
                    <option value="archive">📦 Archive (ZIP, RAR)</option>
                    <option value="other">📎 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
                    required
                  />
                  {uploadForm.file && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Selected: {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" variant="primary" isLoading={isSaving}>
                    {isSaving ? 'Uploading...' : 'Upload File'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Materials List */}
          {materials.length > 0 ? (
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border-l-4 border-primary-gold rounded-lg p-6 bg-warm-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getMaterialIcon(material.material_type)}</span>
                        <div>
                          <h3 className="text-lg font-bold text-secondary-blue">
                            {material.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(material.uploaded_at).toLocaleDateString()} by {material.uploaded_by_name}
                          </p>
                        </div>
                      </div>

                      {material.description && (
                        <p className="text-gray-600 mb-3 ml-12">
                          {material.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 ml-12">
                        <span className="text-sm text-gray-600">
                          Size: {material.file_size_mb} MB
                        </span>
                        <span className="text-sm text-gray-600 capitalize">
                          Type: {material.material_type}
                        </span>
                        <a
                          href={material.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary-blue hover:underline text-sm font-semibold"
                        >
                          📥 Download
                        </a>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold mb-2">No Files Uploaded Yet</h3>
              <p className="mb-4">Upload videos, documents, spreadsheets, and other materials</p>
              <Button variant="primary" onClick={() => setShowUploadForm(true)}>
                Upload First File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
