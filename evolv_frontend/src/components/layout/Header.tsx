'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/lib/api/client';

interface Category {
  id: number;
  name: string;
  icon: string;
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { isAuthenticated, user, logout } = useAuthStore();
  
  // Use refs to track if we've already fetched to prevent loops
  const userRoleFetched = useRef(false);
  const categoriesFetched = useRef(false);

  useEffect(() => {
    // Only fetch if authenticated and haven't fetched yet
    if (!isAuthenticated) {
      setUserRole(null);
      return;
    }
    
    if (userRoleFetched.current) return;
    
    userRoleFetched.current = true;
    
    const fetchUserRole = async () => {
      try {
        const response = await apiClient.get('/profile/');
        setUserRole(response.data.role);
      } catch (error) {
        // Silently fail - user might not be authenticated
        console.error('Failed to fetch user role');
      }
    };

    fetchUserRole();
  }, [isAuthenticated]);

  useEffect(() => {
    if (categoriesFetched.current) return;
    
    categoriesFetched.current = true;
    
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/?is_active=true`);
        const data = await response.json();
        setCategories((data.results || data).slice(0, 8)); // Limit to 8 categories
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []); // Only fetch categories once on mount

  const isAdmin = userRole === 'Admin' || user?.role === 'Admin';

  const navigation = [
    { name: 'Home', href: '/' },
    { 
      name: 'About Us', 
      href: '#',
      dropdown: [
        { name: 'About Us', href: '/about' },
        { name: 'Values', href: '/about/values' },
        { name: 'Impacts', href: '/about/impacts' },
      ]
    },
    { 
      name: 'Training', 
      href: '/courses',
      dropdown: categories.length > 0 ? [
        { name: 'All Courses', href: '/courses' },
        ...categories.map(cat => ({
          name: cat.name,
          href: `/courses?category=${encodeURIComponent(cat.name)}`
        }))
      ] : undefined
    },
    { name: 'Events', href: '/events' },
    { 
      name: 'Companies', 
      href: '#',
      dropdown: [
        { name: 'Become Partner', href: '/companies/partner' },
        { name: 'Train Staff', href: '/companies/train-staff' },
        { name: 'Hire Talents', href: '/companies/hire-talents' },
        { name: 'Event', href: '/companies/events' },
        { name: 'Sponsorship', href: '/companies/sponsorship' },
      ]
    },
  ];

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="kente-strip"></div>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-gold rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
            <span className="text-2xl font-heading font-bold text-secondary-blue">
              Evolv
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 ml-12">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.dropdown ? (
                  <div className="relative">
                    <button
                      onMouseEnter={() => setOpenDropdown(item.name)}
                      className="text-gray-700 hover:text-primary-gold transition-colors font-medium flex items-center gap-1 py-2"
                    >
                      {item.name}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === item.name && (
                      <div 
                        className="absolute top-full left-0 pt-2 z-50"
                        onMouseEnter={() => setOpenDropdown(item.name)}
                        onMouseLeave={closeDropdown}
                      >
                        <div className="w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 overflow-hidden max-h-96 overflow-y-auto">
                          {item.dropdown.map((subItem: any) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="block px-5 py-3 text-gray-700 hover:bg-primary-gold hover:text-white transition-colors text-sm font-medium"
                              onClick={closeDropdown}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-primary-gold transition-colors font-medium py-2"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    My Account
                  </Button>
                </Link>
                {/* Only show Applications for Admins */}
                {isAdmin && (
                  <Link href="/admin/applications">
                    <Button variant="outline" size="sm">
                      Applications
                    </Button>
                  </Link>
                )}
                <Button variant="secondary" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="text-gray-700 hover:text-primary-gold transition-colors font-medium flex items-center justify-between w-full"
                      >
                        {item.name}
                        <svg 
                          className={`w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openDropdown === item.name && (
                        <div className="ml-4 mt-2 flex flex-col gap-2 max-h-64 overflow-y-auto">
                          {item.dropdown.map((subItem: any) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="text-gray-600 hover:text-primary-gold transition-colors py-1"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-700 hover:text-primary-gold transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">
                        My Account
                      </Button>
                    </Link>
                    {/* Only show Applications for Admins */}
                    {isAdmin && (
                      <Link href="/admin/applications">
                        <Button variant="outline" size="sm" className="w-full">
                          Applications
                        </Button>
                      </Link>
                    )}
                    <Button variant="secondary" size="sm" onClick={logout} className="w-full">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="primary" size="sm" className="w-full">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
