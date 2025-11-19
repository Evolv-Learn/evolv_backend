from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Student, Alumni, ContactUs

User = get_user_model()


class Command(BaseCommand):
    help = 'Clean up all records associated with an email address'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address to clean up')

    def handle(self, *args, **options):
        email = options['email']
        
        self.stdout.write(f"\n🔍 Searching for records with email: {email}\n")
        
        # Find and delete Users
        users = User.objects.filter(email__iexact=email)
        if users.exists():
            count = users.count()
            self.stdout.write(f"  Found {count} User(s)")
            users.delete()
            self.stdout.write(self.style.SUCCESS(f"  ✓ Deleted {count} User(s)"))
        else:
            self.stdout.write("  No Users found")
        
        # Find and delete Students
        students = Student.objects.filter(email__iexact=email)
        if students.exists():
            count = students.count()
            self.stdout.write(f"  Found {count} Student(s)")
            students.delete()
            self.stdout.write(self.style.SUCCESS(f"  ✓ Deleted {count} Student(s)"))
        else:
            self.stdout.write("  No Students found")
        
        # Find and delete Alumni
        alumni = Alumni.objects.filter(user__email__iexact=email)
        if alumni.exists():
            count = alumni.count()
            self.stdout.write(f"  Found {count} Alumni")
            alumni.delete()
            self.stdout.write(self.style.SUCCESS(f"  ✓ Deleted {count} Alumni"))
        else:
            self.stdout.write("  No Alumni found")
        
        # Find and delete ContactUs
        contacts = ContactUs.objects.filter(email__iexact=email)
        if contacts.exists():
            count = contacts.count()
            self.stdout.write(f"  Found {count} ContactUs record(s)")
            contacts.delete()
            self.stdout.write(self.style.SUCCESS(f"  ✓ Deleted {count} ContactUs record(s)"))
        else:
            self.stdout.write("  No ContactUs records found")
        
        self.stdout.write(self.style.SUCCESS(f"\n✅ Cleanup complete for: {email}\n"))
