from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0007_alter_aboutus_options_aboutus_image"),
    ]

    operations = [
        migrations.CreateModel(
            name="CoreValue",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField()),
                ("about_us", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="values",
                    to="courses.aboutus",
                )),
            ],
            options={"ordering": ["title"]},
        ),
        migrations.AddConstraint(
            model_name="corevalue",
            constraint=models.UniqueConstraint(
                fields=("about_us", "title"),
                name="unique_corevalue_title_per_aboutus",
            ),
        ),
    ]