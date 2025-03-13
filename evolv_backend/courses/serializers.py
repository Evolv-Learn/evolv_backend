from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Location, Partner, Course, Student, LearningSchedule



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]
        
# Profile Serializer
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Nested user data

    class Meta:
        model = Profile
        fields = ["id", "user", "role"]

# Location Serializer
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"

# Partner Serializer
class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = "__all__"

# Course Serializer
class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.StringRelatedField()  # Display instructor name
    locations = serializers.StringRelatedField(many=True)  # Display location names
    partners = serializers.StringRelatedField(many=True)  # Display partner names
    parent = serializers.StringRelatedField()  # Display parent course name if applicable

    class Meta:
        model = Course
        fields = "__all__"


# Student Serializer
class StudentSerializer(serializers.ModelSerializer):
    courses = serializers.StringRelatedField(many=True)  # Display course names
    schedules = serializers.StringRelatedField(many=True)  # Display schedule details

    class Meta:
        model = Student
        fields = "__all__"