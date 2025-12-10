from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from django.conf import settings
from django.conf.urls.static import static



from .views import (
    ProfileDetailView,
    PublicInstructorListView,
    PublicInstructorProfileView,
    LocationListCreateView,
    LocationDetailView,
    PartnerListCreateView,
    PartnerDetailView,
    CourseCategoryListCreateView,
    CourseCategoryDetailView,
    CourseListCreateView,
    CourseDetailView,
    CourseMaterialListCreateView,
    CourseMaterialDetailView,
    StudentListCreateView,
    TeamMemberDetailView,
    StudentDetailView,
    CourseEnrollmentListView,
    CourseEnrollmentDetailView,
    SelectionProcedureDetailView,
    SelectionProcedureListCreateView,
    StudentSelectionListCreateView,
    StudentSelectionDetailView,
    ContactUsCreateView,
    EventAttendanceListCreateView,
    EventAttendanceDetailView,
    AlumniListCreateView,
    AlumniDetailView,
    EventListCreateView,
    EventDetailView,
    event_calendar,
    verify_email,
    resend_verification,
    AboutUsDetailView,
    TeamMemberListCreateView,
    CoreValueListCreateView,
    CoreValueDetailView,
    ReviewListCreateView,
    ReviewDetailView,
    LearningScheduleListCreateView,
    LearningScheduleDetailView,
    ModuleListCreateView,
    ModuleDetailView,
    LessonListCreateView,
    LessonDetailView,
    RegisterUserView,
    AdminProfileListView,
    AdminUserProfileDetailView, MyStudentView, health_check, current_user
)

from .views_extended import (
    StudentDashboardView,
    AdminDashboardView,
    StudentApplicationStatusView,
    EnrollScheduleView,
    LearningMaterialsView,
    my_courses,
    my_events,
)

app_name = "courses"

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("verify-email/", verify_email, name="verify-email"),
    path("resend-verification/", resend_verification, name="resend-verification"),
    path("profile/", ProfileDetailView.as_view(), name="profile-detail"),
    path("users/me/", current_user, name="current-user"),
    path("instructors/", PublicInstructorListView.as_view(), name="public-instructors-list"),
    path("instructors/<int:user_id>/profile/", PublicInstructorProfileView.as_view(), name="public-instructor-profile"),

    path("admin/profiles/", AdminProfileListView.as_view(), name="admin-profile-list"),
    path("admin/users/<int:user_id>/profile/", AdminUserProfileDetailView.as_view(), name="admin-user-profile-detail"),

    path("locations/", LocationListCreateView.as_view(), name="location-list"),
    path("locations/<int:pk>/", LocationDetailView.as_view(), name="location-detail"),

    path("partners/", PartnerListCreateView.as_view(), name="partner-list"),
    path("partners/<int:pk>/", PartnerDetailView.as_view(), name="partner-detail"),

    path("categories/", CourseCategoryListCreateView.as_view(), name="category-list"),
    path("categories/<int:pk>/", CourseCategoryDetailView.as_view(), name="category-detail"),

    path("courses/", CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("courses/<int:course_id>/materials/", CourseMaterialListCreateView.as_view(), name="course-materials-list"),
    path("course-materials/<int:pk>/", CourseMaterialDetailView.as_view(), name="course-material-detail"),

    path("selection-procedures/", SelectionProcedureListCreateView.as_view(), name="selectionprocedure-list"),
    path("selection-procedures/<int:pk>/", SelectionProcedureDetailView.as_view(), name="selectionprocedure-detail"),

    path("student-selection/", StudentSelectionListCreateView.as_view(),name="studentselection-list"),
    path( "student-selection/<int:pk>/", StudentSelectionDetailView.as_view(), name="studentselection-detail"),

    path("contact-us/", ContactUsCreateView.as_view(), name="contact-us"),
    path("event-attendance/", EventAttendanceListCreateView.as_view(), name="event-attendance-list"),
    path("event-attendance/<int:pk>/", EventAttendanceDetailView.as_view(), name="event-attendance-detail"),

    path("alumni/", AlumniListCreateView.as_view(), name="alumni-list"),
    path("alumni/<int:pk>/", AlumniDetailView.as_view(), name="alumni-detail"),

    path("events/", EventListCreateView.as_view(), name="event-list"),
    path("events/calendar/", event_calendar, name="event-calendar"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),

    path("about-us/", AboutUsDetailView.as_view(), name="about-us"),
    path("team-members/", TeamMemberListCreateView.as_view(), name="team-members"),
    path("team-members/<int:pk>/", TeamMemberDetailView.as_view(), name="team-member-detail"),

    path("core-values/", CoreValueListCreateView.as_view(), name="core-values"),
    path("core-values/<int:pk>/", CoreValueDetailView.as_view(), name="core-value-detail"),

    path("reviews/", ReviewListCreateView.as_view(), name="review-list"),
    path("reviews/<int:pk>/", ReviewDetailView.as_view(), name="review-detail"),

    path("schedules/", LearningScheduleListCreateView.as_view(), name="schedules"),
    path("schedules/<int:pk>/", LearningScheduleDetailView.as_view(),name="schedule-detail"),

    path("modules/", ModuleListCreateView.as_view(), name="module-list"),
    path("modules/<int:pk>/", ModuleDetailView.as_view(), name="module-detail"),
    path("schedules/<int:schedule_id>/modules/",ModuleListCreateView.as_view(), name="schedule-modules"),

    path("lessons/", LessonListCreateView.as_view(), name="lesson-list"),
    path("lessons/<int:pk>/", LessonDetailView.as_view(), name="lesson-detail"),
    path("modules/<int:module_id>/lessons/", LessonListCreateView.as_view(),name="module-lessons"),

    path("students/", StudentListCreateView.as_view(), name="student-list"),
    path("students/<int:pk>/", StudentDetailView.as_view(), name="student-detail"),
    path("students/me/", MyStudentView.as_view(), name="student-me"),

    path("enrollments/", CourseEnrollmentListView.as_view(), name="enrollment-list"),
    path("enrollments/<int:pk>/", CourseEnrollmentDetailView.as_view(), name="enrollment-detail"),

    path("students/me/dashboard/", StudentDashboardView.as_view(), name="student-dashboard"),
    path("students/me/application-status/", StudentApplicationStatusView.as_view(), name="application-status"),
    path("students/me/enroll/<int:schedule_id>/", EnrollScheduleView.as_view(), name="enroll-schedule"),
    path("students/me/learning-materials/", LearningMaterialsView.as_view(), name="learning-materials"),
    path("students/me/courses/", my_courses, name="my-courses"),
    path("students/me/events/", my_events, name="my-events"),
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),

    path("health/", health_check, name="health-check"),
]

urlpatterns = format_suffix_patterns(urlpatterns)
