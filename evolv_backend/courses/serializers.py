from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (Profile, Location, Partner, Course, Student, LearningSchedule, SelectionProcedure, 
                    StudentSelection,  ContactUs, EventAttendance,  Alumni, Event, AboutUs, TeamMember,
                    CoreValue, Review, LearningSchedule, Module, Lesson)



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]
        

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Nested user data

    class Meta:
        model = Profile
        fields = ["id", "user", "role"]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.StringRelatedField()  # Display instructor name
    locations = serializers.StringRelatedField(many=True)  # Display location names
    partners = serializers.StringRelatedField(many=True)  # Display partner names
    parent = serializers.StringRelatedField()  # Display parent course name if applicable

    class Meta:
        model = Course
        fields = "__all__"


class StudentSerializer(serializers.ModelSerializer):
    courses = serializers.StringRelatedField(many=True)  # Display course names
    schedules = serializers.StringRelatedField(many=True)  # Display schedule details

    class Meta:
        model = Student
        fields = "__all__"


class SelectionProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectionProcedure
        fields = "__all__"


class StudentSelectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentSelection
        fields = "__all__"


class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = "__all__"


class EventAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventAttendance
        fields = "__all__"


class AlumniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumni
        fields = "__all__"

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"

class AboutUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUs
        fields = "__all__"

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = "__all__"

class CoreValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreValue
        fields = "__all__"

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"

class LearningScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningSchedule
        fields = "__all__"

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = "__all__"

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = "__all__"