"""
Extended views for additional functionality
"""
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from django.utils import timezone

from .models import (
    Student, StudentSelection, Course, Event, 
    LearningSchedule, Alumni, Review
)
from .serializers import (
    StudentReadSerializer, StudentSelectionSerializer,
    CourseReadSerializer, EventReadSerializer
)


class StudentDashboardView(APIView):
    """
    Student dashboard with all relevant information
    GET /api/v1/students/me/dashboard/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Student profile not found. Please complete your application."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get application status
        selection_steps = StudentSelection.objects.filter(student=student)
        total_steps = selection_steps.count()
        completed_steps = selection_steps.filter(status="Completed").count()
        
        application_status = "pending"
        if total_steps > 0:
            if completed_steps == total_steps:
                application_status = "approved"
            elif completed_steps > 0:
                application_status = "in_progress"

        # Get enrolled schedules
        enrolled_schedules = student.schedules.all()

        # Get upcoming events
        upcoming_events = Event.objects.filter(
            date__gte=timezone.now()
        ).order_by('date')[:5]

        data = {
            "profile": StudentReadSerializer(student, context={'request': request}).data,
            "application_status": application_status,
            "selection_progress": {
                "total_steps": total_steps,
                "completed_steps": completed_steps,
                "steps": StudentSelectionSerializer(selection_steps, many=True).data
            },
            "enrolled_schedules": [
                {
                    "id": schedule.id,
                    "course": schedule.course.name,
                    "start_date": schedule.start_date,
                    "end_date": schedule.end_date,
                    "location": str(schedule.location),
                }
                for schedule in enrolled_schedules
            ],
            "upcoming_events": [
                {
                    "id": event.id,
                    "title": event.title,
                    "date": event.date,
                    "is_virtual": event.is_virtual,
                }
                for event in upcoming_events
            ],
            "learning_materials": {
                "github": "https://github.com/your-org/learning-materials" if application_status == "approved" else None,
                "discord": "https://discord.gg/your-invite" if application_status == "approved" else None,
                "message": "Complete your application to access learning materials" if application_status != "approved" else "Access granted"
            }
        }

        return Response(data)


class AdminDashboardView(APIView):
    """
    Admin dashboard with statistics
    GET /api/v1/admin/dashboard/
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Student statistics
        total_students = Student.objects.count()
        
        # Count pending applications (students with incomplete selection steps)
        pending_applications = Student.objects.filter(
            Q(selection_steps__status="Pending") |
            ~Q(selection_steps__isnull=False)
        ).distinct().count()

        # Course statistics
        active_courses = Course.objects.filter(parent__isnull=True).count()
        total_subcourses = Course.objects.filter(parent__isnull=False).count()

        # Event statistics
        upcoming_events = Event.objects.filter(date__gte=timezone.now()).count()
        past_events = Event.objects.filter(date__lt=timezone.now()).count()

        # Schedule statistics
        active_schedules = LearningSchedule.objects.filter(
            end_date__gte=timezone.now().date()
        ).count()

        # Alumni statistics
        total_alumni = Alumni.objects.count()

        # Review statistics
        total_reviews = Review.objects.count()
        avg_rating = Review.objects.aggregate(
            avg=Count('rating')
        ).get('avg', 0)

        data = {
            "students": {
                "total": total_students,
                "pending_applications": pending_applications,
                "approved": total_students - pending_applications,
            },
            "courses": {
                "active": active_courses,
                "subcourses": total_subcourses,
                "total": active_courses + total_subcourses,
            },
            "events": {
                "upcoming": upcoming_events,
                "past": past_events,
                "total": upcoming_events + past_events,
            },
            "schedules": {
                "active": active_schedules,
            },
            "alumni": {
                "total": total_alumni,
            },
            "reviews": {
                "total": total_reviews,
                "average_rating": avg_rating,
            }
        }

        return Response(data)


