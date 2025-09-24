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

from .permissions import IsAdmin,  IsAdminOrReadOnly

from .models import (Profile, Location, Partner, Course, Student, SelectionProcedure, 
                    StudentSelection, ContactUs, EventAttendance, Alumni, Event, AboutUs, TeamMember,
                    CoreValue, Review, LearningSchedule, Module, Lesson) 
from .serializers import (ProfileSerializer, LocationSerializer, PartnerSerializer, ProfileSelfSerializer,
                        CourseReadSerializer, CourseWriteSerializer, StudentSerializer, SelectionProcedureSerializer, 
                        StudentSelectionSerializer, ContactUsSerializer,EventAttendanceSerializer,
                       AlumniReadSerializer, AlumniWriteSerializer, EventSerializer, AboutUsSerializer, TeamMemberSerializer,
                        CoreValueSerializer, ReviewSerializer, LearningScheduleSerializer, 
                        ModuleSerializer, LessonSerializer, UserProfileCreateSerializer, RegisterUserSerializer, AdminProfileUpdateSerializer)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def secure_data(request):
    return Response({"message": "This is a protected API!"})


User = get_user_model()

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class AdminProfileListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.select_related("user").all()  


    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "user__is_active", "user__is_staff"]
    search_fields = ["user__username", "user__email", "user__first_name", "user__last_name", "role"]
    ordering_fields = ["user__username", "user__email", "user__date_joined", "role"]
    ordering = ["user__username"]


class AdminUserProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminProfileUpdateSerializer
    lookup_url_kwarg = "user_id"

    def _get_or_404(self, user_id: int) -> Profile:
        try:
            return Profile.objects.select_related("user").get(user_id=user_id)
        except Profile.DoesNotExist:
            raise NotFound(detail=f"Profile for user id {user_id} not found.")

    def get_object(self):
        user_id = int(self.kwargs[self.lookup_url_kwarg])
        return self._get_or_404(user_id)

    def patch(self, request, *args, **kwargs):
        user_id = int(kwargs[self.lookup_url_kwarg])
        try:
            instance = Profile.objects.select_related("user").get(user_id=user_id)
        except Profile.DoesNotExist:
            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                raise NotFound(detail=f"User id {user_id} not found.")
            role = request.data.get("role", "Student")
            instance = Profile.objects.create(user=user, role=role)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        user_id = int(kwargs[self.lookup_url_kwarg])
        qs = Profile.objects.filter(user_id=user_id)
        if qs.exists():
            qs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RegisterUserView(generics.CreateAPIView):
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
    queryset = Location.objects.all().order_by("name")
    serializer_class = LocationSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["location_type", "online_region", "country", "state"]
    search_fields = ["name", "country", "state", "online_region"]
    ordering_fields = ["name", "country", "state", "location_type"]
    ordering = ["name"]


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAdminOrReadOnly]


class PartnerListCreateView(generics.ListCreateAPIView):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["name"]
    search_fields = ["name", "description"]
    ordering_fields = ["name"]
    ordering = ["name"]


class PartnerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [IsAdminOrReadOnly]


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes =[IsAdminOrReadOnly]
    queryset = (
        Course.objects
        .select_related("instructor", "parent")
        .prefetch_related("locations", "partners")
        .all()
    )
    
    def get_serializer_class(self):
        return CourseWriteSerializer if self.request.method == "POST" else CourseReadSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["category", "instructor", "partners", "locations", "parent"]
    search_fields = ["name", "description", "software_tools"]
    ordering_fields = ["name", "created_at", "instructor"]
    ordering = ["name"]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = (
        Course.objects
        .select_related("instructor", "parent")
        .prefetch_related("locations", "partners")
        .all()
    )

    def get_serializer_class(self):
        return CourseWriteSerializer if self.request.method in ("PUT", "PATCH") else CourseReadSerializer


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
    queryset = Alumni.objects.select_related("user", "course", "location")
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        return AlumniWriteSerializer if self.request.method == "POST" else AlumniReadSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["graduation_year", "course", "location", "user"]
    search_fields = ["user__username", "user__email", "current_position", "success_story"]
    ordering_fields = ["graduation_year", "user__username"]
    ordering = ["-graduation_year"]


class AlumniDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alumni.objects.select_related("user", "course", "location")
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        return AlumniWriteSerializer if self.request.method in ("PUT", "PATCH") else AlumniReadSerializer

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