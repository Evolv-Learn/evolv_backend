from django.urls import path
from .views import ProfileDetailView, LocationListCreateView, LocationDetailView, PartnerListCreateView, PartnerDetailView, CourseListCreateView
from .views import CourseDetailView, StudentListCreateView, StudentDetailView


urlpatterns = [
    path("courses/profile/", ProfileDetailView.as_view(), name="profile-detail"),

    path("courses/locations/", LocationListCreateView.as_view(), name="location-list"),
    path("courses/locations/<int:pk>/", LocationDetailView.as_view(), name="location-detail"),

    path("partners/", PartnerListCreateView.as_view(), name="partner-list"),
    path("partners/<int:pk>/", PartnerDetailView.as_view(), name="partner-detail"),
    
    path("courses/", CourseListCreateView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
]
