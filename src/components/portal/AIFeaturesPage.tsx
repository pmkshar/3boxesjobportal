'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, Building2, Shield, FileText, Brain, Target, Zap,
  BarChart3, CheckCircle2, MessageSquare, PieChart, Award,
  ArrowRight, Sparkles, Cpu, Lightbulb,
} from 'lucide-react'

export function AIFeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO BANNER ===== */}
      <section className="relative bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e] py-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 22v2h20v-2H0zm0 4v2h20v-2H0zm0 4v2h20v-2H0zm0 4v2h20v-2H0z\' fill=\'%23ffffff\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Badge className="bg-white/15 text-white border-0 rounded-full px-5 py-1.5 text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> AI-Powered Platform
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Built-In <span className="text-green-300">AI Features</span> for Every User
            </h1>
            <p className="text-green-100/80 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
              Not just a job board — 3 Boxes is an intelligent career platform with AI tools designed for job seekers, recruiters, HR managers, and interviewers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES BY USER TYPE ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">Tailored AI Tools</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">AI Features <span className="text-[#16a34a]">For Your Role</span></h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Each user type gets purpose-built AI tools to maximize their career or hiring outcomes</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Seekers */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-sm h-full overflow-hidden">
                <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <Users className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">For Job Seekers</h3>
                  <p className="text-green-100/80 text-xs mt-1">Smart tools to land your dream job</p>
                </div>
                <CardContent className="p-5 space-y-4">
                  {[
                    { icon: FileText, title: 'AI Resume Builder', desc: 'Auto-generate polished resumes with AI. Skills update automatically when you complete training courses.' },
                    { icon: Brain, title: 'AI Mock Interviews', desc: 'Practice interviews with AI and get real-time feedback on communication, technical depth, and confidence.' },
                    { icon: Target, title: 'Smart Job Matching', desc: 'AI calculates your match score with every job based on skills, experience, and career preferences.' },
                    { icon: Zap, title: 'Skill Auto-Update', desc: 'Complete a training course and your skills automatically update across your profile and all resumes.' },
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-[#16a34a]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Corporates & Recruiters */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-sm h-full overflow-hidden">
                <div className="bg-gradient-to-br from-[#f9ab00] to-[#e9a000] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <Building2 className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">For Corporates & Recruiters</h3>
                  <p className="text-amber-100/80 text-xs mt-1">Hire smarter, faster with AI</p>
                </div>
                <CardContent className="p-5 space-y-4">
                  {[
                    { icon: Target, title: 'AI Candidate Matching', desc: 'AI ranks candidates by skill match, experience relevance, and cultural fit — shortlist in seconds, not days.' },
                    { icon: Brain, title: 'AI Interview Insights', desc: 'Get AI-generated summaries and skill ratings from mock interviews before scheduling real interviews.' },
                    { icon: BarChart3, title: 'Hiring Analytics', desc: 'Real-time dashboards with application funnels, time-to-hire, source quality, and AI-driven hiring predictions.' },
                    { icon: Users, title: 'Team Collaboration', desc: 'Recruiters, HR managers, and interviewers collaborate on a shared pipeline with role-based access and notes.' },
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-[#f9ab00]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Interviewers & Admins */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-sm h-full overflow-hidden">
                <div className="bg-gradient-to-br from-[#15803d] to-[#166534] p-6 text-center relative">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                  <Shield className="h-8 w-8 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">For Interviewers & Admins</h3>
                  <p className="text-green-100/80 text-xs mt-1">Streamlined evaluation tools</p>
                </div>
                <CardContent className="p-5 space-y-4">
                  {[
                    { icon: MessageSquare, title: 'Interview Scheduling', desc: 'AI suggests optimal time slots based on interviewer and candidate availability. Automated reminders included.' },
                    { icon: CheckCircle2, title: 'Structured Evaluation', desc: 'Pre-built rubrics and scorecards for technical, behavioral, and cultural-fit assessments. Standardize your hiring.' },
                    { icon: PieChart, title: 'Admin Dashboard', desc: 'Full platform control — manage users, jobs, applications, and analytics from a single powerful admin panel.' },
                    { icon: Award, title: 'Quality Scoring', desc: 'AI generates candidate quality scores combining resume data, interview performance, and skill assessments.' },
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-[#16a34a]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== AI WORKFLOW INFOGRAPHIC ===== */}
      <section className="py-16 bg-[#f5f7fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">AI Workflow</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How <span className="text-[#16a34a]">AI</span> Powers Your Hiring Journey</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">From resume parsing to confident hiring decisions — AI transforms every step</p>
          </div>

          {/* Horizontal workflow */}
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0 justify-center">
            {[
              { icon: FileText, label: 'AI Resume Scan', desc: 'Instant parsing & scoring', color: 'bg-[#16a34a]' },
              { icon: Target, label: 'Smart Matching', desc: 'Skill-fit algorithms', color: 'bg-[#34a853]' },
              { icon: Brain, label: 'AI Interview', desc: 'Automated screening', color: 'bg-[#f9ab00]' },
              { icon: BarChart3, label: 'Quality Score', desc: 'Data-driven ranking', color: 'bg-[#15803d]' },
              { icon: CheckCircle2, label: 'Hire the Best', desc: 'Confident decisions', color: 'bg-[#166534]' },
            ].map((step, i) => (
              <motion.div key={step.label} className="flex items-center"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center text-white shadow-md`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-gray-900 text-xs mt-2">{step.label}</p>
                  <p className="text-[10px] text-gray-500">{step.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden lg:flex items-center mx-2">
                    <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                      <path d="M0 6L12 6L16 2L20 6L24 2L28 6L40 6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                      <circle cx="40" cy="6" r="3" fill="#16a34a" opacity="0.4" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Detailed feature breakdown */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-sm h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center">
                      <Cpu className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">AI Matching Engine</h3>
                      <p className="text-xs text-gray-500">Our core intelligence layer</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    The 3 Boxes AI engine processes over 50 data points per candidate including technical skills, experience depth, project relevance, career trajectory, location preferences, and cultural fit indicators. It continuously learns from hiring outcomes to improve matching accuracy over time.
                  </p>
                  <div className="space-y-2">
                    {['Multi-dimensional skill scoring', 'Experience relevance weighting', 'Cultural fit analysis', 'Career trajectory prediction', 'Real-time score updates'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#16a34a] flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-sm h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f9ab00] to-[#e9a000] flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">AI Interview Intelligence</h3>
                      <p className="text-xs text-gray-500">Smart evaluation & feedback</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    Our AI conducts structured mock interviews with realistic questions tailored to each job role. It evaluates communication clarity, technical accuracy, problem-solving approach, and confidence levels — providing detailed feedback that helps candidates improve and helps employers pre-screen effectively.
                  </p>
                  <div className="space-y-2">
                    {['Role-specific question generation', 'Communication analysis & scoring', 'Technical depth evaluation', 'Real-time behavioral feedback', 'Comprehensive interview reports'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#f9ab00] flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Experience AI-Powered Hiring Today</h2>
          <p className="text-green-100/80 mt-3 text-base max-w-xl mx-auto">Whether you&apos;re a job seeker looking for your next role or an employer seeking top talent — our AI tools are ready for you.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold px-8 h-12 text-base rounded-xl shadow-lg">
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
