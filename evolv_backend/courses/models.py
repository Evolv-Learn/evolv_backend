from django.contrib.auth.models import User, AbstractUser, Group, Permission
from django.db import models
from django.conf import settings

from django.contrib.auth import get_user_model
from django_countries.fields import CountryField
from dateutil.relativedelta import relativedelta

from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, blank=True, null=True)
    email_verification_sent_at = models.DateTimeField(blank=True, null=True)
    
    groups = models.ManyToManyField(Group, related_name="customuser_groups", blank=True)
    user_permissions = models.ManyToManyField(
        Permission, related_name="customuser_permissions", blank=True
    )

    def __str__(self):
        return self.username


class Profile(models.Model):
    USER_ROLES = [
        ("Student", "Student"),
        ("Instructor", "Instructor"),
        ("Alumni", "Alumni"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    role = models.CharField(max_length=20, choices=USER_ROLES)
    profile_picture = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
        help_text="Profile picture"
    )
    title = models.CharField(max_length=200, blank=True, null=True, help_text="Professional title (e.g., Data Science Instructor)")
    bio = models.TextField(blank=True, null=True, help_text="Professional biography")
    email = models.EmailField(blank=True, null=True, help_text="Contact email")
    twitter_url = models.URLField(blank=True, null=True, help_text="Twitter/X profile URL")
    linkedin_url = models.URLField(blank=True, null=True, help_text="LinkedIn profile URL")

    def __str__(self):
        return f"{self.user.username} ({self.role})"


LOCATION_TYPE_CHOICES = [
    ("Campus", "Campus"),
    ("Online", "Online"),
]
ONLINE_REGION_CHOICES = [
    ("Nigeria", "Nigeria"),
    ("United Kingdom", "United Kingdom"),
    ("Europe", "Europe"),
]


class Location(models.Model):
    name = models.CharField(max_length=255, unique=True)
    location_type = models.CharField(max_length=10, choices=LOCATION_TYPE_CHOICES)
    online_region = models.CharField(
        max_length=20, choices=ONLINE_REGION_CHOICES, blank=True, null=True
    )
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.location_type})"


class Partner(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField()
    website = models.URLField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class CourseCategory(models.Model):
    """Course categories that can be managed by admins"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=10, blank=True, null=True, help_text="Emoji icon for the category")
    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True,
        help_text="Category image/banner"
    )
    color = models.CharField(max_length=50, blank=True, null=True, help_text="CSS color class (e.g., bg-primary-gold)")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = "Course Categories"
    
    def __str__(self):
        return self.name


class Course(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(
        CourseCategory,
        on_delete=models.PROTECT,
        related_name="courses",
        help_text="Course category"
    )
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="subcourses",
    )
    description = models.TextField()
    software_tools = models.TextField(
        help_text="List of software and languages covered"
    )
    topics_covered = models.TextField(
        help_text="Topics/content covered in this course",
        blank=True,
        null=True
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="courses",
    )
    locations = models.ManyToManyField(Location, related_name="courses")
    partners = models.ManyToManyField("Partner", related_name="courses")
    
    # Course timeline fields
    registration_deadline = models.DateField(null=True, blank=True, help_text="Last date to register")
    selection_date = models.DateField(null=True, blank=True, help_text="Date when selections are announced")
    start_date = models.DateField(null=True, blank=True, help_text="Training start date")
    end_date = models.DateField(null=True, blank=True, help_text="Training end date")
    
    # Learning materials
    github_repository = models.URLField(blank=True, null=True, help_text="GitHub repository URL")
    discord_community = models.URLField(blank=True, null=True, help_text="Discord community invite link")
    video_content = models.FileField(upload_to="course_videos/", blank=True, null=True, help_text="Course video file")
    additional_materials = models.FileField(upload_to="course_materials/", blank=True, null=True, help_text="Additional materials (PDF, CSV, etc.)")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def clean(self):
        from django.core.exceptions import ValidationError
        errors = {}
        
        # Validate date order: registration_deadline < selection_date < start_date < end_date
        if self.registration_deadline and self.selection_date:
            if self.registration_deadline >= self.selection_date:
                errors['selection_date'] = 'Selection date must be after registration deadline'
        
        if self.selection_date and self.start_date:
            if self.selection_date >= self.start_date:
                errors['start_date'] = 'Start date must be after selection date'
        
        if self.registration_deadline and self.start_date:
            if self.registration_deadline >= self.start_date:
                errors['start_date'] = 'Start date must be after registration deadline'
        
        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
                errors['end_date'] = 'End date must be after start date'
        
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} -> {self.name}"
        return self.name


class CourseMaterial(models.Model):
    """Model for storing multiple learning materials per course"""
    MATERIAL_TYPE_CHOICES = [
        ('video', 'Video'),
        ('document', 'Document'),
        ('spreadsheet', 'Spreadsheet'),
        ('archive', 'Archive'),
        ('other', 'Other'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=255, help_text="Material title/name")
    description = models.TextField(blank=True, null=True, help_text="Brief description of the material")
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES, default='other')
    file = models.FileField(upload_to='course_materials/%Y/%m/', help_text="Upload file (video, PDF, CSV, etc.)")
    file_size = models.BigIntegerField(blank=True, null=True, help_text="File size in bytes")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_materials')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
    
    @property
    def file_size_mb(self):
        """Return file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0
    
    def __str__(self):
        return f"{self.course.name} - {self.title}"
    
    def get_file_extension(self):
        import os
        return os.path.splitext(self.file.name)[1].lower()
    
    def get_file_size_display(self):
        """Return human-readable file size"""
        size = self.file_size or 0
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} TB"


