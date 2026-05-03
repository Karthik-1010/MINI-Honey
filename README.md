# MINI Honey 🍯

A full-stack food ordering platform built with **Django REST Framework** + **React + Vite + TailwindCSS**.

## Features
- 🍽️ **Menu Management** — Add / Edit / Delete menu items with image uploads
- 🛒 **Single & Group Ordering** — Table-based group orders with per-person breakdown
- 📦 **Inventory / Store** — Real-time stock tracking with low-stock alerts & CSV export
- 📊 **Analytics Dashboard** — Weekly revenue report, live order management, hot items
- 🏠 **Home** — Signature dishes carousel with full CRUD

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | Django 4, Django REST Framework |
| Frontend | React 18, Vite, TailwindCSS v4 |
| Database | SQLite (dev) |
| Animations | Framer Motion |

## Quick Start

### Backend
```bash
cd note
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd note/frontend
npm install
npm run dev
```

Backend runs on `http://127.0.0.1:8000`  
Frontend runs on `http://localhost:5173`

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/menu-items/` | Menu CRUD |
| GET/POST | `/api/orders/` | Orders CRUD |
| POST | `/api/orders/clear_all/` | Reset all orders |
| POST | `/api/orders/{id}/update_status/` | Update order status |
| GET/POST | `/api/inventory/` | Inventory CRUD |
| POST | `/api/inventory/clear_all/` | Clear inventory |
| POST | `/api/upload-image/` | Upload menu images |
