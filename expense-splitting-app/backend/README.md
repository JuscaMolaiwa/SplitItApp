# Expense Splitting App - Backend Setup

## Overview
This guide explains the steps to set up the backend of the Expense Splitting App on your local environment. Follow these instructions to install dependencies, configure the database, and run the application.

## Prerequisites
- Python 3.8+
- MySQL installed and configured
- Node.js and npm (for frontend setup)
- A code editor or IDE of your choice
- Basic knowledge of Python, MySQL, and Node.js

## Setup Instructions

1. ### Navigate to the Frontend Directory
- Open a terminal and navigate to the Backend directory:
    ```
    cd expense-splitting-app/backend
    ```

2. ### Set Up the Virtual Environment
- Create a virtual environment:
    ```
    python3 -m venv venv
    ```
- Activate the virtual environment:
    ```
    source venv/bin/activate
    ```
- Install project dependencies:
    ```
    pip install -r requirements.txt
    ```

3. ### Set Up the Database
- Install and configure MySQL on your system.
- Create a new database for the project:
    ```
    CREATE DATABASE expense_splitting;
    ```

4. ### Update/Create the .env file at root of `expense-splitting-app` folder with your database credentials:
    ```
    DATABASE_URI=mysql+pymysql://<username>:<password>@localhost/expense_splitting
    TEST_DATABASE_URI=sqlite:///:memory:
    SECRET_KEY=your-secret-key
    FLASK_DEBUG=1
    FLASK_APP=app.py
    FLASK_ENV=development
    JWT_SECRET_KEY=test-secret-key
    UPLOAD_FOLDER=uploads
    ALLOWED_EXTENSIONS=png,jpg,jpeg,gif
    ```

- To generate the SECRET_KEY and replace the `your-secret-key`, you can use the following command:

    ```
    python3 -c "import secrets; print(secrets.token_hex(32))"
    ```
- Replace `<username>`, `<password>` with your actual database credentials.
- Use the JWT_SECRET_KEY from .env as is for authentication during unit testing and development.

5. ### Testing
- Run the tests:
    - Ensure TEST_DATABASE_URI in .env is set to:
        ```
        TEST_DATABASE_URI=sqlite:///:memory:
        ```

    - Run unit tests with:
        ```
        python -W ignore -m unittest discover -s unittests -p "test_*.py”
        ```

6. ### Run the Application

- Start the backend application:

    ```
    python app.py
    ```

- The backend server should now be running. You can access it at:

    ```
    http://127.0.0.1:5000/
    ```

## API Endpoints

### User Login
- **Endpoint**: `POST /api/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Authorization**: No authentication required.
- **Request Body**: JSON object containing username and password.
- **Response**:
  - `200 OK`: JWT token returned.
  - `400 Bad Request`: Error details if login fails.
  - `401 Unauthorized`: Invalid credentials.

### Register a New User
- **Endpoint**: `POST /api/register`
- **Description**: Registers a new user account.
- **Authorization**: No authentication required.
- **Request Body**: JSON object containing user details (e.g., username, email, password).
- **Response**:
  - `201 Created`: User registered successfully.
  - `409 Conflict`: Error details if registration fails.
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

### Update User Profile
- **Endpoint**: `PUT /api/profile`
- **Description**: Updates the authenticated user's profile information.
- **Authorization**: Requires user authentication.
- **Request Body**: JSON object containing updated profile information (e.g., full_name, email).
- **Response**:
  - `200 OK`: Profile updated successfully.
  - `400 Bad Request`: Error details if the profile cannot be updated.
  - `500 Internal Server Error`: Unexpected error.

### Get User Profile
- **Endpoint**: `GET /api/profile`
- **Description**: Retrieves the authenticated user's profile information.
- **Authorization**: Requires user authentication.
- **Response**:
  - `200 OK`: User profile details.
  - `401 Unauthorized`: If not authenticated.
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


## Contributing
- We welcome contributions! Please refer to the main project [Main Project README](expense-splitting-app/README.md) for contribution guidelines.