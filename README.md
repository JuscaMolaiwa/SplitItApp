# Expense Splitting App

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction
The Expense Splitting App is a web application that allows groups of people, such as roommates or friends, to easily track and split expenses. It provides features for managing expenses, calculating balances, and facilitating payments between group members.

## Features
- **Group Creation**: Users can create groups for different occasions (e.g., roommates, trips, dining out) and invite members to join.
- **Expense Tracking**: Users can add expenses to the group, categorize them, and split the costs among members.
- **Receipt Scanning**: Users can upload receipts, and the app will automatically parse the items and distribute the costs.
- **Real-time Balances**: The app calculates and displays the current balances between group members, making it easy to see who owes what.
- **Payment Integration**: Users can make payments directly through the app, and the system will automatically update the balances.
- **Expense History**: Users can view a detailed history of all expenses and payments within the group.
- **Debt Simplification**: The app includes an algorithm to automatically suggest the optimal payment paths to settle debts between group members.
- **Notifications**: Users receive push notifications for payment reminders and other important updates.

## Technical Stack
- **Frontend**: React/React Native
- **Backend**: Python (Flask/Django) or Node.js
- **Database**: MySQL
- **Payment Integration**: Stripe or PayPal
- **Receipt Parsing**: Optical Character Recognition (OCR) API
- **Notifications**: Firebase Cloud Messaging or Twilio SMS

## Installation
1. Clone the repository:
```
git clone https://github.com/your-username/SplitItApp.git
```
2. Install dependencies:
```
cd expense-splitting-app
pip install -r requirements.txt
```
3. Set up the database:
   - Install and configure MySQL on your system.
   - Create a new database for the project.
   - Update the `SQLALCHEMY_DATABASE_URI` in the `app.py` file with your database credentials.
4. Run the application:
```
python app.py
```

## Usage
1. Register a new user account.
2. Create a new group or join an existing one.
3. Add expenses to the group, either manually or by uploading receipts.
4. View the current balances and make payments to settle debts.
5. Receive notifications for payment reminders and other important updates.

## API Endpoints

### Create a New Expense
- **Endpoint**: `POST /api/expenses`
- **Description**: Creates a new expense.
- **Authorization**: Requires user authentication.
- **Request Body**: JSON object containing expense details (e.g., amount, description, group_id).
- **Response**:
  - `201 Created`: Expense created successfully.
  - `400 Bad Request`: Error details if the expense cannot be created.
  - `500 Internal Server Error`: Unexpected error.

### Get All Expenses
- **Endpoint**: `GET /api/expenses`
- **Description**: Retrieves a list of all expenses.
- **Authorization**: Requires user authentication.
- **Response**:
  - `200 OK`: List of expenses.
  - `500 Internal Server Error`: Unexpected error.

### Get User Profile
- **Endpoint**: `GET /api/profile`
- **Description**: Retrieves the authenticated user's profile information.
- **Authorization**: Requires user authentication.
- **Response**:
  - `200 OK`: User profile details.
  - `401 Unauthorized`: If not authenticated.
  - `500 Internal Server Error`: Unexpected error.

### Update User Profile
- **Endpoint**: `PUT /api/profile`
- **Description**: Updates the authenticated user's profile information.
- **Authorization**: Requires user authentication.
- **Request Body**: JSON object containing updated profile information (e.g., full_name, email).
- **Response**:
  - `200 OK`: Profile updated successfully.
  - `400 Bad Request`: Error details if the profile cannot be updated.
  - `500 Internal Server Error`: Unexpected error.

### Create a New Group
- **Endpoint**: `POST /api/groups`
- **Description**: Creates a new group.
- **Authorization**: Requires user authentication.
- **Request Body**: JSON object containing group details (e.g., group_name).
- **Response**:
  - `201 Created`: Group created successfully.
  - `400 Bad Request`: Error details if the group cannot be created.
  - `500 Internal Server Error`: Unexpected error.

### Get All Groups
- **Endpoint**: `GET /api/groups`
- **Description**: Retrieves a list of all groups.
- **Authorization**: Requires user authentication.
- **Response**:
  - `200 OK`: List of groups.
  - `500 Internal Server Error`: Unexpected error.

### Get Group Members
- **Endpoint**: `GET /api/groups/members`
- **Description**: Retrieves a list of members in a specified group.
- **Authorization**: Requires user authentication.
- **Response**:
  - `200 OK`: List of group members.
  - `500 Internal Server Error`: Unexpected error.

### Get User Information
- **Endpoint**: `GET /api/user`
- **Description**: Retrieves information about the authenticated user.
- **Authorization**: Requires user authentication.
- **Response**:
  - `200 OK`: User information.
  - `401 Unauthorized`: If not authenticated.
  - `500 Internal Server Error`: Unexpected error.

### Get All Users
- **Endpoint**: `GET /api/users`
- **Description**: Retrieves a list of all users.
- **Authorization**: Requires admin privileges.
- **Response**:
  - `200 OK`: List of users.
  - `403 Forbidden`: If not an admin.
  - `500 Internal Server Error`: Unexpected error.

### Register a New User
- **Endpoint**: `POST /api/register`
- **Description**: Registers a new user account.
- **Authorization**: No authentication required.
- **Request Body**: JSON object containing user details (e.g., username, email, password).
- **Response**:
  - `201 Created`: User registered successfully.
  - `409 Conflict`: Error details if registration fails.
  - `500 Internal Server Error`: Unexpected error.

### User Login
- **Endpoint**: `POST /api/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Authorization**: No authentication required.
- **Request Body**: JSON object containing username and password.
- **Response**:
  - `200 OK`: JWT token returned.
  - `400 Bad Request`: Error details if login fails.
  - `401 Unauthorized`: Invalid credentials.

## Contributing
We welcome contributions to the Expense Splitting App project. If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch to your forked repository.
5. Submit a pull request to the original repository.

## License
This project is licensed under the [MIT License](LICENSE).