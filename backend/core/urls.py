from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, ServiceViewSet, AppointmentViewSet, BarberListView, CurrentUserView, UnavailableDayViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'unavailable-days', UnavailableDayViewSet, basename='unavailable-day')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('barbers/', BarberListView.as_view(), name='barbers'),
    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('', include(router.urls)),
]