from django.db import models
from django.contrib.auth.models import User
from django_countries.fields import CountryField
from dateutil.relativedelta import relativedelta


class Profile(models.Model):
    USER_ROLES = [
        ("Student", "Student"),
        ("Instructor", "Instructor"),
        ("Alumni", "Alumni"),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=USER_ROLES)


# Create your models here.
LOCATION_TYPE_CHOICES = [
    ("Campus", "Campus"),
    ("Online", "Online"),
]

ONLINE_REGION_CHOICES = [
    ("Nigeria", "Nigeria"),
    ("United Kingdom", "United Kingdom"),
    ("Europe", "Europe"),
]


# Location Model
class Location(models.Model):
    name = models.CharField(max_length=255)  # e.g., "Lagos Campus", "Online - Nigeria"
    location_type = models.CharField(max_length=10, choices=LOCATION_TYPE_CHOICES)
    online_region = models.CharField(
        max_length=20, choices=ONLINE_REGION_CHOICES, blank=True, null=True
    )
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.location_type})"


# Course Model
class Course(models.Model):
    CATEGORY_CHOICES = [
        ("Data & AI", "Data & AI"),
        ("Cybersecurity", "Cybersecurity"),
        ("Microsoft Dynamics 365", "Microsoft Dynamics 365"),
    ]
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="subcourses",
    )  # Self-referencing field to create hierarchy
    description = models.TextField()
    software_tools = models.TextField(
        help_text="List of software and languages covered"
    )
    instructor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="courses"
    )
    locations = models.ManyToManyField(
        Location, related_name="courses"
    )  # A course can be offered at multiple locations
    partners = models.ManyToManyField("Partner", related_name="courses")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} -> {self.name}"  # Display as hierarchy
        return self.name


# Alumni Model (Linked to Location)
class Alumni(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    graduation_year = models.IntegerField()
    current_position = models.CharField(max_length=255)
    success_story = models.TextField()
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="alumni", null=True, blank=True
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alumni",
    )

    def __str__(self):
        return self.user.username


# Event Model (Linked to Location)
class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )
    course = models.ForeignKey("Course", on_delete=models.SET_NULL, null=True)
    partners = models.ManyToManyField("Partner", related_name="events")
    is_virtual = models.BooleanField(default=False)

    def __str__(self):
        return self.title


# About Us Model
class AboutUs(models.Model):
    title = models.CharField(max_length=255, default="About EvolvLearn")
    description = models.TextField(help_text="Brief description about the organization")
    mission = models.TextField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# Team Members Model
class TeamMember(models.Model):
    about_us = models.ForeignKey(
        AboutUs, on_delete=models.CASCADE, related_name="team_members"
    )
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    image = models.ImageField(upload_to="team_images/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    core_values = models.ManyToManyField("CoreValue", related_name="team_members")

    def __str__(self):
        return f"{self.name} - {self.role}"


# Core Values Model
class CoreValue(models.Model):
    about_us = models.ForeignKey(
        AboutUs, on_delete=models.CASCADE, related_name="values"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.title


# Reviews/Testimonials Model
class Review(models.Model):
    about_us = models.ForeignKey(
        AboutUs, on_delete=models.CASCADE, related_name="reviews", null=True, blank=True
    )
    name = models.CharField(max_length=255)
    review_text = models.TextField()
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="reviews", null=True, blank=True
    )
    alumni = models.ForeignKey(
        "Alumni", on_delete=models.CASCADE, related_name="reviews", null=True, blank=True
    )
    rating = models.IntegerField(default=5, help_text="Rating out of 5")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.name} - {self.rating}⭐"


# Learning Schedule Model
class LearningSchedule(models.Model):
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, related_name="schedules"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    instructor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="schedules"
    )
    location = models.ForeignKey(
        "Location", on_delete=models.CASCADE, related_name="schedules"
    )
    duration = models.IntegerField(
        blank=True, null=True
    )  # Duration in months (optional field)

    def save(self, *args, **kwargs):
        # Automatically calculate the duration in months when saving
        if self.start_date and self.end_date:
            # Calculate the difference using relativedelta
            delta = relativedelta(self.end_date, self.start_date)
            # The duration is calculated as the number of full months
            self.duration = (delta.years * 12) + delta.months
        super(LearningSchedule, self).save(*args, **kwargs)

    def __str__(self):
        return (
            f"Schedule for {self.course.name} from {self.start_date} to {self.end_date}"
        )


# Module Model (Course Breakdown)
class Module(models.Model):
    schedule = models.ForeignKey(
        LearningSchedule, on_delete=models.CASCADE, related_name="modules"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(help_text="Order of the module in the schedule")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.schedule.course.name} - {self.title}"


# Lesson Model (Individual Lessons)
class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    resources = models.URLField(
        blank=True, null=True, help_text="Link to additional learning resources"
    )
    order = models.PositiveIntegerField(help_text="Order of the lesson in the module")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.module.title} - {self.title}"


class Student(models.Model):
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    DIPLOMA_LEVEL_CHOICES = [
        ("PhD", "PhD"),
        ("Master", "Master"),
        ("Bachelor", "Bachelor"),
        ("Secondary School", "Secondary School"),
        ("No Option", "No Option"),
    ]

    ENGLISH_LEVEL_CHOICES = [(i, str(i)) for i in range(1, 6)]  # Levels 1-5

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    birth_date = models.DateField()
    zip_code = models.CharField(max_length=20)
    country_of_birth = CountryField()  # Dropdown with all countries
    nationality = CountryField()  # Dropdown with all countries
    register_number = models.CharField(max_length=50, blank=True, null=True)
    diploma_level = models.CharField(max_length=20, choices=DIPLOMA_LEVEL_CHOICES)
    job_status = models.CharField(max_length=50)
    motivation = models.TextField()
    future_goals = models.TextField()
    proudest_moment = models.TextField()
    english_level = models.IntegerField(choices=ENGLISH_LEVEL_CHOICES)
    how_heard = models.CharField(max_length=100)
    referral_person = models.CharField(max_length=100, blank=True, null=True)
    has_laptop = models.BooleanField()
    courses = models.ManyToManyField(
        "Course", related_name="students"
    )  # Track course enrollment
    schedules = models.ManyToManyField(
        "LearningSchedule", related_name="students"
    )  # Track specific schedule enrollment

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"


# Partners model
class Partner(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    website = models.URLField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return self.name


# Selection Procedure model
class SelectionProcedure(models.Model):
    step_name = models.CharField(max_length=200)
    description = models.TextField()
    order = (
        models.PositiveIntegerField()
    )  # To define the order of steps in the procedure

    def __str__(self):
        return self.step_name


class StudentSelection(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="selection_steps"
    )
    step = models.ForeignKey(SelectionProcedure, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=50, choices=[("Pending", "Pending"), ("Completed", "Completed")]
    )
    updated_at = models.DateTimeField(auto_now=True)


class ContactUs(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)  # Email is required and must be unique
    message = models.TextField()

    def __str__(self):
        return f"Message from {self.name} - {self.email}"


class EventAttendance(models.Model):
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="attendances"
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="event_attendances"
    )
    attended = models.BooleanField(default=False)
