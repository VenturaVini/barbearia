#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append('/app')
django.setup()

from core.models import Appointment, UnavailableDay

print("=== LIMPEZA DE DADOS ===")

# Limpar agendamentos
appointments_count = Appointment.objects.count()
print(f"Agendamentos encontrados: {appointments_count}")

if appointments_count > 0:
    Appointment.objects.all().delete()
    print("✅ Todos os agendamentos foram deletados!")
else:
    print("ℹ️ Nenhum agendamento para deletar")

# Limpar dias indisponíveis
unavailable_count = UnavailableDay.objects.count()
print(f"Dias indisponíveis encontrados: {unavailable_count}")

if unavailable_count > 0:
    UnavailableDay.objects.all().delete()
    print("✅ Todos os dias indisponíveis foram deletados!")
else:
    print("ℹ️ Nenhum dia indisponível para deletar")

print("\n🎉 Limpeza concluída!")