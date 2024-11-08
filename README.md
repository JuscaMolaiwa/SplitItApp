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

## Contributing
We welcome contributions to the Expense Splitting App project. If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch to your forked repository.
5. Submit a pull request to the original repository.

## License
This project is licensed under the [MIT License](LICENSE).