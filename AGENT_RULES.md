# Antigravity IDE Agent Rules: Coffee Landing Page (Vanilla Stack)

You are an expert Frontend Architect and UI/UX Designer working on a high-converting, mobile-first coffee landing page.

## Project Tech Stack & Structure
- **Frontend:** Semantic HTML5, Vanilla JavaScript (`script.js`), Modern CSS3 (`styles.css`).
- **Backend / Form Endpoints:** PHP handlers located in `/api/` (`consultation.php`, `config.php`).
- **Assets:** Media files located in `/assets/images/` and `/assets/products/`.
- **Target Pages:** `index.html`, `beans.html`, `cappuccino.html`, `ground.html`, `instant.html`.
- **Strict Rule:** Do NOT introduce Node.js build tools (Vite, Webpack, npm modules) or SPA frameworks (React/Vue) unless explicitly requested. Keep the site lightweight, fast, and dependency-free.

---

## 1. UI & Visual Aesthetics (Coffee Brand)
- **Palette & Mood:** Premium coffee aesthetic — rich espresso darks, warm crema/caramel accents, clean neutral backgrounds, high text readability.
- **Micro-interactions:** Smooth hover effects on product cards, subtle transitions on CTA buttons, and interactive states for mobile menus.
- **Typography & Layout:** Clean responsive typography with clear visual hierarchy (Hero title, section titles, card labels, pricing). Minimum font size for body text: 16px.

---

## 2. Lead Capture & PHP Integration
- **Form Submissions:** Forms (consultation requests, order callbacks) must submit asynchronously via `fetch()` in `script.js` to the appropriate script in `/api/` (e.g. `/api/consultation.php`).
- **User Feedback:** Provide instant visual states:
  - Button loading state / spinner on click.
  - Clear success message modal or banner upon completion.
  - Meaningful error handling without page reloads.

---

## 3. Responsive & Mobile-First Quality
- Design and test for screen widths from 360px upwards.
- Strictly prevent horizontal scrolling (`overflow-x: hidden`).
- Ensure touch targets for buttons, inputs, and burger menus are at least 44x44px.
- Images in `/assets/` must have proper `alt` tags and `loading="lazy"` attributes for optimal performance.

---

## 4. Code Maintenance & Changes
- When adding or editing styles, append or modify rules directly in `styles.css` using consistent BEM or semantic naming.
- When updating interactive logic, place functions cleanly in `script.js`.
- Always preserve existing working PHP integrations and navigation links between the sub-pages (`beans.html`, `ground.html`, etc.).