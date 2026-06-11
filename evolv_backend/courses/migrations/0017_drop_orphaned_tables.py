from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0016_fix_course_category_column'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                # Drop orphaned tables from old backup that are no longer in the model
                "DROP TABLE IF EXISTS courses_coursematerial CASCADE;",
                "DROP TABLE IF EXISTS courses_category CASCADE;",
            ],
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
