from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from datetime import timedelta
from .models import User, Service, Appointment, UnavailableDay


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_barber']


class RegisterSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, validators=[validate_password])
    confirmar_senha = serializers.CharField(write_only=True)
    eh_barbeiro = serializers.BooleanField(default=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'senha', 'confirmar_senha', 'eh_barbeiro']

    def validate(self, attrs):
        if attrs['senha'] != attrs['confirmar_senha']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmar_senha', None)
        senha = validated_data.pop('senha')
        eh_barbeiro = validated_data.pop('eh_barbeiro', False)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            is_barber=eh_barbeiro
        )
        user.set_password(senha)
        user.save()
        return user


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'duration_minutes', 'price']


class UnavailableDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = UnavailableDay
        fields = ['id', 'barber', 'date', 'reason']
        read_only_fields = ['barber']


class AppointmentSerializer(serializers.ModelSerializer):
    nome_cliente = serializers.CharField(source='client.username', read_only=True)
    nome_barbeiro = serializers.CharField(source='barber.username', read_only=True)
    nome_servico = serializers.CharField(source='service.name', read_only=True)
    pode_cancelar = serializers.SerializerMethodField()
    pode_reagendar = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'barber', 'service', 'start_time', 'end_time',
            'status', 'notes', 'nome_cliente', 'nome_barbeiro', 'nome_servico',
            'pode_cancelar', 'pode_reagendar'
        ]
        read_only_fields = ['client']

    def get_pode_cancelar(self, obj):
        return obj.pode_cancelar()

    def get_pode_reagendar(self, obj):
        return obj.pode_reagendar()

    def validate(self, attrs):
        barbeiro = attrs.get('barber')
        horario_inicio = attrs.get('start_time')
        servico = attrs.get('service')

        if barbeiro and not barbeiro.is_barber:
            raise serializers.ValidationError("O usuário selecionado não é um barbeiro.")

        if horario_inicio:
            # Validar horário de funcionamento (10h-19h)
            if not Appointment.is_valid_time(horario_inicio):
                raise serializers.ValidationError("Agendamentos só podem ser feitos entre 10:00 e 19:00.")

            # Validar se o barbeiro está disponível na data
            if barbeiro and not Appointment.is_available_day(barbeiro, horario_inicio.date()):
                raise serializers.ValidationError("O barbeiro não está disponível nesta data.")

        if horario_inicio and servico and barbeiro:
            horario_fim = horario_inicio + timedelta(minutes=servico.duration_minutes)

            # Validar se o serviço termina antes das 19h
            if not Appointment.is_valid_time(horario_fim):
                raise serializers.ValidationError("O serviço deve terminar até às 19:00.")

            agendamentos_conflitantes = Appointment.objects.filter(
                barber=barbeiro,
                status__in=['PENDENTE', 'CONFIRMADO']
            ).filter(
                Q(start_time__lt=horario_fim) & Q(end_time__gt=horario_inicio)
            )

            if self.instance:
                agendamentos_conflitantes = agendamentos_conflitantes.exclude(id=self.instance.id)

            if agendamentos_conflitantes.exists():
                raise serializers.ValidationError("Já existe um agendamento neste horário para este barbeiro.")

        return attrs