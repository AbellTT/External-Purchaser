# 🎨 Module 4 — React Recap + Tailwind CSS (v4)

> **Goal**: Set up a professional, premium UI foundation for DevHub using the latest Tailwind CSS v4.

---

## 🌊 The Tailwind v4 Revolution

As you noted, Tailwind v4 has moved away from the old `tailwind.config.js`. It is now **CSS-first**, which means your design system lives directly in your CSS files using the `@theme` block.

### Why this is better:
1. **Zero-Config JS**: No more messy JavaScript configuration files.
2. **Lightning Fast**: Built on a new engine (Oxide) that is significantly faster.
3. **CSS Powered**: It uses standard CSS variables that you can use anywhere in your project.

---

## 🛠️ Step 1: Installation (The v4 Way)

We will use the `@tailwindcss/vite` plugin for the smoothest experience.

### The Commands:
```powershell
# 1. Enter the frontend directory
cd frontend

# 2. Install Tailwind v4 and the Vite plugin
npm install tailwindcss @tailwindcss/vite
```

### 1. Update `vite.config.js`
We need to tell Vite to use the Tailwind plugin:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### 2. Update `src/index.css`
In v4, we use a single import to bring in Tailwind:

```css
@import "tailwindcss";

@theme {
  /* Our Premium Design Tokens */
  --color-primary-indigo: #6366f1;
  --color-secondary-pink: #ec4899;
  --color-accent-purple: #a855f7;
  --color-dark-bg: #0f172a;
  
  --font-display: "Inter", sans-serif;
}
```

---

## 💅 The "Wow" Factor: Global Reset

We'll clean up the default Vite styles in `src/index.css` and set our dark theme:

```css
:root {
  background-color: var(--color-dark-bg);
  color: #f8fafc;
  font-family: var(--font-display);
}

body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
}
```

---

## 🎯 The Plan
1. Install Tailwind v4 and the Vite plugin.
2. Update `vite.config.js` to include the plugin.
3. Set up the `@theme` block in `src/index.css`.
4. Build the **Navbar** and **Hero** sections using these new tokens.

**You were absolutely right about the v4 setup! It's much cleaner. Tell me when you've updated your Vite config and CSS!**
