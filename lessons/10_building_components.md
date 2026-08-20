# 🏗️ Lesson 10 — Building the Core UI (Navbar & Hero)

> **Goal**: Create a glassmorphic Navbar and a cinematic Hero section using your semantic Tailwind v4 variables.

---

## 🛠️ Step 0: Add Interactive Powers

To make the site feel "Premium," we need two industry-standard libraries:
1. **Lucide React**: For beautiful, thin icons.
2. **Motion (Framer Motion)**: For smooth animations and glass effects.

### The Command:
```powershell
cd frontend
npm install lucide-react motion
```

---

## 🧭 Step 1: The Glass Navbar

We'll create a reusable component that sits at the top of your page. It will use **Glassmorphism** (semi-transparent blur).

### Create `src/components/Navbar.jsx`:
```jsx
import { Search, User, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-bg/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
        DevHub
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-text/70">
        <a href="#" className="hover:text-primary transition-colors">Explore</a>
        <a href="#" className="hover:text-primary transition-colors">Community</a>
        <a href="#" className="hover:text-primary transition-colors">Resources</a>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Search className="w-5 h-5 text-text/50 hover:text-primary cursor-pointer transition-colors" />
        <button className="bg-primary hover:bg-primary/80 text-white px-5 py-2 rounded-full text-xs font-semibold transition-all shadow-lg shadow-primary/20">
          Get Started
        </button>
        <Menu className="md:hidden w-6 h-6 text-text" />
      </div>
    </nav>
  );
}
```

---

## 🚀 Step 2: The Hero Section

This is the big "First Impression" on your homepage.

### Create `src/components/Hero.jsx`:
```jsx
export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 flex flex-col items-center text-center">
      {/* Badge */}
      <div className="px-4 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-bold mb-6">
        The Future of Developer Communities
      </div>

      {/* Main Title */}
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
        Connecting the <span className="text-primary italic">next</span> generation of developers.
      </h1>

      {/* Subtext */}
      <p className="text-text/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
        Building a place where knowledge is shared, projects come to life, 
        and the community grows together.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/20">
          Join the community
        </button>
        <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
          Explore Posts
        </button>
      </div>
    </section>
  );
}
```

---

## 🎯 The Plan
1. Install `lucide-react` and `motion`.
2. Create the `src/components` folder.
3. Add the `Navbar` and `Hero` files.
4. Update `App.jsx` to show them!

**Ready to start building? Run the install command and tell me when you're ready!**
