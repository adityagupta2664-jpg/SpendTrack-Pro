# 📊 SpendTrack Pro — Premium Expense Tracker & Budget Planner

SpendTrack Pro is a highly polished, responsive personal finance application built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**. It includes support for a secure **Supabase cloud database** with robust Row-Level Security (RLS) policies for complete multi-user isolation, alongside an offline-first simulated local playground sandbox for seamless local development.

---

## 🚀 Key Features

* **Visual Analytics**: Interactive breakdowns, tracking, and bento-grid progress views.
* **Smart Budgeting**: Establish and track monthly category budgets with live limit alerts.
* **Flexible Transaction Ledger**: Easily search, filter, insert, and delete transactions.
* **Premium Typography & Themes**: Crafted using Space Grotesk and Inter typography, complete with standard theme preferences and custom currency symbols.
* **Dual-Mode Client Support**:
  * **Production Mode**: Real-time secure synchronization with your cloud Supabase database.
  * **Development Sandbox**: Safe local-only browser storage playground without cloud config requirements.

---

## 🛠️ Local Development Setup

To run SpendTrack Pro locally, follow these simple steps:

### 1. Clone the Repository & Install Dependencies
```bash
# Clone your repository
git clone https://github.com/adityagupta2664-jpg/SpendTrack-Pro
cd spendtrack-pro

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to a new file named `.env`:
```bash
cp .env.example .env
```
Open `.env` and configure your credentials. During local development, if you leave the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as placeholders, the application will automatically activate the safe **Local Development Sandbox** so you can develop offline.

### 3. Start the Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Cloud Database Setup

To back your production application with a real Supabase database:

1. **Create a Free Project**: Head to [Supabase](https://supabase.com) and create a new project.
2. **Execute Database Schema**: 
   * Navigate to the **SQL Editor** tab in the left sidebar of your Supabase dashboard.
   * Click **New query**.
   * Copy the contents of the `/supabase_schema.sql` file located at the root of this project and paste it into the editor.
   * Click **Run** to execute. This will automatically create the `profiles`, `categories`, `budgets`, and `transactions` tables with perfect Row-Level Security (RLS) policies configured!
3. **Get API Credentials**:
   * Go to **Project Settings** (gear icon) > **API**.
   * Copy the **Project URL** and the **anon public** API key.
   * Paste them into your `.env` file or your Netlify environment settings.

---

## 🐙 Pushing to GitHub

Ensure you are ready to push the project to your GitHub:

1. **Create a new repository** on GitHub (do not initialize with a README, gitignore, or license).
2. **Initialize git locally** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of SpendTrack Pro"
   ```
   *(Note: The provided `.gitignore` automatically prevents your `.env` files and `node_modules` from being pushed to GitHub, keeping your secrets safe.)*
3. **Link and push to GitHub**:
   ```bash
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

---

## ⚡ Deploying to Netlify

Deploying SpendTrack Pro on Netlify is incredibly straightforward:

### 1. Connect GitHub to Netlify
* Log into [Netlify](https://www.netlify.com).
* Click **Add new site** > **Import from Git**.
* Select your Git provider and authorize Netlify.
* Choose your `spendtrack-pro` repository.

### 2. Configure Build Settings
Configure the site settings as follows:
* **Branch to deploy**: `main`
* **Build command**: `npm run build`
* **Publish directory**: `dist`

### 3. Configure Environment Variables
Click **Advanced build settings** or navigate to **Site settings > Environment variables** in Netlify and add:
* `VITE_SUPABASE_URL` — *(Your Supabase Project URL)*
* `VITE_SUPABASE_ANON_KEY` — *(Your Supabase Anon Public Key)*

### 4. SPA Route Support (Already Configured)
This project includes a `/public/_redirects` file that is copied directly to the output during build time:
```text
/* /index.html 200
```
This ensures Netlify handles SPA routing seamlessly, preventing any `404 Not Found` issues when refreshing the page on any custom route!

Click **Deploy site**, and your premium Expense Tracker will be live in seconds!
