# Deploy na VM - Instruções

## Passos para deploy na VM (IP: 34.30.5.249)

### 1. Pré-requisitos na VM
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Upload dos arquivos
Copie todos os arquivos do projeto para a VM:
```bash
scp -r . user@34.30.5.249:/home/user/barbearia/
```

### 3. Executar na VM
```bash
cd /home/user/barbearia
docker-compose up --build -d
```

### 4. Configurar banco de dados
```bash
# Aguardar containers iniciarem (1-2 minutos)
docker-compose exec backend python manage.py migrate

# Criar superusuário
docker-compose exec backend python manage.py createsuperuser
```

### 5. Acessar aplicação
- Frontend: http://34.30.5.249:3000
- Backend: http://34.30.5.249:8000
- Admin: http://34.30.5.249:8000/admin

### 6. Configurações de firewall (se necessário)
```bash
sudo ufw allow 3000
sudo ufw allow 8000
sudo ufw allow 1433
```

## Observações importantes:
- DEBUG está configurado como False para produção
- Senha do SQL Server alterada para: BarbeariaVM2024!
- Frontend configurado para apontar para o IP da VM
- SQL Server rodando em container com persistência de dados