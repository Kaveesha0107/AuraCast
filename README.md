# 🌦️ AuraCast Weather Intelligence System

AuraCast is a **professional-grade weather analytics dashboard** that ranks cities using a custom-designed **Comfort Index**. It delivers real-time weather insights, visualizes 7‑day temperature trends, and leverages **server-side caching** to optimize performance and API usage.

---

## ✨ Features

* **Intelligent Ranking** – Automatically ranks cities using a weighted **Comfort Index** algorithm.
* **Real-time Analytics** – Live weather data (temperature, humidity, visibility) via **OpenWeatherMap API**.
* **Dynamic Visualizations** – Clean, professional **7-day temperature trend charts** with color-coded gradients.
* **Smart Caching** – Server-side caching to handle high traffic and stay within API rate limits.
* **Great UX** – Dark/Light mode support and fully responsive design (mobile & desktop).
* **Secure Access** – User authentication powered by **Auth0**.

---

## 🛠️ Tech Stack

### Frontend

* **React.js** – Component-based UI
* **Tailwind CSS** – Utility-first styling + dark mode
* **Lucide React** – Modern icon set
* **Axios** – HTTP client for API requests

### Backend

* **Node.js & Express.js** – RESTful server environment
* **Node-Cache** – In-memory caching for optimized data retrieval

### External Services

* **OpenWeatherMap API** – Global real-time weather data
* **Auth0** – Authentication & identity management

---

## 🧪 Comfort Index Formula

The **Comfort Index** quantifies how pleasant the weather feels for an average person. The score ranges from **0 to 100**.

### Formula Components

**Temperature Score (T_score)**
Ideal temperature: **22°C**

```
T_score = 100 - |22 - CurrentTemp| × 3
```

**Humidity Score (H_score)**
Ideal humidity: **45%**

```
H_score = 100 - |45 - Humidity| × 1.5
```

**Visibility Score (V_score)**
Based on atmospheric clarity

```
V_score = (Visibility / 1000) × 10   (Capped at 100)
```

### Final Score Calculation

```
Comfort Index = (T_score × 0.5)
              + (H_score × 0.3)
              + (V_score × 0.2)
```

### Weighting Rationale

* **Temperature (50%)** – Primary driver of human comfort
* **Humidity (30%)** – Strongly affects perceived temperature & breathing comfort
* **Visibility (20%)** – Impacts psychological comfort and safety

---

## 💾 Cache Design

AuraCast uses a **server-side caching strategy** with `node-cache`.

* **TTL (Time To Live):** 300 seconds (5 minutes)
* **Flow:**

  1. Request hits `/api/weather`
  2. Cache **HIT** → return cached data
  3. Cache **MISS** → fetch fresh data, compute Comfort Index, update cache

### Benefits

* Faster response times
* Reduced API calls
* Protection against rate limiting
* Consistent data across users

---

## 🔄 Trade-offs & Limitations

* **Data Freshness vs Performance**
  A 5-minute cache improves speed but may slightly delay real-time updates.

* **Pseudo Trend Data**
  Due to free-tier API limits, 7-day trends are simulated using controlled temperature variance.

* **Fixed City List**
  A predefined city set is used to maintain consistent ranking results for evaluation.

---

## 🚀 Setup Instructions

Follow the steps below to run **AuraCast** locally.

### 📋 Prerequisites

* **Node.js** v14.0.0 or higher
* **npm** v6.0.0 or higher
* **OpenWeatherMap API Key**

---

### ⚙️ Installation & Setup

#### 1️⃣ Clone the Repository

```
git clone https://github.com/Kaveesha0107/AuraCast.git
cd AuraCast
```

---

#### 2️⃣ Backend Setup

```
cd backend
npm install
```

Start the backend server:

```
node index.js
```

Backend runs on:

```
http://localhost:5000
```

---

#### 3️⃣ Frontend Setup

Open a new terminal window:

```
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---


