# Step 3: Migrate data from old category field to new ForeignKey field

from django.db import migrations


def migrate_category_data(apps, schema_editor):
    """Convert old category strings to new CourseCategory foreign keys"""
    Course = apps.get_model('courses', 'Course')
    CourseCategory = apps.get_model('courses', 'CourseCategory')
    
    # Get category objects
    categories = {
        'Data & AI': CourseCategory.objects.get(name='Data & AI'),
        'Cybersecurity': CourseCategory.objects.get(name='Cybersecurity'),
        'Microsoft Dynamics 365': CourseCategory.objects.get(name='Microsoft Dynamics 365'),
    }
    
    # Update all courses
    for course in Course.objects.all():
        old_category = course.category_old
        if old_category in categories:
            course.category_new = categories[old_category]
            course.save(update_fields=['category_new'])
        else:
            # If category doesn't match, default to Data & AI
            print(f"Warning: Course '{course.name}' has unknown category '{old_category}', defaulting to 'Data & AI'")
            course.category_new = categories['Data & AI']
            course.save(update_fields=['category_new'])


def reverse_migration(apps, schema_editor):
    """Reverse the migration"""
    Course = apps.get_model('courses', 'Course')
    
    for course in Course.objects.all():
        if course.category_new:
            course.category_old = course.category_new.name
            course.save(update_fields=['category_old'])


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0021_add_temp_category_fk'),
    ]

    operations = [
        migrations.RunPython(migrate_category_data, reverse_migration),
    ]
