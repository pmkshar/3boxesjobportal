'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Target, Brain, BarChart3, Users, Globe, Award, Clock, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react'

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

const companyColors = [
  'bg-[#16a34a]', 'bg-[#34a853]', 'bg-[#f9ab00]', 'bg-[#d93025]',
  'bg-[#7c66ff]', 'bg-[#a55fff]', 'bg-[#00cc9a]', 'bg-[#2869fe]',
]

const getCompanyColor = (name?: string) => {
  if (!name) return companyColors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return companyColors[Math.abs(hash) % companyColors.length]
}

export function CorporatePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO BANNER ===== */}
      <section className="relative bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e] py-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 22v2h20v-2H0zm0 4v2h20v-2H0zm0 4v2h20v-2H0zm0 4v2h20v-2H0z\' fill=\'%23ffffff\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Badge className="bg-white/15 text-white border-0 rounded-full px-5 py-1.5 text-xs font-semibold mb-4">For Corporates & Employers</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Hire Smarter with <span className="text-green-300">AI-Powered</span> Recruitment
            </h1>
            <p className="text-green-100/80 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
              From startups to Fortune 500s — join India&apos;s top companies that trust 3 Boxes for faster, smarter, AI-driven hiring that delivers better candidates.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold px-8 h-12 text-base rounded-xl shadow-lg">
                <Building2 className="h-5 w-5 mr-2" /> Post a Job Free
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 text-base rounded-xl">
                <ArrowRight className="h-5 w-5 mr-2" /> See How It Works
              </Button>
            </div>
            {/* Stats row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white">
              {[
                { value: '500+', label: 'Companies' },
                { value: '50K+', label: 'Candidates' },
                { value: '70%', label: 'Faster Hiring' },
                { value: '95%', label: 'Satisfaction' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold">{stat.value}</div>
                  <div className="text-green-200/70 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SCROLLING COMPANY LOGOS ===== */}
      <section className="py-12 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Companies That <span className="text-[#16a34a]">Hire Through Us</span></h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">India&apos;s leading companies trust 3 Boxes Jobs for their hiring needs</p>
          </div>
          {/* Infinite Marquee */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="overflow-hidden">
              <div className="flex gap-6 animate-marquee whitespace-nowrap">
                {[...topCompanies, ...topCompanies, ...topCompanies].map((c, i) => (
                  <div key={`${c.name}-${i}`} className="flex-shrink-0 w-[130px] h-[70px] flex items-center justify-center rounded-xl border border-gray-100 bg-white hover:border-[#16a34a]/30 hover:bg-green-50 transition-all group shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg ${getCompanyColor(c.name)} flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform`}>
                        {c.logo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY CORPORATES CHOOSE 3 BOXES - INFOGRAPHIC WORKFLOW ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <motion.div initial={{ y: 10, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
              <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">Recruitment Workflow</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Why Corporates Choose <span className="text-[#16a34a]">3 Boxes</span></h2>
              <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Our AI-powered recruitment platform transforms every step of your hiring journey</p>
            </motion.div>
          </div>

          {/* Step-by-step workflow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Building2,
                title: 'Post Jobs Instantly',
                desc: 'Create job postings in minutes with AI-assisted job description generation. Reach thousands of qualified candidates immediately across our platform.',
                color: 'from-[#16a34a] to-[#15803d]',
              },
              {
                step: '02',
                icon: Target,
                title: 'AI Smart Matching',
                desc: 'Our AI engine analyzes skills, experience, and cultural fit to match you with the most relevant candidates — no more sifting through hundreds of irrelevant resumes.',
                color: 'from-[#34a853] to-[#16a34a]',
              },
              {
                step: '03',
                icon: Brain,
                title: 'AI Interview Insights',
                desc: 'Get AI-generated interview summaries, skill ratings, and culture-fit analysis before you even meet the candidate. Save 70% of screening time.',
                color: 'from-[#f9ab00] to-[#e9a000]',
              },
              {
                step: '04',
                icon: BarChart3,
                title: 'Analytics Dashboard',
                desc: 'Real-time hiring analytics — track application funnels, time-to-hire, candidate quality scores, and ROI on your job postings with actionable insights.',
                color: 'from-[#15803d] to-[#166534]',
              },
            ].map((item, i) => (
              <motion.div key={item.step}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connecting line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-12 -right-3 w-6">
                    <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                      <path d="M0 6L8 6L12 2L16 6L24 6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                      <circle cx="24" cy="6" r="2" fill="#16a34a" opacity="0.3" />
                    </svg>
                  </div>
                )}
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full group">
                  <CardContent className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                      {item.step}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
                      <item.icon className="h-5 w-5 text-[#16a34a]" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DETAILED BENEFITS ===== */}
      <section className="py-16 bg-[#f5f7fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Complete <span className="text-[#16a34a]">Hiring Solution</span></h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Everything you need to find, evaluate, and hire the best talent — powered by AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Reduce Time-to-Hire by 70%', desc: 'AI pre-screens and ranks candidates so you only interview the most qualified. Average time from posting to offer drops from 45 days to under 2 weeks.' },
              { icon: Target, title: 'Precision Candidate Matching', desc: 'Our AI evaluates 50+ data points per candidate — skills, experience, cultural fit, career trajectory — to deliver matches that traditional keyword searches miss entirely.' },
              { icon: Brain, title: 'AI Interview Intelligence', desc: 'Access AI-generated mock interview summaries before scheduling real interviews. See how candidates communicate, their technical depth, and problem-solving approach in advance.' },
              { icon: Users, title: 'Team Collaboration Tools', desc: 'Recruiters, HR managers, and interviewers share a unified pipeline. Add notes, rate candidates, schedule interviews, and make collective hiring decisions in real-time.' },
              { icon: BarChart3, title: 'Hiring Analytics & Insights', desc: 'Track every metric that matters — application sources, funnel conversion rates, time-per-stage, candidate quality scores, and hiring ROI — all in one beautiful dashboard.' },
              { icon: Globe, title: 'Unlimited Job Postings', desc: 'Post as many jobs as you need across all categories. Our AI optimizes each posting for visibility and helps you reach passive candidates who match your requirements perfectly.' },
            ].map((benefit, i) => (
              <motion.div key={i}
                initial={{ y: 15, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-sm h-full hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-[#16a34a]" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mb-2">{benefit.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Transform Your Hiring?</h2>
          <p className="text-green-100/80 mt-3 text-base max-w-xl mx-auto">Join 500+ companies that have already streamlined their recruitment with 3 Boxes AI-powered platform. Start posting jobs for free today.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold px-8 h-12 text-base rounded-xl shadow-lg">
              <Building2 className="h-5 w-5 mr-2" /> Register Your Company
            </Button>
            <p className="text-green-200/70 text-sm">Free to post. Pay only when you hire.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
