from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from .utils import send_welcome_email
from .throttles import RegisterRateThrottle, ContactUsRateThrottle

from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsAdmin, IsAdminOrReadOnly, AllowAnyCreateReadAdminModify, IsAdminOrInstructorOwner, AuthenticatedCreateReadAdminModify, IsAdminOrInstructor

from .models import (
    Profile,Location,Partner,CourseCategory,Course,CourseMaterial,Student,CourseEnrollment,SelectionProcedure,StudentSelection,ContactUs,EventAttendance,
    Alumni,Event,AboutUs,TeamMember,CoreValue,Review,LearningSchedule,Module,Lesson,)

from .serializers import (
    ProfileSerializer,LocationSerializer,PartnerSerializer,CourseCategorySerializer,ProfileSelfSerializer,CourseReadSerializer,CourseWriteSerializer,CourseMaterialSerializer,
    SelectionProcedureSerializer,StudentSelectionSerializer,ContactUsSerializer,EventAttendanceSerializer,AlumniReadSerializer,AlumniWriteSerializer,
    EventWriteSerializer,EventReadSerializer,AboutUsSerializer, TeamMemberReadSerializer,TeamMemberWriteSerializer,CoreValueSerializer,ReviewSerializer,
    LearningScheduleSerializer, LessonReadSerializer, LessonWriteSerializer, UserProfileCreateSerializer, RegisterUserSerializer, AdminProfileUpdateSerializer,
    ModuleReadSerializer, ModuleWriteSerializer, StudentReadSerializer, StudentWriteSerializer, CourseEnrollmentSerializer)

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def secure_data(request):
    return Response({"message": "This is a protected API!"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Return current user's data including superuser and staff status"""
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_superuser": user.is_superuser,
        "is_staff": user.is_staff,
    })


User = get_user_model()


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        # Add superuser and staff status to the response
        data['is_superuser'] = request.user.is_superuser
        data['is_staff'] = request.user.is_staff
        return Response(data)


class AdminProfileListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = ProfileSerializer
    queryset = Profile.objects.select_related("user").all()

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "user__is_active", "user__is_staff"]
    search_fields = ["user__username","user__email","user__first_name","user__last_name","role",]
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
        
        try:
            user = User.objects.get(pk=user_id)
            user_email = user.email
            
            # Delete all records with this email (to free up the email for re-registration)
            # 1. Delete Student records (has unique email constraint)
            Student.objects.filter(user=user).delete()
            Student.objects.filter(email__iexact=user_email).delete()
            
            # 2. Delete Alumni records
            Alumni.objects.filter(user=user).delete()
            
            # 3. Delete ContactUs records (has unique email constraint)
            ContactUs.objects.filter(email__iexact=user_email).delete()
            
            # 4. Delete Profile
            Profile.objects.filter(user=user).delete()
            
            # 5. Finally delete the user (this will cascade delete remaining relations)
            user.delete()
            
            return Response(
                {"message": f"User and all related records deleted successfully. Email {user_email} is now available."},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class RegisterUserView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterUserSerializer
    throttle_classes = []  # RegisterRateThrottle

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send verification email instead of welcome email
        from .utils import send_verification_email
        send_verification_email(user)

        # Don't return tokens yet - user needs to verify email first
        data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "message": "Registration successful! Please check your email to verify your account before logging in.",
            "email_sent": True
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


class CourseCategoryListCreateView(generics.ListCreateAPIView):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "order", "created_at"]
    ordering = ["order", "name"]


class CourseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrInstructor]
    queryset = (
        Course.objects.select_related("instructor", "parent")
        .prefetch_related("locations", "partners")
        .all()
    )

    def get_serializer_class(self):
        return (
            CourseWriteSerializer
            if self.request.method == "POST"
            else CourseReadSerializer
        )

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["category", "instructor", "partners", "locations", "parent"]
    search_fields = ["name", "description", "software_tools"]
    ordering_fields = ["name", "created_at", "instructor"]
    ordering = ["name"]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrInstructor]
    queryset = (
        Course.objects.select_related("instructor", "parent")
        .prefetch_related("locations", "partners")
        .all()
    )

    def get_serializer_class(self):
        return (
            CourseWriteSerializer
            if self.request.method in ("PUT", "PATCH")
            else CourseReadSerializer
        )


class CourseMaterialListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsAdminOrInstructor]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['course', 'material_type']
    search_fields = ['title', 'description']
    ordering_fields = ['uploaded_at', 'title']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        return CourseMaterial.objects.select_related('course', 'uploaded_by').all()
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class CourseMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseMaterial.objects.select_related('course', 'uploaded_by').all()
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsAdminOrInstructor]


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
    
    def perform_create(self, serializer):
        contact = serializer.save()
        # Send email notification to admin
        self.send_contact_notification(contact)
    
    def send_contact_notification(self, contact):
        """Send email notification when contact form is submitted"""
        from django.core.mail import EmailMessage
        from django.conf import settings
        
        subject = f"New Contact Form Submission from {contact.name}"
        
        # Email to admin
        admin_message = f"""
        New contact form submission received:
        
        Name: {contact.name}
        Email: {contact.email}
        Message:
        {contact.message}
        
        ---
        Reply to: {contact.email}
        """
        
        admin_email = EmailMessage(
            subject=subject,
            body=admin_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=['evolvngo@gmail.com'],
            reply_to=[contact.email],
        )
        admin_email.send(fail_silently=True)
        
        # Confirmation email to user
        user_subject = "We received your message - EvolvLearn"
        user_message = f"""
        Hi {contact.name},
        
        Thank you for contacting EvolvLearn!
        
        We have received your message and will get back to you within 24 hours.
        
        Your message:
        {contact.message}
        
        Best regards,
        The EvolvLearn Team
        
        ---
        EvolvLearn
        Marsaskala, Malta
        evolvngo@gmail.com
        """
        
        user_email = EmailMessage(
            subject=user_subject,
            body=user_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[contact.email],
            reply_to=['evolvngo@gmail.com'],
        )
        user_email.send(fail_silently=True)
    throttle_classes = [ContactUsRateThrottle] 


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
        return (
            AlumniWriteSerializer
            if self.request.method == "POST"
            else AlumniReadSerializer
        )

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["graduation_year", "course", "location", "user"]
    search_fields = [
        "user__username",
        "user__email",
        "current_position",
        "success_story",
    ]
    ordering_fields = ["graduation_year", "user__username"]
    ordering = ["-graduation_year"]


class AlumniDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alumni.objects.select_related("user", "course", "location")
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        return (
            AlumniWriteSerializer
            if self.request.method in ("PUT", "PATCH")
            else AlumniReadSerializer
        )


class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EventReadSerializer
        return EventWriteSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]



class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EventReadSerializer
        return EventWriteSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]  
        return [permissions.IsAdminUser()]


@api_view(['GET'])
@permission_classes([AllowAny])
def event_calendar(request):
    """
    Get events for a specific month/year for calendar display
    Query params: year, month
    """
    year = request.GET.get('year')
    month = request.GET.get('month')
    
    if not year or not month:
        return Response(
            {'error': 'Year and month parameters are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        year = int(year)
        month = int(month)
        
        # Get events for the specified month
        from datetime import datetime
        start_date = datetime(year, month, 1)
        
        # Get last day of month
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        events = Event.objects.filter(
            date__gte=start_date,
            date__lt=end_date
        ).select_related('location', 'course').prefetch_related('partners')
        
        # Format events for calendar
        events_data = []
        for event in events:
            events_data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'date': event.date.isoformat(),
                'end_date': None,  # Add if you have this field
                'event_type': event.course.category if event.course else 'General',
                'is_virtual': event.is_virtual,
                'location': event.location.name if event.location else 'TBA',
                'course': event.course.name if event.course else '',
                'speaker_name': None,  # Add if you have this field
                'meeting_link': None,  # Add if you have this field
                'capacity': None,  # Add if you have this field
                'attendee_count': event.attendances.count() if hasattr(event, 'attendances') else 0,
                'is_full': False,  # Calculate based on capacity if available
            })
        
        return Response({
            'events': events_data,
            'year': year,
            'month': month,
            'count': len(events_data)
        }, status=status.HTTP_200_OK)
        
    except ValueError:
        return Response(
            {'error': 'Invalid year or month value'},
            status=status.HTTP_400_BAD_REQUEST
        )   


class AboutUsDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = AboutUsSerializer

    def get_object(self):
        obj, _ = AboutUs.objects.get_or_create(
            defaults={
                "title": "About EvolvLearn",
                "description": "We empower learners with practical tech skills.",
                "mission": "",
                "vision": "",
            }
        )
        return obj



class CoreValueListCreateView(generics.ListCreateAPIView):
    queryset = CoreValue.objects.select_related("about_us").all()
    serializer_class = CoreValueSerializer
    permission_classes = [IsAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["about_us"]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "id"]
    ordering = ["title"]


class CoreValueDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CoreValue.objects.select_related("about_us").all()
    serializer_class = CoreValueSerializer
    permission_classes = [IsAdminOrReadOnly]

    

class TeamMemberListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = TeamMember.objects.select_related("about_us").prefetch_related("core_values")

    def get_serializer_class(self):
        return TeamMemberWriteSerializer if self.request.method == "POST" else TeamMemberReadSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["about_us", "core_values", "role"]
    search_fields = ["name", "role", "bio"]
    ordering_fields = ["name", "role", "id"]
    ordering = ["name"]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class TeamMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = TeamMember.objects.select_related("about_us").prefetch_related("core_values")

    def get_serializer_class(self):
        return TeamMemberWriteSerializer if self.request.method in ("PUT", "PATCH") else TeamMemberReadSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.select_related("course", "alumni", "about_us").all()
    serializer_class = ReviewSerializer
    permission_classes = [AllowAnyCreateReadAdminModify]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["course", "alumni", "rating", "about_us"]
    search_fields = ["name", "review_text"]
    ordering_fields = ["rating", "created_at"]
    ordering = ["-created_at"]


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.select_related("course", "alumni", "about_us").all()
    serializer_class = ReviewSerializer
    permission_classes = [AllowAnyCreateReadAdminModify]


class LearningScheduleListCreateView(generics.ListCreateAPIView):
    queryset = LearningSchedule.objects.select_related("course", "instructor", "location").all()
    serializer_class = LearningScheduleSerializer
    permission_classes = [IsAdminOrInstructorOwner]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["course", "instructor", "location"]
    search_fields = ["course__name", "instructor__username"]
    ordering_fields = ["start_date", "end_date", "duration"]
    ordering = ["-start_date"]

    def perform_create(self, serializer):
        if not serializer.validated_data.get("instructor") and self.request.user.is_authenticated:
            serializer.save(instructor=self.request.user)
        else:
            serializer.save()


class LearningScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LearningSchedule.objects.select_related("course", "instructor", "location")
    serializer_class = LearningScheduleSerializer
    permission_classes = [IsAdminOrInstructorOwner]

class ModuleListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Module.objects.select_related("schedule", "schedule__course").all()

    def get_serializer_class(self):
        return ModuleWriteSerializer if self.request.method == "POST" else ModuleReadSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["schedule", "schedule__course"]
    search_fields = ["title", "description"]
    ordering_fields = ["order", "title"]
    ordering = ["order"]

    def get_queryset(self):
        qs = super().get_queryset()
        schedule_id = self.kwargs.get("schedule_id")
        if schedule_id:
            qs = qs.filter(schedule_id=schedule_id)
        return qs


