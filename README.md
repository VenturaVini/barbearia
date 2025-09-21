# 💈 Sistema de Barbearia

Sistema completo de agendamento para barbearia com interface moderna e API robusta.

## 🚀 Tecnologias

- **Frontend**: React 18 com design responsivo
- **Backend**: Django REST Framework com autenticação JWT
- **Banco**: PostgreSQL 15
- **Containerização**: Docker & Docker Compose
- **Autenticação**: JWT tokens com refresh automático

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Git para clonagem do repositório

## ⚡ Início Rápido

### 1. Clone o repositório
```bash
git clone https://github.com/VenturaVini/barbearia.git
cd barbearia
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o `.env` se necessário (valores padrão já funcionam):
```env
SECRET_KEY=django-barbearia-secret-key-production-vm-2024
DEBUG=0
DB_NAME=barbearia_db
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=db
DB_PORT=5432
```

### 3. Execute o projeto
```bash
docker-compose up --build -d
```

### 4. Crie dados de exemplo
```bash
docker-compose exec backend python create_sample_data.py
```

## 🌐 Acesso às Aplicações

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin

## 👤 Usuários de Teste

### Clientes
- **Username**: `cliente1` | **Password**: `cliente123`
- **Username**: `cleinte1` | **Password**: `cliente123`

### Barbeiro
- **Username**: `barbeiro1` | **Password**: `barbeiro123`

### Administrador
- **Username**: `admin` | **Password**: `admin123`

## 🛍️ Serviços Disponíveis

| Serviço | Duração | Preço |
|---------|---------|-------|
| Corte Simples | 30 min | R$ 25,00 |
| Corte + Barba | 45 min | R$ 35,00 |
| Barba | 20 min | R$ 15,00 |
| Corte Premium | 60 min | R$ 50,00 |

## 🎯 Funcionalidades

### Para Clientes
- ✅ Registro e login
- ✅ Agendamento de serviços
- ✅ Visualização do histórico
- ✅ Cancelamento de agendamentos (até 3h antes)

### Para Barbeiros
- ✅ Dashboard com agendamentos
- ✅ Visualização por data
- ✅ Confirmação de agendamentos
- ✅ Gestão de dias indisponíveis

### Para Administradores
- ✅ Gestão completa de usuários
- ✅ Gestão de serviços e preços
- ✅ Relatórios de agendamentos
- ✅ Limpeza de dados

## 🏗️ Estrutura do Projeto

```
barbearia/
├── backend/                 # Django REST API
│   ├── core/               # App principal
│   │   ├── models.py       # User, Service, Appointment, UnavailableDay
│   │   ├── serializers.py  # Serializers DRF
│   │   ├── views.py        # ViewSets e endpoints
│   │   └── urls.py         # Rotas da API
│   ├── backend/
│   │   └── settings.py     # Configurações Django
│   └── requirements.txt    # Dependências Python
├── frontend/               # React App
│   ├── src/
│   │   ├── pages/          # Login, Register, Schedule, Dashboard
│   │   ├── styles/         # CSS customizado
│   │   └── api.js          # Cliente HTTP com interceptors
│   └── package.json        # Dependências Node.js
├── docker-compose.yml      # Orquestração dos containers
└── .env                    # Variáveis de ambiente
```

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Ver logs em tempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar um serviço
docker-compose restart backend

# Executar comandos no container
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py migrate
```

### Banco de Dados
```bash
# Acessar PostgreSQL
docker-compose exec db psql -U postgres -d barbearia_db

# Backup do banco
docker-compose exec db pg_dump -U postgres barbearia_db > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres -d barbearia_db < backup.sql
```

### Limpeza
```bash
# Parar e remover containers
docker-compose down

# Remover volumes (CUIDADO: apaga o banco!)
docker-compose down -v

# Remover imagens
docker-compose down --rmi all
```

## 📱 API Endpoints

### Autenticação
- `POST /api/token/` - Login (obter tokens)
- `POST /api/token/refresh/` - Renovar token
- `POST /api/register/` - Registro de usuário

### Agendamentos
- `GET /api/appointments/` - Listar agendamentos
- `POST /api/appointments/` - Criar agendamento
- `PATCH /api/appointments/{id}/` - Atualizar agendamento
- `DELETE /api/appointments/{id}/` - Cancelar agendamento

### Outros
- `GET /api/services/` - Listar serviços
- `GET /api/barbers/` - Listar barbeiros
- `GET /api/user/` - Dados do usuário atual

## 🐛 Resolução de Problemas

### Erro de CORS
Verifique se o IP no `CORS_ALLOWED_ORIGINS` em `settings.py` está correto.

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está saudável
docker-compose ps db

# Ver logs do banco
docker-compose logs db
```

### Frontend não carrega
```bash
# Verificar logs
docker-compose logs frontend

# Reconstruir frontend
docker-compose up --build frontend
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Vinícius Ventura** - [@VenturaVini](https://github.com/VenturaVini)

---

⭐ Se este projeto te ajudou, deixe uma estrela no repositório!
