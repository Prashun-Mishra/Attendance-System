# Face Recognition Attendance System

This is a full-stack Attendance System using React, Node.js, Prisma, Neon (PostgreSQL), and Face-API.js.

## Prerequisites

1.  **Neon Database**: Create a project on [Neon](https://neon.tech/) and get the connection string.
2.  **Face Models**: You need to download the face-api.js models.

## Setup Instructions

### 1. Database Setup

1.  Navigate to the `server` directory.
2.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Open `.env` and paste your Neon connection string in `DATABASE_URL`.
4.  Push the schema to the database:
    ```bash
    npx prisma db push
    ```

### 2. Frontend Setup (Models)

1.  Download the **Shard Files** and **Manifest Files** for the following models from [justadudewhohacks/face-api.js-models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights):
    - `ssd_mobilenetv1`
    - `face_landmark_68`
    - `face_recognition`
    
    You need all files associated with these (json and binary shards).
    
2.  Place these files in the `client/public/models` directory.
    - `client/public/models/ssd_mobilenetv1_model-weights_manifest.json`
    - `client/public/models/ssd_mobilenetv1_model-shard1`
    - ...etc.

### 3. Running the Application

**Start Backend:**
```bash
cd server
npm start
```

**Start Frontend:**
```bash
cd client
npm run dev
```

## Features
- **Register**: Capture face and save descriptors.
- **Attendance**: Real-time liveness check (Blink Detection) + Recognition.
- **Dashboard**: Export attendance logs to Excel.
