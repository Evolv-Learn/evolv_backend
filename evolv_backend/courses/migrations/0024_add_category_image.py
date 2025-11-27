# Add image field to CourseCategory

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0023_finalize_category_migration'),
    ]

    operations = [
        migrations.AddField(
            model_name='coursecategory',
            name='image',
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to='categories/',
                help_text='Category image/banner'
            ),
        ),
    ]
