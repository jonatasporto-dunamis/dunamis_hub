# Dunamis Hub - MVP

MVP interno para gerenciar desempenho de tráfego pago, clientes, projetos e financeiro básico.

Estrutura:
- `backend/` — Node.js + Express + Prisma (SQLite)
- `frontend/` — Vite + React (pt-BR UI)

Execução local (PowerShell):

```powershell
cd "C:\Users\19BPM-ITA-DSK-SSO\Documents\agencia_hub\backend"
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

```powershell
cd "C:\Users\19BPM-ITA-DSK-SSO\Documents\agencia_hub\frontend"
npm install
npm run dev
```

Logs de evolução e próximos passos: `backend/LOGS.md` (pt-BR).
