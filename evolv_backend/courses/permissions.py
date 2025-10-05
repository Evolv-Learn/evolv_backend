from rest_framework.permissions import BasePermission,  SAFE_METHODS

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsAdminOrReadOnly(BasePermission):  #IsStaffOrReadOnly
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)
    

class AllowAnyCreateReadAdminModify(BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS", "POST"):
            return True
        return bool(request.user and request.user.is_staff)
    

class IsAdminOrInstructorOwner(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and (request.user.is_staff or request.user.is_authenticated))

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        return bool(obj.instructor and obj.instructor == request.user)


class AuthenticatedCreateReadAdminModify(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if request.method == "POST":
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)