#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append('/app')
django.setup()

from core.models import User

# Criar usuário "cleinte1" para facilitar os testes
if not User.objects.filter(username='cleinte1').exists():
    cleinte1 = User.objects.create_user('cleinte1', 'cleinte1@email.com', 'cliente123')
    print("Cliente criado: cleinte1/cliente123")
else:
    print("Usuário cleinte1 já existe")

print("Script executado com sucesso!")