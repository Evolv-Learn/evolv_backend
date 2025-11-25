from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone


from .models import (
    Profile,
    Location,
    Partner,
    Course,
    CourseMaterial,
    Student,
    CourseEnrollment,
    LearningSchedule,
    SelectionProcedure,
    StudentSelection,
    ContactUs,
    EventAttendance,
    Alumni,
    Event,
    AboutUs,
    TeamMember,
    CoreValue,
    Review,
    Module,
    Lesson,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]
        read_only_fields = fields


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "user", "role", "profile_picture", "title", "bio", "email", "twitter_url", "linkedin_url"]


class ProfileSelfSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False)
    first_name = serializers.CharField(
        source="user.first_name", required=False, allow_blank=True
    )
    last_name = serializers.CharField(
        source="user.last_name", required=False, allow_blank=True
    )
    user_email = serializers.EmailField(source="user.email", required=False)
    role = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "role", "username", "first_name", "last_name", "user_email", "email", "profile_picture", "title", "bio", "twitter_url", "linkedin_url"]

    def validate(self, attrs):
        user_data = attrs.get("user", {})
        me = self.context["request"].user

        uname = user_data.get("username")
        if (
            uname
            and User.objects.exclude(pk=me.pk).filter(username__iexact=uname).exists()
        ):
            raise serializers.ValidationError({"username": "Username already taken."})

        mail = user_data.get("email")
        if mail and User.objects.exclude(pk=me.pk).filter(email__iexact=mail).exists():
            raise serializers.ValidationError(
                {"email": "This email is already in use."}
            )
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
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True, min_length=8, trim_whitespace=False
    )

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        # Check if email exists in User table
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        
        # Check if email exists in Student table (has unique constraint)
        if Student.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        
        # Check if email exists in ContactUs table (has unique constraint)
        if ContactUs.objects.filter(email__iexact=value).exists():
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

        Profile.objects.get_or_create(user=user, defaults={"role": "Student"})

        return user


class UserProfileCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Profile.USER_ROLES)
    password = serializers.CharField(write_only=True)
    token = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "role",
            "token",
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def get_token(self, obj):
        from rest_framework.authtoken.models import Token

        token, created = Token.objects.get_or_create(user=obj)
        return token.key

    def create(self, validated_data):
        role = validated_data.pop("role")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        Profile.objects.create(user=user, role=role)

        return user


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"

    def validate(self, attrs):
        loc_type = attrs.get(
            "location_type", getattr(self.instance, "location_type", None)
        )
        online_region = attrs.get(
            "online_region", getattr(self.instance, "online_region", None)
        )
        country = attrs.get("country", getattr(self.instance, "country", None))
        state = attrs.get("state", getattr(self.instance, "state", None))

        errors = {}

        if loc_type == "Online":
            if not online_region:
                errors["online_region"] = (
                    "online_region is required for Online locations."
                )
            if country:
                errors["country"] = "country must be empty for Online locations."
            if state:
                errors["state"] = "state must be empty for Online locations."

        elif loc_type == "Campus":
            if not country:
                errors["country"] = "country is required for Campus locations."
            if online_region:
                errors["online_region"] = (
                    "online_region must be empty for Campus locations."
                )

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
    instructor = serializers.StringRelatedField()
    instructor_id = serializers.PrimaryKeyRelatedField(source="instructor", read_only=True)
    locations = serializers.StringRelatedField(many=True)
    partners = serializers.StringRelatedField(many=True)
    parent = serializers.StringRelatedField()
    parent_id = serializers.PrimaryKeyRelatedField(source="parent", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "category",
            "description",
            "software_tools",
            "topics_covered",
            "instructor",
            "instructor_id",
            "locations",
            "partners",
            "parent",
            "parent_id",
            "registration_deadline",
            "selection_date",
            "start_date",
            "end_date",
            "github_repository",
            "discord_community",
            "video_content",
            "additional_materials",
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
            "id",
            "name",
            "category",
            "description",
            "software_tools",
            "topics_covered",
            "instructor",
            "locations",
            "partners",
            "parent",
            "registration_deadline",
            "selection_date",
            "start_date",
            "end_date",
            "github_repository",
            "discord_community",
            "video_content",
            "additional_materials",
        ]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        parent = attrs.get("parent", getattr(instance, "parent", None))

        if instance and parent and parent.pk == instance.pk:
            raise serializers.ValidationError(
                {"parent": "A course cannot be its own parent."}
            )
        
        # Validate date order
        reg_deadline = attrs.get("registration_deadline", getattr(instance, "registration_deadline", None) if instance else None)
        selection = attrs.get("selection_date", getattr(instance, "selection_date", None) if instance else None)
        start = attrs.get("start_date", getattr(instance, "start_date", None) if instance else None)
        end = attrs.get("end_date", getattr(instance, "end_date", None) if instance else None)
        
        if reg_deadline and selection and reg_deadline >= selection:
            raise serializers.ValidationError(
                {"selection_date": "Selection date must be after registration deadline"}
            )
        
        if selection and start and selection >= start:
            raise serializers.ValidationError(
                {"start_date": "Start date must be after selection date"}
            )
        
        if reg_deadline and start and reg_deadline >= start:
            raise serializers.ValidationError(
                {"start_date": "Start date must be after registration deadline"}
            )
        
        if start and end and start >= end:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date"}
            )

        if instance and parent:
            seen = set()
            cur = parent
            while cur:
                if cur.pk == instance.pk:
                    raise serializers.ValidationError(
                        {"parent": "Cycle detected in course hierarchy."}
                    )
                if cur.pk in seen:
                    break
                seen.add(cur.pk)
                cur = cur.parent
        return attrs


class CourseMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    file_size_mb = serializers.ReadOnlyField()
    
    class Meta:
        model = CourseMaterial
        fields = [
            'id',
            'course',
            'title',
            'description',
            'material_type',
            'file',
            'file_size',
            'file_size_mb',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = ['uploaded_by', 'file_size', 'uploaded_at', 'updated_at']
    
    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name() or obj.uploaded_by.username
        return None


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


class AlumniReadSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    course = serializers.StringRelatedField()
    location = serializers.StringRelatedField()

    class Meta:
        model = Alumni
        fields = [
            "id",
            "user",
            "graduation_year",
            "current_position",
            "success_story",
            "course",
            "location",
        ]


class AlumniWriteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True)
    )
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), required=False, allow_null=True
    )
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Alumni
        fields = [
            "id",
            "user",
            "graduation_year",
            "current_position",
            "success_story",
            "course",
            "location",
        ]

    def validate_user(self, value):
        if self.instance is None and Alumni.objects.filter(user=value).exists():
            raise serializers.ValidationError(
                "An alumni record for this user already exists."
            )
        return value


class EventReadSerializer(serializers.ModelSerializer):
    location = serializers.StringRelatedField()
    course = serializers.StringRelatedField()
    partners = serializers.StringRelatedField(many=True)
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "is_virtual",
            "location",
            "course",
            "partners",
            "image",
        ]


class EventWriteSerializer(serializers.ModelSerializer):
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), required=False, allow_null=True
    )
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), required=False, allow_null=True
    )
    partners = serializers.PrimaryKeyRelatedField(
        queryset=Partner.objects.all(), many=True, required=False
    )
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "is_virtual",
            "location",
            "course",
            "partners",
            "image",
        ]

    def validate(self, attrs):
        is_virtual = attrs.get(
            "is_virtual", getattr(self.instance, "is_virtual", False)
        )
        location = attrs.get("location", getattr(self.instance, "location", None))

        if is_virtual and location:
            raise serializers.ValidationError(
                {"location": "Virtual events must not have a location."}
            )

        if not is_virtual and not location:
            raise serializers.ValidationError(
                {"location": "Physical events must have a location."}
            )

        return attrs


class AboutUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUs
        fields = "__all__"

    def create(self, validated_data):
        if AboutUs.objects.exists():
            raise serializers.ValidationError(
                "AboutUs already exists. Use PATCH/PUT to update."
            )
        return super().create(validated_data)


class CoreValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreValue
        fields = "__all__"

    def validate(self, attrs):
        about_us = attrs.get("about_us", getattr(self.instance, "about_us", None))
        title = attrs.get("title", getattr(self.instance, "title", None))
        if about_us and title:
            qs = CoreValue.objects.filter(about_us=about_us, title__iexact=title)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {
                        "title": "A core value with this title already exists for this AboutUs."
                    }
                )
        return attrs


class TeamMemberWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    core_values = serializers.PrimaryKeyRelatedField(
        queryset=CoreValue.objects.all(), many=True, required=False
    )
    about_us = serializers.PrimaryKeyRelatedField(queryset=AboutUs.objects.all())

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "about_us",
            "name",
            "role",
            "image",
            "bio",
            "linkedin",
            "twitter",
            "core_values",
        ]

    def validate_core_values(self, value):
        if value is None:
            return []
        return value


class TeamMemberReadSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "about_us",
            "name",
            "role",
            "image",
            "bio",
            "linkedin",
            "twitter",
            "core_values",
        ]

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = ["created_at"]

    def validate_rating(self, value):
        if value is None:
            return 5
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs):
        course = attrs.get("course", getattr(self.instance, "course", None))
        alumni = attrs.get("alumni", getattr(self.instance, "alumni", None))
        about_us = attrs.get("about_us", getattr(self.instance, "about_us", None))

        if not (course or alumni or about_us):
            raise serializers.ValidationError(
                "A review must be associated with a course, an alumni, or AboutUs."
            )
        return attrs


class LearningScheduleSerializer(serializers.ModelSerializer):
    duration = serializers.IntegerField(read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    instructor_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LearningSchedule
        fields = [
            "id",
            "course",
            "course_name",
            "start_date",
            "end_date",
            "instructor",
            "instructor_name",
            "location",
            "location_name",
            "duration",
        ]

    def get_instructor_name(self, obj):
        if obj.instructor:
            if obj.instructor.first_name and obj.instructor.last_name:
                return f"{obj.instructor.first_name} {obj.instructor.last_name}"
            return obj.instructor.username
        return None

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        course = attrs.get("course", getattr(self.instance, "course", None))
        location = attrs.get("location", getattr(self.instance, "location", None))

        if start and end and end < start:
            raise serializers.ValidationError(
                {"end_date": "end_date must be the same or after start_date."}
            )

        if start and end and course and location:
            qs = LearningSchedule.objects.filter(course=course, location=location)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            overlap = qs.filter(
                Q(start_date__lte=end) & Q(end_date__gte=start)
            ).exists()
            if overlap:
                raise serializers.ValidationError(
                    "Another schedule for this course/location overlaps the provided date range."
                )

        return attrs


class ModuleReadSerializer(serializers.ModelSerializer):
    schedule = serializers.StringRelatedField()
    lessons = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "schedule", "title", "description", "order", "lessons", "lessons_count"]
    
    def get_lessons(self, obj):
        lessons = obj.lessons.all()
        return LessonReadSerializer(lessons, many=True).data
    
    def get_lessons_count(self, obj):
        return obj.lessons.count()


class ModuleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ["id", "schedule", "title", "description", "order"]

    def validate(self, attrs):
        schedule = attrs.get("schedule", getattr(self.instance, "schedule", None))
        order = attrs.get("order", getattr(self.instance, "order", None))
        if schedule is None or order is None:
            return attrs

        qs = Module.objects.filter(schedule=schedule, order=order)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {"order": "A module with this order already exists for the schedule."}
            )
        return attrs


