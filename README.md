# Sistema de Limpeza Hospitalar

Projeto web interno para controle de limpeza hospitalar.

## Funcionalidades

- Cadastro de funcionárias
- Cadastro de ambientes e equipamentos
- Registro de limpezas
- QR Codes individuais
- Impressão de etiquetas
- Dashboard operacional
- Upload de imagens
- Histórico de limpezas

## Stack

- Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- Frontend: React, Vite, TypeScript

## Como rodar o backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

API local:

```text
http://localhost:3333
```

Teste inicial:

```http
GET http://localhost:3333/
```

Cadastro de funcionária:

```http
POST http://localhost:3333/employees
```

Body:

```json
{
  "name": "Maria Aparecida"
}
```

Listagem:

```http
GET http://localhost:3333/employees
```

## Como rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local:

```text
http://localhost:5173
```