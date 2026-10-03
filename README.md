<h1 align="center">
  Md Abdullah Al Khalid Alif — Portfolio
</h1>

<p align="center">
  Personal portfolio website of <strong>Md Abdullah Al Khalid Alif</strong>, a Full Stack Software Engineer specializing in MERN stack and Next.js applications.
</p>

<p align="center">
  <a href="https://alif.mnr.bd" target="_blank"><img src="https://img.shields.io/badge/Live-alif.mnr.bd-0f0f0f?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Site" /></a>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

## 🌐 Overview

A modern, CMS-driven personal portfolio built with **Next.js 15** and **React 19**. The site showcases projects, skills, work experience, education, awards, and services — all managed through a **Supabase** backend with a private admin panel.

The portfolio is fully SEO-optimized with dynamic metadata, Open Graph tags, a sitemap, and a `robots.txt` — designed to rank and perform in production.

---

## ✨ Features

- **CMS-driven content** — Projects, skills, experience, education, and awards are all managed via Supabase; no code changes needed to update content.
- **Admin panel** — A private `/admin` route for managing all portfolio data from a browser UI.
- **Contact form** — Integrated with EmailJS to send emails directly from the browser.
- **Smooth animations** — Powered by Framer Motion for polished micro-interactions.
- **Dark mode UI** — Fully dark-themed design using DaisyUI + TailwindCSS.
- **SEO ready** — Dynamic `<head>` metadata, Open Graph, Twitter Cards, sitemap, and robots.txt.
- **Optimized images** — Next.js `<Image>` with support for multiple external domains and SVG.
- **Production-ready** — Deployed on Vercel with Turbopack for fast local development.

---

## 🛠 Tech Stack

| Category       | Technology                                                        |
| -------------- | ----------------------------------------------------------------- |
| Framework      | [Next.js 15](https://nextjs.org/) (App Router + Turbopack)       |
| UI Library     | [React 19](https://react.dev/)                                    |
| Styling        | [Tailwind CSS 3](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) |
| Animations     | [Framer Motion](https://www.framer.com/motion/)                   |
| Icons          | [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/react-icons/) |
| Database       | [Supabase](https://supabase.com/) (PostgreSQL)                    |
| Email          | [EmailJS](https://www.emailjs.com/)                               |
| Alerts/UI      | [SweetAlert2](https://sweetalert2.github.io/)                     |
| Deployment     | [Vercel](https://vercel.com/)                                     |

---

## 📁 Project Structure

```
alif/
├── public/                   # Static assets (images, icons)
├── src/
│   ├── app/
│   │   ├── admin/            # Private admin panel
│   │   ├── api/
│   │   │   └── contact/      # Contact form API route
│   │   ├── components/
│   │   │   ├── Home/         # Home page sections
│   │   │   ├── Journey/      # Experience & education timeline
│   │   │   ├── Landing/      # Hero / landing section
│   │   │   ├── Projects/     # Projects showcase
│   │   │   ├── Services/     # Services section
│   │   │   ├── Skills/       # Skills grid
│   │   │   ├── contact/      # Contact section
│   │   │   └── shared/       # Navbar, footer, layout chrome
│   │   ├── projects/         # Dynamic project detail pages
│   │   ├── globals.css       # Global styles
│   │   ├── layout.js         # Root layout + metadata
│   │   ├── page.js           # Home page
│   │   ├── robots.js         # robots.txt generation
│   │   └── sitemap.js        # Sitemap generation
│   ├── component/            # Reusable UI components
│   │   ├── About.jsx
│   │   ├── Award.jsx
│   │   ├── Education.jsx
│   │   ├── ExperienceSummary.jsx
│   │   ├── Experince.jsx
│   │   └── ProjectCart.jsx
│   ├── data/                 # Static/local data files
│   ├── lib/
│   │   ├── cms.js            # Supabase CMS data-fetching layer
│   │   ├── emailjs.js        # EmailJS configuration
│   │   └── supabase.js       # Supabase client setup
│   ├── models/               # Mongoose models (if used)
│   ├── pages/                # Next.js Pages Router (legacy/API)
│   └── utils/                # Shared utility functions
├── supabase/
│   └── schema.sql            # Unified database schema, seeds & storage setup
├── .env                      # Local environment variables (not committed)
├── .env.local                # Local overrides (not committed)
├── next.config.mjs           # Next.js configuration
├── tailwind.config.mjs       # Tailwind CSS configuration
├── vercel.json               # Vercel deployment configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A [Supabase](https://supabase.com/) project
- An [EmailJS](https://www.emailjs.com/) account (for the contact form)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/With-ALIF/alif-protfolio-0.2.git
   cd alif-portfolio-0.2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example below into a `.env.local` file at the project root and fill in your values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be running at [http://localhost:3000](http://localhost:3000) with **Turbopack** for fast HMR.

---

## 🔑 Environment Variables

| Variable                        | Description                        | Required |
| ------------------------------- | ---------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL          | ✅       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public anonymous key | ✅       |

> **Warning:** Never commit your `.env` or `.env.local` files. Both are already listed in `.gitignore`.

---

## 🗄 Database

All dynamic content is stored in **Supabase (PostgreSQL)**. The `src/lib/cms.js` file provides a clean data-fetching layer that queries Supabase to serve:

- Profile & navigation data
- Projects (with tech stack, links, descriptions)
- Skills (categorized)
- Work experience & education (timeline)
- Awards & certifications
- Services offered


---

## 📜 Scripts

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start the dev server with Turbopack |
| `npm run build` | Build for production                |
| `npm run start` | Start the production server         |
| `npm run lint`  | Run ESLint                          |

---

## 📄 License

This project is personal and not open-sourced under any public license. All content, designs, and code are the intellectual property of **Md Abdullah Al Khalid Alif**. You may not copy, distribute, or use this project without explicit permission.

---

<p align="center">
  Built with ❤️ by <a href="https://alif.mnr.bd">Md Abdullah Al Khalid Alif</a>
</p>
