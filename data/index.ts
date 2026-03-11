// ── PERSONAL INFO ────────────────────────────────────────────
export const personal = {
  name: 'Ahmad Baihaqie Bin Mohd Yusri',
  shortName: 'Ahmad Baihaqie',
  role: 'Software Engineer – UI/UX',
  bio: [
    'I\'m Ahmad Baihaqie, a Kuala Lumpur–based Software Engineer (UI/UX) working in fintech and SaaS environments. I specialize in crafting clean, scalable, and user-focused interfaces using technologies such as Vue.js, Nuxt, Tailwind CSS, and API-driven architectures. My work focuses on simplifying complex financial workflows and delivering seamless digital experiences that bridge business goals with user needs.',
    'Currently, I am also pursuing a Master of Science in Human Resource Development at Universiti Putra Malaysia, where my research focuses on AI adoption, digital transformation, and intergenerational dynamics in technology-driven organizations which allowing me to approach product development not only from a technical perspective but also from a human and organizational lens.',
  ],
  summary:
    'A results-driven Software Engineer (UI/UX) in fintech, experienced in developing user-focused web applications with Vue.js, Tailwind CSS, and API integrations.',
  location: 'Kuala Lumpur, W.P',
  email: 'byhaqie1455@gmail.com',
  mobile: '+60 17-710 9486',
  website: 'https://baihaqie.com/',
  github: 'https://github.com/byhaqie31',
  linkedin: 'https://linkedin.com/in/byhaqieyusri',
  availableFor: 'Full-time / Contract',
  focus: 'Fintech / SaaS',
  languages: [
    { lang: 'Malay', level: 'Native Proficiency' },
    { lang: 'English', level: 'Professional Working Proficiency' },
    { lang: 'Arabic', level: 'Elementary Proficiency' },
  ],
}

// ── NAVIGATION ───────────────────────────────────────────────
export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'References', href: '#references' },
  { label: 'Contact', href: '#contact' },
]

// ── PROJECTS ─────────────────────────────────────────────────
export interface Project {
  id: string
  tag: string
  featured?: boolean
  name: string
  description: string
  stack: string[]
  metrics?: { value: string; label: string }[]
  href?: string
}

export const projects: Project[] = [
  {
    id: 'razer-merchant-portal',
    tag: '⚡ Featured',
    featured: true,
    name: 'Razer Merchant Services — Merchant & Admin Portal',
    description:
      'Designed and developed high-quality user interfaces across the Merchant Portal, Admin Portal, and multiple fintech payment modules. Streamlined UI flows, refined error messages, improved form validations, and optimized data-driven interfaces — contributing to higher system adoption and reduced support escalations.',
    stack: ['Vue.js', 'Tailwind CSS', 'JavaScript', 'REST API', 'Figma'],
    metrics: [
      { value: '↓', label: 'Support escalations' },
      { value: '↑', label: 'System adoption' },
      { value: '3+', label: 'Portals shipped' },
    ],
    href: '#',
  },
  {
    id: 'house-of-parfum',
    tag: 'Full Stack',
    featured: true,
    name: 'House of Parfum — Online Perfume Boutique',
    description:
      'Final year project — developed a full-stack e-commerce web application with emphasis on frontend UI quality and backend PHP integration. Conducted user testing and iterated based on feedback to achieve 100% functional compliance.',
    stack: ['PHP', 'Bootstrap', 'JavaScript', 'MySQL', 'Figma'],
    href: '#',
  },
  {
    id: 'graphic-design',
    tag: 'Design',
    name: 'Brand & Print Design — Faztech Services',
    description:
      'Produced professional client-facing artworks including brochures, business cards, and flyers using Adobe tools — adhering to all client requirements across every deliverable.',
    stack: ['Adobe Illustrator', 'Photoshop', 'After Effects', 'Premiere Pro'],
    href: '#',
  },
]

// ── EXPERIENCE ───────────────────────────────────────────────
export interface Experience {
  id: string
  period: string
  company: string
  location: string
  role: string
  current?: boolean
  description: string
  bullets: string[]
  tags: string[]
}

