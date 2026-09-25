# Support Ticket Management System

> **Junior Full Stack Developer – Technical Assessment Submission**

A beginner-friendly, full-stack web-based Support Ticket Management System built with **React.js**, **Node.js (Express.js)**, **MySQL**, and **JWT Authentication**. Customers can create and track support tickets, and Support Agents can manage, assign, prioritize, and respond to tickets with a real-time dashboard.



## 1. Project Overview & Features

### 👤 Customer Features
- **Registration & Authentication**: Secure sign-up and login with password hashing (`bcrypt`) and JWT token management.
- **Customer Dashboard**: View all tickets created by the logged-in customer.
- **Create Support Ticket**: Submit a ticket with `subject`, `description`, and `priority` (`Low`, `Medium`, `High`, `Urgent`).
- **Ticket Details & History**: View ticket status, timestamps, and full response timeline.
- **Comment & Communicate**: Add comments and reply to support agents.
- **Search & Filter**: Search tickets by text and filter by status/priority.
- **Access Isolation**: Customers cannot view or modify tickets belonging to other customers.

### 🛡️ Support Agent Features
- **Agent Dashboard & Statistics**: Overview metrics showing Total, Open, In Progress, Resolved, Closed, and Urgent ticket counts.
- **Ticket Queue Management**: View all customer support tickets across the company.
- **Search, Filter & Sort**: Search tickets, filter by status/priority, and sort by date or priority.
- **Status & Priority Updates**: Transition ticket status (`Open` → `In Progress` → `Resolved` → `Closed`) and adjust priority.
- **Agent Assignment**: Assign tickets to specific support agents.
- **Response Thread**: Post official support responses on ticket conversations.
- **Role Protection**: Unauthenticated or customer users cannot access agent-specific endpoints.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React.js (Vite) | Functional Components, Hooks, Context API, React Router v6, Axios |
| **Backend** | Node.js + Express.js | REST APIs, Modular MVC Architecture, Middleware, Error Handling |
| **Database** | MySQL | InnoDB, Foreign Keys, Cascading Constraints, Indexes, Parameterized Queries |
| **Authentication** | JWT (JSON Web Tokens) + Bcrypt | Secure token-based auth with salted password hashing |
| **Testing** | Jest + Supertest | 13 automated unit & API test cases covering auth, RBAC, CRUD |
| **API Testing** | Postman Collection | Comprehensive collection with automated environment variables |
| **Version Control**| Git / GitHub | Clean commit history & structured repository layout |

---

## 3. Project Structure

```text
support-ticket-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool configuration
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe
│   │   ├── ticketController.js   # Ticket CRUD, Status/Priority update, Stats
│   │   ├── commentController.js  # Conversation comments & replies
│   │   └── userController.js     # Agent user listings
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   ├── roleMiddleware.js     # Role-based authorization middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── ticketRoutes.js       # /api/tickets routes
│   │   └── userRoutes.js         # /api/users routes
│   ├── app.js                    # Express app configuration & middleware
│   ├── server.js                 # HTTP server bootstrap & DB test
│   └── package.json
├── database/
│   ├── schema.sql                # Table definitions, constraints, indexes
│   ├── seed.sql                  # Initial seed data & demo accounts
│   └── queries.sql               # Example queries including Section 8 JOIN query
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios client with JWT interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top navigation with user badge & logout
│   │   │   ├── StatusBadge.jsx   # Status & Priority badge UI pills
│   │   │   ├── StatsCard.jsx     # Metric cards for Agent dashboard
│   │   │   ├── TicketCard.jsx    # Card item for ticket lists
│   │   │   ├── FilterBar.jsx     # Search, filter, and sorting controls
│   │   │   ├── CreateTicketModal.jsx # Customer ticket creation modal
│   │   │   ├── CommentSection.jsx # Conversation timeline and response form
│   │   │   └── ProtectedRoute.jsx # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & persistent login
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page with demo account quick-fill
│   │   │   ├── Register.jsx      # Customer registration page
│   │   │   ├── CustomerDashboard.jsx # Customer tickets & creation
│   │   │   ├── AgentDashboard.jsx    # Agent statistics & queue
│   │   │   ├── TicketDetail.jsx      # Ticket conversation & agent controls
│   │   │   └── NotFound.jsx          # 404 handler
│   │   ├── App.jsx               # React router definitions
│   │   ├── main.jsx              # DOM entrypoint
│   │   └── index.css             # Responsive styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── postman/
│   └── Support_Ticket_System.postman_collection.json # Postman test suite
├── tests/
│   └── api.test.js               # Jest & Supertest automated test suite
├── .env.example                  # Environment configuration template
├── .gitignore                    # Ignored files (node_modules, .env)
├── package.json                  # Root npm scripts
└── README.md                     # Documentation & deployment guide
```

