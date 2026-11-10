from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from django.test import TestCase
from django.test import override_settings
from django.core.management import call_command
from unittest.mock import Mock, patch
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
	Course,
	Event,
	EventAttendance,
	EventRegistration,
	LearningSchedule,
	Location,
	CourseEnrollment,
	CoursePrice,
	InstallmentPayment,
	InstallmentPlan,
	Lesson,
	LessonProgress,
	Module,
	Payment,
	Profile,
	SelectionProcedure,
	Student,
	StudentSelection,
)
from .serializers import ProfileSerializer


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

	def test_course_api_exposes_and_saves_installment_availability(self):
		self.client.force_authenticate(user=self.admin)

		update_response = self.client.patch(
			f"/api/v1/courses/{self.course.pk}/",
			{"installments_enabled": True},
			format="json",
		)

		self.assertEqual(update_response.status_code, status.HTTP_200_OK)
		self.assertTrue(update_response.data["installments_enabled"])
		self.course.refresh_from_db()
		self.assertTrue(self.course.installments_enabled)

		public_response = self.client.get("/api/v1/courses/?public=true")

		self.assertEqual(public_response.status_code, status.HTTP_200_OK)
		public_courses = public_response.data.get("results", public_response.data)
		course_data = next(item for item in public_courses if item["id"] == self.course.pk)
		self.assertTrue(course_data["installments_enabled"])

		CoursePrice.objects.create(
			course=self.course,
			currency="NGN",
			amount="10000.00",
			is_active=True,
		)
		pricing_response = self.client.get("/api/v1/pricing/")
		self.assertEqual(pricing_response.status_code, status.HTTP_200_OK)
		priced_courses = pricing_response.data.get("results", pricing_response.data)
		priced_course = next(item for item in priced_courses if item["id"] == self.course.pk)
		self.assertTrue(priced_course["installments_enabled"])

		curriculum_response = self.client.get(
			f"/api/v1/courses/{self.course.pk}/curriculum/"
		)
		self.assertEqual(curriculum_response.status_code, status.HTTP_200_OK)
		self.assertTrue(curriculum_response.data["installments_enabled"])

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

	def test_event_reminders_send_only_once_to_registrants(self):
		event = Event.objects.create(
			title="Research Workshop",
			description="Workshop details",
			date=timezone.now() + timedelta(days=1),
			is_virtual=True,
			meeting_link="https://discord.gg/example",
		)
		registration = EventRegistration.objects.create(
			event=event,
			full_name="Registered Learner",
			email="registered@example.com",
		)
		self.client.force_authenticate(user=self.admin)

		with patch("courses.utils.send_event_reminder_email", return_value=True) as send_email:
			response = self.client.post(
				f"/api/v1/admin/events/{event.pk}/send-reminders/"
			)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data, {
			"total_registrations": 1,
			"already_sent": 0,
			"sent": 1,
			"failed": 0,
		})
		send_email.assert_called_once()
		registration.refresh_from_db()
		self.assertIsNotNone(registration.reminder_sent_at)

		with patch("courses.utils.send_event_reminder_email") as send_email:
			response = self.client.post(
				f"/api/v1/admin/events/{event.pk}/send-reminders/"
			)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["sent"], 0)
		self.assertEqual(response.data["already_sent"], 1)
		send_email.assert_not_called()

	def test_event_reminders_can_be_explicitly_resent_to_everyone(self):
		event = Event.objects.create(
			title="Research Workshop",
			description="Workshop details",
			date=timezone.now() + timedelta(days=1),
			is_virtual=True,
			meeting_link="https://meet.google.com/example",
		)
		registration = EventRegistration.objects.create(
			event=event,
			full_name="Registered Learner",
			email="registered@example.com",
			reminder_sent_at=timezone.now() - timedelta(hours=1),
		)
		self.client.force_authenticate(user=self.admin)

		with patch("courses.utils.send_event_reminder_email", return_value=True) as send_email:
			response = self.client.post(
				f"/api/v1/admin/events/{event.pk}/send-reminders/",
				{"resend_all": True},
				format="json",
			)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["sent"], 1)
		self.assertEqual(response.data["already_sent"], 1)
		send_email.assert_called_once()
		registration.refresh_from_db()
		self.assertGreater(registration.reminder_sent_at, timezone.now() - timedelta(minutes=1))

	def test_event_reminder_requires_meeting_link(self):
		event = Event.objects.create(
			title="Research Workshop",
			description="Workshop details",
			date=timezone.now() + timedelta(days=1),
			is_virtual=True,
		)
		self.client.force_authenticate(user=self.admin)

		with patch("courses.utils.send_event_reminder_email") as send_email:
			response = self.client.post(
				f"/api/v1/admin/events/{event.pk}/send-reminders/"
			)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		send_email.assert_not_called()

	def test_failed_event_reminder_remains_eligible_for_retry(self):
		event = Event.objects.create(
			title="Research Workshop",
			description="Workshop details",
			date=timezone.now() + timedelta(days=1),
			is_virtual=True,
			meeting_link="https://discord.gg/example",
		)
		registration = EventRegistration.objects.create(
			event=event,
			full_name="Registered Learner",
			email="registered@example.com",
		)
		self.client.force_authenticate(user=self.admin)

		with patch("courses.utils.send_event_reminder_email", return_value=False):
			response = self.client.post(
				f"/api/v1/admin/events/{event.pk}/send-reminders/"
			)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["sent"], 0)
		self.assertEqual(response.data["failed"], 1)
		registration.refresh_from_db()
		self.assertIsNone(registration.reminder_sent_at)

	def test_event_reminder_endpoint_is_admin_only(self):
		event = Event.objects.create(
			title="Research Workshop",
			description="Workshop details",
			date=timezone.now() + timedelta(days=1),
			is_virtual=True,
			meeting_link="https://discord.gg/example",
		)
		self.client.force_authenticate(user=self.user)

		response = self.client.post(
			f"/api/v1/admin/events/{event.pk}/send-reminders/"
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_event_reminder_status_is_admin_only_and_reports_pending(self):
		event = Event.objects.create(
			title="Research Workshop",
			description="Workshop details",
			date=timezone.now() + timedelta(days=1),
			is_virtual=True,
			meeting_link="https://discord.gg/example",
		)
		registration = EventRegistration.objects.create(
			event=event,
			full_name="Registered Learner",
			email="registered@example.com",
		)

		self.client.force_authenticate(user=self.user)
		response = self.client.get(
			f"/api/v1/admin/events/{event.pk}/send-reminders/"
		)
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

		self.client.force_authenticate(user=self.admin)
		response = self.client.get(
			f"/api/v1/admin/events/{event.pk}/send-reminders/"
		)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data, {
			"total_registrations": 1,
			"already_sent": 0,
			"pending": 1,
			"has_meeting_link": True,
		})

		registration.reminder_sent_at = timezone.now()
		registration.save(update_fields=["reminder_sent_at"])
		response = self.client.get(
			f"/api/v1/admin/events/{event.pk}/send-reminders/"
		)
		self.assertEqual(response.data["pending"], 0)
		self.assertEqual(response.data["already_sent"], 1)

	def test_event_meeting_link_is_hidden_from_public_event_responses(self):
		event = Event.objects.create(
			title="Research Workshop",
			description="Workshop details",
			date=timezone.now() + timedelta(days=1),
			is_virtual=True,
			meeting_link="https://discord.gg/example",
		)

		response = self.client.get(f"/api/v1/events/{event.pk}/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertNotIn("meeting_link", response.data)

		self.client.force_authenticate(user=self.admin)
		response = self.client.get(f"/api/v1/events/{event.pk}/")
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data["meeting_link"], event.meeting_link)

	def test_only_paid_enrollments_count_as_applications(self):
		profile = Profile.objects.create(user=self.user, role="Student")
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		payment = Payment.objects.create(
			enrollment=enrollment,
			amount="20000.00",
			currency="NGN",
			status="pending",
		)

		self.assertFalse(ProfileSerializer().get_has_application(profile))
		self.client.force_authenticate(user=self.admin)
		response = self.client.get("/api/v1/admin/enrollments/")
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		results = response.data.get("results", response.data)
		self.assertNotIn(enrollment.id, [item["id"] for item in results])

		payment.status = "paid"
		payment.save(update_fields=["status"])
		self.assertTrue(ProfileSerializer().get_has_application(profile))
		response = self.client.get("/api/v1/admin/enrollments/")
		results = response.data.get("results", response.data)
		self.assertIn(enrollment.id, [item["id"] for item in results])

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

	def test_installment_checkout_requires_course_enablement(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		self.client.force_authenticate(user=self.user)

		response = self.client.post(
			"/api/v1/installments/initiate/",
			{
				"enrollment_id": enrollment.pk,
				"currency": "NGN",
				"installment_number": 1,
			},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("not available", response.data["detail"])

	def test_pending_full_payment_without_processor_reference_can_switch_to_installments(self):
		self.course.installments_enabled = True
		self.course.save(update_fields=["installments_enabled"])
		CoursePrice.objects.create(
			course=self.course,
			currency="NGN",
			amount="1000.00",
		)
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		payment = Payment.objects.create(
			enrollment=enrollment,
			amount="1000.00",
			currency="NGN",
			status="pending",
		)
		self.client.force_authenticate(user=self.user)

		with override_settings(PAYSTACK_SECRET_KEY=""):
			response = self.client.post(
				"/api/v1/installments/initiate/",
				{
					"enrollment_id": enrollment.pk,
					"currency": "NGN",
					"installment_number": 1,
				},
				format="json",
			)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		payment.refresh_from_db()
		self.assertEqual(payment.status, "failed")
		self.assertTrue(InstallmentPlan.objects.filter(enrollment=enrollment).exists())

	def test_abandoned_full_payment_allows_installment_checkout(self):
		self.course.installments_enabled = True
		self.course.save(update_fields=["installments_enabled"])
		CoursePrice.objects.create(
			course=self.course,
			currency="NGN",
			amount="1000.00",
		)
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		payment = Payment.objects.create(
			enrollment=enrollment,
			amount="1000.00",
			currency="NGN",
			status="pending",
			processor="paystack",
			processor_reference="abandoned-full-payment",
			authorization_url="https://checkout.paystack.com/old",
		)
		self.client.force_authenticate(user=self.user)
		verification_response = Mock(ok=True)
		verification_response.json.return_value = {
			"status": True,
			"data": {
				"status": "abandoned",
				"reference": "abandoned-full-payment",
			},
		}
		initialization_response = Mock(ok=True)
		initialization_response.json.return_value = {
			"status": True,
			"data": {"authorization_url": "https://checkout.paystack.com/installment"},
		}

		with (
			override_settings(PAYSTACK_SECRET_KEY="test-secret"),
			patch(
				"courses.views_payment.http_requests.get",
				return_value=verification_response,
			),
			patch(
				"courses.views_payment.http_requests.post",
				return_value=initialization_response,
			),
		):
			response = self.client.post(
				"/api/v1/installments/initiate/",
				{
					"enrollment_id": enrollment.pk,
					"currency": "NGN",
					"installment_number": 1,
				},
				format="json",
			)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		payment.refresh_from_db()
		self.assertEqual(payment.status, "failed")
		self.assertEqual(payment.authorization_url, "")
		self.assertTrue(InstallmentPlan.objects.filter(enrollment=enrollment).exists())

	def test_active_full_payment_checkout_still_blocks_installments(self):
		self.course.installments_enabled = True
		self.course.save(update_fields=["installments_enabled"])
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		payment = Payment.objects.create(
			enrollment=enrollment,
			amount="1000.00",
			currency="NGN",
			status="pending",
			processor="paystack",
			processor_reference="active-full-payment",
		)
		self.client.force_authenticate(user=self.user)
		verification_response = Mock(ok=True)
		verification_response.json.return_value = {
			"status": True,
			"data": {
				"status": "ongoing",
				"reference": "active-full-payment",
			},
		}

		with (
			override_settings(PAYSTACK_SECRET_KEY="test-secret"),
			patch(
				"courses.views_payment.http_requests.get",
				return_value=verification_response,
			),
		):
			response = self.client.post(
				"/api/v1/installments/initiate/",
				{
					"enrollment_id": enrollment.pk,
					"currency": "NGN",
					"installment_number": 1,
				},
				format="json",
			)

		self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
		self.assertIn("still active", response.data["detail"])
		payment.refresh_from_db()
		self.assertEqual(payment.status, "pending")
		self.assertFalse(InstallmentPlan.objects.filter(enrollment=enrollment).exists())

	def test_missing_paystack_transaction_does_not_allow_unsafe_installment_switch(self):
		self.course.installments_enabled = True
		self.course.save(update_fields=["installments_enabled"])
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		payment = Payment.objects.create(
			enrollment=enrollment,
			amount="1000.00",
			currency="NGN",
			status="pending",
			processor="paystack",
			processor_reference="missing-full-payment",
		)
		self.client.force_authenticate(user=self.user)
		verification_response = Mock(ok=False, status_code=404)
		verification_response.json.return_value = {
			"status": False,
			"message": "Transaction reference not found",
		}

		with (
			override_settings(PAYSTACK_SECRET_KEY="test-secret"),
			patch(
				"courses.views_payment.http_requests.get",
				return_value=verification_response,
			),
		):
			response = self.client.post(
				"/api/v1/installments/initiate/",
				{
					"enrollment_id": enrollment.pk,
					"currency": "NGN",
					"installment_number": 1,
				},
				format="json",
			)

		self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
		self.assertIn("same Paystack test/live environment", response.data["detail"])
		payment.refresh_from_db()
		self.assertEqual(payment.status, "pending")
		self.assertFalse(InstallmentPlan.objects.filter(enrollment=enrollment).exists())

	def test_installment_checkout_reuses_existing_pending_attempt(self):
		self.course.installments_enabled = True
		self.course.save(update_fields=["installments_enabled"])
		CoursePrice.objects.create(
			course=self.course,
			currency="NGN",
			amount="1000.00",
		)
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		plan = InstallmentPlan.objects.create(
			enrollment=enrollment,
			currency="NGN",
			total_amount="1000.00",
		)
		InstallmentPayment.objects.create(
			plan=plan,
			installment_number=1,
			amount="500.00",
			currency="NGN",
			status="pending",
			processor="paystack",
			processor_reference="existing-reference",
			authorization_url="https://checkout.paystack.com/existing",
		)
		self.client.force_authenticate(user=self.user)

		with (
			override_settings(PAYSTACK_SECRET_KEY="test-secret"),
			patch("courses.views_payment.http_requests.post") as initialize_request,
		):
			response = self.client.post(
				"/api/v1/installments/initiate/",
				{
					"enrollment_id": enrollment.pk,
					"currency": "NGN",
					"installment_number": 1,
				},
				format="json",
			)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(
			response.data["authorization_url"],
			"https://checkout.paystack.com/existing",
		)
		initialize_request.assert_not_called()

	def test_payment_webhook_rejects_missing_signature(self):
		with override_settings(PAYSTACK_SECRET_KEY="test-secret"):
			response = self.client.post(
				"/api/v1/payments/webhook/?processor=paystack",
				{},
				format="json",
			)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_installment_verification_completes_plan_without_name_error(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
			status="Approved",
		)
		plan = InstallmentPlan.objects.create(
			enrollment=enrollment,
			currency="NGN",
			total_amount="1000.00",
		)
		InstallmentPayment.objects.create(
			plan=plan,
			installment_number=1,
			amount="500.00",
			currency="NGN",
			status="paid",
		)
		second_payment = InstallmentPayment.objects.create(
			plan=plan,
			installment_number=2,
			amount="500.00",
			currency="NGN",
			processor="paystack",
			processor_reference="installment-reference",
		)
		self.client.force_authenticate(user=self.user)

		with (
			override_settings(PAYSTACK_SECRET_KEY="test-secret"),
			patch("courses.views_payment.http_requests.get") as verify_request,
		):
			verify_request.return_value.ok = True
			verify_request.return_value.json.return_value = {
				"status": True,
				"data": {
					"reference": "installment-reference",
					"status": "success",
					"amount": 50000,
					"currency": "NGN",
				},
			}
			response = self.client.post(
				"/api/v1/installments/verify/",
				{"reference": "installment-reference"},
				format="json",
			)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		plan.refresh_from_db()
		second_payment.refresh_from_db()
		enrollment.refresh_from_db()
		self.assertEqual(plan.status, "completed")
		self.assertEqual(second_payment.status, "paid")
		self.assertEqual(enrollment.status, "Approved")

	def test_pending_grace_period_extends_deadline_while_under_review(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		deadline = timezone.now() - timedelta(hours=1)
		grace_expiry = deadline + timedelta(hours=48)
		plan = InstallmentPlan.objects.create(
			enrollment=enrollment,
			currency="NGN",
			total_amount="1000.00",
			second_installment_deadline=deadline,
			grace_period_requested=True,
			grace_period_expires_at=grace_expiry,
		)

		self.assertEqual(plan.effective_deadline, grace_expiry)

	def test_failed_installment_reminder_is_not_marked_sent(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
		)
		plan = InstallmentPlan.objects.create(
			enrollment=enrollment,
			currency="NGN",
			total_amount="1000.00",
			second_installment_deadline=timezone.now() + timedelta(days=3),
		)
		InstallmentPayment.objects.create(
			plan=plan,
			installment_number=1,
			amount="500.00",
			currency="NGN",
			status="paid",
		)

		with patch(
			"courses.management.commands.enforce_installment_deadlines.send_mail",
			side_effect=OSError("mail service unavailable"),
		):
			call_command("enforce_installment_deadlines")

		plan.refresh_from_db()
		self.assertIsNone(plan.reminder_sent_at)

	def test_material_access_is_blocked_if_any_approved_plan_is_incomplete(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
			status="Approved",
		)
		other_course = Course.objects.create(
			name="Another Course",
			category=self.course.category,
			description="A separate course",
			instructor=self.admin,
		)
		other_enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=other_course,
			status="Approved",
		)
		InstallmentPlan.objects.create(
			enrollment=other_enrollment,
			currency="NGN",
			total_amount="1000.00",
			status="active",
		)
		self.client.force_authenticate(user=self.user)

		response = self.client.get("/api/v1/students/me/learning-materials/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertFalse(response.data["access_granted"])

	def test_first_installment_grants_material_access(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
			status="Approved",
		)
		plan = InstallmentPlan.objects.create(
			enrollment=enrollment,
			currency="NGN",
			total_amount="1000.00",
			status="active",
		)
		InstallmentPayment.objects.create(
			plan=plan,
			installment_number=1,
			amount="500.00",
			currency="NGN",
			status="paid",
		)
		self.client.force_authenticate(user=self.user)

		response = self.client.get("/api/v1/students/me/learning-materials/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["access_granted"])
		self.assertIn("modules_api", response.data["materials"])
		self.assertNotIn("github", response.data["materials"])

	def test_first_installment_unlocks_first_course_module(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
			status="Approved",
		)
		plan = InstallmentPlan.objects.create(
			enrollment=enrollment,
			currency="NGN",
			total_amount="1000.00",
			status="active",
		)
		InstallmentPayment.objects.create(
			plan=plan,
			installment_number=1,
			amount="500.00",
			currency="NGN",
			status="paid",
		)
		schedule = LearningSchedule.objects.create(
			course=self.course,
			location=self.location,
			instructor=self.admin,
			start_date=date.today(),
			end_date=date.today() + timedelta(days=30),
		)
		self.student.schedules.add(schedule)
		module = Module.objects.create(
			schedule=schedule,
			title="Foundations",
			order=1,
		)
		Lesson.objects.create(module=module, title="Introduction", order=1)
		self.client.force_authenticate(user=self.user)

		response = self.client.get("/api/v1/students/me/learning-modules/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data["schedules"][0]["modules"][0]["unlocked"])

	def test_learning_modules_unlock_after_every_lesson_is_completed(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
			status="Approved",
		)
		schedule = LearningSchedule.objects.create(
			course=self.course,
			location=self.location,
			instructor=self.admin,
			start_date=date.today(),
			end_date=date.today() + timedelta(days=30),
		)
		self.student.schedules.add(schedule)
		first_module = Module.objects.create(
			schedule=schedule,
			title="Foundations",
			order=1,
		)
		first_lessons = [
			Lesson.objects.create(module=first_module, title=f"Lesson {i}", order=i)
			for i in (1, 2)
		]
		second_module = Module.objects.create(
			schedule=schedule,
			title="Next steps",
			order=2,
		)
		locked_lesson = Lesson.objects.create(
			module=second_module,
			title="Locked lesson",
			order=1,
			content="Only available after the first module.",
		)
		self.client.force_authenticate(user=self.user)

		response = self.client.get("/api/v1/students/me/learning-modules/")

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		modules = response.data["schedules"][0]["modules"]
		self.assertTrue(modules[0]["unlocked"])
		self.assertEqual(len(modules[0]["lessons"]), 2)
		self.assertFalse(modules[1]["unlocked"])
		self.assertEqual(modules[1]["lessons"], [])

		locked_progress_response = self.client.post(
			"/api/v1/students/me/progress/",
			{"lesson": locked_lesson.pk},
			format="json",
		)
		self.assertEqual(
			locked_progress_response.status_code,
			status.HTTP_403_FORBIDDEN,
		)
		for lesson in first_lessons:
			LessonProgress.objects.create(
				student=self.student,
				lesson=lesson,
				completed_at=timezone.now(),
			)

		response = self.client.get("/api/v1/students/me/learning-modules/")

		self.assertTrue(response.data["schedules"][0]["modules"][1]["unlocked"])
		self.assertEqual(
			response.data["schedules"][0]["modules"][1]["lessons"][0]["content"],
			"Only available after the first module.",
		)

	def test_lesson_content_api_requires_auth_and_hides_locked_lessons(self):
		enrollment = CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
			status="Approved",
		)
		schedule = LearningSchedule.objects.create(
			course=self.course,
			location=self.location,
			instructor=self.admin,
			start_date=date.today(),
			end_date=date.today() + timedelta(days=30),
		)
		self.student.schedules.add(schedule)
		first_module = Module.objects.create(
			schedule=schedule,
			title="Foundations",
			order=1,
		)
		Lesson.objects.create(module=first_module, title="Unlocked", order=1)
		second_module = Module.objects.create(
			schedule=schedule,
			title="Next steps",
			order=2,
		)
		locked_lesson = Lesson.objects.create(
			module=second_module,
			title="Locked",
			order=1,
			content="Do not expose yet.",
		)

		self.assertEqual(
			self.client.get("/api/v1/lessons/").status_code,
			status.HTTP_401_UNAUTHORIZED,
		)
		self.client.force_authenticate(user=self.user)
		response = self.client.get(f"/api/v1/lessons/{locked_lesson.pk}/")
		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

	def test_schedule_enrollment_requires_approval_for_that_course(self):
		CourseEnrollment.objects.create(
			student=self.student,
			course=self.course,
			status="Approved",
		)
		other_course = Course.objects.create(
			name="Another Course",
			category=self.course.category,
			description="A separate course",
			instructor=self.admin,
		)
		schedule = LearningSchedule.objects.create(
			course=other_course,
			location=self.location,
			instructor=self.admin,
			start_date=date.today(),
			end_date=date.today() + timedelta(days=30),
		)
		self.client.force_authenticate(user=self.user)

		response = self.client.post(f"/api/v1/students/me/enroll/{schedule.pk}/")

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
		self.assertFalse(self.student.schedules.filter(pk=schedule.pk).exists())