class StudentApplicationStatusView(APIView):
    """
    Check student application status
    GET /api/v1/students/me/application-status/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {
                    "status": "not_applied",
                    "message": "You haven't submitted a student application yet."
                },
                status=status.HTTP_200_OK
            )

        selection_steps = StudentSelection.objects.filter(student=student)
        total_steps = selection_steps.count()
        completed_steps = selection_steps.filter(status="Completed").count()

        if total_steps == 0:
            application_status = "submitted"
            message = "Your application is under review."
        elif completed_steps == total_steps:
            application_status = "approved"
            message = "Congratulations! Your application has been approved."
        elif completed_steps > 0:
            application_status = "in_progress"
            message = f"Your application is in progress. {completed_steps}/{total_steps} steps completed."
        else:
            application_status = "pending"
            message = "Your application is pending review."

        return Response({
            "status": application_status,
            "message": message,
            "progress": {
                "total_steps": total_steps,
                "completed_steps": completed_steps,
                "percentage": (completed_steps / total_steps * 100) if total_steps > 0 else 0
            },
            "steps": StudentSelectionSerializer(selection_steps, many=True).data
        })


class EnrollScheduleView(APIView):
    """
    Enroll in a learning schedule
    POST /api/v1/students/me/enroll/<schedule_id>/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, schedule_id):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Student profile not found. Please complete your application first."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if application is approved
        selection_steps = StudentSelection.objects.filter(student=student)
        total_steps = selection_steps.count()
        completed_steps = selection_steps.filter(status="Completed").count()
        
        if total_steps > 0 and completed_steps < total_steps:
            return Response(
                {"detail": "Your application must be approved before enrolling in courses."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            schedule = LearningSchedule.objects.get(id=schedule_id)
        except LearningSchedule.DoesNotExist:
            return Response(
                {"detail": "Schedule not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already enrolled
        if student.schedules.filter(id=schedule_id).exists():
            return Response(
                {"detail": "You are already enrolled in this schedule."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enroll student
        student.schedules.add(schedule)
        student.courses.add(schedule.course)

        return Response({
            "message": "Successfully enrolled in the schedule!",
            "schedule": {
                "id": schedule.id,
                "course": schedule.course.name,
                "start_date": schedule.start_date,
                "end_date": schedule.end_date,
                "location": str(schedule.location),
            }
        }, status=status.HTTP_201_CREATED)


class LearningMaterialsView(APIView):
    """
    Get learning materials (GitHub, Discord, etc.)
    GET /api/v1/students/me/learning-materials/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user.student
        except Student.DoesNotExist:
            return Response(
                {"detail": "Student profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if application is approved
        selection_steps = StudentSelection.objects.filter(student=student)
        total_steps = selection_steps.count()
        completed_steps = selection_steps.filter(status="Completed").count()

        if total_steps == 0 or completed_steps < total_steps:
            return Response({
                "access_granted": False,
                "message": "Complete your application to access learning materials.",
                "materials": None
            })

        # Return learning materials
        return Response({
            "access_granted": True,
            "message": "You have access to all learning materials!",
            "materials": {
                "github": {
                    "url": "https://github.com/your-org/learning-materials",
                    "description": "Access course code, projects, and resources"
                },
                "discord": {
                    "url": "https://discord.gg/your-invite",
                    "description": "Join our community and get support"
                },
                "video_materials": {
                    "url": "https://youtube.com/playlist/your-playlist",
                    "description": "Watch video tutorials and lectures"
                },
                "documentation": {
                    "url": "https://docs.yoursite.com",
                    "description": "Read comprehensive documentation"
                }
            }
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_courses(request):
    """
    Get courses the authenticated student is enrolled in
    GET /api/v1/students/me/courses/
    """
    try:
        student = request.user.student
        courses = student.courses.all()
        serializer = CourseReadSerializer(courses, many=True)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response(
            {"detail": "Student profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_events(request):
    """
    Get events the authenticated student is attending
    GET /api/v1/students/me/events/
    """
    try:
        student = request.user.student
        # Get events student is attending
        attended_events = Event.objects.filter(
            attendances__student=student
        )
        serializer = EventReadSerializer(attended_events, many=True, context={'request': request})
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response(
            {"detail": "Student profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
