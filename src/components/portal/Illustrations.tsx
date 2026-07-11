'use client'

import { motion } from 'framer-motion'

// Animated SVG illustrations for the 3 Boxes Jobs Portal
// These lively, colorful illustrations make the portal more engaging

interface IllustrationProps {
  className?: string
}

// Hero illustration - person working on laptop with AI elements
export function HeroIllustration({ className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background blobs */}
        <ellipse cx="200" cy="250" rx="180" ry="30" fill="#dcfce7" opacity="0.5" />
        <circle cx="320" cy="60" r="40" fill="#bbf7d0" opacity="0.4" />
        <circle cx="60" cy="80" r="25" fill="#86efac" opacity="0.3" />

        {/* Desk */}
        <rect x="80" y="180" width="240" height="8" rx="4" fill="#15803d" />
        <rect x="90" y="188" width="10" height="60" rx="2" fill="#166534" />
        <rect x="300" y="188" width="10" height="60" rx="2" fill="#166534" />

        {/* Laptop */}
        <rect x="140" y="130" width="120" height="50" rx="4" fill="#e2e8f0" stroke="#16a34a" strokeWidth="2" />
        <rect x="148" y="136" width="104" height="36" rx="2" fill="#f0fdf4" />
        {/* Screen content */}
        <rect x="155" y="142" width="40" height="4" rx="2" fill="#16a34a" opacity="0.6" />
        <rect x="155" y="150" width="60" height="3" rx="1.5" fill="#86efac" />
        <rect x="155" y="157" width="50" height="3" rx="1.5" fill="#bbf7d0" />
        <rect x="155" y="164" width="35" height="3" rx="1.5" fill="#86efac" />
        {/* AI sparkle on screen */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
          <path d="M230 148 L232 144 L234 148 L238 150 L234 152 L232 156 L230 152 L226 150 Z" fill="#22c55e" />
        </motion.g>

        {/* Keyboard base */}
        <path d="M130 180 L270 180 L260 190 L140 190 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />

        {/* Person */}
        {/* Head */}
        <circle cx="200" cy="90" r="22" fill="#fcd34d" />
        {/* Hair */}
        <path d="M180 85 Q185 65 200 62 Q215 65 220 85" fill="#92400e" />
        {/* Eyes */}
        <circle cx="193" cy="88" r="2.5" fill="#1e293b" />
        <circle cx="207" cy="88" r="2.5" fill="#1e293b" />
        {/* Smile */}
        <path d="M195 96 Q200 100 205 96" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Body */}
        <path d="M185 112 L180 130 L175 175" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M215 112 L220 130 L225 175" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* Arms reaching to laptop */}
        <path d="M185 118 L160 145 L155 155" stroke="#fcd34d" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M215 118 L240 145 L245 155" stroke="#fcd34d" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Floating AI elements */}
        <motion.g animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          {/* Brain/AI icon */}
          <circle cx="330" cy="100" r="18" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
          <path d="M322 100 Q326 90 330 95 Q334 90 338 100 Q338 108 330 112 Q322 108 322 100Z" fill="#16a34a" opacity="0.7" />
        </motion.g>

        <motion.g animate={{ y: [5, -5, 5] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
          {/* Target icon */}
          <circle cx="70" cy="140" r="16" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" />
          <circle cx="70" cy="140" r="8" fill="none" stroke="#16a34a" strokeWidth="1.5" />
          <circle cx="70" cy="140" r="3" fill="#16a34a" />
        </motion.g>

        <motion.g animate={{ y: [-3, 7, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          {/* Chart icon */}
          <rect x="340" y="150" width="30" height="30" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
          <rect x="347" y="165" width="4" height="10" rx="1" fill="#22c55e" />
          <rect x="353" y="158" width="4" height="17" rx="1" fill="#16a34a" />
          <rect x="359" y="162" width="4" height="13" rx="1" fill="#22c55e" />
        </motion.g>

        {/* Connection lines */}
        <motion.path d="M310 100 L270 120" stroke="#86efac" strokeWidth="1" strokeDasharray="4 4" fill="none"
          animate={{ strokeDashoffset: [0, 8] }} transition={{ duration: 1, repeat: Infinity }} />
        <motion.path d="M86 140 L130 150" stroke="#86efac" strokeWidth="1" strokeDasharray="4 4" fill="none"
          animate={{ strokeDashoffset: [0, 8] }} transition={{ duration: 1, repeat: Infinity }} />
      </svg>
    </motion.div>
  )
}

// Job matching illustration - people connected by network
export function JobMatchIllustration({ className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <svg viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background */}
        <circle cx="150" cy="125" r="110" fill="#f0fdf4" opacity="0.5" />

        {/* Center node */}
        <motion.g animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <circle cx="150" cy="110" r="28" fill="#16a34a" />
          <path d="M140 110 L148 118 L162 102" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Surrounding person nodes */}
        {[
          { cx: 70, cy: 70 }, { cx: 230, cy: 70 },
          { cx: 70, cy: 160 }, { cx: 230, cy: 160 },
          { cx: 150, cy: 200 },
        ].map((pos, i) => (
          <motion.g key={i} animate={{ y: [0, -3, 0] }} transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}>
            <circle cx={pos.cx} cy={pos.cy} r="18" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
            <circle cx={pos.cx} cy={pos.cy - 4} r="6" fill="#fcd34d" />
            <path d={`M${pos.cx - 5} ${pos.cy + 5} L${pos.cx} ${pos.cy + 2} L${pos.cx + 5} ${pos.cy + 5}`} fill="#16a34a" opacity="0.6" />
          </motion.g>
        ))}

        {/* Connection lines */}
        {[
          { x1: 70, y1: 70, x2: 150, y2: 110 },
          { x1: 230, y1: 70, x2: 150, y2: 110 },
          { x1: 70, y1: 160, x2: 150, y2: 110 },
          { x1: 230, y1: 160, x2: 150, y2: 110 },
          { x1: 150, y1: 200, x2: 150, y2: 110 },
        ].map((line, i) => (
          <motion.line key={i} {...line} stroke="#86efac" strokeWidth="1.5" strokeDasharray="5 5"
            animate={{ strokeDashoffset: [0, 10] }} transition={{ duration: 1.5, repeat: Infinity }} />
        ))}

        {/* Label */}
        <text x="150" y="240" textAnchor="middle" fill="#16a34a" fontSize="12" fontWeight="600">AI-Powered Matching</text>
      </svg>
    </motion.div>
  )
}

// Resume building illustration
export function ResumeIllustration({ className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <svg viewBox="0 0 250 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Document */}
        <rect x="40" y="20" width="170" height="230" rx="8" fill="white" stroke="#16a34a" strokeWidth="2" />
        {/* Header */}
        <rect x="55" y="35" width="80" height="8" rx="4" fill="#16a34a" opacity="0.8" />
        <rect x="55" y="50" width="140" height="4" rx="2" fill="#dcfce7" />
        <rect x="55" y="58" width="120" height="4" rx="2" fill="#dcfce7" />

        {/* Profile circle */}
        <circle cx="180" cy="45" r="15" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
        <circle cx="180" cy="41" r="5" fill="#fcd34d" />
        <path d="M172 52 Q180 56 188 52" fill="#16a34a" opacity="0.5" />

        {/* Section: Experience */}
        <rect x="55" y="75" width="60" height="5" rx="2.5" fill="#22c55e" opacity="0.7" />
        <rect x="55" y="86" width="3" height="20" rx="1.5" fill="#16a34a" />
        <rect x="64" y="86" width="90" height="4" rx="2" fill="#e2e8f0" />
        <rect x="64" y="93" width="70" height="3" rx="1.5" fill="#f1f5f9" />
        <rect x="64" y="99" width="80" height="3" rx="1.5" fill="#f1f5f9" />
        <rect x="55" y="112" width="3" height="20" rx="1.5" fill="#16a34a" />
        <rect x="64" y="112" width="85" height="4" rx="2" fill="#e2e8f0" />
        <rect x="64" y="119" width="65" height="3" rx="1.5" fill="#f1f5f9" />

        {/* Section: Skills */}
        <rect x="55" y="142" width="40" height="5" rx="2.5" fill="#22c55e" opacity="0.7" />
        <rect x="55" y="153" width="35" height="14" rx="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
        <text x="72" y="163" textAnchor="middle" fill="#16a34a" fontSize="8" fontWeight="500">React</text>
        <rect x="95" y="153" width="32" height="14" rx="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
        <text x="111" y="163" textAnchor="middle" fill="#16a34a" fontSize="8" fontWeight="500">Node</text>
        <rect x="132" y="153" width="45" height="14" rx="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
        <text x="155" y="163" textAnchor="middle" fill="#16a34a" fontSize="8" fontWeight="500">Python</text>
        <rect x="55" y="172" width="28" height="14" rx="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
        <text x="69" y="182" textAnchor="middle" fill="#16a34a" fontSize="8" fontWeight="500">AWS</text>
        <rect x="88" y="172" width="38" height="14" rx="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
        <text x="107" y="182" textAnchor="middle" fill="#16a34a" fontSize="8" fontWeight="500">Docker</text>

        {/* AI sparkle overlay */}
        <motion.g animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M195 80 L198 72 L201 80 L209 83 L201 86 L198 94 L195 86 L187 83 Z" fill="#22c55e" opacity="0.8" />
        </motion.g>
        <motion.g animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <path d="M30 100 L33 94 L36 100 L42 103 L36 106 L33 112 L30 106 L24 103 Z" fill="#86efac" opacity="0.6" />
        </motion.g>

        {/* Auto-update arrow */}
        <motion.path d="M215 160 C230 140 230 120 215 100" stroke="#16a34a" strokeWidth="2" fill="none"
          strokeDasharray="4 4" animate={{ strokeDashoffset: [0, 8] }} transition={{ duration: 1, repeat: Infinity }} />
        <motion.path d="M215 160 C200 180 200 200 215 220" stroke="#86efac" strokeWidth="2" fill="none"
          strokeDasharray="4 4" animate={{ strokeDashoffset: [8, 0] }} transition={{ duration: 1, repeat: Infinity }} />
        <path d="M210 95 L215 85 L220 95" fill="#16a34a" />
        <path d="M210 225 L215 235 L220 225" fill="#86efac" />

        {/* Label */}
        <text x="125" y="270" textAnchor="middle" fill="#16a34a" fontSize="11" fontWeight="600">AI Resume Builder</text>
      </svg>
    </motion.div>
  )
}

// Interview illustration - person in video call
export function InterviewIllustration({ className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <svg viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Video call frame */}
        <rect x="20" y="20" width="240" height="160" rx="12" fill="#1e293b" stroke="#16a34a" strokeWidth="2" />
        {/* Screen content */}
        <rect x="28" y="28" width="224" height="144" rx="8" fill="#0f172a" />

        {/* Interviewer (small) */}
        <rect x="35" y="35" width="80" height="60" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <circle cx="75" cy="55" r="10" fill="#fcd34d" />
        <path d="M60 70 Q75 78 90 70" fill="#475569" />
        <rect x="35" y="35" width="80" height="60" rx="6" stroke="#16a34a" strokeWidth="1" fill="none" opacity="0.3" />

        {/* Candidate (larger) */}
        <rect x="130" y="35" width="115" height="85" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <circle cx="188" cy="60" r="14" fill="#fcd34d" />
        <path d="M168 80 Q188 90 208 80" fill="#16a34a" opacity="0.7" />
        <rect x="130" y="35" width="115" height="85" rx="6" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.4" />

        {/* AI feedback panel */}
        <rect x="35" y="105" width="80" height="60" rx="6" fill="#0f172a" stroke="#16a34a" strokeWidth="1" />
        <text x="75" y="120" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">AI Feedback</text>
        {/* Score bars */}
        <rect x="42" y="128" width="45" height="4" rx="2" fill="#1e293b" />
        <rect x="42" y="128" width="36" height="4" rx="2" fill="#22c55e" />
        <rect x="42" y="136" width="45" height="4" rx="2" fill="#1e293b" />
        <rect x="42" y="136" width="30" height="4" rx="2" fill="#86efac" />
        <rect x="42" y="144" width="45" height="4" rx="2" fill="#1e293b" />
        <rect x="42" y="144" width="40" height="4" rx="2" fill="#16a34a" />
        <rect x="42" y="152" width="45" height="4" rx="2" fill="#1e293b" />
        <rect x="42" y="152" width="28" height="4" rx="2" fill="#86efac" />

        {/* Camera dot */}
        <motion.circle cx="140" cy="175" r="4" fill="#ef4444"
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />

        {/* Floating score badge */}
        <motion.g animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}>
          <rect x="210" y="130" width="40" height="24" rx="12" fill="#16a34a" />
          <text x="230" y="146" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">85%</text>
        </motion.g>

        {/* Bottom icons */}
        <circle cx="100" cy="200" r="14" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
        <path d="M94 200 L98 204 L106 196" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="140" cy="200" r="14" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
        <path d="M134 196 L140 204 L146 196 M134 200 L140 208 L146 200" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="180" cy="200" r="14" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
        <rect x="175" y="195" width="10" height="10" rx="2" stroke="#16a34a" strokeWidth="1.5" fill="none" />

        {/* Label */}
        <text x="140" y="245" textAnchor="middle" fill="#16a34a" fontSize="11" fontWeight="600">AI Mock Interviews</text>
      </svg>
    </motion.div>
  )
}

