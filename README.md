# SupportFlow - Backend

SupportFlow is a service booking and support request system where customers can raise service requests, workers can manage and complete them, and admins can oversee the platform.

## Demo Accounts

### Admin

| Role  | Email                                                 | Password |
| ----- | ----------------------------------------------------- | -------- |
| Admin | [admin@supportflow.com](mailto:admin@supportflow.com) | admin123 |

### Workers

| Role   | Email                                                     | Password  |
| ------ | --------------------------------------------------------- | --------- |
| Worker | [manahil@supportflow.com](mailto:manahil@supportflow.com) | worker123 |
| Worker | [hooria@supportflow.com](mailto:hooria@supportflow.com)   | worker123 |
| Worker | [tayyaba@supportflow.com](mailto:tayyaba@supportflow.com) | worker123 |
| Worker | [bilal@supportflow.com](mailto:bilal@supportflow.com)     | worker123 |
| Worker | [sara@supportflow.com](mailto:sara@supportflow.com)       | worker123 |
| Worker | [usman@supportflow.com](mailto:usman@supportflow.com)     | worker123 |
| Worker | [ayesha@supportflow.com](mailto:ayesha@supportflow.com)   | worker123 |
| Worker | [zainab@supportflow.com](mailto:zainab@supportflow.com)   | worker123 |

Customers can create their own account using the **Register** option.

---

# Features & How to Use Them

## 1. Customer Features

### Register / Login

Customers can create an account and log in to the system.

**How to use:**

1. Open the application.
2. Go to **Register**.
3. Enter your name, email, and password.
4. Login using your account.

### Raise an Issue

Customers can create a service request.

**How to use:**

1. Login as a customer.
2. Open **Raise an Issue**.
3. Enter the issue description.
4. Select a category.
5. Select a worker.
6. Submit the request.

The system creates a ticket for the request.

### View My Requests

Customers can see all the service requests they have created.

They can check:

* Ticket number
* Category
* Assigned worker
* Priority
* Current status
* Request details

### Track Request Status

Customers can track their request as it moves through the process.

The normal flow is:

**Pending → In Progress → Completed**

A request can also be rejected or cancelled.

### Chat with Worker

Customers can send messages to the assigned worker from the ticket.

**How to use:**

1. Open a ticket.
2. Go to the messages/chat section.
3. Type a message.
4. Send it.

### Cancel Request

Customers can cancel a request while it is still pending or in progress.

### Leave a Review

After a request is completed, the customer can leave a review for the worker.

---

# 2. Worker Features

Workers can manage service requests assigned to them.

### View Assigned Requests

Workers can see the requests assigned to their account.

They can view:

* Customer information
* Issue description
* Category
* Priority
* Status
* Ticket number

### Accept Request

A worker can accept a pending request.

**How to use:**

1. Login using a worker account.
2. Open the assigned request.
3. Click **Accept**.

The request moves from **Pending** to **In Progress**.

### Reject Request

A worker can reject a pending request if they cannot handle it.

### Update Priority

Workers can update the priority of a request.

### Update Status

Workers can update the request status while working on it.

Available flow:

**Pending → In Progress → Completed**

Before marking a request as **Completed**, the worker must add a resolution note explaining how the issue was resolved.

### Chat with Customer

Workers can communicate with customers through the ticket messages.

### Complete Request

After solving the issue:

1. Open the assigned ticket.
2. Add a **Resolution Note**.
3. Update the status to **Completed**.

Once completed, the ticket is final and cannot be changed.

---

# 3. Admin Features

Admins can manage and monitor the complete SupportFlow system.

### Admin Dashboard

The admin can view an overview of the platform, including customers, workers, and service requests.

### View Customers

Admins can view the registered customers.

### View Workers

Admins can view all workers and their information.

### Worker Task History

Admins can open a specific worker and view their previous and current tasks.

### View All Tickets

Admins can view all service requests created in the system and monitor their progress.

---

# 4. Worker Listing

Customers can browse available workers.

Workers can be viewed by category, such as:

* Teaching
* Technology
* Design
* Repair
* Cleaning

Customers can also view reviews for workers before selecting them.

---

# 5. Category Suggestion

When a customer enters an issue description, the system can suggest a suitable category based on keywords.

For example:

* "My laptop is not working" → **Technology**
* "I need help fixing a broken door" → **Repair**
* "I need help with my assignment" → **Teaching**

The customer can use the suggested category or select another category manually.

---

# 6. Notifications

Users can receive notifications about important ticket activities.

Users can:

* View notifications
* Open/read notifications
* Mark notifications as read

---

# 7. Ticket Status Flow

The system follows these status rules:

```text
Pending → In Progress → Completed

Pending → Rejected

Pending/In Progress → Cancelled
```

Completed, Rejected, and Cancelled tickets are final and cannot be changed.

---

# 8. Typical Complete Workflow

### Customer

**Register → Login → Raise an Issue → Select Category → Select Worker → Submit Request**

### Worker

**Login → View Request → Accept → Work on Request → Add Resolution Note → Complete**

### Customer

**Track Request → Chat with Worker → View Completed Request → Leave Review**

### Admin

**Login → Dashboard → View Customers → View Workers → View Tickets → Check Worker Task History**
