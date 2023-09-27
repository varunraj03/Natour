# Natours - Tour Booking and Review Website

Welcome to Natours, a web application that allows users to browse, book, and review tour sites. This project is built using Node.js, Express, and MongoDB for the backend, and Pug for the frontend. Natours follows the Model-View-Controller (MVC) architecture and includes user authentication with web tokens stored in cookies.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Usage](#usage)
5. [Contributing](#contributing)
6. [License](#license)

## Getting Started

### Prerequisites

Before you can run the Natours project, ensure you have the following software installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/yourusername/natours.git

2. Navigate to the project directory:
   ```bash
   cd natours

3. Install the project dependencies:
   ```bash
   npm install
4. Create a .env file in the root directory based on the provided .env.example template. Replace the placeholder values with   your own configuration.

5. Start the application:
   ```bash
   npm start
6. The Natours app will be accessible at http://localhost:3000 in your web browser.

## Features

- User authentication with JWT (JSON Web Tokens) stored in cookies.
- Browse and search for tour sites.
- Book tours with user-specific details.
- Write and edit reviews for tours.
- View tour details, including pricing, duration, and user ratings.
- User account management (profile, password reset, etc.).
- Secure password hashing using bcrypt.
- Scalable and modular MVC architecture.
- Custom error handling and user-friendly error messages.

## Project Structure

The Natours project follows a structured directory layout:

- `controllers/`: Contains the controller logic for different routes and features.
- `models/`: Defines the data models used in the application.
- `public/`: Contains static files (e.g., stylesheets, images).
- `routes/`: Defines the application routes and their corresponding controllers.
- `views/`: Contains Pug templates for rendering HTML views.
- `utils/`: Includes utility functions and modules.

## Usage

1. Visit `http://localhost:3000` in your web browser.
2. Register for an account or log in if you already have one.
3. Browse available tours, view tour details, and book a tour.
4. Write reviews for tours you have booked.
5. Update your user profile and password.
6. Log out when you're done.

## Contributing

Contributions to the Natours project are welcome! If you have suggestions, enhancements, or bug fixes, please open an issue or create a pull request.

Thank you for using Natours! We hope you enjoy booking and reviewing tour sites on our platform. If you have any questions or encounter any issues, please don't hesitate to reach out to us. Happy touring! 🌍🌟