// Skills/training illustration
export function SkillsIllustration({ className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background circle */}
        <circle cx="130" cy="110" r="90" fill="#f0fdf4" opacity="0.5" />

        {/* Skill progress rings */}
        <motion.circle cx="130" cy="110" r="70" fill="none" stroke="#dcfce7" strokeWidth="8"
          strokeDasharray="330 440" strokeLinecap="round" />
        <motion.circle cx="130" cy="110" r="70" fill="none" stroke="#16a34a" strokeWidth="8"
          strokeDasharray="280 440" strokeLinecap="round"
          animate={{ strokeDashoffset: [440, 0] }} transition={{ duration: 2, repeat: false, delay: 0.5 }} />

        <motion.circle cx="130" cy="110" r="55" fill="none" stroke="#dcfce7" strokeWidth="6"
          strokeDasharray="260 346" strokeLinecap="round" />
        <motion.circle cx="130" cy="110" r="55" fill="none" stroke="#22c55e" strokeWidth="6"
          strokeDasharray="200 346" strokeLinecap="round"
          animate={{ strokeDashoffset: [346, 0] }} transition={{ duration: 2, repeat: false, delay: 0.8 }} />

        <motion.circle cx="130" cy="110" r="40" fill="none" stroke="#dcfce7" strokeWidth="5"
          strokeDasharray="190 251" strokeLinecap="round" />
        <motion.circle cx="130" cy="110" r="40" fill="none" stroke="#86efac" strokeWidth="5"
          strokeDasharray="150 251" strokeLinecap="round"
          animate={{ strokeDashoffset: [251, 0] }} transition={{ duration: 2, repeat: false, delay: 1.1 }} />

        {/* Center score */}
        <circle cx="130" cy="110" r="25" fill="white" />
        <text x="130" y="105" textAnchor="middle" fill="#16a34a" fontSize="18" fontWeight="700">78</text>
        <text x="130" y="118" textAnchor="middle" fill="#86efac" fontSize="7" fontWeight="500">SKILL SCORE</text>

        {/* Skill tags floating around */}
        {[
          { x: 30, y: 50, label: 'React', color: '#16a34a' },
          { x: 200, y: 40, label: 'Node.js', color: '#22c55e' },
          { x: 20, y: 170, label: 'AWS', color: '#15803d' },
          { x: 210, y: 160, label: 'Python', color: '#16a34a' },
          { x: 80, y: 20, label: 'TS', color: '#22c55e' },
        ].map((tag, i) => (
          <motion.g key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>
            <rect x={tag.x - 18} y={tag.y - 8} width={tag.label.length * 7 + 12} height="16" rx="8" fill={tag.color} opacity="0.15" stroke={tag.color} strokeWidth="1" />
            <text x={tag.x + (tag.label.length * 7 - 6) / 2} y={tag.y + 3} textAnchor="middle" fill={tag.color} fontSize="8" fontWeight="500">{tag.label}</text>
          </motion.g>
        ))}

        {/* Auto-update arrows */}
        <motion.path d="M130 200 L130 220" stroke="#16a34a" strokeWidth="2" fill="none"
          strokeDasharray="3 3" animate={{ strokeDashoffset: [0, 6] }} transition={{ duration: 0.8, repeat: Infinity }} />
        <path d="M125 215 L130 225 L135 215" fill="#16a34a" />

        {/* Update badge */}
        <motion.rect x="95" y="228" width="70" height="20" rx="10" fill="#16a34a"
          animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <text x="130" y="242" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">AUTO-UPDATE</text>

        {/* Label */}
        <text x="130" y="258" textAnchor="middle" fill="#16a34a" fontSize="11" fontWeight="600">Skills & Training</text>
      </svg>
    </motion.div>
  )
}

