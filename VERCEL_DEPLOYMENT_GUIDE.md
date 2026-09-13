# Vercel Deployment Guide for VARSHA-SETU (SIH 2026 PS71)

This project is pre-configured for **Full-Stack Vercel Deployment** in a single monorepo:
* **Frontend**: React 18 + Vite (built to `frontend/dist`)
* **Backend**: Python Flask REST API (executed as Vercel Serverless Function via `api/index.py`)
* **Database**: MongoDB Atlas or Resilient In-Memory Failover Store

Both frontend and backend live under the **same Vercel domain** (e.g. `https://varsha-setu.vercel.app`), ensuring zero CORS friction and instant HTTPS.

---

## Method 1: Deploy via GitHub & Vercel Dashboard (Recommended)

### Step 1: Push Code to a GitHub Repository
Open your terminal in the project root:
```bash
cd "C:\Users\laptop hubs\.gemini\antigravity\brain\610e17bd-3afb-47ca-8c53-249d347f5b28\scratch\sih2026_ps71_rainfall_inundation"

# Initialize Git (if not already initialized)
git init
git add .
git commit -m "Initial commit - SIH 2026 PS71 VARSHA-SETU ready for Vercel"

# Create a new repository on GitHub (e.g., sih2026-ps71)
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com) (sign up with GitHub if you don't have an account).
2. On your Vercel Dashboard, click **Add New...** $\to$ **Project**.
3. Select your GitHub repository and click **Import**.
4. **Configure Project Settings**:
   * **Framework Preset**: Leave as *Other* (or Vite).
   * **Root Directory**: Leave as `./` (the root).
   * **Build & Output Settings**: Already configured by `vercel.json`!
     - *Build Command*: `npm --prefix frontend install && npm --prefix frontend run build`
     - *Output Directory*: `frontend/dist`
5. **Environment Variables** (Optional):
   Add the following variables under the **Environment Variables** section:
   * `SECRET_KEY`: `sih2026-ps71-rainfall-early-warning-key`
   * `DATA_SOURCE_MODE`: `SIMULATED`
   * `MONGO_URI`: *(Optional)* Your MongoDB Atlas connection string (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/sih2026`). If you don't provide one, the system automatically runs on the resilient in-memory collection store with zero errors!
6. Click **Deploy**.

Within 1–2 minutes, Vercel will build both the React frontend and the Python serverless API, giving you a live public production URL!

---

## Method 2: Deploy Directly via Vercel CLI

If you have Node.js installed, you can deploy in one command directly from your terminal:

```bash
cd "C:\Users\laptop hubs\.gemini\antigravity\brain\610e17bd-3afb-47ca-8c53-249d347f5b28\scratch\sih2026_ps71_rainfall_inundation"

# Run Vercel CLI
npx vercel
```

### Interactive Prompts:
* *Set up and deploy?* $\to$ **y**
* *Which scope do you want to deploy to?* $\to$ Select your account
* *Link to existing project?* $\to$ **n**
* *What's your project's name?* $\to$ `varsha-setu` (or press Enter)
* *In which directory is your code located?* $\to$ `./` (press Enter)
* *Want to modify settings?* $\to$ **n** (settings are automatically picked up from `vercel.json`)

To deploy straight to production:
```bash
npx vercel --prod
```

---

## Post-Deployment Verification Checklist

Once deployed, verify that both the frontend and serverless API endpoints are responding:

1. **Frontend Home**: Open `https://<YOUR-PROJECT>.vercel.app/`  
   * Confirm the scientific light-themed dashboard renders.
   * Confirm the subtle atmospheric rainfall particles animate in the background.
   * Confirm you can switch catchments (Mumbai, Chennai, Guwahati, Kochi, Bengaluru).
2. **Backend API Health**: Open `https://<YOUR-PROJECT>.vercel.app/api/health`  
   * Expected response:
     ```json
     {
       "architecture": "React -> Flask REST API -> ML Engine -> MongoDB",
       "database": {
         "mode": "IN_MEMORY_STORE",
         "status": "CONNECTED"
       },
       "fidelity_mode": "SIMULATED",
       "status": "HEALTHY"
     }
     ```
3. **Rainfall Predictions**: Open `https://<YOUR-PROJECT>.vercel.app/api/predictions/rainfall/mumbai_coastal`  
   * Confirm it returns the 3-hour precipitation forecast and timeline horizons.
4. **What-If Storm Simulator**:
   * Click **Simulate Storm** in the header.
   * Move the Radar Reflectivity slider to $55\text{ dBZ}$ and click **Run Simulation Forecast**.
   * Confirm that the prediction updates immediately on the live deployed site!

---

## Troubleshooting Common Questions

* **Does Vercel charge for Python serverless functions?**  
  No, Vercel provides generous free-tier serverless execution suitable for hackathon demonstrations.
* **What if I don't set up MongoDB Atlas?**  
  You don't have to! The backend's `DatabaseManager` detects that `MONGO_URI` is not reachable and automatically uses its in-memory document store. All features (saving predictions, locations, warnings) work out of the box.
* **How do I link a custom domain?**  
  In your Vercel Project Dashboard, navigate to **Settings** $\to$ **Domains** and enter your domain name.
