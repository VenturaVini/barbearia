# Sistema de Barbearia

Sistema simples de agendamento para barbearia usando React, Django e SQL Server.

## Pré-requisitos

- Docker e Docker Compose
- ODBC Driver 17 para SQL Server (instalar no host)
  - Windows: Baixar do site oficial da Microsoft
  - Linux: `sudo apt-get install -y msodbcsql17`
  - macOS: `brew install msodbcsql17`

## Configuração

1. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e ajuste a senha do SQL Server:
```
MSSQL_SA_PASSWORD=SuaSenhaSegura123!
```

## Como executar

1. Execute o projeto:
```bash
docker-compose up --build
```

2. Acesse as aplicações:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Admin Django: http://localhost:8000/admin

3. Execute as migrações (se necessário):
```bash
docker-compose exec backend python manage.py migrate
```

4. Crie um superusuário:
```bash
docker-compose exec backend python manage.py createsuperuser
```

## Estrutura do Projeto

- **Frontend**: React com tema dark mode
- **Backend**: Django REST Framework com autenticação JWT
- **Banco**: SQL Server em container
- **Autenticação**: JWT tokens para clientes e barbeiros

## Funcionalidades

- Registro e login de usuários (clientes e barbeiros)
- Agendamento de serviços pelos clientes
- Dashboard para barbeiros visualizarem agendamentos
- Gestão de serviços e preços

## Desenvolvimento

O projeto está configurado para desenvolvimento com hot-reload habilitado tanto no frontend quanto no backend.