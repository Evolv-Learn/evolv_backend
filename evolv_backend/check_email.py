#!/usr/bin/env python
"""
Quick script to check if an email exists in any table
Run: python manage.py shell < check_email.py
"""
import sys
import os
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evolv_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Student, ContactUs, Alumni

User = get_user_model()

email = 'masudowolabi@gmail.com'

print(f"\n🔍 Checking for email: {email}\n")

# Check User table
users = User.objects.filter(email__iexact=email)
print(f"Users table: {users.count()} record(s)")
for u in users:
    print(f"  - ID: {u.id}, Username: {u.username}, Email: {u.email}")

# Check Student table
students = Student.objects.filter(email__iexact=email)
print(f"\nStudents table: {students.count()} record(s)")
for s in students:
    print(f"  - ID: {s.id}, Name: {s.first_name} {s.last_name}, Email: {s.email}")

# Check ContactUs table
contacts = ContactUs.objects.filter(email__iexact=email)
print(f"\nContactUs table: {contacts.count()} record(s)")
for c in contacts:
    print(f"  - ID: {c.id}, Name: {c.name}, Email: {c.email}")

# Check Alumni table
alumni = Alumni.objects.filter(user__email__iexact=email)
print(f"\nAlumni table: {alumni.count()} record(s)")
for a in alumni:
    print(f"  - ID: {a.id}, User: {a.user.email if a.user else 'None'}")

print("\n✅ Check complete\n")
