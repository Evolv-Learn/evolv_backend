from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0015_add_lesson_progress_live_session_assignment'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                # 1. Add the correct category column (varchar) with a safe default
                "ALTER TABLE courses_course ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'Quantitative Methods';",

                # 2. Drop the stale FK column
                "ALTER TABLE courses_course DROP COLUMN IF EXISTS category_id;",

                # 3. Drop extra columns that are no longer in the model
                "ALTER TABLE courses_course DROP COLUMN IF EXISTS additional_materials;",
                "ALTER TABLE courses_course DROP COLUMN IF EXISTS discord_community;",
                "ALTER TABLE courses_course DROP COLUMN IF EXISTS github_repository;",
                "ALTER TABLE courses_course DROP COLUMN IF EXISTS video_content;",
            ],
            reverse_sql=[
                "ALTER TABLE courses_course DROP COLUMN IF EXISTS category;",
            ]
        ),
    ]