class Alumni(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    graduation_year = models.IntegerField(
        validators=[MinValueValidator(1950), MaxValueValidator(date.today().year + 1)]
    )
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

    class Meta:
        ordering = ["-graduation_year", "user__username"]

    def __str__(self):
        return self.user.username


class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.ForeignKey(
        "Location",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="events",
    )
    course = models.ForeignKey(
        "Course", on_delete=models.SET_NULL, null=True, blank=True
    )
    partners = models.ManyToManyField("Partner", related_name="events", blank=True)
    is_virtual = models.BooleanField(default=False)
    image = models.ImageField(
        upload_to="events/",
        blank=True,
        null=True,
        help_text="Upload an image for the event (flyer, poster, banner)",
    )

    def __str__(self):
        return self.title


class AboutUs(models.Model):
    title = models.CharField(max_length=255, default="About EvolvLearn")
    description = models.TextField(help_text="Brief description about the organization")
    mission = models.TextField(blank=True, null=True)
    vision = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to="about/", blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class CoreValue(models.Model):
    about_us = models.ForeignKey(
        AboutUs, on_delete=models.CASCADE, related_name="values"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        ordering = ["title"]
        constraints = [
            models.UniqueConstraint(
                fields=["about_us", "title"],
                name="unique_corevalue_title_per_aboutus",
            )
        ]

    def __str__(self):
        return self.title


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


    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} - {self.role}"


class Review(models.Model):
    about_us = models.ForeignKey(
        AboutUs, on_delete=models.CASCADE, related_name="reviews", null=True, blank=True
    )
    name = models.CharField(max_length=255)
    review_text = models.TextField()
    course = models.ForeignKey(
        "Course",
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True,
    )
    alumni = models.ForeignKey(
        "Alumni",
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True,
    )
    rating = models.IntegerField(default=5, help_text="Rating out of 5")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.name} - {self.rating}⭐"


class LearningSchedule(models.Model):
    course = models.ForeignKey("Course", on_delete=models.CASCADE, related_name="schedules")
    start_date = models.DateField()
    end_date = models.DateField()
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="schedules",)
    location = models.ForeignKey("Location", on_delete=models.CASCADE, related_name="schedules")
    duration = models.IntegerField(blank=True, null=True) 

    def save(self, *args, **kwargs):
        if self.start_date and self.end_date:
            delta = relativedelta(self.end_date, self.start_date)
            self.duration = (delta.years * 12) + delta.months
        else:
            self.duration = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Schedule for {self.course.name} from {self.start_date} to {self.end_date}"


class Module(models.Model):
    schedule = models.ForeignKey(LearningSchedule, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(help_text="Order of the module in the schedule")

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.schedule.course.name} - {self.title}"


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
    GENDER_CHOICES = [("Male", "Male"), ("Female", "Female"), ("Other", "Other")]
    DIPLOMA_LEVEL_CHOICES = [("PhD", "PhD"),("Master", "Master"),("Bachelor", "Bachelor"),("Secondary School", "Secondary School"), ("No Option", "No Option")]
    ENGLISH_LEVEL_CHOICES = [(i, str(i)) for i in range(1, 6)]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student", null=True, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    birth_date = models.DateField()
    zip_code = models.CharField(max_length=20)
    country_of_birth = CountryField()
    nationality = CountryField()
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
    courses = models.ManyToManyField("Course", related_name="students")
    schedules = models.ManyToManyField("LearningSchedule", related_name="students")

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"


class CourseEnrollment(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Under Review", "Under Review"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ["student", "course"]
        ordering = ["-applied_at"]
    
    def __str__(self):
        return f"{self.student.first_name} - {self.course.name} ({self.status})"
    

class ContactUs(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    message = models.TextField()

    def __str__(self):
        return f"Message from {self.name} - {self.email}"


class SelectionProcedure(models.Model):
    step_name = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField()

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


class EventAttendance(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="attendances")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="event_attendances")
    attended = models.BooleanField(default=False)


