from django.urls import path
from .views import (ProfileDetailView, LocationListCreateView, LocationDetailView,
                     PartnerListCreateView, PartnerDetailView, CourseListCreateView,
                    CourseDetailView, StudentListCreateView, StudentDetailView, 
                    StudentDetailView, SelectionProcedureDetailView, SelectionProcedureListCreateView, StudentSelectionListCreateView,
                    StudentSelectionDetailView, ContactUsCreateView, EventAttendanceListCreateView, EventAttendanceDetailView,
                    AlumniListCreateView, AlumniDetailView, EventListCreateView, EventDetailView,
                    AboutUsListCreateView, TeamMemberListCreateView, CoreValueListCreateView,
                    ReviewListCreateView, LearningScheduleListCreateView, ModuleListCreateView,
                    LessonListCreateView)


urlpatterns = [
    path("profile/", ProfileDetailView.as_view(), name="profile-detail"),

    path("locations/", LocationListCreateView.as_view(), name="location-list"),
    path("locations/<int:pk>/", LocationDetailView.as_view(), name="location-detail"),

    path("partners/", PartnerListCreateView.as_view(), name="partner-list"),
    path("partners/<int:pk>/", PartnerDetailView.as_view(), name="partner-detail"),
    
    path("courses/", CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),

    path("selection-procedures/", SelectionProcedureListCreateView.as_view(), name="selectionprocedure-list"),
    path("selection-procedures/<int:pk>/", SelectionProcedureDetailView.as_view(), name="selectionprocedure-detail"),

    path("student-selection/", StudentSelectionListCreateView.as_view(), name="studentselection-list"),
    path("student-selection/<int:pk>/", StudentSelectionDetailView.as_view(), name="studentselection-detail"),

    path("contact-us/", ContactUsCreateView.as_view(), name="contact-us"),
    path("event-attendance/", EventAttendanceListCreateView.as_view(), name="event-attendance-list"),
    path("event-attendance/<int:pk>/", EventAttendanceDetailView.as_view(), name="event-attendance-detail"),

    path("alumni/", AlumniListCreateView.as_view(), name="alumni-list"),
    path("alumni/<int:pk>/", AlumniDetailView.as_view(), name="alumni-detail"),

    path("events/", EventListCreateView.as_view(), name="event-list"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),

    path("about-us/", AboutUsListCreateView.as_view(), name="about-us"),
    path("team-members/", TeamMemberListCreateView.as_view(), name="team-members"),
    path("core-values/", CoreValueListCreateView.as_view(), name="core-values"),
    path("reviews/", ReviewListCreateView.as_view(), name="reviews"),

    path("schedules/", LearningScheduleListCreateView.as_view(), name="schedules"),
    path("modules/", ModuleListCreateView.as_view(), name="modules"),
    path("lessons/", LessonListCreateView.as_view(), name="lessons"),
]
