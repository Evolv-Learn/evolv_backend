

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0009_alter_teammember_options'),
    ]

    operations = [
            migrations.AddField(
                model_name="teammember",
                name="core_values",
                field=models.ManyToManyField(
                    related_name="team_members",
                    to="courses.corevalue",
                ),
            ),
        ]