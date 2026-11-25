# 📋 TaskFlow - Project Management

A scalable full-stack project management application built with modern technologies for efficient task tracking and team collaboration.

## ✨ Features

- 🔐 **Authentication** — Secure login/signup via Clerk
- ✅ **Task Management** — Create, update, delete tasks with CRUD operations
- 🔍 **Smart Filtering** — Filter tasks by status, priority, and deadline
- ⏰ **Deadline Tracking** — Never miss a deadline with real-time tracking
- 📧 **Email Notifications** — Real-time email alerts via Nodemailer
- ⚡ **Event-Driven Workflows** — Background job processing with Inngest
- 👥 **Team Collaboration** — Manage tasks across workflows

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React + Vite | Frontend framework |
| Node.js + Express.js | Backend server |
| Neon (PostgreSQL) | Database |
| Prisma | ORM |
| Clerk | Authentication |
| Inngest | Event-driven workflows |
| Nodemailer | Email notifications |

## 📁 Folder Structure
```
Task_Flow/
├── client/                     # Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── app/                # App configuration
│   │   ├── assets/             # Images & icons
│   │   ├── components/         # Reusable components
│   │   ├── configs/            # Config files
│   │   ├── features/           # Feature modules
│   │   ├── pages/              # Page components
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env                    # Frontend env variables
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── server/                     # Backend
│   ├── configs/                # Server configuration
│   ├── controllers/            # Route controllers
│   ├── inngest/                # Inngest event functions
│   ├── middlewares/            # Express middlewares
│   ├── prisma/                 # Database schema
│   ├── routes/                 # API routes
│   ├── .env                    # Backend env variables
│   ├── server.js               # Entry point
│   ├── package.json
│   └── vercel.json
│
├── .gitignore
├── README.md
└── LICENSE
```

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/developertutuorials/task-flow.git
cd Task_Flow
```

### 2. Setup Frontend
```bash
cd client
npm install
```

Create `.env` file in `client/`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASEURL=your_backend_url
```

### 3. Setup Backend
```bash
cd server
npm install
```

Create `.env` file in `server/`:
```env
DATABASE_URL=your_neon_database_url
CLERK_SECRET_KEY=your_clerk_secret_key
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### 4. Setup Database
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 5. Run Development Servers

**Frontend:**
```bash
cd client
npm run dev
```

**Backend:**
```bash
cd server
npm run dev
```

## 🚀 Deployment

- **Frontend** — Deployed on Vercel
- **Backend** — Deployed on Vercel

🌐 **[Live Demo](https://task-flow-woad-kappa.vercel.app/)**

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.


Built with ❤️ by [developertutuorials](https://github.com/developertutuorials)
