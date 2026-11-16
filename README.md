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
index.html            all page content
css/style.css         design tokens (top of file) and styles
js/projects.js        the project list, edit this to add projects
js/main.js            theme, menu, project filter, contact form, animations
assets/Brilan.jpg     profile photo
assets/Asongna-Brilan-Resume.pdf   your résumé (add this file)
```

## Common updates

**Add a project:** open `js/projects.js` and copy an entry. Use `type: 'own'` for your projects and
`type: 'collab'` for collaborations (add `partner: 'Team name'`).

**Résumé download:** save your PDF as `assets/Asongna-Brilan-Resume.pdf` and push. Until the file
exists, the button switches to "Request by email".

**Contact form:** messages are delivered to `b.asongna@plastibytes.com` through
[FormSubmit](https://formsubmit.co) (free, no account). The **first** time someone submits the form,
FormSubmit sends an activation email to that address. Click the link in it once, and every
message after that is delivered. If the service is unreachable, the form offers a "send from your email app" fallback.

## Publishing

```bash
git add .
git commit -m "Update portfolio"
git push
```

GitHub Pages rebuilds in about a minute. Always share the public URL above. Addresses such as
`localhost`, `127.0.0.1`, `192.168.x.x` or `file:///…` only work on your own computer or home network.
