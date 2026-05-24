# Pathshala Coaching Website

A Next.js + React website for Pathshala coaching, including:
- Enrollment form and approval workflow
- Teacher and student portal
- Subject and syllabus sections
- Results display and notifications

## GitHub Repository Name
Use: `pathshala-coaching`

## Publish to GitHub
1. Install Git if not already installed.
2. Open the project folder in a terminal.
3. Initialize git (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "Initial Pathshala coaching website"
   ```
4. Create a new repository on GitHub named `pathshala-coaching`.
5. Add the remote and push:
   ```bash
   git remote add origin https://github.com/<your-github-username>/pathshala-coaching.git
   git branch -M main
   git push -u origin main
   ```

## Deploy to Vercel (recommended)
1. Go to https://vercel.com and sign in with GitHub.
2. Import the repository `pathshala-coaching`.
3. Use the default Next.js build settings.
4. Deploy the project.

### Configure remote enrollment sync
To make enrollment requests available across devices and to the teacher dashboard, you must configure a Vercel remote data store.

1. Open the project in Vercel.
2. Go to Settings → Integrations.
3. Add Vercel KV or Upstash Redis.
4. Add environment variables if required by the integration:
   - `VERCEL_KV_URL`
   - `VERCEL_KV_TOKEN`
   - or the corresponding Upstash Redis values.
5. Redeploy after saving the settings.

If remote storage is not configured, enrollment submissions will still save locally in the browser, but cross-device sync will not work.

### Use a custom domain
1. In Vercel, open your project settings.
2. Add your custom domain (for example, `yourdomain.com`).
3. Follow the DNS instructions from Vercel.

## Local development
- Install dependencies:
  ```bash
  npm install
  ```
- Run development server:
  ```bash
  npm run dev
  ```
- Open `http://localhost:3000`

## Build and deploy scripts
- To build the project locally:
  ```powershell
  .\build.ps1
  ```
- To initialize the repo and push to GitHub once Git is installed:
  ```powershell
  .\deploy.ps1
  ```

## Notes
- The app has been built to be public and deployable.
- If you want a public domain immediately, Vercel provides a generated URL after deployment.
- Replace `<your-github-username>` with your actual GitHub username.
