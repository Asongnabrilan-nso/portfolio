# Asongna Brilan — Professional Portfolio

> A clean, dark-themed, fully responsive portfolio website.
> Built with plain HTML, CSS, and JavaScript — zero build tools, zero dependencies, deploys instantly to GitHub Pages.

**Live URL (after deployment):** `https://YOUR_GITHUB_USERNAME.github.io/portfolio/`

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [How to Deploy to GitHub Pages](#how-to-deploy-to-github-pages)
3. [How to Personalise the Site](#how-to-personalise-the-site)
   - [Your Name & Tagline](#your-name--tagline)
   - [Social Links](#social-links)
   - [About Section](#about-section)
   - [Skills](#skills)
   - [Ventures](#ventures)
   - [Adding a Project Card](#adding-a-project-card)
   - [Contact Links](#contact-links)
4. [Changing Colours / Theme](#changing-colours--theme)
5. [Adding a Profile Photo](#adding-a-profile-photo)
6. [Adding More Sections](#adding-more-sections)
7. [SEO & Meta Tags](#seo--meta-tags)

---

## Project Structure

```
portfolio/
├── index.html          ← Single-page app — all content lives here
├── css/
│   └── style.css       ← All styles (CSS custom properties make theming easy)
├── js/
│   └── main.js         ← Scroll animations, mobile nav, active links
├── assets/             ← Drop your profile photo and any images here
└── README.md           ← This file
```

---

## How to Deploy to GitHub Pages

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in.
2. Click **New repository**.
3. Name it `portfolio` (or anything you want).
4. Set visibility to **Public**.
5. Click **Create repository**.

### Step 2 — Push the files

```bash
cd /c/Users/Surface7/.local/bin/portfolio

git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/portfolio.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. In your repository, go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Select branch `main`, folder `/ (root)`.
4. Click **Save**.

Your site will be live at `https://YOUR_GITHUB_USERNAME.github.io/portfolio/` within ~60 seconds.

### Step 4 — Custom domain (optional)

If you own a domain (e.g., `asongnabrilan.com`):

1. In **Settings → Pages**, enter your domain under **Custom domain**.
2. Add a `CNAME` file in the root of the repo containing just your domain:
   ```
   asongnabrilan.com
   ```
3. Point your domain's DNS to GitHub Pages (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).

---

## How to Personalise the Site

All content is in `index.html`. Open it in any text editor (VS Code recommended).

---

### Your Name & Tagline

Find the hero section (search for `id="hero"`):

```html
<h1 class="hero-name">Asongna Brilan<br /><span class="hero-surname">Nso Nkengafac</span></h1>
```

Edit the `<h1>` to change how your name is displayed. The `hero-surname` span renders in a dimmer colour — you can put your family name there to create visual hierarchy.

Change the tagline paragraph:

```html
<p class="hero-tagline">
  I build hardware that solves real problems ...
</p>
```

Add or remove `<span class="role-tag">` items to update your roles:

```html
<div class="hero-roles">
  <span class="role-tag">Computer Engineer</span>
  <span class="role-tag">Embedded Systems Developer</span>
  <span class="role-tag">Community Builder</span>
</div>
```

---

### Social Links

In the `hero-social` div, replace `YOUR_GITHUB` and `YOUR_LINKEDIN` with your actual usernames:

```html
<a href="https://github.com/YOUR_GITHUB" ...>
<a href="https://www.linkedin.com/in/YOUR_LINKEDIN" ...>
```

---

### About Section

Find the `id="about"` section and edit the three `<p>` paragraphs inside `.about-text`. Update the numbers in `.stat-card` to match your real stats:

```html
<div class="stat-card">
  <span class="stat-number">3</span>
  <span class="stat-label">Ventures Co-Founded</span>
</div>
```

---

### Skills

Each column is a `.skill-group` div. To add a skill, add a `<li>` inside the matching `.skill-list`:

```html
<li>New Skill Here</li>
```

To add a whole new skill column, copy a full `.skill-group` block and paste it inside `.skills-grid`. Update the title and the list items.

---

### Ventures

Each company card is a `.venture-card` div inside `id="ventures"`. Edit:

- `venture-name` — company name
- `venture-role` — your role
- `venture-desc` — description
- `venture-link` — the link URL and text

The three icon colour variants are:
- `venture-icon--green` (teal, used for PlastiBytes)
- `venture-icon--blue`  (blue, used for HWIVC)
- `venture-icon--orange` (orange, used for LEVON)

---

### Adding a Project Card

Copy this block and paste it inside `.projects-grid`:

```html
<div class="project-card">
  <div class="project-header">
    <div class="project-meta">
      <!-- Status options: status-active | status-complete | status-progress -->
      <span class="project-status status-active">Active</span>
      <span class="project-year">2025</span>
    </div>
    <div class="project-links">
      <a href="https://github.com/YOUR_GITHUB/repo-name" target="_blank" rel="noopener" aria-label="GitHub">
        <!-- GitHub SVG icon is already in the file — copy from another card -->
        <svg viewBox="0 0 24 24" fill="currentColor">...</svg>
      </a>
    </div>
  </div>
  <h3 class="project-title">Your Project Name</h3>
  <p class="project-desc">
    What the project does, what problem it solves, key technologies used.
  </p>
  <div class="project-tags">
    <span class="tag">ESP32</span>
    <span class="tag">Python</span>
    <span class="tag">MQTT</span>
  </div>
</div>
```

Add `class="project-card featured"` to the card you want to visually highlight as your flagship project.

---

### Contact Links

In the `id="contact"` section, update the three `.contact-item` anchors with your real email address and website URLs.

---

## Changing Colours / Theme

All colours are CSS custom properties at the top of `css/style.css`:

```css
:root {
  --bg:          #0a0d12;   /* page background */
  --bg-alt:      #0e1219;   /* alternate section background */
  --bg-card:     #121822;   /* card background */
  --accent:      #00d4aa;   /* primary accent (teal-green) */
  --accent-blue: #3b82f6;   /* secondary accent */
  --text:        #e2e8f0;   /* primary text */
  --text-muted:  #7a8999;   /* secondary text */
  ...
}
```

To switch to a blue accent palette, just change `--accent: #00d4aa` to `--accent: #3b82f6`.

For a light theme, swap `--bg: #0a0d12` to `--bg: #f8fafc` and `--text: #e2e8f0` to `--text: #0f172a`.

---

## Adding a Profile Photo

1. Put your photo in the `assets/` folder (e.g., `assets/profile.jpg`).
2. In the About section of `index.html`, add an `<img>` tag inside `.about-grid`:

```html
<div class="about-image">
  <img src="assets/profile.jpg" alt="Asongna Brilan" />
</div>
```

3. In `css/style.css`, style it:

```css
.about-image img {
  width: 100%;
  border-radius: var(--radius);
  border: 2px solid var(--border);
}
```

4. Update `.about-grid` to a 3-column layout: `grid-template-columns: 1fr 1fr 240px;`

---

## Adding More Sections

Copy the section template below, give it a unique `id`, and add a `<li><a href="#your-id">Label</a></li>` to the nav:

```html
<section id="your-id" class="section">
  <div class="container">
    <div class="section-label">06 / Label</div>
    <h2 class="section-title">Section Title</h2>
    <!-- your content here -->
  </div>
</section>
```

Alternate `class="section"` and `class="section section-alt"` to get the light/dark alternating background rhythm.

---

## SEO & Meta Tags

At the top of `index.html`, update these tags:

```html
<meta name="description" content="Your description here — shows in Google search results." />
<meta property="og:title" content="Your Name | Portfolio" />
<meta property="og:description" content="Short hook for social media previews." />
```

For a full Open Graph image (thumbnail when shared on LinkedIn/Twitter), add:

```html
<meta property="og:image" content="https://YOUR_GITHUB_USERNAME.github.io/portfolio/assets/og-image.png" />
```

Create a 1200×630px image and save it to `assets/og-image.png`.

---

## Updating the Site

After making changes locally:

```bash
git add .
git commit -m "Update project cards"
git push
```

GitHub Pages auto-rebuilds within ~30 seconds. Hard-refresh the browser (`Ctrl+Shift+R`) to see changes.

---

*Built for Asongna Brilan Nso Nkengafac — PlastiBytes · HWIVC · LEVON Robotics*
#   p o r t f o l i o  
 