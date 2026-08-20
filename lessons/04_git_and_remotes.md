# 🐙 Module 1 — Part 5: Git & Pushing to Remote Repos

> **Goal**: Save your progress and share it with the world (or a private repo).

---

## 🛠️ Step 1: Initializing the Root

You mentioned you ran `git init` in the "devhub file". This is usually fine, but in a standard "monorepo" like ours, we typically want the root to be the very top folder (`react django/`). 

### How to check where you are:
Type `ls -a` or `dir /ah` in your terminal. If you see a `.git` folder, that's your Git root.

---

## 💾 Step 2: The standard Git Workflow

Before pushing anywhere, you need to "Staging" and "Commit" your changes locally.

1. **Check status**:
   ```powershell
   git status
   ```
2. **Add all files**:
   ```powershell
   git add .
   ```
3. **Save (Commit)**:
   ```powershell
   git commit -m "feat: complete module 1 - added posts app and model"
   ```

---

## 🚀 Step 3: Pushing to a Remote (GitHub/GitLab)

To "Push" your code to a remote server, you need to tell your local Git where that server is.

### 1. Create a Repository online
- Go to [GitHub](https://github.com) and create a new repository called `devhub`.
- **Do NOT** initialize it with a README, license, or gitignore (since we already have code).

### 2. Connect the Remote
Copy the URL of your new repo (it looks like `https://github.com/YourName/devhub.git`). Then run:
```powershell
git remote add origin https://github.com/YourName/devhub.git
```

### 3. Rename the branch (Modern Standard)
```powershell
git branch -M main
```

### 4. Push!
```powershell
git push -u origin main
```

---

## 🛑 Important: The `.gitignore`

Before you push, make sure you have a `.gitignore` file in your root folder. This tells Git **NOT** to upload things like:
- `venv/` (thousands of useless library files)
- `.env` (your database passwords!)
- `__pycache__/` (compiled Python files)
- `node_modules/` (massive frontend dependencies)

If you don't have one, I can help you create a perfect one for this project!
