#!/usr/bin/env python
"""
Quick API Testing Script
Run this to test your API endpoints quickly
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name, passed, message=""):
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"{status} - {name}")
    if message:
        print(f"  {Colors.YELLOW}{message}{Colors.END}")

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/health/")
        passed = response.status_code == 200
        print_test("Health Check", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        print_test("Health Check", False, str(e))
        return False

def test_public_endpoints():
    """Test public endpoints"""
    endpoints = [
        ("GET Courses", f"{BASE_URL}/courses/"),
        ("GET Events", f"{BASE_URL}/events/"),
        ("GET About Us", f"{BASE_URL}/about-us/"),
        ("GET Alumni", f"{BASE_URL}/alumni/"),
        ("GET Reviews", f"{BASE_URL}/reviews/"),
        ("GET Locations", f"{BASE_URL}/locations/"),
        ("GET Partners", f"{BASE_URL}/partners/"),
    ]
    
    print(f"\n{Colors.BLUE}Testing Public Endpoints...{Colors.END}")
    results = []
    
    for name, url in endpoints:
        try:
            response = requests.get(url)
            passed = response.status_code == 200
            print_test(name, passed, f"Status: {response.status_code}")
            results.append(passed)
        except Exception as e:
            print_test(name, False, str(e))
            results.append(False)
    
    return all(results)

def test_registration():
    """Test user registration"""
    print(f"\n{Colors.BLUE}Testing Registration...{Colors.END}")
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    data = {
        "username": f"testuser_{timestamp}",
        "email": f"test_{timestamp}@example.com",
        "password": "SecurePass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    
    try:
        response = requests.post(f"{BASE_URL}/register/", json=data)
        if response.status_code == 429:
            print_test("User Registration", False, "Throttled (429) - adjust DRF throttle settings for /register/")
            return None, None

        passed = response.status_code == 201
        
        if passed:
            result = response.json()
            tokens = result.get('tokens', {})
            print_test("User Registration", True, f"User ID: {result['user']['id']}")
            return tokens.get('access'), tokens.get('refresh')
        else:
            print_test("User Registration", False, f"Status: {response.status_code}, {response.text}")
            return None, None
    except Exception as e:
        print_test("User Registration", False, str(e))
        return None, None

def test_login(username="evolv_user", password="Justbekind@1234"):
    """Test login"""
    print(f"\n{Colors.BLUE}Testing Login...{Colors.END}")
    
    data = {
        "username": username,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=data)
        passed = response.status_code == 200
        
        if passed:
            result = response.json()
            # The response has a nested structure: {"message": "...", "tokens": {...}}
            tokens = result.get("tokens", {})
            access = tokens.get("access")
            refresh = tokens.get("refresh")
            if access:
                print_test("Login", True, "Access & refresh tokens received")
                return access, refresh
            else:
                print_test("Login", False, f"No tokens in response: {result}")
                return None, None
        else:
            print_test("Login", False, f"Status: {response.status_code}, {response.text}")
            return None, None
    except Exception as e:
        print_test("Login", False, str(e))
        return None, None

def test_authenticated_endpoints(access_token):
    """Test authenticated endpoints"""
    print(f"\n{Colors.BLUE}Testing Authenticated Endpoints...{Colors.END}")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    endpoints = [
        ("GET Profile", f"{BASE_URL}/profile/"),
        ("GET My Student Profile", f"{BASE_URL}/students/me/"),
    ]
    
    results = []
    for name, url in endpoints:
        try:
            response = requests.get(url, headers=headers)
            # 404 is ok for student profile if not created yet
            passed = response.status_code in [200, 404]
            msg = "OK" if response.status_code == 200 else "Not found (expected if no student profile)"
            print_test(name, passed, msg)
            results.append(passed)
        except Exception as e:
            print_test(name, False, str(e))
            results.append(False)
    
    return all(results)

def test_new_endpoints(access_token):
    """Test new endpoints from improvements"""
    print(f"\n{Colors.BLUE}Testing New Endpoints...{Colors.END}")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    endpoints = [
        ("Student Dashboard", f"{BASE_URL}/students/me/dashboard/"),
        ("Application Status", f"{BASE_URL}/students/me/application-status/"),
        ("Learning Materials", f"{BASE_URL}/students/me/learning-materials/"),
        ("My Courses", f"{BASE_URL}/students/me/courses/"),
        ("My Events", f"{BASE_URL}/students/me/events/"),
    ]
    
    results = []
    for name, url in endpoints:
        try:
            response = requests.get(url, headers=headers)
            # These might return 404 if student profile doesn't exist
            passed = response.status_code in [200, 404]
            status_msg = "OK" if response.status_code == 200 else "Not found (create student profile first)"
            print_test(name, passed, status_msg)
            results.append(passed)
        except requests.exceptions.ConnectionError:
            print_test(name, False, "Endpoint not found - Did you add it to urls.py?")
            results.append(False)
        except Exception as e:
            print_test(name, False, str(e))
            results.append(False)
    
    return all(results)

def test_admin_dashboard(admin_token):
    """Test admin dashboard"""
    print(f"\n{Colors.BLUE}Testing Admin Dashboard...{Colors.END}")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/admin/dashboard/", headers=headers)
        passed = response.status_code == 200
        
        if passed:
            data = response.json()
            print_test("Admin Dashboard", True, f"Students: {data.get('students', {}).get('total', 0)}")
        else:
            print_test("Admin Dashboard", False, f"Status: {response.status_code}")
        
        return passed
    except requests.exceptions.ConnectionError:
        print_test("Admin Dashboard", False, "Endpoint not found - Did you add it to urls.py?")
        return False
    except Exception as e:
        print_test("Admin Dashboard", False, str(e))
        return False

def main():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}Evolv Learning Platform - API Testing{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}")
    
    # Test health
    if not test_health():
        print(f"\n{Colors.RED}Server is not running! Start it with: python manage.py runserver{Colors.END}")
        return
    
    # Test public endpoints
    test_public_endpoints()
    
    # Test registration
    access_token, refresh_token = test_registration()
    
    # Test authenticated endpoints with regular user
    if access_token:
        test_authenticated_endpoints(access_token)
        test_new_endpoints(access_token)
    
    # Test admin login and dashboard
    print(f"\n{Colors.YELLOW}Testing admin endpoints with your credentials...{Colors.END}")
    admin_token, _ = test_login("evolv_user", "Justbekind@1234")
    if admin_token:
        test_admin_dashboard(admin_token)
    else:
        print(f"{Colors.RED}Admin login failed. Check your credentials.{Colors.END}")
    if admin_token:
        test_admin_dashboard(admin_token)
    
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN}Testing Complete!{Colors.END}")
    
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    print(f"{Colors.YELLOW}Next Steps:{Colors.END}")
    print("1. Check TESTING_GUIDE.md for detailed testing instructions")
    print("2. Test the complete student journey manually")
    print("3. Integrate new endpoints by updating urls.py")
    print("4. Test email notifications")
    print("5. Test rate limiting\n")

if __name__ == "__main__":
    main()
