# SunFlow 360

**AI-Powered Solar Installation & Operations Management System**

Built by **VisionX** for the Odoo × GCET Hackathon.

---

## Overview

SunFlow 360 manages the complete lifecycle of a solar installation business — from customer enquiry through lead qualification, site survey, quotation, installation, warranty tracking, and service management.

### Enquiry Channels

| Channel | Status |
|---|---|
| Website Enquiry Form | ✅ Available |
| WhatsApp Assistant | 🔜 Coming Soon |
| Voice AI Assistant | 🔜 Coming Soon |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.3.x, Maven |
| Frontend | React 19, TypeScript, Vite |
| Styling | Vanilla CSS (design system) |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router |
| Database | PostgreSQL 18 (Stage 2) |

---

## Quick Start

### Prerequisites

- Java 21 (OpenJDK Temurin recommended)
- Maven 3.9+
- Node.js 20+ and npm
- PostgreSQL 18 (required from Stage 2 onward)

### 1. Clone the Repository

```bash
git clone https://github.com/Piyush-2309/SunPower-by-VisionX-v1.git
cd "SunPower by VisionX v1"
```

### 2. Environment Variables

```bash
copy .env.example .env
# Edit .env with your actual values (database credentials, API keys, etc.)
```

### 3. Start the Backend

```bash
cd sunflow-api
mvn spring-boot:run
```

The API will be available at **http://localhost:8080**.

Health check: `GET http://localhost:8080/api/health`

### 4. Start the Frontend

```bash
cd sunflow-ui
npm install
npm run dev
```

The UI will be available at **http://localhost:5173**.

The Vite dev server proxies `/api` requests to the backend automatically.

---

## Project Structure

```
├── sunflow-api/          # Spring Boot backend
│   └── src/main/java/com/visionx/sunflow/
│       ├── SunflowApplication.java
│       ├── common/       # Health controller, shared DTOs
│       ├── config/       # App configuration (future)
│       ├── lead/         # Lead management (future)
│       ├── customer/     # Customer management (future)
│       └── ...           # Other business modules
├── sunflow-ui/           # React + TypeScript frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page-level components
│       └── services/     # API client layer
├── docs/                 # Documentation
├── scripts/              # Dev setup scripts
├── .env.example          # Environment variable template
└── .gitignore
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Application health check |

*More endpoints will be added in subsequent stages.*

---

## License

MIT — see [LICENSE](LICENSE).