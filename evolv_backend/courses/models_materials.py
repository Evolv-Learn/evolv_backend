from django.db import models
from django.conf import settings
from .models import Course


class CourseMaterial(models.Model):
    """Model for storing multiple course materials (videos, PDFs, etc.)"""
    
    MATERIAL_TYPE_CHOICES = [
        ('video', 'Video'),
        ('document', 'Document'),
        ('spreadsheet', 'Spreadsheet'),
        ('archive', 'Archive'),
        ('other', 'Other'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=255, help_text="Material title/name")
    description = models.TextField(blank=True, null=True, help_text="Brief description")
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES, default='other')
    file = models.FileField(upload_to='course_materials/%Y/%m/', help_text="Upload file")
    file_size = models.BigIntegerField(blank=True, null=True, help_text="File size in bytes")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_materials')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Course Material'
        verbose_name_plural = 'Course Materials'
    
    def __str__(self):
        return f"{self.course.name} - {self.title}"
    
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
