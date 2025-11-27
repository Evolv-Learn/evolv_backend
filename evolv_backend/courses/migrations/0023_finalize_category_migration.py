# Step 4: Remove old field and rename new field

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0022_migrate_category_data'),
    ]

    operations = [
        # Remove old category field
        migrations.RemoveField(
            model_name='course',
            name='category_old',
        ),
        # Rename category_new to category
        migrations.RenameField(
            model_name='course',
            old_name='category_new',
            new_name='category',
        ),
        # Make category field required (not null)
        migrations.AlterField(
            model_name='course',
            name='category',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='courses',
                to='courses.coursecategory',
                help_text='Course category'
            ),
        ),
    ]
