'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    id: number;
    role: 'Student' | 'Instructor' | 'Alumni';
    profile_picture?: string;
    title?: string;
  };
}

function UsersManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams?.get('filter') || 'all';
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(filter);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedRole, searchQuery]);

  const fetchUsers = async () => {
    try {
      // Fetch profiles which include user data
      const profilesRes = await apiClient.get('/admin/profiles/');
      const profilesData = profilesRes.data.results || profilesRes.data;
      
      // Transform profiles to match the User interface
      const usersData = profilesData.map((profile: any) => ({
        id: profile.user?.id || profile.id,
        username: profile.username || profile.user?.username,
        email: profile.user_email || profile.email || profile.user?.email,
        first_name: profile.first_name || profile.user?.first_name || '',
        last_name: profile.last_name || profile.user?.last_name || '',
        profile: {
          id: profile.id,
          role: profile.role,
          profile_picture: profile.profile_picture,
          title: profile.title,
        },
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    
    // Filter by role
    if (selectedRole === 'students') {
      filtered = filtered.filter(u => u.profile?.role === 'Student');
    } else if (selectedRole === 'instructors') {
      filtered = filtered.filter(u => u.profile?.role === 'Instructor');
    } else if (selectedRole === 'alumni') {
      filtered = filtered.filter(u => u.profile?.role === 'Alumni');
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: number, profileId: number, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }
    
    setUpdatingUserId(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/profile/`, { role: newRole });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId && u.profile
          ? { ...u, profile: { ...u.profile, role: newRole as any } }
          : u
      ));
      
      alert(`User role updated to ${newRole} successfully!`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update user role. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCreateAdmin = () => {
    router.push('/admin/users/create-admin');
  };

  const handleResetPassword = async (userId: number, username: string, email: string) => {
    const newPassword = prompt(`Enter new password for "${username}":`);
    if (!newPassword) {
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    setUpdatingUserId(userId);
    try {
      await apiClient.post(`/admin/users/${userId}/reset-password/`, {
        new_password: newPassword,
      });
      
      alert(`Password reset successfully for "${username}"!\n\nNew password: ${newPassword}\n\nPlease share this with the user securely.`);
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Failed to reset password. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to DELETE user "${username}"? This action cannot be undone!`)) {
      return;
    }
    
    const confirmText = prompt(`Type "${username}" to confirm deletion:`);
    if (confirmText !== username) {
      alert('Deletion cancelled - username did not match.');
      return;
    }
    
    setUpdatingUserId(userId);
    try {
      await apiClient.delete(`/admin/users/${userId}/profile/`);
      
      alert(`User "${username}" deleted successfully!`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Instructor':
        return 'bg-secondary-blue text-white';
      case 'Student':
        return 'bg-primary-gold text-gray-900';
      case 'Alumni':
        return 'bg-success text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold text-secondary-blue mb-2">
                User Management 👥
              </h1>
              <p className="text-gray-600">Manage user accounts and roles</p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateAdmin}
            >
              ➕ Create Admin Account
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-500 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-500 mb-1">Students</div>
            <div className="text-3xl font-bold text-primary-gold">
              {users.filter(u => u.profile?.role === 'Student').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-500 mb-1">Instructors</div>
            <div className="text-3xl font-bold text-secondary-blue">
              {users.filter(u => u.profile?.role === 'Instructor').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-sm text-gray-500 mb-1">Alumni</div>
            <div className="text-3xl font-bold text-success">
              {users.filter(u => u.profile?.role === 'Alumni').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="instructors">Instructors Only</option>
                <option value="alumni">Alumni Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-warm-white transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-gold to-secondary-blue flex items-center justify-center text-white font-bold">
                            {user.first_name?.[0] || user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.first_name && user.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user.username}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.profile?.role)}`}>
                          {user.profile?.role || 'No Role'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.profile ? (
                          <div className="flex flex-wrap gap-2">
                            {user.profile.role !== 'Instructor' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleRoleChange(user.id, user.profile!.id, 'Instructor')}
                                disabled={updatingUserId === user.id}
                              >
                                {updatingUserId === user.id ? '⏳' : '⬆️'} Instructor
                              </Button>
                            )}
                            {user.profile.role !== 'Student' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(user.id, user.profile!.id, 'Student')}
                                disabled={updatingUserId === user.id}
                              >
                                Student
                              </Button>
                            )}
                            {user.profile.role !== 'Alumni' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(user.id, user.profile!.id, 'Alumni')}
                                disabled={updatingUserId === user.id}
                              >
                                Alumni
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetPassword(user.id, user.username, user.email)}
                              disabled={updatingUserId === user.id}
                              className="text-secondary-blue border-secondary-blue hover:bg-secondary-blue hover:text-white"
                            >
                              🔑 Reset Password
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              disabled={updatingUserId === user.id}
                              className="text-igbo-red border-igbo-red hover:bg-igbo-red hover:text-white"
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No profile</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-2">🔍</div>
                      <p>No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function UsersManagementPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <UsersManagementContent />
    </Suspense>
  );
}
