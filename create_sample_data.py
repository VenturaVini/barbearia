#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append('/app')
django.setup()

from core.models import User, Service

# Criar usuários de exemplo
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser('admin', 'admin@barbearia.com', 'admin123')
    print("Superusuário criado: admin/admin123")

if not User.objects.filter(username='barbeiro1').exists():
    barbeiro1 = User.objects.create_user('barbeiro1', 'barbeiro1@barbearia.com', 'barbeiro123', is_barber=True)
    print("Barbeiro criado: barbeiro1/barbeiro123")

if not User.objects.filter(username='cliente1').exists():
    cliente1 = User.objects.create_user('cliente1', 'cliente1@email.com', 'cliente123')
    print("Cliente criado: cliente1/cliente123")

# Criar serviços de exemplo
servicos = [
    {'name': 'Corte Simples', 'duration_minutes': 30, 'price': 25.00},
    {'name': 'Corte + Barba', 'duration_minutes': 45, 'price': 35.00},
    {'name': 'Barba', 'duration_minutes': 20, 'price': 15.00},
    {'name': 'Corte Premium', 'duration_minutes': 60, 'price': 50.00},
]

for servico_data in servicos:
    if not Service.objects.filter(name=servico_data['name']).exists():
        Service.objects.create(**servico_data)
        print(f"Serviço criado: {servico_data['name']}")

print("Dados de exemplo criados com sucesso!")