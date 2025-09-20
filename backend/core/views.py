from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from datetime import datetime, date
from .models import User, Service, Appointment, UnavailableDay
from .serializers import UserSerializer, RegisterSerializer, ServiceSerializer, AppointmentSerializer, UnavailableDaySerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"mensagem": "Usuário criado com sucesso", "id_usuario": user.id},
            status=status.HTTP_201_CREATED
        )


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class BarberListView(generics.ListAPIView):
    queryset = User.objects.filter(is_barber=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UnavailableDayViewSet(viewsets.ModelViewSet):
    serializer_class = UnavailableDaySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_barber:
            return UnavailableDay.objects.filter(barber=user)
        return UnavailableDay.objects.none()

    def perform_create(self, serializer):
        serializer.save(barber=self.request.user)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.all()

        if user.is_staff:
            queryset = queryset
        elif user.is_barber:
            queryset = queryset.filter(barber=user)
        else:
            queryset = queryset.filter(client=user)

        # Filtros de data para barbeiros
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date__gte=start_date)
            except ValueError:
                pass

        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date__lte=end_date)
            except ValueError:
                pass

        return queryset

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def update(self, request, *args, **kwargs):
        appointment = self.get_object()
        user = request.user

        if not (user.is_staff or user == appointment.client or user == appointment.barber):
            return Response(
                {"erro": "Você não tem permissão para editar este agendamento"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Se o cliente está tentando cancelar, verificar se pode
        if (user == appointment.client and
            'status' in request.data and
            request.data['status'] == 'CANCELADO'):

            if not appointment.pode_cancelar():
                return Response(
                    {"erro": "Não é possível cancelar este agendamento. O cancelamento deve ser feito até 3 horas antes do horário marcado."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        appointment = self.get_object()
        user = request.user

        if not (user.is_staff or user == appointment.client or user == appointment.barber):
            return Response(
                {"erro": "Você não tem permissão para excluir este agendamento"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def today(self, request):
        today = datetime.now().date()
        queryset = self.get_queryset().filter(start_time__date=today)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Apagar TODOS os agendamentos (apenas para staff)"""
        if not request.user.is_staff:
            return Response(
                {"erro": "Apenas administradores podem apagar todos os agendamentos"},
                status=status.HTTP_403_FORBIDDEN
            )

        count = Appointment.objects.count()
        Appointment.objects.all().delete()
        return Response(
            {"mensagem": f"{count} agendamentos foram deletados"},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['delete'])
    def clear_by_date(self, request):
        """Apagar agendamentos por data (apenas para staff)"""
        if not request.user.is_staff:
            return Response(
                {"erro": "Apenas administradores podem apagar agendamentos por data"},
                status=status.HTTP_403_FORBIDDEN
            )

        target_date = request.query_params.get('date')
        if not target_date:
            return Response(
                {"erro": "Parâmetro 'date' é obrigatório (formato: YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_date = datetime.strptime(target_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"erro": "Formato de data inválido. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointments = Appointment.objects.filter(start_time__date=target_date)
        count = appointments.count()
        appointments.delete()

        return Response(
            {"mensagem": f"{count} agendamentos do dia {target_date} foram deletados"},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['delete'])
    def clear_by_client(self, request):
        """Apagar agendamentos por cliente (apenas para staff)"""
        if not request.user.is_staff:
            return Response(
                {"erro": "Apenas administradores podem apagar agendamentos por cliente"},
                status=status.HTTP_403_FORBIDDEN
            )

        client_id = request.query_params.get('client_id')
        if not client_id:
            return Response(
                {"erro": "Parâmetro 'client_id' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = User.objects.get(id=client_id)
        except User.DoesNotExist:
            return Response(
                {"erro": "Cliente não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        appointments = Appointment.objects.filter(client=client)
        count = appointments.count()
        appointments.delete()

        return Response(
            {"mensagem": f"{count} agendamentos do cliente {client.username} foram deletados"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'])
    def reagendar(self, request, pk=None):
        appointment = self.get_object()
        user = request.user

        # Verificar permissões (barbeiro ou staff)
        if not (user.is_staff or user == appointment.barber):
            return Response(
                {"erro": "Apenas o barbeiro responsável pode reagendar este agendamento"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verificar se pode reagendar
        if not appointment.pode_reagendar():
            return Response(
                {"erro": "Este agendamento não pode ser reagendado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Atualizar com nova data/hora
        nova_data = request.data.get('start_time')
        if nova_data:
            serializer = self.get_serializer(appointment, data={'start_time': nova_data}, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"erro": "Nova data/hora é obrigatória"},
            status=status.HTTP_400_BAD_REQUEST
        )