// Growth/analytics illustration
export function GrowthIllustration({ className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background */}
        <rect x="20" y="10" width="240" height="170" rx="12" fill="#f0fdf4" stroke="#dcfce7" strokeWidth="2" />

        {/* Grid lines */}
        {[40, 70, 100, 130, 160].map(y => (
          <line key={y} x1="40" y1={y} x2="240" y2={y} stroke="#dcfce7" strokeWidth="1" />
        ))}

        {/* Chart bars */}
        <motion.rect x="50" y="120" width="20" height="50" rx="4" fill="#86efac"
          animate={{ height: [0, 50], y: [170, 120] }} transition={{ duration: 0.5, delay: 0.2 }} />
        <motion.rect x="80" y="90" width="20" height="80" rx="4" fill="#22c55e"
          animate={{ height: [0, 80], y: [170, 90] }} transition={{ duration: 0.5, delay: 0.4 }} />
        <motion.rect x="110" y="70" width="20" height="100" rx="4" fill="#16a34a"
          animate={{ height: [0, 100], y: [170, 70] }} transition={{ duration: 0.5, delay: 0.6 }} />
        <motion.rect x="140" y="55" width="20" height="115" rx="4" fill="#15803d"
          animate={{ height: [0, 115], y: [170, 55] }} transition={{ duration: 0.5, delay: 0.8 }} />
        <motion.rect x="170" y="40" width="20" height="130" rx="4" fill="#16a34a"
          animate={{ height: [0, 130], y: [170, 40] }} transition={{ duration: 0.5, delay: 1.0 }} />
        <motion.rect x="200" y="30" width="20" height="140" rx="4" fill="#15803d"
          animate={{ height: [0, 140], y: [170, 30] }} transition={{ duration: 0.5, delay: 1.2 }} />

        {/* Trend line */}
        <motion.path d="M60 120 L90 85 L120 65 L150 50 L180 38 L210 28" stroke="#22c55e" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5 }} />

        {/* Trend arrow */}
        <motion.path d="M220 25 L230 20 L225 32" fill="#22c55e" stroke="#22c55e" strokeWidth="1"
          animate={{ y: [-2, 2, -2] }} transition={{ duration: 1.5, repeat: Infinity }} />

        {/* AI sparkle */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
          <path d="M240 45 L243 38 L246 45 L253 48 L246 51 L243 58 L240 51 L233 48 Z" fill="#16a34a" opacity="0.6" />
        </motion.g>

        {/* Labels */}
        <text x="60" y="190" fill="#64748b" fontSize="7">Jan</text>
        <text x="90" y="190" fill="#64748b" fontSize="7">Feb</text>
        <text x="118" y="190" fill="#64748b" fontSize="7">Mar</text>
        <text x="150" y="190" fill="#64748b" fontSize="7">Apr</text>
        <text x="180" y="190" fill="#64748b" fontSize="7">May</text>
        <text x="210" y="190" fill="#64748b" fontSize="7">Jun</text>

        {/* Bottom label */}
        <text x="140" y="210" textAnchor="middle" fill="#16a34a" fontSize="11" fontWeight="600">Career Growth Analytics</text>
      </svg>
    </motion.div>
  )
}

