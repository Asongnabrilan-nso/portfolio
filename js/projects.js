/* ============================================================
   projects.js: the project list. Edit this file to add projects.

   type:   "own"    → a project you led
           "collab" → a project you contributed to with another team
   status: "Active" | "Complete" | "In progress"
   links:  any number of { label, url }
   ============================================================ */

window.PROJECTS = [
  {
    title: 'MarineSentinel',
    type: 'own',
    status: 'Active',
    year: '2025–2026',
    desc: 'A ~$300 floating AI sentinel on an Arduino UNO Q that watches rivers and coastlines for plastic pollution around the clock and logs water quality.',
    tags: ['Edge AI', 'Computer vision', 'Fusion 360', 'Sensors'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Asongnabrilan-nso/MarineSentinel_v1' },
      { label: 'Write-up', url: 'https://www.hackster.io/abrilannso/marinesentinel-60f927' },
    ],
    featured: true,
  },
  {
    title: 'PlastiSense',
    type: 'own',
    status: 'Complete',
    year: '2026',
    desc: 'A precision filament-diameter sensor on the XIAO ESP32-C3 with a custom KiCad PCB, 3D-printed housing, on-device web dashboard, REST API and OTA updates.',
    tags: ['ESP32-C3', 'KiCad PCB', 'PlatformIO', 'REST API'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Asongnabrilan-nso/PlastiSense' },
      { label: 'Demo', url: 'https://youtu.be/B_dy0DAJdtQ' },
    ],
  },
  {
    title: 'PlastiWatch',
    type: 'own',
    status: 'In progress',
    year: '2026',
    desc: 'An edge-AI smartwatch: low-power wearable hardware running on-device inference, explored in both C and Rust firmware.',
    tags: ['Wearables', 'Edge AI', 'C', 'Rust'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Asongnabrilan-nso/PlastiWatch' },
    ],
  },
  {
    title: 'XIAO ESP32-C3 Joystick',
    type: 'own',
    status: 'Complete',
    year: '2026',
    desc: 'A compact wireless joystick controller built on the Seeed XIAO ESP32-C3 for driving robots and interactive hardware.',
    tags: ['ESP32-C3', 'Robotics', 'Wireless control'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Asongnabrilan-nso/xiao_esp32c3_joystick' },
    ],
  },

  /* ---- Collaborated projects: copy this template and set type: 'collab' ----
  {
    title: 'Project name',
    type: 'collab',
    status: 'Complete',
    year: '2025',
    partner: 'Partner / organisation',
    desc: 'One or two sentences on the project and your role in it.',
    tags: ['Tag', 'Tag'],
    links: [{ label: 'Website', url: 'https://…' }],
  },
  ------------------------------------------------------------------------- */
];
