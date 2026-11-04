from .models import CourseEnrollment, InstallmentPlan, LessonProgress, Module


def has_learning_access(enrollment):
    if enrollment.status != "Approved":
        return False

    try:
        plan = enrollment.installment_plan
    except InstallmentPlan.DoesNotExist:
        return True

    return (
        plan.status in ("active", "completed")
        and plan.installments.filter(
            installment_number=1,
            status="paid",
        ).exists()
    )


def get_student_schedule_modules(student, schedule):
    enrollment = CourseEnrollment.objects.filter(
        student=student,
        course=schedule.course,
        status="Approved",
    ).first()
    if (
        enrollment is None
        or not student.schedules.filter(pk=schedule.pk).exists()
        or not has_learning_access(enrollment)
    ):
        return None

    modules = list(
        Module.objects.filter(schedule=schedule)
        .prefetch_related("lessons")
        .order_by("order")
    )
    completed_lesson_ids = set(
        LessonProgress.objects.filter(
            student=student,
            lesson__module__schedule=schedule,
            completed_at__isnull=False,
        ).values_list("lesson_id", flat=True)
    )

    previous_module_complete = True
    module_access = []
    for module in modules:
        lessons = list(module.lessons.all())
        module_access.append((module, previous_module_complete, lessons))
        previous_module_complete = bool(lessons) and all(
            lesson.pk in completed_lesson_ids for lesson in lessons
        )

    return module_access


def get_unlocked_module_ids(student):
    module_ids = set()
    for schedule in student.schedules.select_related("course"):
        module_ids.update(
            module.pk
            for module, unlocked, _ in get_student_schedule_modules(student, schedule)
            if unlocked
        )
    return module_ids
