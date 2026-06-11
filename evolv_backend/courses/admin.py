from django.contrib import admin
from .models import (
    CourseCategory,
    Course,
    Location,
    Alumni,
    Event,
    AboutUs,
    TeamMember,
    CoreValue,
    Review,
    LearningSchedule,
)
from .models import (
    Module,
    Lesson,
    Student,
    CourseEnrollment,
    ContactUs,
    Partner,
    SelectionProcedure,
    StudentSelection,
    Profile,
    EventAttendance,
    LessonProgress,
    LiveSession,
    Assignment,
)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "email",
        "diploma_level",
        "nationality",
        "has_laptop",
    )
    list_filter = ("diploma_level", "nationality")


@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "message")


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ("name", "website", "contact_email")


@admin.register(SelectionProcedure)
class SelectionProcedureAdmin(admin.ModelAdmin):
    list_display = ("step_name", "order")


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "status", "applied_at", "updated_at")
    list_filter = ("status", "course", "applied_at")
    search_fields = ("student__first_name", "student__last_name", "student__email", "course__name")
    list_editable = ("status",)
    ordering = ("-applied_at",)


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "icon", "color", "is_active", "order", "course_count")
    list_filter = ("is_active",)
    search_fields = ("name", "description")
    list_editable = ("is_active", "order")
    ordering = ("order", "name")
    
    def course_count(self, obj):
        return obj.courses.count()
    course_count.short_description = "Courses"


admin.site.register(Location)
admin.site.register(Alumni)
admin.site.register(Event)
admin.site.register(AboutUs)
admin.site.register(CoreValue)
admin.site.register(TeamMember)
admin.site.register(Review)
admin.site.register(StudentSelection)
admin.site.register(EventAttendance)
admin.site.register(Profile)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "instructor", "registration_deadline", "start_date", "end_date")
    list_filter = ("category",)
    search_fields = ("name",)


@admin.register(LearningSchedule)
class LearningScheduleAdmin(admin.ModelAdmin):
    list_display = ("course", "location", "instructor", "start_date", "end_date", "duration")
    list_filter = ("course",)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("title", "schedule", "order")
    list_filter = ("schedule__course",)
    ordering = ("schedule", "order")


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "module", "order")
    list_filter = ("module__schedule__course",)
    ordering = ("module", "order")


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ("title", "schedule", "module", "session_date", "recording_url")
    list_filter = ("schedule__course",)
    ordering = ("session_date",)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("student", "module", "status", "submitted_at", "updated_at")
    list_filter = ("status", "module__schedule__course")
    search_fields = ("student__first_name", "student__last_name", "student__email")
    list_editable = ("status",)
    readonly_fields = ("submitted_at", "updated_at")
    ordering = ("-submitted_at",)


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ("student", "lesson", "completed_at")
    list_filter = ("lesson__module__schedule__course",)
    search_fields = ("student__first_name", "student__last_name")
