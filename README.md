# 🛍️ Modern E-commerce Store

A full-stack e-commerce platform built with Next.js 15, TypeScript, and MongoDB. This application offers a seamless shopping experience with features like user authentication, product management, checkout, admin dashboard, order tracking, payment integrations, and AI-powered product suggestions.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework for server-side rendering and static site generation
- **React 19** - Component-based UI library
- **Tailwind CSS v4** - Utility-first CSS framework
- **ShadCN UI** - Reusable UI components
- **Redux Toolkit** - State management
- **React Hook Form + Zod** - Form handling and validation
- **Lucide Icons** - Icon library for UI elements

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB + Mongoose** - NoSQL database and ORM
- **NextAuth.js** - Authentication
- **Cloudinary** - Image upload and management
- **Razorpay, Stripe, PayPal** - Payment gateways
- **Redis** - Caching for performance optimization
- **Pinecone** - Vector database for AI product suggestions
- **Gemini API** - AI-powered product recommendations

## 📂 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)           # Auth routes (login, register, reset password)
│   │   ├── (dashboard)      # Admin & User dashboard
│   │   ├── api/             # API routes for backend logic
│   │   ├── homepage/        # Landing page
│   │   └── layout.tsx       # Root layout
│   │
│   ├── components/          # Reusable UI components
│   │   └── ui/              # ShadCN-based UI primitives
│   │
│   ├── config/              # DB, Cloudinary, Pinecone, & Gemini setup
│   ├── lib/                 # Auth, cache, redis, and utilities
│   ├── models/              # Mongoose models (User, Product, Order, etc.)
│   ├── redux/               # State management
│   ├── utils/               # Helper functions
│   └── types.ts             # Global TypeScript types
│
├── public/                  # Static assets (logos, icons, payment images)
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
├── next.config.ts           # Next.js config
└── package.json             # Dependencies and scripts
```

## ⚙️ Features

### 🧑‍💻 User Features
- ✅ User Registration & Login with NextAuth
- ✅ Forgot & Reset Password
- ✅ Product Listing & Filtering by categories, price, etc.
- ✅ Product Reviews & Ratings
- ✅ Shopping Cart (Add, Remove, Update items)
- ✅ Checkout with multiple payment options
- ✅ Order Tracking & History
- ✅ Responsive Dark/Light Mode
- ✅ AI-Powered Product Suggestions using natural language queries

### 🧑‍💼 Admin Features
- ✅ Admin Authentication
- ✅ Dashboard Analytics for sales and user insights
- ✅ Product Management (Create, Read, Update, Delete)
- ✅ Order Management (View and update order status)
- ✅ Sales Statistics with graphical insights

### 💳 Payment Gateways
- **Razorpay** - Cash on Delivery + Online payments
- **Stripe** - Credit/Debit card payments
- **PayPal** - International payment support

### 🤖 AI Product Suggestions
- Powered by **Gemini API** for natural language processing and personalized product recommendations
- Utilizes **Pinecone** vector database to store and query product embeddings for fast and relevant suggestions based on user input

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Database
MONGODB_URI=<your_mongodb_connection_string>

# Authentication
NEXTAUTH_SECRET=<your_nextauth_secret>
NEXTAUTH_URL=https://e-commerce-next-app-peach.vercel.app

# Cloudinary (Image Management)
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Payment Gateways
RAZORPAY_KEY_ID=<your_key_id>
RAZORPAY_KEY_SECRET=<your_key_secret>

# Caching
REDIS_URL=<your_redis_url>

# AI Features
PINECONE_API_KEY=<your_pinecone_api_key>
PINECONE_INDEX_NAME=<your_pinecone_index_name>
GEMINI_API_KEY=<your_gemini_api_key>
```

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/e-commerce-next-app.git
cd e-commerce-next-app
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Run the development server
```bash
npm run dev
```
App will be live at `http://localhost:3000`

### 4️⃣ Build for production
```bash
npm run build
npm start
```

## 🧩 Redux State Management

- **cartSlice.ts** - Manages cart operations (add, remove, update)
- **userSlice.ts** - Stores user session and details
- **fetchApi/** - Handles API communication with RTK Query
- **aiSlice.ts** - Manages state for AI-powered product suggestions

## 🧠 Utilities

- **formatPrice.ts** - Formats prices for display
- **debounceSearch.tsx** - Implements debounced search functionality
- **theme-provider.tsx** - Toggles between dark and light modes
- **adminAuth.ts** - Middleware for admin session validation
- **aiUtils.ts** - Helper functions for Pinecone and Gemini API integration

## 📊 Admin Dashboard

- Displays total sales, users, and orders
- Supports product CRUD operations
- Manages order statuses
- Provides graphical statistics (daily/weekly revenue)

## 🧾 API Routes Overview

| Route | Description |
|-------|-------------|
| `/api/auth/*` | Authentication (login/register/reset) |
| `/api/products/*` | Products CRUD & categories |
| `/api/orders/*` | Order creation & retrieval |
| `/api/payments/*` | Payment verification & processing |
| `/api/user/*` | User profile & address |
| `/api/adminRoute/*` | Admin-only routes (orders, stats) |
| `/api/ai/suggestions` | AI-powered product suggestions |

## 🧑‍🎨 UI System (ShadCN)

Built with ShadCN's "New York" style and TailwindCSS v4. Reusable components are located in `/components/ui`.

## 📸 Screenshots

> Add screenshots of the homepage, product page, cart, admin dashboard, and AI suggestion interface for a visual overview.

## 🧾 License

This project is licensed under the MIT License — free to use, modify, and distribute.

## 👨‍💻 Author

**Neeraj Gaur**  
Frontend Developer | MERN Stack | Next.js Specialist

- 📧 Email: neerajgaur8448@gmail.com
- 🌍 [LinkedIn](https://www.linkedin.com/in/neerajgaur12)
- 💼 [Portfolio](https://www.neerajgaur.me)

---

⭐ If you find this project nice, please give it a star!
