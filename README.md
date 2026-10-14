# ShopKart 🛒

A modern, full-stack e-commerce web application built with the **MERN** stack (MongoDB, Express, React, Node.js) featuring secure user authentication, product browsing, dynamic cart and wishlist management, order tracking, and integrated **Razorpay payment gateway**.

---

## 🌟 Features

- **User Authentication**: Secure signup and login using bcrypt password hashing and HTTP-only JWT cookies.
- **Product Catalog**: Browse products with search, category filtering, and detailed product views.
- **Cart & Wishlist**:
  - Persistent server-synced cart with dynamic quantity updates and real-time total calculations.
  - Wishlist toggle to save favorite items for later.
- **Razorpay Checkout & Payments**:
  - Seamless Razorpay payment popup integration in frontend.
  - Server-side cryptographic HMAC SHA-256 signature verification for fraud prevention.
- **Order Management**:
  - Real-time order placement upon payment verification.
  - Order history tracking and detailed order confirmation view.
- **Responsive & Modern UI**: Built with React and modern CSS styling with clean animations and micro-interactions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State Management**: React Context API
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Payment SDK**: Razorpay Checkout.js (`https://checkout.razorpay.com/v1/checkout.js`)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcrypt`
- **Payment Processing**: [Razorpay Node SDK](https://www.npmjs.com/package/razorpay)
- **Security & Utilities**: `cookie-parser`, `cors`, `dotenv`

---

## 📁 Project Structure

```text
ShopKart/
├── backend/
│   ├── config/
│   │   └── razorpay.js            # Razorpay SDK initialization & helpers
│   ├── controllers/
│   │   ├── cart.controller.js     # Cart operations
│   │   ├── customer.controller.js # Customer auth & profile
│   │   ├── order.controller.js    # Order creation & Razorpay verification
│   │   ├── product.controller.js  # Product queries & listing
│   │   └── wishlist.controller.js # Wishlist management
│   ├── middlewares/
│   │   └── authMiddleware.js      # JWT verification middleware
│   ├── models/
│   │   ├── customer.model.js      # Customer user schema
│   │   ├── order.model.js         # Order schema with Razorpay IDs
│   │   └── product.model.js       # Product schema
│   ├── routes/
│   │   ├── cart.routes.js
│   │   ├── customer.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js
│   ├── .env.example               # Backend environment variables template
│   ├── index.js                   # Express server entry point
│   └── package.json
│
├── frontend/
│   └── vite-project/
│       ├── src/
│       │   ├── components/        # Reusable UI components (Navbar, ProductCard)
│       │   ├── context/           # Cart & application state contexts
│       │   ├── pages/             # App pages (Home, Products, Cart, Checkout, etc.)
│       │   ├── services/          # Axios API client & endpoints
│       │   ├── App.jsx            # App routes & layout
│       │   └── main.jsx
│       └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster URI)
- [Razorpay Account](https://dashboard.razorpay.com/) (Test mode API keys)

---

### 1. Clone the Repository

```bash
git clone https://github.com/adnanahmediq10-creator/ShopKart.git
cd ShopKart
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory:
   ```env
   dbUrl=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. Start the backend server:
   ```bash
   node index.js
   # or with nodemon for auto-reload:
   npm run dev
   ```
   The backend will run on `http://localhost:8088`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend/vite-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 💳 Razorpay Configuration

To enable test payments:
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** (toggle on top bar).
3. Navigate to **Account & Settings** → **API Keys**.
4. Click **Generate Key** to get your `Key ID` and `Key Secret`.
5. Add them to your `backend/.env` file:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxx
   RAZORPAY_KEY_SECRET=xxxxxx
   ```
6. Use [Razorpay's Test Card & UPI Credentials](https://razorpay.com/docs/payments/payments/test-card-details/) during checkout to test payments.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/customers/signup` | Register a new customer | No |
| `POST` | `/customers/login` | Authenticate customer & set cookie | No |
| `POST` | `/customers/logout` | Clear auth token cookie | Yes |
| `GET` | `/customers/profile` | Get current customer profile | Yes |
| `GET` | `/products` | Get list of products / search | No |
| `GET` | `/products/:id` | Get details of a single product | No |
| `GET` | `/cart` | Get current customer cart | Yes |
| `POST` | `/cart/add` | Add product to cart | Yes |
| `DELETE` | `/cart/:itemId` | Remove item from cart | Yes |
| `GET` | `/wishlist` | Get wishlist items | Yes |
| `POST` | `/wishlist/toggle` | Add/remove product in wishlist | Yes |
| `POST` | `/orders/create-payment-order` | Create order & initiate Razorpay payment | Yes |
| `POST` | `/orders/verify-payment` | Verify HMAC signature & complete order | Yes |
| `GET` | `/orders` | List customer order history | Yes |
| `GET` | `/orders/:id` | Get single order details | Yes |

---

## 🛡️ Security Notes

- **Environment Secrets**: Never commit `.env` or sensitive API keys. `.env` is already configured in `.gitignore`.
- **HMAC Verification**: All payments verify Razorpay's cryptographic signature server-side before marking an order as `PAID`.
- **Protected Routes**: Protected endpoints use JWT cookie verification to authenticate users.

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).
