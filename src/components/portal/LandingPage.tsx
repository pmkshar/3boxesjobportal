'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AuthDialog } from './AuthDialog'
import {
  Briefcase, Brain, FileText, Users, BarChart3, GraduationCap,
  ArrowRight, Star, ChevronRight, Sparkles, Zap, Target, Award,
  CheckCircle2, Globe, Shield
} from 'lucide-react'

const features = [
  { icon: FileText, title: 'AI Resume Builder', desc: 'Auto-generate and enhance your resume with AI. Skills auto-update when you complete training.', color: 'emerald' },
  { icon: Target, title: 'Smart Job Matching', desc: 'AI-powered job matching scores based on your skills, experience, and preferences.', color: 'teal' },
  { icon: Brain, title: 'AI Mock Interviews', desc: 'Practice with AI-powered mock interviews. Get real-time feedback on communication and technical skills.', color: 'cyan' },
  { icon: Zap, title: 'Skill Auto-Update', desc: 'Complete training courses and your skills are automatically updated across your profile and resume.', color: 'amber' },
  { icon: BarChart3, title: 'AI Analytics', desc: 'Comprehensive analytics dashboard with AI-driven insights and career recommendations.', color: 'violet' },
  { icon: GraduationCap, title: 'Training Hub', desc: 'Access curated courses to upskill. AI recommends courses based on your career goals and job market trends.', color: 'rose' },
]

const testimonials = [
  { name: 'Priya M.', role: 'Software Engineer', text: 'The AI mock interviews helped me land my dream job at a top tech company. The feedback was incredibly detailed!', rating: 5 },
  { name: 'Rahul K.', role: 'Data Scientist', text: 'Skill auto-update is a game changer. Every course I complete automatically enhances my resume and profile.', rating: 5 },
  { name: 'Sneha R.', role: 'HR Director', text: 'As a corporate user, the AI matching saves us hours. We find better candidates faster than any other platform.', rating: 5 },
]

const stats = [
  { label: 'Active Jobs', value: '10K+' },
  { label: 'Companies', value: '5K+' },
  { label: 'Candidates', value: '50K+' },
  { label: 'AI Interviews', value: '1K+' },
]

export function LandingPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register')

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThreeBoxesLogo size={32} />
            <span className="text-xl font-bold text-gray-900">3 Boxes <span className="text-emerald-600">Jobs</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => { setAuthTab('login'); setAuthOpen(true) }}>Login</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setAuthTab('register'); setAuthOpen(true) }}>
              Get Started <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} onSuccess={() => setAuthOpen(false)} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
              <ThreeBoxesLogo size={80} className="mx-auto mb-6" />
            </motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              India&apos;s First <span className="text-emerald-600">AI-Powered</span><br />Career Platform
            </motion.h1>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Smart resume building, AI mock interviews, skill auto-updates, and intelligent job matching — all in one platform.
            </motion.p>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-base px-8 h-12"
                onClick={() => { setAuthTab('register'); setAuthOpen(true) }}>
                <Sparkles className="mr-2 h-5 w-5" /> Start as Job Seeker
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => { setAuthTab('register'); setAuthOpen(true) }}>
                <Briefcase className="mr-2 h-5 w-5" /> Post as Employer
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">AI-Powered Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need to<br />Land Your Dream Job</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="h-full hover:shadow-lg transition-shadow border-gray-100 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-teal-100 text-teal-700 mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Simple Steps to Success</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> For Job Seekers
              </h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Create Profile & Resume', desc: 'Build your AI-powered resume and complete your profile with skills and experience.' },
                  { step: '2', title: 'Train & Get Matched', desc: 'Take training courses to upskill. AI auto-updates your resume and matches you with jobs.' },
                  { step: '3', title: 'Interview & Get Hired', desc: 'Practice with AI mock interviews, apply with confidence, and land your dream job.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-teal-600" /> For Employers
              </h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Post Jobs', desc: 'Create job postings with detailed requirements. AI helps optimize your job descriptions.' },
                  { step: '2', title: 'Review AI-Matched Candidates', desc: 'Get AI-scored candidate matches. Filter by skills, experience, and AI match percentage.' },
                  { step: '3', title: 'Hire the Best', desc: 'Schedule interviews, track applications, and hire top talent with AI-driven insights.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-amber-100 text-amber-700 mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trusted by Thousands</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="h-full border-gray-100">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
          <p className="text-lg text-emerald-100 mb-8">Join thousands of professionals who have accelerated their careers with 3 Boxes Jobs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-8 h-12"
              onClick={() => { setAuthTab('register'); setAuthOpen(true) }}>
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="mt-4 text-sm text-emerald-200">Demo: seeker@3boxes.com / demo123</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ThreeBoxesLogo size={24} />
                <span className="text-lg font-bold text-white">3 Boxes Jobs</span>
              </div>
              <p className="text-sm">India&apos;s first AI-powered career platform with smart resume building, mock interviews, and skill auto-updates.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                <li>AI Resume Builder</li><li>Smart Job Search</li><li>AI Mock Interviews</li><li>Training Hub</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li>Post Jobs</li><li>AI Candidate Matching</li><li>Recruiter Tools</li><li>Analytics Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About Us</li><li>Contact</li><li>Privacy Policy</li><li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            &copy; 2024 3 Boxes Jobs. All rights reserved. Powered by AI.
          </div>
        </div>
      </footer>
    </div>
  )
}

export function ThreeBoxesLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  const s = size / 8
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <rect x={2 * s} y={0} width={3 * s} height={3 * s} rx={0.5 * s} fill="#059669" />
      <rect x={5.5 * s} y={0} width={3 * s} height={3 * s} rx={0.5 * s} fill="#0d9488" />
      <rect x={3.75 * s} y={3.5 * s} width={3 * s} height={3 * s} rx={0.5 * s} fill="#0891b2" />
    </svg>
  )
}
