# 🛠️ Team Contributing & Git Workflow Guide

Welcome to the **Smart Closed-Loop Hydroponics** repository. This guide covers local environment initialization, domain boundaries, and the required Git workflow.
---

## 👥 Roles & Branch Assignments

| Member | Domain & Assigned Directory | Tech Stack | Dedicated Git Branch |
| :--- | :--- | :--- | :--- |
| **Shikhar (Lead / Backend)** | `/backend` | Node.js, Express, Prisma (PostgreSQL), InfluxDB, MQTT | `backend` |
| **Suyasha (Frontend / UI)** | `/frontend` | | `frontend` |
| **Somi (ML / Vision)** | `/ml-service` | | `ml-service` |
| **Vivek (Firmware)** | | | |

> ⚠️ **Scope Boundary:** Never modify or commit files outside your assigned directory.
---

## 📋 First-Time Project Setup

### 1. Clone the Repository & Switch to Your Branch
```bash
# Clone the repository
git clone https://github.com/ShikharVerma1922/smart-hydroponics.git
cd smart-hydroponics

# Switch to your assigned working branch (PICK YOURS)
git checkout frontend    # Suyasha
git checkout backend     # Shikhar
git checkout ml-service  # Somi
```
### 2. Start the Shared Local Infrastructure (Databases & Broker)
Make sure Docker Desktop is running on your laptop, then start the shared containers from the project root:
```bash
docker compose up -d
```
Local Ports & Credentials:
- Mosquitto MQTT: localhost:1883
- PostgreSQL: localhost:5433 (hydroponics_db / postgres / password123)
- InfluxDB Web UI: http://localhost:8086 (hydro_org / sensor_data)

### 3. Initialize Your Domain Directory
Navigate to your assigned subfolder:
- Frontend
  ```bash
  cd frontend
  ```
- Backend
  ```bash
  cd backend
  ```
- ml-service
  ```bash
  cd ml-service
  ```

## 🔄 Daily Git Routine & Rules
Follow this 5-step cycle every time you work on the project.
1. Verify Your Current Branch (First Thing Every Session)
   Check what branch you are currently on before editing code:
   ```bash
   git branch --show-current
   ```
   - If the output is not your assigned branch, switch immediately:
     ```bash
     git checkout <your-branch-name>
     ```
2. Sync Latest Updates (Before You Start Coding)
   Always pull the latest merged updates from main into your working branch:
   ```bash
   git pull origin main
   ```
3. Check Your Changes
   Verify that only files in your designated folder are modified:
   ```bash
   git status
   ```
4. Commit Your Progress
   Write clear, descriptive commit messages:
   ```bash
   git add .
   git commit -m "feat(domain): description of what you built/fixed"
   ```
5. Push to YOUR Branch
   ```bash
   # Push ONLY to your assigned branch
    git push origin <your-branch-name>
   ```
   (Direct pushes to `main` are blocked by branch protection rules).
   
## 🔀 Merging Code into `main` branch (Pull Requests)
When a feature or milestone is completed and tested locally:
1. Open the repository on GitHub.
2. Click **Pull requests** $\rightarrow$ **New pull request**.
3. Set **Base:** `main` $\leftarrow$ **Compare:** `your-branch-name`.
4. Add a short summary of changes and request a review.
5. Once reviewed and approved, the PR will be merged into `main`.
