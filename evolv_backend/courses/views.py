from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import (Profile, Location, Partner, Course, Student, SelectionProcedure, 
                    StudentSelection, ContactUs, EventAttendance, Alumni, Event, AboutUs, TeamMember,
                    CoreValue, Review, LearningSchedule, Module, Lesson) 
from .serializers import (ProfileSerializer, LocationSerializer, PartnerSerializer, 
                        CourseSerializer, StudentSerializer, SelectionProcedureSerializer, 
                        StudentSelectionSerializer, ContactUsSerializer,EventAttendanceSerializer,
                        AlumniSerializer, EventSerializer, AboutUsSerializer, TeamMemberSerializer,
                        CoreValueSerializer, ReviewSerializer, LearningScheduleSerializer, ModuleSerializer, LessonSerializer)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def secure_data(request):
    return Response({"message": "This is a protected API!"})


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the profile of the logged-in user.
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)


class LocationListCreateView(generics.ListCreateAPIView):
    """
    List all locations or create a new one.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.AllowAny]  # Open to all users


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