# Major_project_2025

# 📌 Attendance Management System

A full-stack **Attendance Management System** built using modern web technologies. This application allows users to manage and track attendance efficiently with a dynamic user interface and reliable backend operations.

---

## 🛠️ Tech Stack

**Backend**

* JavaScript
* Node.js
* Express.js

**Frontend**

* HTML
* CSS
* Tailwind CSS
* EJS (Embedded JavaScript Templates)

**Database**

* MySQL

**Cloud Storage**

* Cloudinary (Free Tier)

**Deployment**

* Deployed on AWS (Amazon Web Services) using the free trial tier

---

## 📁 Project Structure

```
attendance-management/
├── public/            # Static assets (images, styles, JS logic in /js subfolder)
├── views/             # Frontend templates using .ejs format
├── server.js          # Main server file with routing and core logic
├── database.js        # Handles MySQL DB connection and query functions
├── cloud.js           # Integrates Cloudinary for cloud image storage
├── .env               # Environment variables for sensitive configurations
├── .gitignore         # Specifies files and folders to ignore in Git
├── package.json       # Node.js project metadata and dependencies
├── tailwind.config.js # Tailwind CSS configuration
```

---

## ⚙️ Features

* User-friendly attendance tracking interface
* Backend logic to manage user data and attendance records
* Integration with Cloudinary for image uploads and storage
* Responsive design using Tailwind CSS
* MySQL database integration for storing persistent data
* Server-side rendering with EJS
* Secure and scalable deployment on AWS

---

## 📦 Installation & Setup

1. **Clone the repository**

```
git clone https://github.com/yourusername/attendance-management.git
cd attendance-management
```

2. **Install dependencies**

```
npm install
```

3. **Create a `.env` file** and add your configuration variables:

```
MYSQL_HOST=your_host  
MYSQL_USER=your_user  
MYSQL_PASSWORD=your_password  
MYSQL_DATABASE=your_database  
CLOUD_NAME=your_cloud_name  
CLOUD_API_KEY=your_api_key  
CLOUD_API_SECRET=your_api_secret  
```

4. **Run the application**

```
node server.js
```

5. Visit `http://localhost:3000` in your browser


