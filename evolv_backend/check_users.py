#!/usr/bin/env python
"""
Script to check and delete users by email
Usage: python manage.py shell < check_users.py
"""

from django.contrib.auth import get_user_model

User = get_user_model()

# List all users
print("\n=== All Users ===")
for user in User.objects.all():
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}")

# Check for specific email
email_to_check = input("\nEnter email to check (or press Enter to skip): ").strip()

if email_to_check:
    users = User.objects.filter(email__iexact=email_to_check)
    if users.exists():
        print(f"\n✓ Found {users.count()} user(s) with email: {email_to_check}")
        for user in users:
            print(f"  - ID: {user.id}, Username: {user.username}")
        
        delete = input("\nDelete these users? (yes/no): ").strip().lower()
        if delete == 'yes':
            count = users.count()
            users.delete()
            print(f"✓ Deleted {count} user(s)")
        else:
            print("Cancelled")
    else:
        print(f"✗ No users found with email: {email_to_check}")

print("\n=== Done ===")
