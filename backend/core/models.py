from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import timedelta, time
from django.utils import timezone


class User(AbstractUser):
    is_barber = models.BooleanField(default=False)

    def __str__(self):
        return self.username


class Service(models.Model):
    name = models.CharField(max_length=100)
    duration_minutes = models.IntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return self.name


class UnavailableDay(models.Model):
    barber = models.ForeignKey(User, on_delete=models.CASCADE, related_name='unavailable_days')
    date = models.DateField()
    reason = models.CharField(max_length=200, default='Indisponível')

    class Meta:
        unique_together = ['barber', 'date']

    def __str__(self):
        return f"{self.barber.username} - {self.date} - {self.reason}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('CONFIRMADO', 'Confirmado'),
        ('REALIZADO', 'Realizado'),
        ('CANCELADO', 'Cancelado'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_appointments')
    barber = models.ForeignKey(User, on_delete=models.CASCADE, related_name='barber_appointments')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE')
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.end_time and self.start_time and self.service:
            self.end_time = self.start_time + timedelta(minutes=self.service.duration_minutes)
        super().save(*args, **kwargs)

    def pode_cancelar(self):
        """Verifica se o agendamento pode ser cancelado (até 3h antes)"""
        if self.status in ['REALIZADO', 'CANCELADO']:
            return False

        agora = timezone.now()
        limite_cancelamento = self.start_time - timedelta(hours=3)
        return agora <= limite_cancelamento

    def pode_reagendar(self):
        """Verifica se o agendamento pode ser reagendado"""
        return self.status in ['PENDENTE', 'CONFIRMADO']

    @staticmethod
    def is_valid_time(datetime_obj):
        """Verifica se o horário está dentro do funcionamento (10h-19h)"""
        hora = datetime_obj.time()
        return time(10, 0) <= hora <= time(19, 0)

    @staticmethod
    def is_available_day(barber, date):
        """Verifica se o barbeiro está disponível na data"""
        return not UnavailableDay.objects.filter(barber=barber, date=date).exists()

    def __str__(self):
        return f"{self.client.username} - {self.service.name} - {self.start_time}"

    class Meta:
        ordering = ['start_time']