class LessonReadSerializer(serializers.ModelSerializer):
    module = serializers.StringRelatedField()

    class Meta:
        model = Lesson
        fields = [
            "id",
            "module",
            "title",
            "description",
            "content",
            "resources",
            "order",
        ]


class LessonWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id",
            "module",
            "title",
            "description",
            "content",
            "resources",
            "order",
        ]

    def validate(self, attrs):
        module = attrs.get("module", getattr(self.instance, "module", None))
        order = attrs.get("order", getattr(self.instance, "order", None))

        if module is None or order is None:
            return attrs

        qs = Lesson.objects.filter(module=module, order=order)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                {"order": "A lesson with this order already exists for the module."}
            )
        return attrs


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    course_category = serializers.CharField(source='course.category', read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'course_id', 'course_name', 'course_category', 'status', 'applied_at', 'updated_at']
        read_only_fields = ['id', 'applied_at', 'updated_at']


class StudentReadSerializer(serializers.ModelSerializer):
    courses = serializers.StringRelatedField(many=True)
    enrollments = CourseEnrollmentSerializer(many=True, read_only=True)
    schedules = serializers.StringRelatedField(many=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = "__all__"
        read_only_fields = ["id", "user"]

    def get_user(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "username": obj.user.username,
                "email": obj.user.email,
            }
        return None


class StudentWriteSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    courses = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), many=True, required=False, allow_null=True
    )
    schedules = serializers.PrimaryKeyRelatedField(
        queryset=LearningSchedule.objects.all(), many=True, required=False, allow_null=True
    )

    class Meta:
        model = Student
        fields = "__all__"
        read_only_fields = ["id"]

    def validate_courses(self, value):
        """Filter out None values from courses list"""
        if value is None:
            return []
        return [course for course in value if course is not None]

    def validate_schedules(self, value):
        """Filter out None values from schedules list"""
        if value is None:
            return []
        return [schedule for schedule in value if schedule is not None]

    def validate_birth_date(self, value):
        if value >= timezone.localdate():
            raise serializers.ValidationError("birth_date must be in the past.")
        return value

    def validate_english_level(self, value):
        if not (1 <= int(value) <= 5):
            raise serializers.ValidationError("english_level must be between 1 and 5.")
        return value

    def validate(self, attrs):
        user = attrs.get("user")
        if (
            user
            and self.instance is None
            and Student.objects.filter(user=user).exists()
        ):
            raise serializers.ValidationError(
                "A student profile already exists for this user."
            )

        courses = attrs.get("courses") or []
        schedules = attrs.get("schedules") or []
        # if not courses and not schedules:
        #     raise serializers.ValidationError("Select at least one course or schedule.")
        return attrs

    def create(self, validated_data):
        courses = validated_data.pop("courses", [])
        schedules = validated_data.pop("schedules", [])
        student = super().create(validated_data)
        
        # Set courses using the ManyToMany field
        if courses:
            student.courses.set(courses)
            # Also create CourseEnrollment entries with default "Pending" status
            for course in courses:
                CourseEnrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={'status': 'Pending'}
                )
        
        if schedules:
            student.schedules.set(schedules)
        if student.user and student.user.email and student.email != student.user.email:
            student.email = student.user.email
            student.save(update_fields=["email"])
        return student

    def update(self, instance, validated_data):
        courses = validated_data.pop("courses", None)
        schedules = validated_data.pop("schedules", None)
        student = super().update(instance, validated_data)
        
        # Update courses using the ManyToMany field
        if courses is not None:
            student.courses.set(courses)
            # Also create/update CourseEnrollment entries
            for course in courses:
                CourseEnrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={'status': 'Pending'}
                )
        
        if schedules is not None:
            student.schedules.set(schedules)
        return student




class CourseEnrollmentSerializer(serializers.ModelSerializer):
    student = StudentReadSerializer(read_only=True)
    course = CourseReadSerializer(read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'student', 'course', 'status', 'applied_at', 'updated_at']
        read_only_fields = ['applied_at', 'updated_at']
