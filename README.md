🎮 BULL3D - Asset Management Platform
<div align="center"> <img src="https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="MERN Stack"> <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"> <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"> <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"> </div>
📋 Description
BULL3D is a web platform specifically designed for the management of digital assets. Built with the MERN stack, it provides a solution to organize, catalog, and manage all the digital resources required in the video game development process.



✨ Key Features
🎯 Centralized Asset Management - Organize all your 3D assets, textures, sounds, and more in one place

🔐 Secure Authentication System - Access control based on JWT with bcrypt encryption

📱 Modern and Responsive Interface - Designed with Material UI for an exceptional user experience

☁️ Cloud Storage - Integration with Google Cloud.

🛠️ Technology Stack
Frontend
React.js - JavaScript library for user interfaces

Context API/Redux - Global state management

Backend
Node.js - JavaScript runtime environment

Express.js - Minimal and flexible web framework

JWT - Token-based authentication

bcrypt - Password hashing

Database
MongoDB - NoSQL document-based database

Mongoose - Elegant ODM for MongoDB and Node.js

🚀 Installation and Setup
Prerequisites
Node.js (v14 or higher)

MongoDB (local or Atlas)

npm or yarn

Installation Steps
Clone the repository

bash
Copy
git clone https://github.com/vancovx/BULL3D.git
cd BULL3D
Install backend dependencies

bash
Copy
cd backend
npm install
Install frontend dependencies

bash
Copy
cd ../frontend
npm install
Configure environment variables

bash
Copy
# In the backend directory, create .env
NODE_ENV = production
PORT = 5000
MONGO_URI = your_mongodb_url
JWT_SECRET = your_jwt_secret_key
GOOGLE_DRIVE_CREDENTIALS = your_google_cloud_credentials
Start the development server

bash
Copy
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
📂 Project Structure
csharp
Copy
BULL3D/
├── backend/
│   ├── models/          # Data models (Mongoose)
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middlewares
│   ├── controllers/     # Controller logic
│   └── config/          # Configurations
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Main pages
│   │   ├── context/     # Context API
│   │   ├── services/    # API services
│   │   └── utils/       # Utilities
│   └── public/          # Static assets
└── README.md
👨‍👨‍👧 Development Team
<div align="center">
Vanessa Covrig

Alejandro Villena

Antonio Morales

