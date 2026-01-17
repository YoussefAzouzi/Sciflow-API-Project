# Sciflow API Project

Sciflow is a comprehensive scientific conference discovery platform designed to bridge the gap between researchers and conference organizers. It provides a unified interface for finding upcoming academic events, tracking interests, and accessing associated research papers.

## 🚀 Key Features

- **Conference Discovery Feed**: A unified dashboard merging internal scholarly events with external data from the `dev.events` RSS feed.
- **Researcher & Organizer Roles**: Role-based access control (RBAC) allows researchers to discover and rate events, while organizers can host, manage, and link research papers.
- **Research Paper Integration**: Direct linking system for associating multiple research artifacts (PDFs, DOIs, URLs) with conferences.
- **Smart Notifications**: Real-time alerts for researchers when new papers are added to conferences they are tracking.
- **Google Calendar Synchronization**: One-click OAuth integration to add conference dates to your personal primary Google Calendar.
- **Community Ratings & Interests**: Social proof via user star-ratings and "Researcher Tracked" metrics.
- **Modern UI/UX**: Responsive design built with React, featuring glassmorphism aesthetics and smooth Framer Motion animations.

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI (Asynchronous Python)
- **Database**: SQLite with `aiosqlite` and `SQLAlchemy` ORM
- **Security**: JWT (JSON Web Tokens) with `HS256` encryption and `passlib` hashing
- **Integration**: `httpx` for RSS parsing, Google OAuth 2.0 & Calendar v3 API
- **Containerization**: Docker with Python 3.11-slim

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Vanilla CSS (Custom Glassmorphism Design System)
- **Animations**: Framer Motion
- **Networking**: Axios with centralized API interceptors
- **Icons/Avatars**: SVG & Dynamic Letter-based avatars

## 📂 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── routers/        # Modular API endpoints (Auth, Conferences, etc.)
│   │   ├── models.py       # SQLAlchemy database schemas
│   │   ├── schemas.py      # Pydantic data validation models
│   │   ├── main.py         # Entry point & Middleware config
│   │   └── db.py           # Async Database session management
│   ├── Dockerfile          # Backend containerization
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, List, etc.)
│   │   ├── pages/          # Page-level views (Home, Detail, Auth)
│   │   ├── services/       # API connection logic
│   │   └── context/        # Auth and global state management
│   ├── Dockerfile          # Nginx-based production container
│   └── package.json        # JS dependencies
└── docker-compose.yml       # Full-stack orchestration
```

## ⚙️ Installation & Setup

### Using Docker (Recommended)
1. Ensure you have Docker and Docker Compose installed.
2. Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

### Manual Local Setup (Backend)
1. Create a virtual environment: `python -m venv venv`
2. Install dependencies: `pip install -r backend/requirements.txt`
3. Run the server: 
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Manual Local Setup (Frontend)
1. Install dependencies: `cd frontend && npm install`
2. Start development server: `npm run dev`

## 🔗 API Resources Summary

- `POST /auth/register`: Create a new researcher or organizer account.
- `GET /conferences`: Combined feed of internal and external events.
- `GET /conferences/{id}`: Detailed view including linked research papers.
- `POST /conferences/{id}/papers`: (Organizer only) Add research links.
- `POST /interests/conferences/{id}/interest`: Track a conference.
- `POST /google/conferences/{id}/add`: Sync event to Google Calendar.
- `GET /notifications`: View personal alerts for tracked events.

## 🚀 Deployment (Render)

This project includes a `render.yaml` Blueprint for easy deployment on [Render](https://render.com).

### Prerequisites
- A GitHub repository containing this code.
- A Render account.

### Steps
1. Push your code to GitHub.
2. Go to your Render Dashboard and click **New +** -> **Blueprint**.
3. Connect your repository.
4. Render will automatically detect the `render.yaml` file and configure:
   - **sciflow-backend**: The Python FastAPI service.
   - **sciflow-frontend**: The React static site.
   - **sciflow-db**: The PostgreSQL database.
5. Click **Apply**.
6. Once deployed, Render will provide a public URL for your frontend.

### Environment Variables
The `render.yaml` automatically sets up:
- `DATABASE_URL`: Connection string for the managed PostgreSQL.
- `FRONTEND_URL`: The URL of your deployed frontend.
- `VITE_API_URL`: The URL of your deployed backend.

## 📝 Design Philosophy
The project emphasizes **Data Integrity** and **Developer Experience**. By using FastAPI's automatic documentation (Swagger) and Pydantic's strict typing, the API ensures that frontend developers have a robust and predictable contract to build upon. The UI avoids placeholders, using dynamic image generation and real-time community engagement stats to provide a premium feel.
