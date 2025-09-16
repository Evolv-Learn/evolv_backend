from rest_framework import serializers
from django.contrib.auth import get_user_model


from .models import (Profile, Location, Partner, Course, Student, LearningSchedule, SelectionProcedure, 
                    StudentSelection,  ContactUs, EventAttendance,  Alumni, Event, AboutUs, TeamMember,
                    CoreValue, Review, Module, Lesson)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username", "first_name", "last_name", "email"]
        read_only_fields = fields


class ProfileSerializer(serializers.ModelSerializer):
    #Allow admin to list all Profile
    user = UserSerializer(read_only=True) 
    role = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "user", "role"]


class ProfileSelfSerializer(serializers.ModelSerializer):
    # editable user fields (mapped to related user)
    username   = serializers.CharField(source="user.username",   required=False)
    first_name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    last_name  = serializers.CharField(source="user.last_name",  required=False, allow_blank=True)
    email      = serializers.EmailField(source="user.email",     required=False)
    # keep role locked for normal users
    role       = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "role", "username", "first_name", "last_name", "email"]

    def validate(self, attrs):
        user_data = attrs.get("user", {})
        me = self.context["request"].user

        uname = user_data.get("username")
        if uname and User.objects.exclude(pk=me.pk).filter(username__iexact=uname).exists():
            raise serializers.ValidationError({"username": "Username already taken."})

        mail = user_data.get("email")
        if mail and User.objects.exclude(pk=me.pk).filter(email__iexact=mail).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})

        return attrs

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, val in user_data.items():
            setattr(instance.user, attr, val)
        instance.user.save()
        return super().update(instance, validated_data)


class AdminProfileUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "user", "role"]  


class RegisterUserSerializer(serializers.Serializer):
    username   = serializers.CharField()
    email      = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name  = serializers.CharField(required=False, allow_blank=True)
    # role = serializers.ChoiceField(choices=Profile.USER_ROLES)  # drop or ignore for now
    password   = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        user.set_password(validated_data["password"])
        user.save()

        # default every new user to Student role
        Profile.objects.get_or_create(user=user, defaults={"role": "Student"})

        return user


class UserProfileCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a User and Profile together.
    """
    role = serializers.ChoiceField(choices=Profile.USER_ROLES)  # Allow role selection
    password = serializers.CharField(write_only=True)  # Ensure password is hidden
    token = serializers.SerializerMethodField()  # Add token field

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "password", "role", "token"]

    def validate_email(self, value):
        """Ensure email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def get_token(self, obj):
        """Return authentication token after user creation"""
        from rest_framework.authtoken.models import Token
        token, created = Token.objects.get_or_create(user=obj)
        return token.key

    def create(self, validated_data):
        """Create both User and Profile, and return authentication token"""
        role = validated_data.pop("role")  # Extract role from data
        password = validated_data.pop("password")  # Extract password
        user = User(**validated_data)
        user.set_password(password)  # Hash password before saving
        user.save()

        # Create Profile
        Profile.objects.create(user=user, role=role)

        return user  # Will return with token due to get_token method


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"

    def validate(self, attrs):
        loc_type = attrs.get("location_type", getattr(self.instance, "location_type", None))
        online_region = attrs.get("online_region", getattr(self.instance, "online_region", None))
        country = attrs.get("country", getattr(self.instance, "country", None))
        state = attrs.get("state", getattr(self.instance, "state", None))

        errors = {}

        if loc_type == "Online":
            if not online_region:
                errors["online_region"] = "online_region is required for Online locations."
            if country:
                errors["country"] = "country must be empty for Online locations."
            if state:
                errors["state"] = "state must be empty for Online locations."

        elif loc_type == "Campus":
            if not country:
                errors["country"] = "country is required for Campus locations."
            if online_region:
                errors["online_region"] = "online_region must be empty for Campus locations."

        if errors:
            raise serializers.ValidationError(errors)
        return attrs



class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = "__all__"

    def validate_name(self, value):
        qs = Partner.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Partner with this name already exists.")
        return value


class CourseReadSerializer(serializers.ModelSerializer):
    instructor = serializers.StringRelatedField()  # Display instructor name
    locations = serializers.StringRelatedField(many=True)  # Display location names
    partners = serializers.StringRelatedField(many=True)  # Display partner names
    parent = serializers.StringRelatedField()  # Display parent course name if applicable
    parent_id  = serializers.PrimaryKeyRelatedField(source="parent", read_only=True)

    class Meta:
        model = Course
        fields =  [
            "id", "name", "category", "description", "software_tools",
            "instructor", "locations", "partners", "parent", "parent_id",
            "created_at",
        ]

class CourseWriteSerializer(serializers.ModelSerializer):
    instructor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True), allow_null=True, required=False
    )
    locations = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), many=True
    )
    partners = serializers.PrimaryKeyRelatedField(
        queryset=Partner.objects.all(), many=True, required=False
    )
    parent = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = Course
        fields = [
            "id", "name", "category", "description", "software_tools",
            "instructor", "locations", "partners", "parent",
        ]

    def validate(self, attrs):
        # prevent parent=self and simple cycle on updates
        instance = getattr(self, "instance", None)
        parent = attrs.get("parent", getattr(instance, "parent", None))

        if instance and parent and parent.pk == instance.pk:
            raise serializers.ValidationError({"parent": "A course cannot be its own parent."})

        # Optional: prevent multi-level cycles (simple walk up)
        if instance and parent:
            seen = set()
            cur = parent
            while cur:
                if cur.pk == instance.pk:
                    raise serializers.ValidationError({"parent": "Cycle detected in course hierarchy."})
                if cur.pk in seen:
                    break
                seen.add(cur.pk)
                cur = cur.parent
        return attrs


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