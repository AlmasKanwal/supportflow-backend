# SupportFlow - Backend

This is the backend REST API for **SupportFlow**, a service booking / support request system where customers raise service requests, workers accept and complete them, and admins oversee the whole platform.

## 1. Project Overview

SupportFlow connects three types of users:

- **Customer** – raises a service request ("Raise an Issue"), picks a category and a worker, tracks status, chats with the worker, and leaves a review once the work is done.
- **Worker** – sees requests assigned to them, accepts or rejects them, updates priority/status, and adds a resolution note before marking a request as completed.
- **Admin** – views all customers, workers, and requests, and can drill into a specific worker's task history.

The backend is a plain Express + MongoDB REST API. There are no sockets, no polling, and no external AI service — the "smart category suggestion" is a simple keyword-matching function (see `utils/categorySuggestion.js`).

## 2. Technologies

- Node.js + Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- dotenv, cors

## 3. Folder Structure

```
backend/
├── config/db.js              MongoDB connection
├── controllers/               Route handler logic
├── middleware/                 auth, role, error handling
├── models/                     User, Ticket, Notification, Review
├── routes/                     Express routers
├── data/workers.json           Demo worker seed data
├── utils/                      ticket number generator, category matcher, seed script
├── index.js                    App entry point
├── .env.example
├── vercel.json
└── package.json
```

## 4. Installation

```bash
cd backend
npm install
```

## 5. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

```
PORT=8000
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_random_jwt_secret_here
FRONTEND_URL=http://localhost:5173
```

### MongoDB Atlas setup

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new Cluster (the free M0 tier is enough).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for testing/Vercel).
5. Click **Connect > Drivers**, copy the connection string, and replace `<password>` with your database user's password.
6. Paste the full string into `MONGO_URI` in your `.env` file.

### JWT secret

`JWT_SECRET` can be any long random string. You can generate one quickly:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `JWT_SECRET`.

## 6. Running the Backend

```bash
npm run dev
```

This starts the server on `http://localhost:8000` (or whatever `PORT` you set) using nodemon, so it restarts automatically on file changes.

## 7. Seeding the Database

Run this once after setting up MongoDB:

```bash
npm run seed
```

This creates:
- 1 admin account
- 8 demo worker accounts across the categories Teaching, Technology, Design, Repair and Cleaning

The seed script is safe to run multiple times — it skips accounts that already exist.

## 8. Demo Accounts

All demo accounts use the password shown below.

| Role   | Email                     | Password  |
|--------|----------------------------|-----------|
| Admin  | admin@supportflow.com      | admin123  |
| Worker | manahil@supportflow.com     | worker123 |
| Worker | hooria@supportflow.com     | worker123 |
| Worker | tayyaba@supportflow.com    | worker123 |
| Worker | bilal@supportflow.com      | worker123 |
| Worker | sara@supportflow.com       | worker123 |
| Worker | usman@supportflow.com      | worker123 |
| Worker | ayesha@supportflow.com     | worker123 |
| Worker | zainab@supportflow.com     | worker123 |

Customers register themselves from the frontend at `/register`.

## 9. How the Mock Category Suggestion Works

`utils/categorySuggestion.js` exports `suggestCategory(description)`. It lowercases the customer's description and checks it against predefined keyword lists for each category (Teaching, Technology, Design, Repair, Cleaning). Whichever category has the most keyword matches is suggested. If nothing matches, it returns `null` and the frontend shows "No suitable category found. Please select or enter a category manually."

This is a plain JavaScript function — **no AI API, no API key, no external service is used.**

## 10. Ticket Number Generation

Every ticket gets both a MongoDB `_id` and a human-friendly `ticketNumber` like `SF-10001`, `SF-10002`, etc., generated in `utils/generateTicketNumber.js`.

## 11. Status Flow Rules (enforced in the backend)

```
Pending → In Progress → Completed   (final)
Pending → Rejected                  (final)
Pending/In Progress → Cancelled     (customer only, final)
```

`Completed` requires a non-empty `resolutionNote`. Once a ticket is `Completed`, `Rejected`, or `Cancelled`, no further status changes are allowed — this is enforced in `controllers/workerController.js`, not just in the UI.

## 12. API Routes

All protected routes require an `Authorization: Bearer <token>` header.

**Auth**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

**Users**
```
GET  /api/users/profile
PUT  /api/users/profile
```

**Tickets (customer)**
```
POST /api/tickets
GET  /api/tickets/my
GET  /api/tickets/:id
POST /api/tickets/:id/messages
POST /api/tickets/:id/cancel
```

**Worker**
```
GET  /api/worker/tickets
GET  /api/worker/tickets/:id
PUT  /api/worker/tickets/:id/accept
PUT  /api/worker/tickets/:id/reject
PUT  /api/worker/tickets/:id/status
PUT  /api/worker/tickets/:id/priority
POST /api/worker/tickets/:id/messages
```

**Workers (public listing)**
```
GET  /api/workers
GET  /api/workers/category/:category
GET  /api/workers/:id/reviews
```

**Notifications**
```
GET /api/notifications
PUT /api/notifications/:id/read
```

**Reviews**
```
POST /api/reviews
```

**Admin**
```
GET /api/admin/dashboard
GET /api/admin/customers
GET /api/admin/workers
GET /api/admin/workers/:id
GET /api/admin/tickets
```

No Postman is required — the React frontend is fully wired up to every one of these routes.

## 13. Deploying to Vercel

1. Push the `backend` folder to its own GitHub repository (e.g. `supportflow-backend`).
2. On https://vercel.com, import that repository as a new project.
3. In the project's **Environment Variables**, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` (set this to your deployed frontend URL once you have it, e.g. `https://supportflow-frontend.vercel.app`)
4. Deploy. Vercel will use the included `vercel.json` to route all requests to `index.js`.
5. Copy the deployed backend URL (e.g. `https://supportflow-backend.vercel.app`) — you'll need it for the frontend's `VITE_API_URL`.
6. After the frontend is deployed, come back and update `FRONTEND_URL` in the backend's Vercel environment variables to match the real frontend URL, then redeploy so CORS works correctly.

## 14. Common Errors and Solutions

| Problem | Solution |
|---|---|
| `MongoDB connection error` | Double-check `MONGO_URI`, make sure your IP is allowed in Atlas Network Access. |
| `401 Not authorized, no token` | Make sure the frontend is sending the `Authorization: Bearer <token>` header (this is handled automatically by `services/api.js` in the frontend). |
| CORS errors in the browser | Make sure `FRONTEND_URL` in the backend `.env` matches the exact URL the frontend is running on. |
| `Duplicate field value entered` on register | The email is already in use — try logging in instead. |
| Seed script says accounts already exist | That's expected if you've already run `npm run seed` once; it won't create duplicates. |
