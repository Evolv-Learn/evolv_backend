from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0037_software_tools_optional"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="meeting_link",
            field=models.URLField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name="EventRegistration",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("full_name", models.CharField(max_length=255)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(blank=True, max_length=50)),
                ("organization", models.CharField(blank=True, max_length=255)),
                ("how_heard", models.CharField(blank=True, max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("reminder_sent_at", models.DateTimeField(blank=True, null=True)),
                ("event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="registrations", to="courses.event")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="eventregistration",
            constraint=models.UniqueConstraint(fields=("event", "email"), name="unique_event_registration_email"),
        ),
    ]