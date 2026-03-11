// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Project {
  title: string
  description: string
  stack: string[]
  href?: string
  github?: string
  featured: boolean
  year: number
  status?: 'live' | 'wip' | 'archived'
}

export interface Experience {
  company: string
  role: string
  period: string
  description: string
  stack: string[]
  current?: boolean
}

export interface SkillGroup {
  category: string
  skills: string[]
}

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: string
  action: () => void
  keywords?: string[]
}

// ─── Personal ──────────────────────────────────────────────────────────────────

export const personal = {
  name: 'Ahmad Baihaqie',
  title: 'Software Engineer',
  tagline: 'Building products people actually use.',
  description:
    'I design and build fast, clean web applications. Focused on great user experience, clear code, and shipping things that matter.',
  location: 'Malaysia',
  email: 'hello@ahmadbaihaqie.dev',
  github: 'https://github.com/byhaqie31',
  linkedin: 'https://linkedin.com/in/ahmadbaihaqie',
  availability: true,
}

// ─── Navigation ────────────────────────────────────────────────────────────────

export const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

// ─── Projects ──────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    title: 'Project Alpha',
    description:
      'A full-stack SaaS platform for managing team workflows. Built with a focus on performance and real-time collaboration.',
    stack: ['Nuxt', 'TypeScript', 'Supabase', 'Tailwind'],
    href: '#',
    github: '#',
    featured: true,
    year: 2025,
    status: 'live',
  },
  {
    title: 'Project Beta',
    description:
      'Developer tool that automates repetitive tasks in CI/CD pipelines, saving hours per week.',
    stack: ['Node.js', 'TypeScript', 'CLI'],
    href: '#',
    github: '#',
    featured: true,
    year: 2024,
    status: 'live',
  },
  {
    title: 'Project Gamma',
    description:
      'Open-source UI component library for Vue 3, focused on accessibility and dark-mode-first design.',
    stack: ['Vue 3', 'TypeScript', 'Vite'],
    github: '#',
    featured: false,
    year: 2024,
    status: 'live',
  },
  {
    title: 'Project Delta',
    description:
      'REST API boilerplate with auth, rate limiting, and structured logging out of the box.',
    stack: ['Hono', 'TypeScript', 'PostgreSQL'],
    github: '#',
    featured: false,
    year: 2023,
    status: 'archived',
  },
]

// ─── Experience ────────────────────────────────────────────────────────────────

export const experience: Experience[] = [
  {
    company: 'Company Name',
    role: 'Software Engineer',
    period: '2024 — Present',
    description:
      'Building and maintaining core product features. Leading frontend architecture decisions and mentoring junior engineers.',
    stack: ['TypeScript', 'Vue', 'Node.js', 'PostgreSQL'],
    current: true,
  },
  {
    company: 'Previous Company',
    role: 'Frontend Developer',
    period: '2022 — 2024',
    description:
      'Developed responsive web applications and internal tools. Improved page performance by 40% through bundle optimization.',
    stack: ['React', 'TypeScript', 'GraphQL', 'Tailwind'],
  },
  {
    company: 'Freelance',
    role: 'Web Developer',
    period: '2021 — 2022',
    description:
      'Built websites and web apps for small businesses across various industries.',
    stack: ['Vue', 'PHP', 'MySQL', 'CSS'],
  },
]

// ─── Skills ────────────────────────────────────────────────────────────────────

export const skillGroups: SkillGroup[] = [
  {
    category: 'Languages',
    skills: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'SQL'],
  },
  {
    category: 'Frontend',
    skills: ['Vue 3', 'Nuxt 3', 'React', 'Next.js', 'Tailwind CSS'],
  },
  {
    category: 'Backend',
    skills: ['Node.js', 'Hono', 'Express', 'REST APIs', 'PostgreSQL'],
  },
  {
    category: 'Tools',
    skills: ['Git', 'Docker', 'Vite', 'Figma', 'Linux'],
  },
]
