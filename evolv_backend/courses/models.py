from django.db import models
from django.contrib.auth.models import User

# Create your models here.
LOCATION_TYPE_CHOICES = [
    ('Campus', 'Campus'),
    ('Online', 'Online'),
]

ONLINE_REGION_CHOICES = [
    ('Nigeria', 'Nigeria'),
    ('United Kingdom', 'United Kingdom'),
    ('Europe', 'Europe'),
]

# Location Model
class Location(models.Model):
    name = models.CharField(max_length=255)  # e.g., "Lagos Campus", "Online - Nigeria"
    location_type = models.CharField(max_length=10, choices=LOCATION_TYPE_CHOICES)
    online_region = models.CharField(max_length=20, choices=ONLINE_REGION_CHOICES, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.location_type})"



# Course Model
class Course(models.Model):
    CATEGORY_CHOICES = [
        ('Data & AI', 'Data & AI'),
        ('Cybersecurity', 'Cybersecurity'),
        ('Microsoft Dynamics 365','Microsoft Dynamics 365')
    ]
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE, related_name="subcourses"
    )  # Self-referencing field to create hierarchy
    description = models.TextField()
    software_tools = models.TextField(help_text="List of software and languages covered")
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
    locations = models.ManyToManyField(Location, related_name='courses')  # A course can be offered at multiple locations
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
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="alumni")

    def __str__(self):
        return self.user.username



# Event Model (Linked to Location)
class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
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
    about_us = models.ForeignKey(AboutUs, on_delete=models.CASCADE, related_name="team_members")
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    image = models.ImageField(upload_to="team_images/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.role}"

# Core Values Model
class CoreValue(models.Model):
    about_us = models.ForeignKey(AboutUs, on_delete=models.CASCADE, related_name="values")
    title = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.title

# Reviews/Testimonials Model
class Review(models.Model):
    about_us = models.ForeignKey(AboutUs, on_delete=models.CASCADE, related_name="reviews")
    name = models.CharField(max_length=255)
    review_text = models.TextField()
    rating = models.IntegerField(default=5, help_text="Rating out of 5")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.name} - {self.rating}⭐"
    

# Learning Schedule Model
class LearningSchedule(models.Model):
    course = models.ForeignKey("Course", on_delete=models.CASCADE, related_name="schedules")
    start_date = models.DateField()
    end_date = models.DateField()
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="schedules")
    location = models.ForeignKey("Location", on_delete=models.CASCADE, related_name="schedules")
    
    def __str__(self):
        return f"{self.course.name} - {self.start_date} to {self.end_date}"

# Module Model (Course Breakdown)
class Module(models.Model):
    schedule = models.ForeignKey(LearningSchedule, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(help_text="Order of the module in the schedule")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.schedule.course.name} - {self.title}"

# Lesson Model (Individual Lessons)
class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    resources = models.URLField(blank=True, null=True, help_text="Link to additional learning resources")
    order = models.PositiveIntegerField(help_text="Order of the lesson in the module")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.module.title} - {self.title}"
