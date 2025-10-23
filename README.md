# 🛍️ E-Commerce Next.js App

A **full-stack e-commerce platform** built with **Next.js 15**, **TypeScript**, and **MongoDB**, featuring authentication, product management, checkout, admin dashboard, order tracking, and payment integrations (Razorpay.).

---

## 🚀 Tech Stack

**Frontend**

* [Next.js 15](https://nextjs.org/)
* [React 19](https://react.dev/)
* [Tailwind CSS v4](https://tailwindcss.com/)
* [ShadCN UI](https://ui.shadcn.com/)
* [Redux Toolkit](https://redux-toolkit.js.org/)
* [React Hook Form + Zod](https://react-hook-form.com/)
* [Lucide Icons](https://lucide.dev/)

**Backend**

* [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
* [MongoDB + Mongoose](https://mongoosejs.com/)
* [NextAuth.js](https://next-auth.js.org/)
* [Cloudinary](https://cloudinary.com/) for image upload
* [Razorpay](https://razorpay.com/), [Stripe](https://stripe.com/), [PayPal](https://www.paypal.com/) integration
* [Redis](https://redis.io/) for caching

---

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
│   ├── config/              # DB & Cloudinary setup
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

---

## ⚙️ Features

### 🧑‍💻 User Features

* User Registration & Login (NextAuth)
* Forgot & Reset Password
* Product Listing & Filtering
* Product Reviews & Ratings
* Shopping Cart (Add / Remove / Update)
* Checkout with multiple payment options
* Order Tracking & History
* Responsive Dark / Light Mode

### 🧑‍💼 Admin Features

* Admin Authentication
* Dashboard Analytics
* Add / Edit / Delete Products
* View & Manage Orders
* Sales Statistics

### 💳 Payment Gateways

* Razorpay (COD + Online)

---

## 🔧 Environment Variables

Create a `.env.local` file in the root directory and include:

```
MONGODB_URI=<your_mongodb_connection_string>
NEXTAUTH_SECRET=<your_nextauth_secret>
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
RAZORPAY_KEY_ID=<your_key_id>
RAZORPAY_KEY_SECRET=<your_key_secret>
REDIS_URL=<your_redis_url>
```

---

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

App will be live at **[http://localhost:3000](http://localhost:3000)**

### 4️⃣ Build for production

```bash
npm run build
npm start
```

---

## 🧩 Redux State Management

* `cartSlice.ts`: Handles cart logic (add/remove/update)
* `userSlice.ts`: Stores user session & details
* `fetchApi/*`: Manages API communication using RTK Query

---

## 🧠 Utilities

* `formatPrice.ts`: Price formatting helper
* `debounceSearch.tsx`: Debounced search logic
* `theme-provider.tsx`: Dark/Light mode toggle
* `adminAuth.ts`: Admin session validation middleware

---

## 📊 Admin Dashboard

* View total sales, users, and orders
* Product CRUD (Create, Read, Update, Delete)
* Order status management
* Graphical stats (daily/weekly revenue)

---

## 🧾 API Routes Overview

| Route               | Description                           |
| ------------------- | ------------------------------------- |
| `/api/auth/*`       | Authentication (login/register/reset) |
| `/api/products/*`   | Products CRUD & categories            |
| `/api/orders/*`     | Order creation & retrieval            |
| `/api/payments/*`   | Payment verification & processing     |
| `/api/user/*`       | User profile & address                |
| `/api/adminRoute/*` | Admin-only routes (orders, stats)     |

---

## 🧑‍🎨 UI System (ShadCN)

Uses ShadCN’s “New York” style with TailwindCSS v4.
All components are in `/components/ui` and can be reused globally.

---

## 📸 Screenshots (optional)

> *(Add screenshots of homepage, product page, cart, admin dashboard, etc.)*

---

## 🧾 License

This project is **MIT Licensed** — free to use, modify, and distribute.

---

## 👨‍💻 Author

**Neeraj Gaur**
Frontend Developer | MERN Stack | Next.js Specialist
📧 [neerajgaur8448@gmail.com](mailto:neerajgaur8448@gmail.com)
🌍 [LinkedIn](https://www.linkedin.com/in/neerajgaur12/) | [Portfolio](https://www.neerajgaur.me/)
