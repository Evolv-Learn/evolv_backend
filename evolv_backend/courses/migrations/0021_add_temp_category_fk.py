# Step 2: Add temporary category_new field as ForeignKey

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0020_add_coursecategory_model'),
    ]

    operations = [
        # Rename old category field to category_old
        migrations.RenameField(
            model_name='course',
            old_name='category',
            new_name='category_old',
        ),
        # Add new category field as ForeignKey (nullable for now)
        migrations.AddField(
            model_name='course',
            name='category_new',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='courses',
                to='courses.coursecategory',
                help_text='Course category'
            ),
        ),
    ]
