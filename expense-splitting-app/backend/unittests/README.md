Test Suite for Expense Splitting App
This repository contains a suite of unit tests for the Expense Splitting App, focusing on the authentication features. The tests validate core functionalities like user registration, login, and access control to ensure the application behaves as expected under various scenarios.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Running-UnitTests](#running-unit-tests)
- [Tests-Included](#tests-included)
- [Mocking](#mocking)
- [Contributing](#contributing)
- [Happy-Testing](#happy-testing-)


## Overview
The test suite is built using Python's unittest framework and targets the authentication module. It ensures:

- User registration functions properly.
- Login and token generation work seamlessly.
- Access control decorators like login_required and admin_required are enforced correctly.

## Setup
- Clone the Repository
```
git clone https://github.com/your-username/SplitItApp.git

cd expense-splitting-app
```
- Create a Virtual Environment
- It’s recommended to use a virtual environment to manage dependencies.
```
python -m venv venv
```
- Activate the Virtual Environment
  - On macOS/Linux:
```
source venv/bin/activate
```
   - On Windows:
```
venv\Scripts\activate
```

## Install Dependencies
Install the required packages, including Flask and testing libraries, using:

```
pip install -r requirements.txt
```

## Set Environment Variables
Ensure any required environment variables (e.g., FLASK_ENV, DATABASE_URL) are set. You can use a .env file or set them directly in your shell.

### Running Unit Tests
Run the unit tests with:

```
python -m unittest discover -s unittests -p "test_*.py"
```

## For more detailed output, use the verbose flag:

```
python -W ignore -m unittest discover -s unittests -p "test_*.py" -v
```
## Tests Included
  - Authentication Tests
    - get_current_user_id:
    - Validates decoding of valid tokens.
    - Handles cases where no token is provided.
  - Registration
    - Tests successful user registration.
    - Validates error handling for missing or invalid fields.
  - Login
    - Verifies successful login and token generation.
    - Ensures graceful handling of invalid credentials.
- Decorators
    - admin_required:
        - Tests behavior for admin and non-admin users.
    - login_required:
        - Validates access control for authenticated and unauthenticated users.

## Mocking
The test suite employs mocking to isolate unit test behavior. Commonly mocked elements include:

- Database interactions
- Token decoding and validation
- JSON responses (flask.jsonify)
- This ensures tests run independently without relying on external services.

## Contributing
We welcome contributions to improve this test suite! Please follow these steps:

Fork the repository.
Create a feature branch (git checkout -b feature-name).
Add tests or improve existing ones.
Submit a pull request with a clear description of your changes.

### Happy Testing! 🎉

