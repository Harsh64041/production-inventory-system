<a name="readme-top"></a>

# 📦 Production-Ready Inventory Management System

A **full-stack, containerized application** that manages, processes, and visualizes  
**business inventory and orders in real time** using **React.js, FastAPI, PostgreSQL**, and **Docker**.

---

## 🔗 Live Links & Demo

🌍 **Frontend (Live Web App):** [https://thunderous-marshmallow-1742f7.netlify.app](https://thunderous-marshmallow-1742f7.netlify.app)  
⚙️ **Backend API (Swagger Docs):** [https://production-inventory-system.onrender.com/docs](https://production-inventory-system.onrender.com/docs)  
🐳 **Docker Hub Image:** [https://hub.docker.com/r/harshhhhhhh/inventory-backend](https://hub.docker.com/r/harshhhhhhh/inventory-backend)  
📂 **GitHub Repository:** [https://github.com/Harsh64041/production-inventory-system](https://github.com/Harsh64041/production-inventory-system)  

---

## 📌 About The Project

**Production-Ready Inventory Management System** is designed to process live product stock, perform real-time  
**order amount calculations**, and present insights through an **interactive business dashboard**.

The application manages complex relationships between products, customers, and orders, applies strict Pydantic-based data validation,  
and automatically updates inventory metrics upon order creation or cancellation.

This project demonstrates:
- Containerized microservices architecture
- Strict business logic and backend data validation
- Scalable REST APIs with Python
- Interactive frontend UI and metric visualization

---

## 🧠 Architecture Overview

### 🔹 Backend
- Built with **FastAPI (Python)**
- REST APIs for inventory, customer, and order management
- Deployed on **Render**

### 🔹 Database
- **PostgreSQL**
- Scalable, relational storage ensuring ACID compliance for inventory transactions

### 🔹 Frontend
- Built with **React.js**
- Hosted on **Netlify**
- Displays interactive cards, forms, and real-time stock values

### 📊 Containerization & Deployment
- Docker & Docker Hub
- Automated API documentation via Swagger UI

---

## 📂 Folder Structure
```text
📁 production-inventory-system
├── 📁 backend
│   ├── 📄 main.py
│   ├── 📄 requirements.txt
│   ├── 📄 Dockerfile
│   └── 📄 .env
│
├── 📁 frontend
│   ├── 📁 public
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── 📁 src
│   │   ├── 📄 App.js
│   │   ├── 📄 App.css
│   │   └── 📄 index.js
│   │
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   └── 📄 Dockerfile
│
├── 📄 docker-compose.yml
├── 📄 README.md ⭐ (ROOT LEVEL – GitHub reads this)
└── 📄 .gitignore