---

## 4. MySQL Database Schema

The database consists of three relational tables enforcing primary/foreign keys, one-to-many relationships, and indexes:

### 1. `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE, INDEX | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | ENUM('customer','agent') | NOT NULL, DEFAULT 'customer' | User authorization role |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

### 2. `tickets` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique ticket identifier |
| `user_id` | INT | FOREIGN KEY (`users.id`) ON DELETE CASCADE | Customer who created the ticket |
| `subject` | VARCHAR(255) | NOT NULL | Ticket summary title |
| `description` | TEXT | NOT NULL | Detailed description of issue |
| `priority` | ENUM('Low','Medium','High','Urgent') | DEFAULT 'Medium', INDEX | Ticket priority level |
| `status` | ENUM('Open','In Progress','Resolved','Closed') | DEFAULT 'Open', INDEX | Ticket lifecycle status |
| `assigned_to` | INT | FOREIGN KEY (`users.id`) ON DELETE SET NULL, INDEX | Assigned support agent |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, INDEX | Created timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last updated timestamp |

### 3. `ticket_comments` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique comment identifier |
| `ticket_id` | INT | FOREIGN KEY (`tickets.id`) ON DELETE CASCADE, INDEX | Associated ticket |
| `user_id` | INT | FOREIGN KEY (`users.id`) ON DELETE CASCADE, INDEX | Comment author (customer or agent) |
| `comment` | TEXT | NOT NULL | Comment or response body |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

---

## 5. Section 8 Example Database Query Requirement

> **Requirement**: *"Write a query that returns all open tickets along with the customer's name and email. The query should demonstrate use of a JOIN and filtering."*

```sql
SELECT 
    t.id AS ticket_id,
    t.subject,
    t.description,
    t.priority,
    t.status,
    t.created_at,
    u.name AS customer_name,
    u.email AS customer_email
FROM tickets t
INNER JOIN users u ON t.user_id = u.id
WHERE t.status = 'Open'
ORDER BY t.created_at DESC;
```

**Explanation:**
- `INNER JOIN users u ON t.user_id = u.id` connects each ticket to its creator's user record.
- `WHERE t.status = 'Open'` filters the result set to include only active tickets requiring support.
- `ORDER BY t.created_at DESC` sorts the tickets chronologically with the newest tickets first.

---

## 6. REST API Endpoints

| Method | Endpoint | Purpose | Access Role | Request Body |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new customer | Public | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Log in user and receive JWT | Public | `{ email, password }` |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated | Header `Authorization: Bearer <token>` |
| `GET` | `/api/tickets` | Get tickets (Customer: own tickets; Agent: all tickets) | Authenticated | Query: `status`, `priority`, `search`, `sortBy` |
| `POST` | `/api/tickets` | Create a new ticket | Customer | `{ subject, description, priority }` |
| `GET` | `/api/tickets/stats` | Get ticket statistics | Agent | Header `Authorization: Bearer <agent_token>` |
| `GET` | `/api/tickets/:id` | Get ticket details | Authorized user (Owner or Agent) | None |
| `PUT` | `/api/tickets/:id` | Update status, priority, or assign agent | Agent / Authorized | `{ status, priority, assigned_to }` |
| `DELETE` | `/api/tickets/:id` | Delete ticket | Authorized user | None |
| `GET` | `/api/tickets/:id/comments` | Get comments for ticket | Authorized user | None |
| `POST` | `/api/tickets/:id/comments` | Add response/comment | Authenticated | `{ comment }` |
| `GET` | `/api/users` | Get agents list for assignment | Agent | Query: `?role=agent` |

