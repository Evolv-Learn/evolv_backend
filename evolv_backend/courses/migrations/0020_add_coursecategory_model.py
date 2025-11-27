# Step 1: Add CourseCategory model and create default categories

from django.db import migrations, models
import django.db.models.deletion


def create_default_categories(apps, schema_editor):
    """Create default categories"""
    CourseCategory = apps.get_model('courses', 'CourseCategory')
    
    categories = [
        {
            'name': 'Data & AI',
            'description': 'Data Science and Artificial Intelligence courses',
            'icon': '📊',
            'color': 'bg-primary-gold',
            'order': 1,
            'is_active': True
        },
        {
            'name': 'Cybersecurity',
            'description': 'Cybersecurity and Information Security courses',
            'icon': '🔒',
            'color': 'bg-igbo-red',
            'order': 2,
            'is_active': True
        },
        {
            'name': 'Microsoft Dynamics 365',
            'description': 'Business applications and ERP systems',
            'icon': '💼',
            'color': 'bg-hausa-indigo',
            'order': 3,
            'is_active': True
        },
    ]
    
    for cat_data in categories:
        CourseCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )


def reverse_categories(apps, schema_editor):
    """Remove categories"""
    CourseCategory = apps.get_model('courses', 'CourseCategory')
    CourseCategory.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0018_alter_coursematerial_options_and_more'),
    ]

    operations = [
        # Create CourseCategory model
        migrations.CreateModel(
            name='CourseCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('icon', models.CharField(blank=True, help_text='Emoji icon for the category', max_length=10, null=True)),
                ('color', models.CharField(blank=True, help_text='CSS color class (e.g., bg-primary-gold)', max_length=50, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('order', models.IntegerField(default=0, help_text='Display order')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Course Categories',
                'ordering': ['order', 'name'],
            },
        ),
        # Create default categories
        migrations.RunPython(create_default_categories, reverse_categories),
    ]
