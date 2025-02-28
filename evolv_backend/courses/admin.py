from django.contrib import admin
from .models import Course, Location, Alumni, Event, AboutUs, TeamMember, CoreValue, Review, LearningSchedule
from .models import Module, Lesson, Student, ContactUs, Partner, SelectionProcedure, StudentSelection, Profile, EventAttendance

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'diploma_level', 'nationality', 'has_laptop')
    list_filter = ('diploma_level', 'nationality')


@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'message')


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'website', 'contact_email')


@admin.register(SelectionProcedure)
class SelectionProcedureAdmin(admin.ModelAdmin):
    list_display = ('step_name', 'order')



# Register your models here.
admin.site.register(Location)
admin.site.register(Course)
admin.site.register(Alumni)
admin.site.register(Event)
admin.site.register(AboutUs)
admin.site.register(TeamMember)
admin.site.register(CoreValue)
admin.site.register(Review)
admin.site.register(LearningSchedule)
admin.site.register(Module)
admin.site.register(Lesson)
admin.site.register(StudentSelection)
admin.site.register(EventAttendance)
admin.site.register(Profile)