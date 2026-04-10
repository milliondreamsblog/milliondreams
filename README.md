# 🌌 Akshat Darshi | Software Engineer Portfolio

A premium, minimalistic, and highly interactive portfolio built with **Next.js 15**, **Framer Motion**, and **Tailwind CSS**. This project features a unique "Agent Mode" that transforms the experience into a terminal-like developer view, along with a custom Lofi player and smooth transitions.

![Portfolio Preview]() *(Note: Replace with a project screenshot if available)*

## ✨ Key Features

- **🛡️ Binary Mode System**: Toggle between a **Human Mode** (clean UI) and an **Agent Mode** (raw markdown view using global context).
- **🚀 Multi-Page Navigation**: Dedicated routes for `/`, `/projects`, and `/blog` with a persistent, glassmorphic bottom navbar.
- **🎧 Built-in Lofi Player**: Stream curated lofi beats directly from the dashboard with an interactive volume slider.
- **🧠 Neural Network Simulation**: Dynamic, mouse-responsive particle system representing AI nodes.
- **📊 GitHub Integration**: Real-time visualization of contributions through a custom graph component.
- **📱 QR Integration**: Instant LinkedIn profile access via an integrated QR code modal.
- **🌈 Adaptive Dark Mode**: System-aware theme switching with a smooth transition.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API
- **Fonts**: [Google Fonts (DM Sans)](https://fonts.google.com/specimen/DM+Sans)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/milliondreamsblog/miyoko-portfolio.git
   cd miyoko-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```bash
├── app/
│   ├── blog/              # Blog page route
│   ├── projects/          # Projects page route
│   ├── components/        # Reusable UI components
│   ├── context/           # Global NavContext & State
│   ├── data/              # Markdown & static content
│   └── layout.tsx         # Root layout with Provders
├── public/                # Static assets (images, audio)
└── tailwind.config.ts     # Styling configuration
```

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

Built with ❤️ by [Akshat Darshi](https://www.linkedin.com/in/akshat-darshi/)
