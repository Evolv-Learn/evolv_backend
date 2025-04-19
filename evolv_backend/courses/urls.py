from django.urls import path
from .views import (
    ProfileDetailView,
    LocationListCreateView,
    LocationDetailView,
    PartnerListCreateView,
    PartnerDetailView,
    CourseListCreateView,
    CourseDetailView,
    StudentListCreateView,
    StudentDetailView,
    ContactUsListCreateView,
    AlumniListCreateView,
    AlumniDetailView,
    EventListCreateView,
    EventDetailView,
    AboutUsListCreateView,
    TeamMemberListCreateView,
    ReviewListCreateView,
    LearningScheduleListCreateView,
    ModuleListCreateView,
    LessonListCreateView,
    RegisterUserView,
    UserDeleteView,
    UserProfileUpdateView,
    AboutUsDetailView,
    TeamMemberDetailView,
    ReviewDetailView,
    LearningScheduleDetailView,
    ModuleDetailView,
    LessonDetailView,
    ContactUsDetailView
)


urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("delete-account/", UserDeleteView.as_view(), name="delete-account"),
    path("profile/", ProfileDetailView.as_view(), name="profile-detail"),
    path("profile/update/", UserProfileUpdateView.as_view(), name="profile-update"),
    path("locations/", LocationListCreateView.as_view(), name="location-list"),
    path("locations/<int:pk>/", LocationDetailView.as_view(), name="location-detail"),
    path("partners/", PartnerListCreateView.as_view(), name="partner-list"),
    path("partners/<int:pk>/", PartnerDetailView.as_view(), name="partner-detail"),
    path("courses/", CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("alumni/", AlumniListCreateView.as_view(), name="alumni-list"),
    path("alumni/<int:pk>/", AlumniDetailView.as_view(), name="alumni-detail"),
    path("events/", EventListCreateView.as_view(), name="event-list"),
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("about-us/", AboutUsListCreateView.as_view(), name="about-us"),
    path("about-us/<int:pk>/", AboutUsDetailView.as_view(), name="about-us-detail"),
    path("team-members/", TeamMemberListCreateView.as_view(), name="team-members"),
    path(
        "team-members/<int:pk>/",
        TeamMemberDetailView.as_view(),
        name="teammember-detail",
    ),

    path("reviews/", ReviewListCreateView.as_view(), name="reviews"),
    path("reviews/<int:pk>/", ReviewDetailView.as_view(), name="review-detail"),

    path("schedules/", LearningScheduleListCreateView.as_view(), name="schedules"),
    path("schedules/<int:pk>/", LearningScheduleDetailView.as_view(), name="schedule-detail"),

    path("modules/", ModuleListCreateView.as_view(), name="modules"),
    path("modules/<int:pk>/", ModuleDetailView.as_view(), name="module-detail"),


    path("contact/", ContactUsListCreateView.as_view(), name="contact-us"),
    path("contact/<int:pk>/", ContactUsDetailView.as_view(), name="contact-detail"),
  
    path("lessons/", LessonListCreateView.as_view(), name="lessons"),
    path("lessons/<int:pk>/", LessonDetailView.as_view(), name="lesson-detail"),

    path("students/", StudentListCreateView.as_view(), name="student-list-create"),
    path("students/<int:pk>/", StudentDetailView.as_view(), name="student-detail")
]