export const experiences: Experience[] = [
  {
    id: 'razer',
    period: 'Dec 2025 – Present',
    company: 'Razer Merchant Services',
    location: 'Kuala Lumpur, W.P',
    role: 'Software Engineer – UI/UX',
    current: true,
    description:
      'Building high-quality user interfaces for fintech payment products across Merchant Portal, Admin Portal, and multiple payment modules.',
    bullets: [
      'Designed and developed high-quality UIs using Vue.js, Tailwind CSS, and modern front-end architectures across the Merchant Portal, Admin Portal, and multiple fintech payment modules.',
      'Collaborated with product owners, backend developers, QA testers, and business teams to identify pain points, refine requirements, and deploy incremental improvements.',
      'Enhanced merchant experience by streamlining UI flows, refining error messages, improving form validations, and optimizing data-driven interfaces.',
    ],
    tags: ['Vue.js', 'Tailwind CSS', 'JavaScript', 'REST API', 'Figma', 'GitLab'],
  },
  {
    id: 'faztech',
    period: 'Jul 2020 – Oct 2020',
    company: 'Faztech Services',
    location: 'Tangkak, Johor',
    role: 'Graphic Designer & Technician',
    description:
      'Designed professional client artworks and collaborated with a team of 8 technicians to handle maintenance and support tasks.',
    bullets: [
      'Designed professional artworks using 6 Adobe software applications (Illustrator, After Effects) adhering to all client requirements for brochures, business cards, and flyers.',
      'Collaborated with a team of 8 technicians handling program installation and OS maintenance with 0% callback from upper management.',
      'Responded to recurring client issues (Anti-Virus & OS Installation) closing 8/10 cases per week following established BAU protocols.',
    ],
    tags: ['Adobe Illustrator', 'After Effects', 'Photoshop', 'Premiere Pro'],
  },
]

// ── EDUCATION ────────────────────────────────────────────────
export interface Education {
  id: string
  period: string
  institution: string
  location: string
  degree: string
  cgpa: string
}

export const education: Education[] = [
  {
    id: 'upm-masters',
    period: 'In Progress',
    institution: 'Universiti Putra Malaysia (UPM)',
    location: 'Serdang, Selangor',
    degree: 'Master of Science in Human Resource Development',
    cgpa: 'In Progress',
  },
  {
    id: 'um-degree',
    period: 'Oct 2023',
    institution: 'Universiti Malaya (UM)',
    location: 'Kuala Lumpur, W.P',
    degree: 'Bachelor of Islamic Studies and Information Technology (First Class Honours)',
    cgpa: '3.77 / 4.00',
  },
  {
    id: 'um-foundation',
    period: 'May 2019',
    institution: 'Universiti Malaya (UM)',
    location: 'Kuala Lumpur, W.P',
    degree: 'Foundation of Islamic Studies and Science',
    cgpa: '3.44 / 4.00',
  },
]

// ── SKILLS ───────────────────────────────────────────────────
export interface SkillGroup {
  label: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    label: 'UI / UX Design',
    items: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Wireframing', 'Design Systems'],
  },
  {
    label: 'Frontend',
    items: ['Vue.js', 'Nuxt 3', 'Tailwind CSS', 'JavaScript', 'REST API Integration', 'HTML / CSS'],
  },
  {
    label: 'Creative & Design Tools',
    items: ['Adobe Illustrator', 'Photoshop', 'After Effects', 'Premiere Pro'],
  },
  {
    label: 'Tools & Workflow',
    items: ['GitLab', 'Figma', 'Microsoft Office', 'Version Control', 'Agile / Scrum'],
  },
]

// ── EXTRA ACTIVITIES ─────────────────────────────────────────
export const activities = [
  'UM — "Kesatuan Mahasiswa Akademi Pengajian Islam" (Committee Member)',
  'UM — "Program Career Fest 2023, Akademi Pengajian Islam" (Treasurer)',
  'UM — "Malam Penghargaan Dayasari, Kolej Kediaman Dayasari" (Head of Multimedia)',
]

// ── REFERENCES ───────────────────────────────────────────────
export const references = [
  {
    name: 'Haziman Hashim',
    title: 'Senior Manager, Software Engineer',
    company: 'Razer Merchant Services',
    email: 'haziman.hashim@fiuu.com',
  },
]
