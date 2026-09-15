# Project Management System

A full-stack web application that allows authenticated users to create and manage projects, organize tasks, track progress, and monitor project statistics through a centralized dashboard.

## Features

### 🔐 User Authentication

* User registration and login
* JWT-based authentication
* Secure password hashing using bcrypt
* User logout
* Unique email validation
* Protected API routes
* Authentication rate limiting to reduce brute-force attacks

### 📁 Project Management

* Create projects
* View project details
* Edit projects
* Delete projects
* View only projects owned by the authenticated user
* Project status tracking:

  * Not Started
  * In Progress
  * Completed
* Start date and end date management

### ✅ Task Management

* Create tasks under projects
* View tasks by project
* Edit tasks
* Delete tasks
* Mark tasks as completed
* Task status:

  * Pending
  * In Progress
  * Completed
* Task priority:

  * Low
  * Medium
  * High
* Due date tracking

### 📊 Dashboard

The dashboard provides an overview of the authenticated user's project and task activity:

* Total Projects
* Total Tasks
* Completed Tasks
* Pending Tasks
* Projects In Progress

### 🔎 Search & Filtering

* Search projects by name
* Search tasks by name
* Filter projects by status
* Filter tasks by status
* Filter tasks by priority

### 🛡️ Security

* JWT authentication
* bcrypt password hashing
* Protected routes and APIs
* User-level authorization
* Request validation
* SQL Injection protection using parameterized/ORM queries
* Authentication endpoint rate limiting
* Sensitive information is excluded from API responses

---

## Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* REST API integration
* Responsive UI

### Backend

* Node.js
* Express.js
* REST API
* JWT
* bcrypt
* Request validation
* Authentication middleware
* Error handling
* Logging

### Database

* PostgreSQL / MySQL
* Relational database design
* Foreign key relationships
* Normalized database structure

---

## Project Structure

```text
project-management-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── server.js
│
├── README.md
└── .gitignore
```

> The exact folder structure may vary depending on the implementation.

---

## Database Design

The application uses a relational database with the following main entities:

### Users

* id
* full_name
* email
* password
* created_at

### Projects

* id
* user_id
* project_name
* description
* status
* start_date
* end_date
* created_at

### Tasks

* id
* project_id
* task_name
* description
* priority
* status
* due_date
* created_at

### Relationships

```text
Users
  │
  │ 1 : N
  ▼
Projects
  │
  │ 1 : N
  ▼
Tasks
```

Each user can own multiple projects, and each project can contain multiple tasks.

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |
| POST   | `/api/auth/logout`   | Logout user         |

### Projects

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | `/api/projects`     | Get all user's projects |
| GET    | `/api/projects/:id` | Get project details     |
| POST   | `/api/projects`     | Create a project        |
| PUT    | `/api/projects/:id` | Update a project        |
| DELETE | `/api/projects/:id` | Delete a project        |

### Tasks

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | `/api/tasks`     | Get user's tasks |
| GET    | `/api/tasks/:id` | Get task details |
| POST   | `/api/tasks`     | Create a task    |
| PUT    | `/api/tasks/:id` | Update a task    |
| DELETE | `/api/tasks/:id` | Delete a task    |

---

## Authentication Flow

```text
User
 │
 ▼
Register / Login
 │
 ▼
Backend validates credentials
 │
 ▼
JWT Token Generated
 │
 ▼
Authenticated Requests
 │
 ▼
Authentication Middleware
 │
 ▼
Protected API
```

Protected APIs verify the JWT before allowing access to projects and tasks.

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd project-management-system
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit the `.env` file to GitHub.

### 5. Setup Database

Create the required database and configure the connection using the environment variables.

Run the database migrations/schema setup according to the project's database configuration.

### 6. Start Backend

```bash
cd server
npm run dev
```

### 7. Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The application will be available at the local development URL shown by the frontend development server.

---

## Environment Variables

| Variable       | Description                            |
| -------------- | -------------------------------------- |
| `PORT`         | Backend server port                    |
| `DATABASE_URL` | Database connection string             |
| `JWT_SECRET`   | Secret key used for JWT authentication |

---

## Validation & Error Handling

The application validates incoming requests for:

* Required fields
* Empty strings
* Email format
* Password requirements
* Valid dates
* Valid project status
* Valid task status
* Valid task priority
* Invalid project/task IDs

The API returns appropriate HTTP status codes and error messages for invalid requests.

---

## Authorization

Users can only access resources that belong to them.

For example:

```text
User A
 ├── Project A
 │    ├── Task 1
 │    └── Task 2
 │
 └── Project B

User B
 └── Project C
```

User A cannot view, modify, or delete User B's projects or tasks.

Authorization checks are performed on protected API requests.

---

## Dashboard Statistics

The dashboard calculates statistics based on the authenticated user's data.

```text
Total Projects
Total Tasks
Completed Tasks
Pending Tasks
Projects In Progress
```

Statistics are dynamically updated when projects or tasks are created, updated, or deleted.

---

## API Documentation

Detailed API documentation includes:

* Authentication APIs
* Project APIs
* Task APIs
* Request parameters
* Request body examples
* Response formats
* Authentication requirements
* Error responses

API documentation can be provided through **Postman Collection / Swagger** depending on the implementation.

---

## Responsive Design

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

The UI follows a clean and responsive component-based structure.

---

## Security Practices

The application follows basic security best practices:

* Passwords are never stored in plain text
* Passwords are hashed using bcrypt
* JWT authentication is used for protected APIs
* Authentication middleware protects private routes
* User authorization prevents unauthorized data access
* Input validation is applied to API requests
* SQL Injection is prevented using ORM/parameterized queries
* Authentication endpoints are rate-limited
* Sensitive user information is not exposed in API responses
* Environment variables are used for sensitive configuration

---

## Future Enhancements

Possible future improvements include:

* Pagination
* Sorting
* Project progress percentage
* Task reminders
* Notifications
* Audit logs
* Role-Based Access Control
* Docker support
* Unit and integration testing
* CI/CD pipeline
* Cloud deployment
* Swagger API documentation

---

## Deployment

### Frontend

Deployment can be configured using platforms such as Vercel or Netlify.

### Backend

The Express.js backend can be deployed using platforms such as Render or Railway.

### Database

The relational database can be hosted using a cloud PostgreSQL/MySQL provider.

**Live Demo:** `<your-deployment-url>`

**GitHub Repository:** `<your-github-repository-url>`

---

## Screenshots

Add application screenshots here after completing the UI.

```text
screenshots/
├── login.png
├── register.png
├── dashboard.png
├── projects.png
├── project-details.png
└── tasks.png
```

---

## Author

**Harshini Elangovan**

B.Tech – Artificial Intelligence & Data Science

---

## License

This project is developed for learning, assessment, and demonstration purposes.
