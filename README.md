# Live Speech Sentiment Visualizer

This project is a full-stack application that consists of a **frontend** and a **backend**. The application is designed to display and analyze transcripts, visualize sentiment, and provide keyword insights.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Scripts](#scripts)

---

## Project Structure

### Backend

The backend is located in the `backend/` folder and contains the following:

- **`server.js`**: The main entry point for the backend server.
- **`package.json`**: Lists backend dependencies and scripts.

### Frontend

The frontend is located in the `frontend/` folder and contains the following:

- **`src/`**: Contains React components, styles, and utility functions.
- **`public/`**: Contains static assets like `index.html` and `manifest.json`.
- **`package.json`**: Lists frontend dependencies and scripts.

---

## Technologies Used

### Backend

- **Node.js**: JavaScript runtime for the backend.
- **Express.js**: Web framework for building the backend server.

### Frontend

- **React.js**: JavaScript library for building the user interface.

---

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)

### Backend Setup

1. Navigate to the `backend` folder:
   `cd backend`
2. Install dependencies:
   `npm install`
3. Create a `.env` file in the backend folder and configure the required environment variables.
4. Start the backend server:
   `npm start`

### Frontend Setup

1. Navigate to the frontend folder:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Create a `.env` file in the frontend folder and configure the required environment variables.
4. Start the development server:
   `npm start`

### Scripts

#### Backend

`npm start`: Starts the backend server.

#### Frontend

1. `npm start`: Starts the frontend development server.
2. `npm run build`: Builds the frontend for production.
