# Asongna Brilan · Portfolio

Personal website of **Asongna Brilan Nso Nkengafac**, Hardware Developer and Co-founder of
[PlastiBytes](https://plastibytes.com).

| | Link |
|---|---|
| **Live site** | https://asongnabrilan-nso.github.io/portfolio/ |
| **Admin editor** | https://asongnabrilan-nso.github.io/portfolio/admin.html |
| **Source code** | https://github.com/Asongnabrilan-nso/portfolio |
| **Hosting settings** | https://github.com/Asongnabrilan-nso/portfolio/settings/pages |

The site is plain HTML, CSS and JavaScript hosted free on **GitHub Pages**. There is no build step:
every push to the `main` branch goes live in about a minute, and anyone with the link can open it from any network.

---

## Contents

1. [What's where](#1-whats-where)
2. [Everyday tasks: the admin editor](#2-everyday-tasks-the-admin-editor)
3. [Editing page text](#3-editing-page-text)
4. [Replacing the résumé or photo](#4-replacing-the-résumé-or-photo)
5. [Contact form](#5-contact-form)
6. [Working on your computer](#6-working-on-your-computer)
7. [Design system](#7-design-system)
8. [Troubleshooting](#8-troubleshooting)
9. [Security notes](#9-security-notes)

---

## 1. What's where

```
index.html                 All fixed page text: hero, About, Expertise, Ventures, Contact, footer
admin.html                 Private editor for Projects and Achievements
data/projects.json         Project list (edited through admin.html)
data/achievements.json     Awards & certificates (edited through admin.html)
assets/Brilan.jpg          Profile photo (hero circle)
assets/Asongna-Brilan-Resume.pdf   Résumé offered for download
assets/projects/           Project pictures uploaded by the admin
assets/achievements/       Award / certificate pictures and PDFs uploaded by the admin
css/style.css              Design tokens and all site styles
css/admin.css              Admin page styles
js/main.js                 Site behaviour: theme, menu, animations, project cards, contact form
js/admin.js                Admin editor logic
js/vendor/pdfjs/           PDF.js (Mozilla), used by the admin to preview certificate PDFs
```

| I want to change… | Where |
|---|---|
| Projects or achievements | **admin.html** (no code) |
| Hero, About, Expertise, Ventures or Contact text | `index.html` |
| Résumé | replace `assets/Asongna-Brilan-Resume.pdf` |
| Profile photo | replace `assets/Brilan.jpg` |
| Colors / fonts | top of the **PURE BLACK & WHITE** and **GREEN ACCENT** blocks in `css/style.css` |
| Contact email | `index.html` (search `b.asongna@plastibytes.com`) |

---

## 2. Everyday tasks: the admin editor

Use this for anything in the **Projects** and **Achievements** sections. Nothing to install.

### One-time setup: create your access token

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
   ([direct link](https://github.com/settings/personal-access-tokens/new)).
2. **Token name:** `Portfolio admin`. **Expiration:** choose a date (e.g. 1 year). Note it, as you'll need a new token then.
3. **Repository access:** *Only select repositories* → `portfolio`.
4. **Permissions → Repository permissions → Contents:** *Read and write*. Leave everything else as is.
5. Click **Generate token** and copy it (starts with `github_pat_`). GitHub shows it only once.
   Keep it in a password manager.

### Signing in

1. Open **https://asongnabrilan-nso.github.io/portfolio/admin.html**.
2. Paste the token and click **Sign in**.
   Tick **Remember on this device** only on your own computer.
3. Click **Sign out** (top right) when you're done on a shared computer.

### Adding or editing a project

1. Choose the **Projects** tab → **+ Add project**, or click **Edit** on an existing one.
2. Fill in the form:

   | Field | Shown where |
   |---|---|
   | Title \* | Card and detail view |
   | Kind | *My project* or *Collaboration* (drives the filter tabs) |
   | Status / Year | Badge and date on the card |
   | Partner / organisation | "with …" line (collaborations) |
   | Short summary \* | On the card, 1–2 sentences |
   | Full description | In the detail view; blank line = new paragraph |
   | My role | In the detail view |
   | Tags | Comma-separated chips, e.g. `ESP32, KiCad, Edge AI` |
   | Links | GitHub, demo video, write-up… (any number) |
   | Pictures | Drag in or click **+ Add pictures**. The first is the cover; use ★ to change it |
   | Feature this project | Shows it as the large highlighted card |

3. Click **Save & publish**. Everything (text + pictures) is saved to GitHub in one change and appears on the
   site in about a minute.

Use **↑ / ↓** in the list to reorder; the site shows items in the same order.
**Delete** removes the item and its pictures (Git history keeps a copy if you ever need it back).

### Achievements

Same flow on the **Achievements** tab: title, *Award* or *Certificate*, issuer, date, summary,
description and a verification link.

**Certificate file:** drag your certificate **PDF** (up to 15 MB) onto the *Certificate file* box, or click it to browse.
The editor automatically turns page 1 into the preview picture shown on the card. Wait for
*"PDF added, with a preview of page 1"* before saving (the Save button is paused while it works).
You can also use a photo or screenshot instead of, or alongside, the PDF.

On the site, visitors see the preview on the card plus a **PDF** link. Opening the card shows the full PDF inside
the page on desktop, and **Open certificate (PDF)** and **Download** buttons on every device.

The Achievements section and its menu link stay hidden on the site until there's at least one entry.

---

## 3. Editing page text

The fixed text (hero, About, Expertise, Ventures, Contact, footer) lives in `index.html`.

**Easiest: in the browser**

1. Open [index.html on GitHub](https://github.com/Asongnabrilan-nso/portfolio/blob/main/index.html) and click the ✏️ **pencil** icon.
2. Press `Ctrl+F` to find the sentence you want to change, edit only the words between the tags, e.g.
   `<p>…change this text…</p>`. Don't delete the `<…>` tags themselves.
3. Click **Commit changes…** → **Commit changes**. Live in about a minute.

Writing style used on the site: no em dashes (use commas, colons or full stops), and no location wording.
The site presents you as available for **remote, on-site or hybrid** work.

---

## 4. Replacing the résumé or photo

Keep the **exact same file names** so nothing else needs changing.

1. Open the [assets folder on GitHub](https://github.com/Asongnabrilan-nso/portfolio/tree/main/assets).
2. Click **Add file → Upload files**, drag in the new file named exactly:
   - `Asongna-Brilan-Resume.pdf`, or
   - `Brilan.jpg` (square-ish photo, face near the top-middle, under ~500 KB is ideal)
3. **Commit changes**. The new file replaces the old one.

> Windows tip: if File Explorer hides extensions, a file renamed to `Resume.pdf` may really be `Resume.pdf.pdf`.
> Turn on *View → Show → File name extensions* to check.

---

## 5. Contact form

- Messages are delivered to **b.asongna@plastibytes.com** by [FormSubmit](https://formsubmit.co) (free, no account).
- Each email's subject shows the sender's name and their **preferred way of working**
  (Remote / On-site / Hybrid / Not sure yet), e.g. `Portfolio message from Jane [Hybrid]`. Reply directly to the email.
- **One-time activation:** FormSubmit sent an *Activate Form* email to that address. If messages aren't
  arriving, find that email (check spam) and click the link. Until then, visitors see
  "The contact form is waiting to be activated" with a link to email you directly.
- To change the receiving address, edit `action="https://formsubmit.co/…"` in `index.html`, then re-activate.

---

## 6. Working on your computer

For larger changes, edit locally with VS Code.

```bash
# First time only
git clone https://github.com/Asongnabrilan-nso/portfolio.git
cd portfolio

# Every time you start: get the latest (includes anything saved through the admin page)
git pull

# Preview at http://localhost:8000 (needed for the project list and form to work)
python -m http.server 8000

# Publish
git add .
git commit -m "Describe your change"
git push
```

Always **`git pull` before you start**. The admin editor saves directly to GitHub, so your computer can fall
behind. Opening `index.html` by double-clicking shows the page but won't load projects or send messages;
use the preview command above.

`localhost` and `192.168.x.x` addresses only work on your own machine or network. Always share the public link.

---

## 7. Design system

- **Colors:** pure black `#000000`, pure white `#FFFFFF` and one accent green `#00D26A`.
  Green text on white uses `#00843D` for readability. Change them at the top of the
  **PURE BLACK & WHITE** and **GREEN ACCENT** blocks in `css/style.css`.
- **Font:** Inter, with fluid sizes (`--fs-*` tokens).
- **Light/dark:** follows the visitor's device; the sun/moon button switches it and is remembered.
- **Sections** alternate white and black. Cards are outlined and get a green offset shadow on hover.
- **Accessibility:** keyboard focus rings, 44px touch targets, high-contrast text, and calmer animations
  for visitors with *reduce motion* enabled.

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| Change not showing | Wait 1–2 minutes, then hard-refresh (`Ctrl+Shift+R`). Check the build at **[Actions](https://github.com/Asongnabrilan-nso/portfolio/actions)**. |
| Site shows 404 | **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`. |
| Admin: "token was not accepted" | Token expired or copied incompletely. Create a new one (section 2). |
| Admin: "cannot write" | Token needs **Contents: Read and write** on the `portfolio` repo. |
| Admin: "changed somewhere else" | Someone (or your computer) pushed in the meantime. Reload the admin page and redo the edit. |
| `git push` rejected | Run `git pull` first, then push again. |
| Contact form says "waiting to be activated" | Click the FormSubmit activation email (section 5). |
| Résumé button says "Request by email" | The PDF is missing or misnamed; re-upload as `assets/Asongna-Brilan-Resume.pdf`. |

---

## 9. Security notes

- Anyone can open `admin.html`, but **nothing can be changed without your token**.
- Never paste the token into a file, an issue, a chat or the website's code. If it leaks, delete it on GitHub
  (Settings → Fine-grained tokens) and create a new one.
- The repository is public, so don't commit private documents. Everything in it is visible.
