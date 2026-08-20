# 🚀 Lesson 11 — Your Turn: Building the FAQ Section

You asked me to leave a section for you to build by yourself based on my instructions! This is how you cement your React and Tailwind knowledge. 

Your mission is to build a **Frequently Asked Questions (FAQ)** section and plug it into the Landing Page.

---

## 🎯 The Objective

Build a reusable array of questions and answers, map through them, and render them in a clean, dark-themed UI.

### Step 1: Create the Component File
Create a new file called `FAQ.jsx` inside the `src/components/sections/` folder.

### Step 2: Write the Code
Here is the skeleton to get you started. Focus on practicing your Tailwind utility classes for layout and colors!

```jsx
// src/components/sections/FAQ.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is DevHub free to use?",
    answer: "Yes! DevHub is free for all open-source contributors and individual developers."
  },
  {
    question: "Can I connect my GitHub account?",
    answer: "Absolutely. We are building a deep integration with GitHub to automatically showcase your best repositories."
  },
  {
    question: "How is this different from other networks?",
    answer: "We focus purely on code, projects, and architecture. No algorithms, no ads, just developer-to-developer connection."
  }
];

export default function FAQ() {
  // Hint: You will need a state variable here to track which FAQ is currently "open"
  // const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-32 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black italic mb-4">Frequently Asked <span className="text-primary">Questions</span></h2>
        <p className="text-text/60 font-medium">Everything you need to know about the product.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* YOUR TASK: Map over the 'faqs' array here and render the Q&A as dropdowns! */}
        
        {/* Example of what ONE mapped item should look like functionally: */}
        {/* 
          1. Wrap the entire item in a div.
          2. The question should be a <button> that sets 'openIndex' to the current index when clicked.
          3. Use <AnimatePresence> and <motion.div> to conditionally render the answer IF openIndex === index.
        */}
      </div>
    </section>
  );
}
```

### Step 3: Plug it into the Landing Page
1. Open up `src/pages/LandingPage.jsx`.
2. Look for the `YOUR TURN` placeholder I left for you (around line 20).
3. Delete the placeholder `<div>`.
4. Import your new `FAQ` component at the top of the file: 
   `import FAQ from "../components/sections/FAQ";`
5. Place the `<FAQ />` component where the placeholder used to be!

---

## 🏆 Submission
Once you've built it, look at it in your browser (`npm run dev`). Make sure the text colors and backgrounds match the established design system (`bg-white/5`, `text-primary`, etc.). 

**Tell me when you are done, or paste your code if you get stuck!**
