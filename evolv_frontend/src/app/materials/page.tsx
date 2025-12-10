'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

export default function LearningMaterialsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [communityLinks, setCommunityLinks] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [isCourseFilesOpen, setIsCourseFilesOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    fetchMaterialsAndCourses();
  }, [isAuthenticated]);

  const fetchMaterialsAndCourses = async () => {
    try {
      // Fetch student's learning materials (only for approved courses)
      const materialsRes = await apiClient.get('/students/me/learning-materials/');
      console.log('Learning materials response:', materialsRes.data);
      
      // Check if access is granted
      if (!materialsRes.data.access_granted) {
        setError(materialsRes.data.message || 'You do not have access to learning materials yet.');
        setIsLoading(false);
        return;
      }

      const materialsData = materialsRes.data.results || [];
      const communityLinksData = materialsRes.data.community_links || null;
      
      setMaterials(materialsData);
      setCommunityLinks(communityLinksData);

      // Extract unique courses from materials
      const uniqueCourses = Array.from(
        new Map(
          materialsData
            .filter((m: any) => m.course_name)
            .map((m: any) => [m.course, { course_id: m.course, course_name: m.course_name }])
        ).values()
      );
      
      setEnrolledCourses(uniqueCourses);
    } catch (err: any) {
      console.error('Failed to fetch materials:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 403) {
        setError(err.response?.data?.detail || 'You do not have any approved course enrollments yet.');
      } else if (err.response?.status === 404) {
        setError(err.response?.data?.detail || 'Student profile not found.');
      } else {
        setError('Failed to load learning materials. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMaterials = selectedCourse === 'all' 
    ? materials 
    : materials.filter(m => m.course === parseInt(selectedCourse));

  // Group materials by type (folder structure)
  const groupedMaterials = filteredMaterials.reduce((acc: any, material: any) => {
    const type = material.material_type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(material);
    return acc;
  }, {});

  const getFolderInfo = (type: string) => {
    const folderMap: any = {
      'video': { icon: '🎥', name: 'Videos', color: 'bg-purple-50 border-purple-200' },
      'document': { icon: '📄', name: 'Documents', color: 'bg-blue-50 border-blue-200' },
      'spreadsheet': { icon: '📊', name: 'Spreadsheets', color: 'bg-green-50 border-green-200' },
      'archive': { icon: '📦', name: 'Archives', color: 'bg-orange-50 border-orange-200' },
      'other': { icon: '📎', name: 'Others', color: 'bg-gray-50 border-gray-200' },
    };
    return folderMap[type] || folderMap['other'];
  };

  const getMaterialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'spreadsheet': return '📊';
      case 'archive': return '📦';
      default: return '📎';
    }
  };

  const toggleFolder = (folderType: string) => {
    const newOpenFolders = new Set(openFolders);
    if (newOpenFolders.has(folderType)) {
      newOpenFolders.delete(folderType);
    } else {
      newOpenFolders.add(folderType);
    }
    setOpenFolders(newOpenFolders);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/dashboard">
              <Button variant="primary">← Back to My Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link href="/dashboard" className="inline-block mb-6">
          <Button variant="outline">
            ← Back to My Account
          </Button>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
              Learning Materials
            </h1>
            <p className="text-gray-600">
              Access course materials, resources, and study guides for your enrolled courses
            </p>
          </div>

          {/* External Links Section */}
          {communityLinks && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h2 className="text-2xl font-bold text-secondary-blue mb-4 flex items-center gap-2">
                🔗 External Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityLinks.github && (
                  <a
                    href={communityLinks.github.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <span className="text-3xl">📁</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">GitHub Repository</h3>
                      <p className="text-sm text-gray-600">{communityLinks.github.description}</p>
                      <span className="text-xs text-blue-600 mt-2 inline-block">Click to open →</span>
                    </div>
                  </a>
                )}
                {communityLinks.discord && (
                  <a
                    href={communityLinks.discord.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <span className="text-3xl">💬</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">Discord Community</h3>
                      <p className="text-sm text-gray-600">{communityLinks.discord.description}</p>
                      <span className="text-xs text-blue-600 mt-2 inline-block">Click to open →</span>
                    </div>
                  </a>
                )}
                {communityLinks.video_materials && (
                  <a
                    href={communityLinks.video_materials.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <span className="text-3xl">🎬</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">Video Materials</h3>
                      <p className="text-sm text-gray-600">{communityLinks.video_materials.description}</p>
                      <span className="text-xs text-blue-600 mt-2 inline-block">Click to open →</span>
                    </div>
                  </a>
                )}
                {communityLinks.documentation && (
                  <a
                    href={communityLinks.documentation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <span className="text-3xl">📚</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">Documentation</h3>
                      <p className="text-sm text-gray-600">{communityLinks.documentation.description}</p>
                      <span className="text-xs text-blue-600 mt-2 inline-block">Click to open →</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Course Filter */}
          {enrolledCourses.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-gold"
              >
                <option value="all">All Courses ({materials.length} files)</option>
                {enrolledCourses.map((enrollment: any) => (
                  <option key={enrollment.course_id} value={enrollment.course_id}>
                    {enrollment.course_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Main Course Files Folder - Collapsible */}
          {filteredMaterials.length > 0 ? (
            <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
              {/* Main Folder Header */}
              <button
                onClick={() => setIsCourseFilesOpen(!isCourseFilesOpen)}
                className="w-full p-5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">📁</span>
                  <div className="flex-1 text-left">
                    <h2 className="text-2xl font-bold text-secondary-blue flex items-center gap-2">
                      Course Files
                      <span className="text-sm font-normal text-gray-500">
                        ({filteredMaterials.length} {filteredMaterials.length === 1 ? 'file' : 'files'})
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">media/course_files/</p>
                  </div>
                  <span className="text-2xl text-gray-600">
                    {isCourseFilesOpen ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {/* Subfolders - Only show when main folder is open */}
              {isCourseFilesOpen && (
                <div className="p-4 space-y-3 bg-gray-50">
                  {Object.keys(groupedMaterials).map((folderType) => {
                    const folderInfo = getFolderInfo(folderType);
                    const folderFiles = groupedMaterials[folderType];
                    const isOpen = openFolders.has(folderType);
                    
                    return (
                      <div key={folderType} className={`border-2 rounded-lg overflow-hidden ${folderInfo.color}`}>
                        {/* Subfolder Header */}
                        <button
                          onClick={() => toggleFolder(folderType)}
                          className="w-full p-4 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">📁</span>
                            <div className="flex-1 text-left">
                              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                {folderInfo.name}
                                <span className="text-sm font-normal text-gray-500">
                                  ({folderFiles.length} {folderFiles.length === 1 ? 'file' : 'files'})
                                </span>
                              </h3>
                              <p className="text-xs text-gray-500">course_files/{folderInfo.name.toLowerCase()}/</p>
                            </div>
                            <span className="text-xl text-gray-600">
                              {isOpen ? '▼' : '▶'}
                            </span>
                          </div>
                        </button>

                        {/* Files in Subfolder - Only show when subfolder is open */}
                        {isOpen && (
                          <div className="p-3 space-y-2 bg-white border-t-2 border-gray-200">
                            {folderFiles.map((material: any) => (
                              <div 
                                key={material.id}
                                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{getMaterialIcon(material.material_type)}</span>
                                  
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 truncate">
                                      {material.title}
                                    </h4>
                                    
                                    {material.course_name && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {material.course_name}
                                      </p>
                                    )}
                                    
                                    {material.description && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                        {material.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                      {material.file_size && (
                                        <span>📦 {material.file_size}</span>
                                      )}
                                      {material.file_extension && (
                                        <span>{material.file_extension.toUpperCase()}</span>
                                      )}
                                      {material.uploaded_at && (
                                        <span>📅 {new Date(material.uploaded_at).toLocaleDateString()}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-shrink-0">
                                    {material.file_url && (
                                      <a
                                        href={material.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                      >
                                        <Button variant="primary" size="sm">
                                          📥 Download
                                        </Button>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Files Uploaded Yet
              </h3>
              <p className="text-gray-600">
                {selectedCourse === 'all' 
                  ? 'Your instructors will upload course files soon.'
                  : 'No files available for this course yet.'}
              </p>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-secondary-blue">
            <h3 className="font-bold text-secondary-blue mb-2">Need Help?</h3>
            <p className="text-sm text-gray-700">
              If you're having trouble accessing materials or have questions about course content, 
              please contact your instructor or reach out to our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
