

# 📋 TaskFlow — Microservices-Based Project Management Platform

## A modern, highly scalable full-stack project management application engineered using a **Microservices Architecture**, an **API Gateway**, an **Asynchronous Event-Driven Backbone**, and **Docker Container Orchestration**.

## 🌟 Key Features

- 🔐 **Edge Authentication** — Centralized Clerk JWT authentication and token validation at the API Gateway.
- 🏢 **Multi-Tenant Workspaces** — Workspace creation, custom slug generation, and role-based access control (`ADMIN` / `MEMBER`).
- 📁 **Project Management** — Milestone scheduling, progress tracking, deadline tracking, and team member assignment.
- ⚡ **High-Velocity Task Tracking** — Kanban status workflows (`TODO`, `IN_PROGRESS`, `DONE`), priority levels (`LOW`, `MEDIUM`, `HIGH`), and threaded comments.
- 📨 **Event-Driven Notifications** — Asynchronous task assignment emails and automated reminder workflows via Nodemailer and Inngest without blocking HTTP requests.
- 🐳 **Full Docker Orchestration** — Complete multi-container orchestration with Docker Compose, Redis event broker, and Nginx reverse proxy.

---

## 🏗️ System Architecture

TaskFlow decouples business logic across dedicated, single-responsibility microservices fronted by an API Gateway.

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Layer (Port 5173 / 3000)"]
        SPA["React 19 + Vite + Redux Toolkit SPA"]
    end
    subgraph EdgeLayer["Edge / Routing Layer (Port 4000)"]
        Gateway["API Gateway & Reverse Proxy<br/>• Clerk JWT Authentication<br/>• Header Decoration (x-user-id)<br/>• Dynamic Service Routing<br/>• Health Monitoring"]
    end
    subgraph Microservices["Domain Microservices Layer"]
        WS["Workspace Service (Port 5001)<br/>Workspaces & Memberships"]
        PS["Project Service (Port 5002)<br/>Projects & Team Leads"]
        TS["Task & Comment Service (Port 5003)<br/>Tasks, Kanban, Comments"]
        US["User Service (Port 5005)<br/>User Sync & Clerk Webhooks"]
        NS["Notification Worker (Port 5004)<br/>Nodemailer & Inngest Reminders"]
    end
    subgraph EventBackbone["Asynchronous Event Bus"]
        Bus["Distributed Event Bus / Redis Streams"]
    end
    subgraph Persistence["Database Layer"]
        DB[(PostgreSQL / Neon Serverless DB)]
    end
    SPA -->|HTTP / JSON| Gateway
    Gateway -->|Forward Auth Headers| WS
    Gateway -->|Forward Auth Headers| PS
    Gateway -->|Forward Auth Headers| TS
    Gateway -->|Forward Auth Headers| US
    Gateway -->|Proxy Inngest Webhooks| NS
    TS -.->|Publish 'app/task.assigned'| Bus
```
