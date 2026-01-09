MediMeet Health AI 🤖🏥

AI-Powered Health Assistant - Symptom analysis, emergency detection, doctor appointment booking, and patient management system built with Next.js 14 and Groq AI.

✨ Features
🤖 AI Health Assistant - Groq-powered symptom analysis with JSON responses

🚨 Emergency Detection - Instant identification of critical conditions

🔐 Clerk Authentication - Secure user management and onboarding

📅 Doctor Appointments - Full booking system with Neon PostgreSQL

📱 SMS Notifications - Vonage-powered appointment confirmations

✉️ Email System - Brevo-powered transactional emails

📊 Patient Management - Complete health chat history and analytics

⚡ TypeScript - Full type safety end-to-end

📱 Responsive UI - TailwindCSS + shadcn/ui components

🛠️ Tech Stack
text
Frontend: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
Backend: Prisma + Neon PostgreSQL + Node.js
AI: Groq AI (Llama 3.3 70B) 
Auth: Clerk
Communication: Vonage SMS + Brevo Email
Deployment: Vercel + Neon
🚀 Quick Start
Prerequisites
Node.js 18+

Neon PostgreSQL account

Clerk account

Groq AI API key

1. Clone & Install
bash
git clone <your-repo-url>
cd medimeet
npm install
2. Environment Setup
Copy .env.example to .env.local and fill in your keys:

bash
cp .env.example .env.local
3. Database Setup
bash
npx prisma generate
npx prisma db push
4. Development
bash
npm run dev
