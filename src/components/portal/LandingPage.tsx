'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AuthDialog } from './AuthDialog'
import {
  Briefcase, Brain, FileText, Users, BarChart3, GraduationCap,
  ArrowRight, Star, ChevronRight, Sparkles, Zap, Target, Award,
  CheckCircle2, MapPin, Search, Building2, TrendingUp, Laptop,
  Heart, Shield, Clock, BookOpen, Code, PieChart, UserCheck,
  IndianRupee, Globe, ChevronDown, Layers
} from 'lucide-react'

const jobCategories = [
  { icon: Code, label: 'IT & Software', count: '5,200+', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { icon: Briefcase, label: 'Banking & Finance', count: '3,100+', color: 'bg-green-50 text-green-700 border-green-200' },
  { icon: Heart, label: 'Healthcare', count: '2,400+', color: 'bg-red-50 text-red-700 border-red-200' },
  { icon: GraduationCap, label: 'Education', count: '1,800+', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { icon: Laptop, label: 'Marketing', count: '1,500+', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { icon: Building2, label: 'Manufacturing', count: '1,200+', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { icon: Globe, label: 'BPO & Call Centre', count: '900+', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { icon: TrendingUp, label: 'Sales', count: '2,700+', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
]

const topCompanies = [
  { name: 'TCS', logo: 'TCS' },
  { name: 'Infosys', logo: 'INFY' },
  { name: 'Wipro', logo: 'WIP' },
  { name: 'HCL Tech', logo: 'HCL' },
  { name: 'Amazon', logo: 'AMZ' },
  { name: 'Google', logo: 'GOO' },
  { name: 'Microsoft', logo: 'MSF' },
  { name: 'Flipkart', logo: 'FLP' },
  { name: 'Reliance', logo: 'REL' },
  { name: 'HDFC Bank', logo: 'HDF' },
]

const featuredJobs = [
  { title: 'Senior React Developer', company: 'Priya Technologies', location: 'Bangalore', salary: '12-20 LPA', tags: ['React', 'TypeScript', 'Remote'], posted: '2 hours ago' },
  { title: 'Data Scientist - AI/ML', company: 'TechCorp India', location: 'Hyderabad', salary: '15-25 LPA', tags: ['Python', 'TensorFlow', 'NLP'], posted: '5 hours ago' },
  { title: 'DevOps Engineer', company: 'CloudScale Inc', location: 'Pune', salary: '10-18 LPA', tags: ['AWS', 'Docker', 'Kubernetes'], posted: '1 day ago' },
  { title: 'Product Manager - SaaS', company: 'InnoSoft Solutions', location: 'Mumbai', salary: '18-30 LPA', tags: ['Product Strategy', 'Agile', 'SaaS'], posted: '1 day ago' },
]

const aiFeatures = [
  { icon: FileText, title: 'AI Resume Builder', desc: 'Auto-generate and enhance your resume with AI. Skills auto-update when you complete training courses.' },
  { icon: Target, title: 'Smart Job Matching', desc: 'AI-powered matching scores based on your skills, experience, and career preferences.' },
  { icon: Brain, title: 'AI Mock Interviews', desc: 'Practice with AI interviews and get real-time feedback on communication and technical skills.' },
  { icon: Zap, title: 'Skill Auto-Update', desc: 'Complete training and your skills are automatically updated across your profile and all resumes.' },
  { icon: BarChart3, title: 'AI Analytics', desc: 'Comprehensive analytics dashboard with AI-driven career insights and recommendations.' },
  { icon: GraduationCap, title: 'Training Hub', desc: 'Curated courses to upskill. AI recommends courses based on your career goals and market trends.' },
]

const testimonials = [
  { name: 'Priya M.', role: 'Software Engineer at Google', text: 'The AI mock interviews helped me land my dream job at a top tech company. The feedback was incredibly detailed!', rating: 5 },
  { name: 'Rahul K.', role: 'Data Scientist at Amazon', text: 'Skill auto-update is a game changer. Every course I complete automatically enhances my resume and profile.', rating: 5 },
  { name: 'Sneha R.', role: 'HR Director at TCS', text: 'As a corporate user, the AI matching saves us hours. We find better candidates faster than any other platform.', rating: 5 },
]

export function LandingPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register')
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchExp, setSearchExp] = useState('')

  const openRegister = () => { setAuthTab('register'); setAuthOpen(true) }
  const openLogin = () => { setAuthTab('login'); setAuthOpen(true) }

  return (
    <div className="min-h-screen bg-white">
      {/* ===== NAVBAR (Naukri-style blue top bar) ===== */}
      <nav className="sticky top-0 z-50 bg-[#4A90D9] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <ThreeBoxesLogo size={32} />
                <span className="text-xl font-bold text-white">3 Boxes <span className="text-yellow-300">Jobs</span></span>
              </div>
              <div className="hidden lg:flex items-center gap-5 text-sm text-white/90">
                <a href="#jobs" className="hover:text-white font-medium">Find Jobs</a>
                <a href="#companies" className="hover:text-white font-medium">Companies</a>
                <a href="#ai-features" className="hover:text-white font-medium">AI Features</a>
                <a href="#training" className="hover:text-white font-medium">Training</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10" onClick={openLogin}>
                Login
              </Button>
              <Button className="bg-[#FF8C00] hover:bg-[#E07B00] text-white font-semibold" onClick={openRegister}>
                Register Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} onSuccess={() => setAuthOpen(false)} />

      {/* ===== HERO SECTION (Naukri-style blue gradient + search) ===== */}
      <section className="relative bg-gradient-to-br from-[#4A90D9] via-[#3A7BC8] to-[#2C6AB5] pb-32 pt-8">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <motion.h1
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              Find Your Dream Job with <span className="text-yellow-300">AI-Powered</span> Precision
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-4 text-base sm:text-lg text-white/80"
            >
              Smart resumes, AI mock interviews, skill auto-updates & intelligent job matching — India&apos;s most advanced career platform
            </motion.p>
          </div>

          {/* ===== SEARCH BAR (Naukri-style multi-field) ===== */}
          <motion.div
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-2xl p-2 sm:p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Skills, Designations, Companies"
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-md"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Location (City, State)"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-md"
                  />
                </div>
                <div className="sm:w-36 relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Experience"
                    value={searchExp}
                    onChange={(e) => setSearchExp(e.target.value)}
                    className="pl-10 h-12 border-0 focus-visible:ring-0 text-base bg-gray-50 rounded-md"
                  />
                </div>
                <Button className="h-12 px-8 bg-[#4A90D9] hover:bg-[#3A7BC8] text-white font-semibold text-base rounded-md whitespace-nowrap"
                  onClick={openRegister}>
                  <Search className="h-5 w-5 mr-2" /> Search
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {['React', 'Python', 'AWS', 'Data Science', 'DevOps', 'Product Manager'].map(tag => (
                <button key={tag} className="px-3 py-1 text-sm bg-white/15 text-white/90 rounded-full hover:bg-white/25 transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10"
          >
            {[
              { label: 'Active Jobs', value: '10,000+' },
              { label: 'Companies', value: '5,000+' },
              { label: 'Candidates', value: '50,000+' },
              { label: 'AI Interviews', value: '1,000+' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-300">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 24C840 28 960 32 1080 30C1200 28 1320 20 1380 16L1440 12V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== JOB CATEGORIES (Naukri-style grid) ===== */}
      <section id="jobs" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Browse Jobs by Category</h2>
            <Button variant="ghost" className="text-[#4A90D9] text-sm font-semibold">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {jobCategories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ y: 15, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}
              >
                <Card className={`cursor-pointer hover:shadow-md transition-all border ${cat.color} group`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <cat.icon className="h-5 w-5 text-[#4A90D9]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{cat.label}</p>
                      <p className="text-xs text-gray-500">{cat.count} jobs</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED JOBS ===== */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Jobs</h2>
            <Button variant="ghost" className="text-[#4A90D9] text-sm font-semibold">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {featuredJobs.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ y: 15, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base hover:text-[#4A90D9] transition-colors">{job.title}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                          <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {job.salary}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.posted}</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-[#4A90D9]/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-[#4A90D9]" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TOP COMPANIES HIRING (Naukri-style logo strip) ===== */}
      <section id="companies" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Top Companies Hiring Now</h2>
            <p className="text-sm text-gray-500 mt-1">More than 5,000 companies trust 3 Boxes Jobs</p>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-3">
            {topCompanies.map((company, i) => (
              <motion.div
                key={company.name}
                initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                className="cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-100 hover:border-[#4A90D9]/30 hover:shadow-sm transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold text-[#4A90D9] group-hover:bg-[#4A90D9]/5 transition-colors">
                    {company.logo}
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight">{company.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI-POWERED FEATURES ===== */}
      <section id="ai-features" className="py-14 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-[#4A90D9]/10 text-[#4A90D9] mb-3 text-sm px-4 py-1">AI-Powered</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Makes 3 Boxes Jobs Different</h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-sm sm:text-base">Our AI doesn't just help you find jobs — it actively builds your career with smart skill updates, interview training, and personalized insights.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all border-gray-100 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-[#4A90D9]/10 flex items-center justify-center mb-4 group-hover:bg-[#4A90D9]/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-[#4A90D9]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (Split for Job Seeker / Employer) ===== */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Job Seekers */}
            <div className="bg-gradient-to-br from-[#4A90D9]/5 to-[#4A90D9]/10 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#4A90D9] flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Job Seekers</h3>
              </div>
              <div className="space-y-5">
                {[
                  { step: '1', title: 'Create Profile & AI Resume', desc: 'Build your AI-powered resume and complete your profile with skills and experience.' },
                  { step: '2', title: 'Train & Skills Auto-Update', desc: 'Take training courses to upskill. AI automatically updates your resume and profile skills.' },
                  { step: '3', title: 'AI Interview & Get Hired', desc: 'Practice with AI mock interviews, apply with confidence, and land your dream job.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#4A90D9] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6 w-full bg-[#4A90D9] hover:bg-[#3A7BC8] text-white font-semibold" onClick={openRegister}>
                Register as Job Seeker <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Employers */}
            <div className="bg-gradient-to-br from-[#FF8C00]/5 to-[#FF8C00]/10 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FF8C00] flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Employers</h3>
              </div>
              <div className="space-y-5">
                {[
                  { step: '1', title: 'Post Jobs with AI', desc: 'Create job postings with AI-optimized descriptions. Reach the right candidates faster.' },
                  { step: '2', title: 'Review AI-Matched Candidates', desc: 'Get AI-scored candidate matches. Filter by skills, experience, and AI match percentage.' },
                  { step: '3', title: 'Hire the Best Talent', desc: 'Schedule interviews, track applications, and hire top talent with AI-driven insights.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#FF8C00] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6 w-full bg-[#FF8C00] hover:bg-[#E07B00] text-white font-semibold" onClick={openRegister}>
                Register as Employer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRAINING SECTION ===== */}
      <section id="training" className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upskill with AI Training</h2>
              <p className="text-sm text-gray-500 mt-1">Complete courses and your skills are automatically updated on your resume</p>
            </div>
            <Button variant="ghost" className="text-[#4A90D9] text-sm font-semibold hidden sm:flex">
              View All Courses <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'React Advanced Patterns', level: 'Advanced', duration: '24 hrs', skills: 'React, TypeScript, Redux', rating: 4.9, enrolled: '2,500' },
              { title: 'Machine Learning with Python', level: 'Intermediate', duration: '40 hrs', skills: 'Python, TensorFlow, NLP', rating: 4.8, enrolled: '3,200' },
              { title: 'AWS Solutions Architect', level: 'Intermediate', duration: '36 hrs', skills: 'AWS, EC2, Lambda, S3', rating: 4.7, enrolled: '1,800' },
              { title: 'System Design for Engineers', level: 'Advanced', duration: '20 hrs', skills: 'System Design, Scalability', rating: 4.9, enrolled: '2,100' },
            ].map((course, i) => (
              <motion.div
                key={course.title}
                initial={{ y: 15, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs ${course.level === 'Advanced' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                        {course.level}
                      </Badge>
                      <span className="text-xs text-gray-400">{course.duration}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{course.skills}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">{course.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">{course.enrolled} enrolled</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Our Users Say</h2>
            <p className="text-gray-500 mt-2 text-sm">Trusted by 50,000+ professionals across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="h-full border-gray-100">
                  <CardContent className="p-6">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4A90D9]/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#4A90D9]">{t.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION (Naukri-style register banner) ===== */}
      <section className="bg-[#4A90D9] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to Accelerate Your Career?</h2>
              <p className="text-white/80 mt-2 text-sm sm:text-base">Join 50,000+ professionals. Register free and let AI power your job search.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-[#FF8C00] hover:bg-[#E07B00] text-white font-bold text-base px-8 h-12"
                onClick={openRegister}>
                Register Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base px-6 h-12"
                onClick={openLogin}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER (Naukri-style dark footer) ===== */}
      <footer className="bg-[#1A1A2E] text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <ThreeBoxesLogo size={24} />
                <span className="text-lg font-bold text-white">3 Boxes <span className="text-yellow-300">Jobs</span></span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">India&apos;s first AI-powered career platform with smart resume building, AI mock interviews, skill auto-updates, and intelligent job matching.</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Shield className="h-3.5 w-3.5" /> Your data is secure and private
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">AI Resume Builder</li>
                <li className="hover:text-white cursor-pointer transition-colors">Smart Job Search</li>
                <li className="hover:text-white cursor-pointer transition-colors">AI Mock Interviews</li>
                <li className="hover:text-white cursor-pointer transition-colors">Training Hub</li>
                <li className="hover:text-white cursor-pointer transition-colors">Skill Auto-Update</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">Post Jobs</li>
                <li className="hover:text-white cursor-pointer transition-colors">AI Candidate Matching</li>
                <li className="hover:text-white cursor-pointer transition-colors">Recruiter Tools</li>
                <li className="hover:text-white cursor-pointer transition-colors">Analytics Dashboard</li>
                <li className="hover:text-white cursor-pointer transition-colors">Pricing Plans</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-white cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>&copy; 2024 3 Boxes Jobs. All rights reserved. Powered by AI.</span>
            <span>Demo: seeker@3boxes.com / demo123</span>
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
      <rect x={2 * s} y={0} width={3 * s} height={3 * s} rx={0.5 * s} fill="#FF8C00" />
      <rect x={5.5 * s} y={0} width={3 * s} height={3 * s} rx={0.5 * s} fill="#4A90D9" />
      <rect x={3.75 * s} y={3.5 * s} width={3 * s} height={3 * s} rx={0.5 * s} fill="#2C6AB5" />
    </svg>
  )
}
