# 🍽️ LocalBites Frontend

A modern food ordering web application built with **React** and **Vite**. LocalBites connects customers with nearby restaurants while providing restaurant owners with a complete dashboard to manage their business.

---

## ✨ Features

### 👤 Customer
- User Registration & Login
- JWT Authentication
- Browse Restaurants
- View Restaurant Details
- Browse Food Menu
- Add / Remove Items from Cart
- Update Cart Quantity
- Place Orders
- Order History
- User Profile Management

### 🏪 Restaurant Owner
- Owner Registration & Login
- Restaurant Management
- Food Management (CRUD)
- Order Management
- Dashboard Overview
- Owner Profile

### 🔐 Authentication
- JWT Based Authentication
- Protected Routes
- Role Based Access Control
- Automatic Login Persistence
- Logout Handling

### 🎨 UI Features
- Responsive Design
- Reusable Components
- Loading States
- Confirmation Dialogs
- Toast Notifications
- Form Validation
- Mobile Friendly Navigation

---

# 🛠 Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Axios
- Context API

### Styling
- CSS3
- Responsive Layout
- Custom Components

### State Management
- React Context API
- Custom Hooks

### Development Tools
- ESLint
- npm

---

# 📂 Project Structure

```
src/
│
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│
├── context/
│
├── hooks/
│
├── pages/
│   ├── auth/
│   ├── user/
│   ├── owner/
│
├── routes/
│
├── services/
│
├── utils/
│
├── App.jsx
└── main.jsx
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/nakummeet/localbites-frontend.git
```

```bash
cd localbites-frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_API_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

---

## Run Development Server

```bash
npm run dev
```

Application will run on:

```
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

---

## Preview Production Build

```bash
npm run preview
```

---

# 🔑 User Roles

## Customer

- Register
- Login
- Browse Restaurants
- Order Food
- Manage Cart
- View Orders

## Restaurant Owner

- Register as Owner
- Create Restaurant
- Manage Foods
- Manage Orders
- View Dashboard

---

# 📡 Backend Repository

This project communicates with the LocalBites Backend API.

Backend Repository:

```
https://github.com/nakummeet/localbites-backend
```

---


# 📦 Dependencies

Main packages used:

- React
- React Router DOM
- Axios
- React Hot Toast
- Vite

---

# 👨‍💻 Author

**Nakum Meet**


---

# 📄 License

This project is licensed under the MIT License.