from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
	Course,
	Event,
	EventAttendance,
	LearningSchedule,
	Location,
	SelectionProcedure,
	Student,
	StudentSelection,
)


User = get_user_model()


class LearningScheduleDurationTests(TestCase):
	def test_duration_counts_inclusive_calendar_months(self):
		user = User.objects.create_user(username="instructor", email="instructor@example.com")
		location = Location.objects.create(name="Online", location_type="Online")
		course = Course.objects.create(
			name="R for Quantitative Research",
			category="Quantitative Methods",
			description="Applied research training",
			instructor=user,
		)

		schedule = LearningSchedule.objects.create(
			course=course,
			location=location,
			instructor=user,
			start_date=date(2026, 11, 1),
			end_date=date(2027, 1, 31),
		)

		self.assertEqual(schedule.duration, 3)


class UserScopedEndpointPermissionTests(APITestCase):
	def setUp(self):
		self.admin = User.objects.create_user(
			username="admin",
			email="admin@example.com",
			password="password123",
			is_staff=True,
		)
		self.user = User.objects.create_user(
			username="student-one",
			email="student-one@example.com",
			password="password123",
		)
		self.other_user = User.objects.create_user(
			username="student-two",
			email="student-two@example.com",
			password="password123",
		)
		self.location = Location.objects.create(
			name="Online Nigeria",
			location_type="Online",
			online_region="Nigeria",
		)
		self.course = Course.objects.create(
			name="R for Quantitative Research",
			category="Quantitative Methods",
			description="Applied research training",
			instructor=self.admin,
		)
		self.course.locations.add(self.location)

		self.student = self._create_student(self.user, "STU001")
		self.other_student = self._create_student(self.other_user, "STU002")

	def _create_student(self, user, register_number):
		return Student.objects.create(
			user=user,
			email=user.email,
			phone="+2348000000000",
			first_name=user.first_name or user.username,
			last_name="Learner",
			gender="Other",
			birth_date=date(1995, 1, 1),
			country_of_birth="NG",
			nationality="NG",
			register_number=register_number,
			diploma_level="Bachelor",
			job_status="Student",
			english_level=4,
			has_laptop=True,
		)

	def test_student_detail_is_limited_to_owner_or_admin(self):
		self.client.force_authenticate(user=self.user)

		own_response = self.client.get(f"/api/v1/students/{self.student.pk}/")
		other_response = self.client.get(f"/api/v1/students/{self.other_student.pk}/")

		self.assertEqual(own_response.status_code, status.HTTP_200_OK)
		self.assertEqual(other_response.status_code, status.HTTP_404_NOT_FOUND)

		self.client.force_authenticate(user=self.admin)
		admin_response = self.client.get(f"/api/v1/students/{self.other_student.pk}/")
		self.assertEqual(admin_response.status_code, status.HTTP_200_OK)

	def test_student_selection_endpoints_are_admin_only(self):
		step = SelectionProcedure.objects.create(step_name="Review", description="Admin review", order=1)
		selection = StudentSelection.objects.create(student=self.student, step=step, status="Pending")

		self.client.force_authenticate(user=self.user)
		list_response = self.client.get("/api/v1/student-selection/")
		detail_response = self.client.get(f"/api/v1/student-selection/{selection.pk}/")

		self.assertEqual(list_response.status_code, status.HTTP_403_FORBIDDEN)
		self.assertEqual(detail_response.status_code, status.HTTP_403_FORBIDDEN)

	def test_event_attendance_endpoints_are_admin_only(self):
		event = Event.objects.create(
			title="Orientation",
			description="Welcome session",
			date=timezone.now() + timedelta(days=1),
			location=self.location,
		)
		attendance = EventAttendance.objects.create(event=event, student=self.student)

		self.client.force_authenticate(user=self.user)
		list_response = self.client.get("/api/v1/event-attendance/")
		detail_response = self.client.get(f"/api/v1/event-attendance/{attendance.pk}/")

		self.assertEqual(list_response.status_code, status.HTTP_403_FORBIDDEN)
		self.assertEqual(detail_response.status_code, status.HTTP_403_FORBIDDEN)

	def test_live_session_detail_is_limited_to_enrolled_student_or_admin(self):
		schedule = LearningSchedule.objects.create(
			course=self.course,
			start_date=date.today(),
			end_date=date.today() + timedelta(days=30),
			instructor=self.admin,
			location=self.location,
		)
		self.student.schedules.add(schedule)
		live_session = schedule.live_sessions.create(
			title="Week 1 Live Class",
			session_date=timezone.now() + timedelta(days=1),
			discord_link="https://discord.gg/example",
		)

		self.client.force_authenticate(user=self.user)
		own_response = self.client.get(f"/api/v1/live-sessions/{live_session.pk}/")
		self.assertEqual(own_response.status_code, status.HTTP_200_OK)

		self.client.force_authenticate(user=self.other_user)
		other_response = self.client.get(f"/api/v1/live-sessions/{live_session.pk}/")
		self.assertEqual(other_response.status_code, status.HTTP_404_NOT_FOUND)

		self.client.force_authenticate(user=self.admin)
		admin_response = self.client.get(f"/api/v1/live-sessions/{live_session.pk}/")
		self.assertEqual(admin_response.status_code, status.HTTP_200_OK)
