# Asongna Brilan — Portfolio

Personal website of **Asongna Brilan Nso Nkengafac**, Hardware Developer and Co-founder of
[PlastiBytes](https://plastibytes.com).

**Live site (public, works on any network):** https://asongnabrilan-nso.github.io/portfolio/

Plain HTML, CSS and JavaScript with no build step, hosted on GitHub Pages.
The design follows Apple's interface guidelines: system typography with size-specific tracking,
translucent navigation, interruptible spring-style motion, automatic light/dark mode, and support for
reduced-motion, reduced-transparency and high-contrast settings. Brand colors are black, white and gray.

## Structure

```
index.html                 page layout and fixed text (About, Expertise, Ventures, Contact)
admin.html                 private editor for Projects and Achievements
data/projects.json         project list (edited through admin.html)
data/achievements.json     awards and certificates (edited through admin.html)
assets/projects/           project pictures uploaded by the admin
assets/achievements/       award / certificate pictures uploaded by the admin
assets/Asongna-Brilan-Resume.pdf   résumé offered for download
css/style.css              design tokens (top of file) and styles
css/admin.css              admin page styles
js/main.js                 site behaviour (theme, menu, filters, detail sheet, contact form)
js/admin.js                admin editor
```

## Editing projects and achievements (admin)

1. Open **https://asongnabrilan-nso.github.io/portfolio/admin.html**.
2. Sign in with a GitHub **fine-grained personal access token**:
   GitHub → Settings → Developer settings → Fine-grained tokens → *Generate new token*
   - Repository access: **Only select repositories → portfolio**
   - Permissions → Repository permissions → **Contents: Read and write**
3. Add, edit, reorder or delete projects and achievements. You can add a title, kind (my project or collaboration),
   status, year, partner, summary, full description, your role, tags, links, a featured flag and several pictures
   (the first is the cover). Achievements take a title, award or certificate, issuer, date, description, link and one picture.
4. **Save & publish** commits everything to GitHub in one commit. The site updates in about a minute.

The token stays in your browser only (for the session, or on that device if you tick *Remember*). Never paste it into
the website's code. Anyone can open `admin.html`, but nobody can change anything without your token.
The Achievements section stays hidden on the site until it has at least one entry.

## Contact form

Messages are delivered to `b.asongna@plastibytes.com` through [FormSubmit](https://formsubmit.co).
**Activate it once:** FormSubmit sent an email with an *Activate Form* link to that address (check spam).
Until it is clicked, the form shows "waiting to be activated". After that, messages arrive normally.

## Publishing

```bash
git add .
git commit -m "Update portfolio"
git push
```

GitHub Pages rebuilds in about a minute. Always share the public URL above. Addresses such as
`localhost`, `127.0.0.1`, `192.168.x.x` or `file:///…` only work on your own computer or home network.
