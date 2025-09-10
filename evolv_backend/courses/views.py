from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.exceptions import NotFound
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, permissions,status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import IsAdmin

from .models import (Profile, Location, Partner, Course, Student, SelectionProcedure, 
                    StudentSelection, ContactUs, EventAttendance, Alumni, Event, AboutUs, TeamMember,
                    CoreValue, Review, LearningSchedule, Module, Lesson) 
from .serializers import (ProfileSerializer, LocationSerializer, PartnerSerializer, ProfileSelfSerializer,
                        CourseSerializer, StudentSerializer, SelectionProcedureSerializer, 
                        StudentSelectionSerializer, ContactUsSerializer,EventAttendanceSerializer,
                        AlumniSerializer, EventSerializer, AboutUsSerializer, TeamMemberSerializer,
                        CoreValueSerializer, ReviewSerializer, LearningScheduleSerializer, 
                        ModuleSerializer, LessonSerializer, UserProfileCreateSerializer, RegisterUserSerializer, AdminProfileUpdateSerializer)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def secure_data(request):
    return Response({"message": "This is a protected API!"})


User = get_user_model()

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the profile of the logged-in user.
    """
    serializer_class = ProfileSelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class AdminProfileListView(generics.ListAPIView):
    """
    GET /api/v1/admin/profiles/
    Admin-only: list all profiles with filter/search/ordering + pagination
    """
    permission_classes = [IsAdmin]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.select_related("user").all()  

    # proper queryset:
    #def get_queryset(self):
    #    return Profile.objects.select_related("user").all()

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "user__is_active", "user__is_staff"]
    search_fields = ["user__username", "user__email", "user__first_name", "user__last_name", "role"]
    ordering_fields = ["user__username", "user__email", "user__date_joined", "role"]
    ordering = ["user__username"]


class AdminUserProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/admin/users/<int:user_id>/profile/
    Admin-only: manage a specific user's profile.
    """
    permission_classes = [IsAdmin]
    serializer_class = AdminProfileUpdateSerializer
    lookup_url_kwarg = "user_id"

    def _get_or_404(self, user_id: int) -> Profile:
        try:
            return Profile.objects.select_related("user").get(user_id=user_id)
        except Profile.DoesNotExist:
            raise NotFound(detail=f"Profile for user id {user_id} not found.")


 # ----- Retrieve -----
    def get_object(self):
        user_id = int(self.kwargs[self.lookup_url_kwarg])
        return self._get_or_404(user_id)

    # ----- Update (upsert) -----
    def patch(self, request, *args, **kwargs):
        user_id = int(kwargs[self.lookup_url_kwarg])
        try:
            instance = Profile.objects.select_related("user").get(user_id=user_id)
        except Profile.DoesNotExist:
            # create profile then apply incoming partial data
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                raise NotFound(detail=f"User id {user_id} not found.")
            # default role if none provided
            role = request.data.get("role", "Student")
            instance = Profile.objects.create(user=user, role=role)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ----- Delete (idempotent) -----
    def delete(self, request, *args, **kwargs):
        user_id = int(kwargs[self.lookup_url_kwarg])
        qs = Profile.objects.filter(user_id=user_id)
        if qs.exists():
            qs.delete()
        # Always 204 even if nothing was deleted
        return Response(status=status.HTTP_204_NO_CONTENT)





class RegisterUserView(generics.CreateAPIView):
    """
    POST /api/v1/register/
    Creates a user + profile, returns JWT {access, refresh} and user info.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterUserSerializer


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
        }
        return Response(data, status=status.HTTP_201_CREATED)




class LocationListCreateView(generics.ListCreateAPIView):
    """
    List all locations or create a new one.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = []  # Open to all users


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific location.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.AllowAny]  # Adjust permissions as needed


class PartnerListCreateView(generics.ListCreateAPIView):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [permissions.AllowAny]  # Open to all users


class PartnerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [permissions.AllowAny]


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]


class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.AllowAny]  # Open to all users

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.AllowAny]



class SelectionProcedureListCreateView(generics.ListCreateAPIView):
    queryset = SelectionProcedure.objects.all()
    serializer_class = SelectionProcedureSerializer
    permission_classes = [permissions.AllowAny]


class SelectionProcedureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SelectionProcedure.objects.all()
    serializer_class = SelectionProcedureSerializer
    permission_classes = [permissions.AllowAny]


class StudentSelectionListCreateView(generics.ListCreateAPIView):
    queryset = StudentSelection.objects.all()
    serializer_class = StudentSelectionSerializer
    permission_classes = [permissions.AllowAny]


class StudentSelectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentSelection.objects.all()
    serializer_class = StudentSelectionSerializer
    permission_classes = [permissions.AllowAny]


class ContactUsCreateView(generics.CreateAPIView):
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    permission_classes = [permissions.AllowAny]

class EventAttendanceListCreateView(generics.ListCreateAPIView):
    queryset = EventAttendance.objects.all()
    serializer_class = EventAttendanceSerializer
    permission_classes = [permissions.AllowAny]

class EventAttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EventAttendance.objects.all()
    serializer_class = EventAttendanceSerializer
    permission_classes = [permissions.AllowAny]


class AlumniListCreateView(generics.ListCreateAPIView):
    queryset = Alumni.objects.all()
    serializer_class = AlumniSerializer
    permission_classes = [permissions.AllowAny]

class AlumniDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alumni.objects.all()
    serializer_class = AlumniSerializer
    permission_classes = [permissions.AllowAny]

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

class AboutUsListCreateView(generics.ListCreateAPIView):
    queryset = AboutUs.objects.all()
    serializer_class = AboutUsSerializer
    permission_classes = [permissions.AllowAny]

class TeamMemberListCreateView(generics.ListCreateAPIView):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.AllowAny]

class CoreValueListCreateView(generics.ListCreateAPIView):
    queryset = CoreValue.objects.all()
    serializer_class = CoreValueSerializer
    permission_classes = [permissions.AllowAny]

class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

class LearningScheduleListCreateView(generics.ListCreateAPIView):
    queryset = LearningSchedule.objects.all()
    serializer_class = LearningScheduleSerializer
    permission_classes = [permissions.AllowAny]

class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.AllowAny]

class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.AllowAny]