class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Module.objects.select_related("schedule", "schedule__course").all()

    def get_serializer_class(self):
        return ModuleWriteSerializer if self.request.method in ("PUT", "PATCH") else ModuleReadSerializer


class LessonListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Lesson.objects.select_related("module", "module__schedule").all()

    def get_serializer_class(self):
        return LessonWriteSerializer if self.request.method == "POST" else LessonReadSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        module_id = self.kwargs.get("module_id")
        if module_id:
            qs = qs.filter(module_id=module_id)
        return qs

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["module", "module__schedule", "order"]
    search_fields = ["title", "description", "content"]
    ordering_fields = ["order", "title"]
    ordering = ["order"]


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Lesson.objects.select_related("module", "module__schedule").all()

class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.prefetch_related("courses", "schedules").all()
    permission_classes = [AuthenticatedCreateReadAdminModify]

    def get_serializer_class(self):
        return StudentWriteSerializer if self.request.method == "POST" else StudentReadSerializer

    def perform_create(self, serializer):
        # This will set user via HiddenField / CurrentUserDefault,
        # but this is defensive to ensure the user is set.
        serializer.save(user=self.request.user)


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.prefetch_related("courses", "schedules").all()
    permission_classes = [AuthenticatedCreateReadAdminModify]

    def get_serializer_class(self):
        # Admin updates use write serializer; GET uses read one
        return StudentWriteSerializer if self.request.method in ("PUT", "PATCH") else StudentReadSerializer
    

class MyStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response({"detail":"Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StudentReadSerializer(student, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response({"detail":"Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StudentWriteSerializer(student, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Return the updated data using the read serializer
        read_serializer = StudentReadSerializer(student, context={"request": request})
        return Response(read_serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Verify user email with token"""
    token = request.data.get('token')
    
    if not token:
        return Response(
            {'error': 'Verification token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email_verification_token=token)
        
        # Check if token is expired (24 hours)
        from django.utils import timezone
        from datetime import timedelta
        
        if user.email_verification_sent_at:
            expiry_time = user.email_verification_sent_at + timedelta(hours=24)
            if timezone.now() > expiry_time:
                return Response(
                    {'error': 'Verification link has expired. Please request a new one.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Verify the email
        user.is_email_verified = True
        user.email_verification_token = None
        user.save()
        
        # Send welcome email now
        from .utils import send_welcome_email
        send_welcome_email(user)
        
        return Response({
            'message': 'Email verified successfully! You can now login.',
            'email': user.email
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid verification token'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    """Resend verification email"""
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email__iexact=email)
        
        if user.is_email_verified:
            return Response(
                {'error': 'Email is already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Resend verification email
        from .utils import send_verification_email
        send_verification_email(user)
        
        return Response({
            'message': 'Verification email sent! Please check your inbox.',
            'email': user.email
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'No account found with this email'},
            status=status.HTTP_404_NOT_FOUND
        )



class CourseMaterialListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsAdminOrInstructor]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        if course_id:
            return CourseMaterial.objects.filter(course_id=course_id)
        return CourseMaterial.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class CourseMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseMaterial.objects.all()
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsAdminOrInstructor]



class PublicInstructorProfileView(generics.RetrieveAPIView):
    """Public view for instructor profiles - no authentication required"""
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'user_id'
    
    def get_queryset(self):
        # Only return profiles with Instructor role
        return Profile.objects.filter(role='Instructor').select_related('user')



class CourseEnrollmentListView(generics.ListAPIView):
    """List all course enrollments (for admin)"""
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = CourseEnrollment.objects.all().select_related('student', 'course').order_by('-applied_at')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'course']
    search_fields = ['student__first_name', 'student__last_name', 'student__email', 'course__name']
    ordering_fields = ['applied_at', 'updated_at', 'status']


class CourseEnrollmentDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a course enrollment"""
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = CourseEnrollment.objects.all()