---

## 7. Demo Credentials

Seed data (`database/seed.sql`) provides the following accounts:

| Role | Email | Password | Description |
|---|---|---|---|
| **Support Agent** | `agent@support.com` | `Agent123!` | Primary Support Agent |
| **Support Agent** | `alex.agent@support.com` | `Agent123!` | Secondary Support Agent |
| **Customer** | `john.customer@gmail.com` | `Customer123!` | Customer account with sample tickets |
| **Customer** | `alice.customer@gmail.com` | `Customer123!` | Customer account with urgent tickets |

---

## 8. Local Installation & Setup Guide

### Prerequisites
- Node.js (v18+)
- MySQL Server (Local MySQL, XAMPP, or cloud instance like Aiven / Railway)

### Step 1: Clone Repository & Configure Environment
1. Copy `.env.example` to `backend/.env`:
   ```bash
   cp .env.example backend/.env
   ```
2. Update `backend/.env` with your MySQL database credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=support_ticket_db
   DB_PORT=3306
   JWT_SECRET=super_secret_jwt_key_support_tickets_2024
   FRONTEND_URL=http://localhost:5173
   ```

### Step 2: Initialize Database
Execute the schema and seed scripts in MySQL:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### Step 3: Run Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend will start on `http://localhost:5000`.

### Step 4: Run Frontend Application
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will open on `http://localhost:5173`.

---

## 9. Running Automated Tests

The test suite runs 13 automated unit and API integration tests using **Jest** and **Supertest**:

```bash
# Run from root directory
npm test

# Or run directly in backend directory
cd backend
npm test
```

### Test Scenarios Covered:
1. `POST /api/auth/register` - Successful registration (201)
2. `POST /api/auth/register` - Missing required fields rejected (400)
3. `POST /api/auth/login` - Successful login with JWT (200)
4. `POST /api/auth/login` - Invalid credentials rejected (401)
5. `GET /api/tickets` - Unauthorized request without JWT rejected (401)
6. `POST /api/tickets` - Ticket creation succeeds (201)
7. `GET /api/tickets/:id` - Customer cannot access another customer's ticket (403 Forbidden)
8. `GET /api/tickets/:id` - Non-existent ticket returns 404
9. `GET /api/tickets/:id` - Invalid non-numeric ticket ID returns 400
10. `PUT /api/tickets/:id` - Agent can update ticket status and priority (200)
11. `PUT /api/tickets/:id` - Customer forbidden from changing status (403 Forbidden)
12. `GET /api/users` - Customer forbidden from accessing agent-only endpoint (403 Forbidden)
13. `POST /api/tickets/:id/comments` - Authenticated user can add comment (201)

---

## 10. API Testing with Postman

1. Open Postman and click **Import**.
2. Select the file located at: `postman/Support_Ticket_System.postman_collection.json`.
3. The collection includes pre-configured requests, body payloads, and automated test scripts that automatically save your `customerToken` and `agentToken` variables upon logging in.

---

## 11. Cloud Deployment Guide

### A. Deploy Database (Aiven / PlanetScale / Railway)
1. Create a free MySQL database on [Aiven](https://aiven.io/) or [Railway](https://railway.app/).
2. Run the SQL statements from `database/schema.sql` and `database/seed.sql` in the cloud MySQL query console.
3. Note the connection details (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

### B. Deploy Backend (Render / Railway)
1. Push repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add Environment Variables:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
   - `JWT_SECRET`
   - `FRONTEND_URL` (set to your deployed frontend URL)
7. Deploy service and copy your public backend URL (e.g., `https://support-ticket-api.onrender.com`).

### C. Deploy Frontend (Vercel / Netlify)
1. Create a new project on [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/).
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Add Environment Variable:
   - `VITE_API_URL=https://support-ticket-api.onrender.com/api`
6. Deploy! Your application is now live on the web.
