from django.contrib import admin
from django.contrib import messages
from .models import User, Service, Appointment, UnavailableDay


def clear_all_appointments(modeladmin, request, queryset):
    """Ação para limpar todos os agendamentos"""
    count = Appointment.objects.count()
    Appointment.objects.all().delete()
    messages.success(request, f'{count} agendamentos foram deletados!')

clear_all_appointments.short_description = "🗑️ Limpar TODOS os agendamentos"


def clear_selected_appointments(modeladmin, request, queryset):
    """Ação para limpar apenas os agendamentos selecionados"""
    count = queryset.count()
    queryset.delete()
    messages.success(request, f'{count} agendamentos selecionados foram deletados!')

clear_selected_appointments.short_description = "🗑️ Deletar agendamentos selecionados"


def clear_appointments_by_date(modeladmin, request, queryset):
    """Ação para limpar agendamentos de hoje"""
    from datetime import datetime
    today = datetime.now().date()
    appointments = Appointment.objects.filter(start_time__date=today)
    count = appointments.count()
    appointments.delete()
    messages.success(request, f'{count} agendamentos de hoje ({today}) foram deletados!')

clear_appointments_by_date.short_description = "🗑️ Limpar agendamentos de HOJE"


def clear_appointments_by_client(modeladmin, request, queryset):
    """Ação para limpar agendamentos dos clientes selecionados (se houver agendamentos selecionados)"""
    clients = set()
    for appointment in queryset:
        clients.add(appointment.client)

    total_deleted = 0
    for client in clients:
        client_appointments = Appointment.objects.filter(client=client)
        count = client_appointments.count()
        client_appointments.delete()
        total_deleted += count
        messages.success(request, f'{count} agendamentos do cliente {client.username} foram deletados!')

    if total_deleted == 0:
        messages.warning(request, 'Nenhum agendamento encontrado para deletar!')

clear_appointments_by_client.short_description = "🗑️ Limpar TODOS agendamentos dos clientes"


def clear_all_unavailable_days(modeladmin, request, queryset):
    """Ação para limpar todos os dias indisponíveis"""
    count = UnavailableDay.objects.count()
    UnavailableDay.objects.all().delete()
    messages.success(request, f'{count} dias indisponíveis foram deletados!')

clear_all_unavailable_days.short_description = "🗑️ Limpar TODOS os dias indisponíveis"


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_barber', 'is_staff', 'date_joined']
    list_filter = ['is_barber', 'is_staff', 'is_active']
    search_fields = ['username', 'email']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_minutes', 'price']
    search_fields = ['name']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['client', 'barber', 'service', 'start_time', 'status']
    list_filter = ['status', 'start_time', 'barber']
    search_fields = ['client__username', 'barber__username', 'service__name']
    date_hierarchy = 'start_time'
    actions = [
        clear_all_appointments,
        clear_selected_appointments,
        clear_appointments_by_date,
        clear_appointments_by_client
    ]


@admin.register(UnavailableDay)
class UnavailableDayAdmin(admin.ModelAdmin):
    list_display = ['barber', 'date', 'reason']
    list_filter = ['date']
    search_fields = ['barber__username', 'reason']
    actions = [clear_all_unavailable_days]