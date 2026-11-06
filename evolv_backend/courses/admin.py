from django.contrib import admin
from .models import (
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
    EventRegistration,
    LessonProgress,
    LiveSession,
    Assignment,
    CoursePrice,
    Payment,
    DiscountCode,
    InstallmentPlan,
    InstallmentPayment,
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


admin.site.register(Location)
admin.site.register(Alumni)
admin.site.register(AboutUs)
admin.site.register(CoreValue)
admin.site.register(TeamMember)
admin.site.register(Review)
admin.site.register(StudentSelection)
admin.site.register(EventAttendance)
admin.site.register(Profile)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "is_virtual", "course", "registration_count")
    list_filter = ("is_virtual", "course", "date")
    search_fields = ("title", "description", "meeting_link")
    filter_horizontal = ("partners",)

    def registration_count(self, obj):
        return obj.registrations.count()


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "phone", "event", "created_at", "reminder_sent_at")
    list_filter = ("event", "created_at", "reminder_sent_at")
    search_fields = ("full_name", "email", "phone", "organization")
    readonly_fields = ("created_at", "reminder_sent_at")
    ordering = ("-created_at",)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "instructor", "registration_deadline", "start_date", "end_date", "installments_enabled")
    list_filter = ("category", "installments_enabled")
    list_editable = ("installments_enabled",)
    search_fields = ("name",)
    fieldsets = (
        (None, {
            'fields': ('name', 'category', 'parent', 'description', 'software_tools', 'topics_covered', 'instructor', 'locations', 'partners'),
        }),
        ('Timeline', {
            'fields': ('registration_deadline', 'selection_date', 'start_date', 'end_date'),
        }),
        ('Payment Options', {
            'fields': ('installments_enabled',),
            'description': 'Enable instalment payments (50/50 split) for this course cohort.',
        }),
    )


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


@admin.register(CoursePrice)
class CoursePriceAdmin(admin.ModelAdmin):
    list_display = ("course", "currency", "amount", "is_active")
    list_filter = ("currency", "is_active", "course")
    search_fields = ("course__name",)
    list_editable = ("amount", "is_active")
    ordering = ("course__name", "currency")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("enrollment", "currency", "amount", "processor", "status", "created_at", "paid_at")
    list_filter = ("status", "processor", "currency")
    search_fields = ("enrollment__student__first_name", "enrollment__student__last_name", "processor_reference")
    readonly_fields = ("created_at", "paid_at", "metadata")
    ordering = ("-created_at",)


@admin.register(DiscountCode)
class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "discount_value", "uses_count", "max_uses", "valid_until", "is_active")
    list_filter = ("discount_type", "is_active")
    search_fields = ("code",)
    list_editable = ("is_active",)
    filter_horizontal = ("courses",)
    readonly_fields = ("uses_count", "created_at")
    ordering = ("-created_at",)


class InstallmentPaymentInline(admin.TabularInline):
    model = InstallmentPayment
    extra = 0
    readonly_fields = ('installment_number', 'amount', 'currency', 'status', 'processor', 'processor_reference', 'due_date', 'paid_at', 'created_at')
    can_delete = False


@admin.register(InstallmentPlan)
class InstallmentPlanAdmin(admin.ModelAdmin):
    list_display = (
        'enrollment', 'currency', 'total_amount', 'status',
        'second_installment_deadline', 'grace_period_requested',
        'grace_period_approved', 'created_at',
    )
    list_filter = ('status', 'currency', 'grace_period_requested', 'grace_period_approved')
    search_fields = (
        'enrollment__student__first_name',
        'enrollment__student__last_name',
        'enrollment__student__email',
        'enrollment__course__name',
    )
    readonly_fields = (
        'created_at', 'updated_at', 'grace_period_requested_at',
        'grace_period_expires_at', 'grace_period_reviewed_at',
    )
    inlines = [InstallmentPaymentInline]
    ordering = ('-created_at',)

    fieldsets = (
        ('Plan Details', {
            'fields': ('enrollment', 'currency', 'total_amount', 'status', 'second_installment_deadline'),
        }),
        ('Grace Period', {
            'fields': (
                'grace_period_requested', 'grace_period_requested_at',
                'grace_period_expires_at', 'grace_period_evidence',
                'grace_period_approved', 'grace_period_reviewed_by', 'grace_period_reviewed_at',
            ),
        }),
        ('Reminders & Timestamps', {
            'fields': ('reminder_sent_at', 'created_at', 'updated_at'),
        }),
    )


@admin.register(InstallmentPayment)
class InstallmentPaymentAdmin(admin.ModelAdmin):
    list_display = (
        'plan', 'installment_number', 'currency', 'amount',
        'status', 'processor', 'due_date', 'paid_at',
    )
    list_filter = ('status', 'processor', 'currency', 'installment_number')
    search_fields = ('plan__enrollment__student__email', 'processor_reference')
    readonly_fields = ('created_at', 'paid_at', 'metadata')
    ordering = ('-created_at',)