// Collaboration/handshake illustration for testimonials
export function CollabIllustration({ className = '' }: IllustrationProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background */}
        <circle cx="100" cy="80" r="70" fill="#f0fdf4" opacity="0.4" />

        {/* Person 1 */}
        <circle cx="65" cy="55" r="16" fill="#fcd34d" />
        <path d="M48 55 Q50 40 65 38 Q80 40 82 55" fill="#92400e" />
        <rect x="52" y="72" width="26" height="35" rx="8" fill="#16a34a" />

        {/* Person 2 */}
        <circle cx="135" cy="55" r="16" fill="#fcd34d" />
        <path d="M118 55 Q120 40 135 38 Q150 40 152 55" fill="#1e293b" />
        <rect x="122" y="72" width="26" height="35" rx="8" fill="#22c55e" />

        {/* Handshake */}
        <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <path d="M78 85 Q100 78 122 85" stroke="#fcd34d" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M78 88 Q100 95 122 88" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Sparkles */}
        <motion.path d="M100 30 L103 22 L106 30 L114 33 L106 36 L103 44 L100 36 L92 33 Z" fill="#22c55e" opacity="0.7"
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M30 40 L32 35 L34 40 L39 42 L34 44 L32 49 L30 44 L25 42 Z" fill="#86efac" opacity="0.5"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
        <motion.path d="M170 35 L172 30 L174 35 L179 37 L174 39 L172 44 L170 39 L165 37 Z" fill="#86efac" opacity="0.5"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} />

        {/* Bottom label */}
        <text x="100" y="130" textAnchor="middle" fill="#16a34a" fontSize="10" fontWeight="600">Trusted by 5,000+ Companies</text>
      </svg>
    </motion.div>
  )
}
