<a name="readme-top"></a>

# 📦 Production-Ready Inventory Management System

A **full-stack, containerized application** that manages, processes, and visualizes  
**business inventory and orders in real time** using **React.js, FastAPI, PostgreSQL**, and **Docker**.

---

## 🔗 Live Links & Demo

📂 **GitHub Repository:** [https://github.com/Harsh64041/production-inventory-system](https://github.com/Harsh64041/production-inventory-system)  
🌍 **Frontend (Live Web App):** [https://thunderous-marshmallow-1742f7.netlify.app](https://thunderous-marshmallow-1742f7.netlify.app)  
⚙️ **Backend API Hosted URL:** [https://production-inventory-system.onrender.com/docs](https://production-inventory-system.onrender.com/docs)  
🐳 **Backend Docker Hub Image Link:** [https://hub.docker.com/r/harshhhhhhh/inventory-backend](https://hub.docker.com/r/harshhhhhhh/inventory-backend)  

> 💡 **Important Note Regarding the Backend API Link:**  
> If you visit the base Backend API URL directly, you will see a `{"detail":"Not Found"}` JSON response. **This is expected behavior**, as the root endpoint (`/`) is intentionally left blank. To explore and test the API endpoints, please append `/docs` to the URL (or click the Backend link provided above) to access the interactive **FastAPI UI**.

---

## 📌 About The Project

**Production-Ready Inventory Management System** is designed to process live product stock, perform real-time  
**order amount calculations**, and present insights through an **interactive business dashboard**.

The application manages complex relationships between products, customers, and orders, applies strict Pydantic-based data validation,  
and automatically updates inventory metrics upon order creation or cancellation.

**Key Technical Achievements in this Project:**
- **Cloud-Ready Containerization:** Packaged with Docker for consistent, hassle-free deployments across any environment.
- **Bulletproof Backend Logic:** Built with Python and FastAPI, utilizing Pydantic to enforce strict data validation and reliable business rules.
- **Scalable REST APIs:** Designed a clean, structured, and fully documented API architecture ready for growth.
- **Engaging User Experience:** Developed a responsive React dashboard that transforms raw data into clear, interactive visual metrics.

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
│   │    ├── index.html
│   ├── 📁 src  
│   │    ├── 📄 App.js
│   │    ├── 📄 App.css
│   │    └── 📄 index.js
│   │
│   ├── 📄 package.json
│   └── 📄 Dockerfile
│
│   
├── 📄 docker-compose.yml   
├── 📄 README.md
└── 📄 .gitignore

```
---
## 🛠️ Setup & Installation
✅ Prerequisites
Before setting up the project locally, make sure you have:
- **Node.js (v16 or higher)**
- **Python (v3.8 or higher)**
- **PostgreSQL**
- **Docker & Docker Desktop** 
- **Git**

### 🔽 Step 1: Clone the Repository**
```sh
git clone [https://github.com/Harsh64041/production-inventory-system.git](https://github.com/Harsh64041/production-inventory-system.git)
cd production-inventory-system
```

### 📦 Step 2: Install Dependencies**
- **Backend Dependencies**
```sh
cd Backend
pip install -r requirements.txt
```

- **Frontend Dependencies**
 ```sh
cd ../frontend
npm install
```

### 🛢️ Step 3: Set Up PostgreSQL Database**
- **Log in to your local PostgreSQL (e.g., via pgAdmin or psql)**
- **Create a new database with the following details:**
     - Database Name: inventory_db
- **Create a .env file inside the backend folder:**
```sh
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/inventory_db
```

### ▶️ Step 4: Run the Application (Local Mode)**
- **Start Backend Server**
```sh
cd backend
uvicorn main:app --reload --host localhost --port 8000
```

- **Backend API & Docs will run at :**
```sh
http://localhost:8000/docs
```

- **Start Frontend Application :**
```sh
cd frontend
npm start
```

- **Frontend will run at :**
```sh
http://localhost:3000
```



### 🐳 Step 5: Run the Application (Docker Mode)**

- **If you prefer running the entire stack via containers:**
```sh
docker-compose up --build
```


---
### **🔮 Future Enhancements**
🚀 Advanced Authentication – Implement JWT-based login and Role-Based Access Control (RBAC) for admins vs. staff.

🗺️ Automated Reports – Generate downloadable PDF and Excel reports for monthly inventory audits.

📊 Real-Time Alert System – Email notifications and webhooks for low stock warnings using Celery and Redis.

🔔 Barcode Integration – Add support for physical barcode scanning to easily intake and update inventory.

☁️ Multi-Tenant Architecture – Allow multiple businesses to register and manage their own inventory silos on the same platform.

---
### **🤝 Contribution**
- Fork the repository.
- Create a feature branch (git checkout -b feature-branch).
- Commit your changes (git commit -m "Add new feature").
- Push to the branch (git push origin feature-branch).
- Open a Pull Request.
---

### **📧 Contact & Support**
For any queries or support, feel free to reach out:

For any queries, reach out to:
- 👤 Harsh Vardhan Sharma
- 📩 Email: hs9733492@gmail.com
- 🔗 LinkedIn: [Connect with me](https://www.linkedin.com/in/harshvardhan-sharma-246919297)
- 🌍 GitHub: [Project Repository](https://github.com/Harsh64041/production-inventory-system)
