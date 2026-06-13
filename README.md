# 🏥 Doctor Hub - Advanced Healthcare System

Doctor Hub is a full-stack healthcare consultation and patient history management system. It allows patients to search for doctors by disease and treatment type (Allopathic, Homeopathic, Herbal) and manage their medical journey.

### 🌐 Live Project
**[https://doctor-hub-olive.vercel.app](https://doctor-hub-olive.vercel.app)**

---

## 🔑 Demo Credentials
Role-based access is implemented. Use the following to log in:
- **Patient**: `john@patient.com` / `Patient@123`
- **Doctor**: `sarah@doctorhub.com` / `Doctor@123`
- **Admin**: `admin@doctorhub.com` / `Admin@123`
- **Assistant**: `assistant@doctorhub.com` / `Assistant@123`
- **Super Admin**: `superadmin@doctorhub.com` / `SuperAdmin@123`

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, React, Custom CSS (Dark Theme, Glassmorphism)
- **Backend**: Next.js API Routes, Prisma ORM, SQLite
- **Authentication**: JWT, bcryptjs

## 🧩 Key Features
- **Doctor Search Engine**: Filter by disease, specialization, and treatment type.
- **RBAC**: Custom dashboards and capabilities per user role.
- **Immutable History**: Secure patient medical history.
- **Appointment Booking**: Built-in scheduling system.

## 🚀 How to Run Locally

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the dev server:
```bash
npm run dev
```
Open `http://localhost:3000` to view the app!
