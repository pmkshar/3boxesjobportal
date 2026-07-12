'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap, Target, Award, TrendingUp, Brain, BookOpen, Cpu, Trophy,
  GraduationCap, Rocket, CheckCircle2, ArrowRight, Star, Clock, Users, BarChart3,
} from 'lucide-react'

export function TrainingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO BANNER ===== */}
      <section className="relative bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e] py-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 22v2h20v-2H0zm0 4v2h20v-2H0zm0 4v2h20v-2H0zm0 4v2h20v-2H0z\' fill=\'%23ffffff\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Badge className="bg-white/15 text-white border-0 rounded-full px-5 py-1.5 text-xs font-semibold mb-4">
              <GraduationCap className="h-3.5 w-3.5 mr-1" /> Upskill & Get Hired Faster
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Training That <span className="text-green-300">Auto-Updates</span> Your Profile
            </h1>
            <p className="text-green-100/80 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
              Our integrated training portal — MarqAI Trainers — offers industry-aligned courses designed to bridge the skill gap. Every course you complete automatically updates your skills across your 3 Boxes profile and resume.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a href="https://marqaitrainers.vercel.app/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold px-8 h-12 text-base rounded-xl shadow-lg">
                  <GraduationCap className="h-5 w-5 mr-2" /> Explore Training Portal
                </Button>
              </a>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 text-base rounded-xl">
                <Rocket className="h-5 w-5 mr-2" /> Sign Up Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== BENEFITS SECTION ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Training Benefits */}
            <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">Why Train With Us</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                Complete a Course, <span className="text-[#16a34a]">Boost Your Career</span> Automatically
              </h2>
              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                Unlike standalone learning platforms, 3 Boxes training is deeply integrated with your career profile. Every skill you learn immediately enhances your visibility to employers, improves your AI match scores, and updates across all your resumes — zero manual work required.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { icon: Zap, title: 'Skills Auto-Update', desc: 'Complete a course and your profile, resume, and job match scores update instantly — no manual entry needed.' },
                  { icon: Target, title: 'Industry-Aligned Curriculum', desc: 'Courses designed with industry input so you learn exactly what employers are looking for in current job markets.' },
                  { icon: Award, title: 'Verified Certificates', desc: 'Earn certificates that are displayed on your profile and visible to recruiters, giving you a competitive edge.' },
                  { icon: TrendingUp, title: 'Higher Match Scores', desc: 'More verified skills = higher AI match scores = more interview calls. Training directly boosts your visibility.' },
                  { icon: Brain, title: 'AI-Recommended Courses', desc: 'Our AI analyzes your profile and career goals to recommend the exact courses that will maximize your career growth.' },
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-5 w-5 text-[#16a34a]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{benefit.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://marqaitrainers.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-6 h-11 rounded-xl shadow-md">
                    <GraduationCap className="h-5 w-5 mr-2" /> Explore Training Portal
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Right - Infographic Workflow */}
            <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-[#16a34a] to-[#15803d] p-6 text-center relative">
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                    <GraduationCap className="h-10 w-10 text-white mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">Training → Profile → Job</h3>
                    <p className="text-green-100/80 text-xs mt-1">See how training transforms your career journey</p>
                  </div>

                  {/* Workflow Steps */}
                  <div className="p-6 space-y-0">
                    {[
                      { step: '1', icon: BookOpen, title: 'Enroll in a Course', desc: 'Choose from industry-aligned courses on MarqAI Trainers', color: 'bg-[#16a34a]', line: true },
                      { step: '2', icon: Cpu, title: 'Learn & Complete', desc: 'Interactive lessons with hands-on projects and assessments', color: 'bg-[#34a853]', line: true },
                      { step: '3', icon: Zap, title: 'Skills Auto-Update', desc: 'Your 3 Boxes profile & resume update automatically with new skills', color: 'bg-[#f9ab00]', line: true },
                      { step: '4', icon: Target, title: 'Higher Match Scores', desc: 'AI re-calculates your job match scores — higher visibility to employers', color: 'bg-[#15803d]', line: true },
                      { step: '5', icon: Trophy, title: 'Get Interview Calls', desc: 'More matches = more interviews = faster hiring', color: 'bg-[#166534]', line: false },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                              {item.step}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4 text-[#16a34a]" />
                              <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        {item.line && (
                          <div className="flex ml-[22px] my-2">
                            <div className="w-0.5 h-6 bg-gradient-to-b from-[#16a34a]/40 to-[#16a34a]/10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== COURSE CATEGORIES ===== */}
      <section className="py-16 bg-[#f5f7fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-green-50 text-[#16a34a] border-green-200 rounded-full px-4 py-1 text-xs font-semibold mb-3">Popular Categories</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Train In <span className="text-[#16a34a]">High-Demand Skills</span></h2>
            <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Industry-aligned courses designed to bridge the skill gap and boost your employability</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Web Development', desc: 'React, Node.js, TypeScript, and full-stack development courses with hands-on projects and real-world assignments.', count: '25+ Courses', color: 'from-[#16a34a] to-[#15803d]' },
              { icon: Brain, title: 'Data Science & AI', desc: 'Python, Machine Learning, Deep Learning, NLP, and data analytics courses designed for all skill levels from beginner to advanced.', count: '18+ Courses', color: 'from-[#f9ab00] to-[#e9a000]' },
              { icon: Cpu, title: 'Cloud & DevOps', desc: 'AWS, Azure, Docker, Kubernetes, CI/CD pipelines, and infrastructure automation courses for modern engineering teams.', count: '15+ Courses', color: 'from-[#34a853] to-[#16a34a]' },
              { icon: Users, title: 'Soft Skills', desc: 'Communication, leadership, project management, and interview preparation courses that round out your professional profile.', count: '12+ Courses', color: 'from-[#15803d] to-[#166534]' },
            ].map((cat, i) => (
              <motion.div key={i}
                initial={{ y: 15, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-sm h-full hover:shadow-lg transition-all group overflow-hidden">
                  <div className={`bg-gradient-to-br ${cat.color} p-5 text-center relative`}>
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")'}} />
                    <cat.icon className="h-8 w-8 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-white text-base">{cat.title}</h3>
                    <Badge className="bg-white/20 text-white border-0 rounded-full px-3 py-0.5 text-[10px] mt-1">{cat.count}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{cat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, value: '70+', label: 'Courses Available', color: 'text-[#16a34a]' },
              { icon: Users, value: '10K+', label: 'Learners Enrolled', color: 'text-[#34a853]' },
              { icon: Award, value: '95%', label: 'Completion Rate', color: 'text-[#f9ab00]' },
              { icon: TrendingUp, value: '3X', label: 'More Interview Calls', color: 'text-[#15803d]' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-[#f5f7fc]">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 bg-gradient-to-br from-[#166534] via-[#15803d] to-[#22c55e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Start Learning Today on MarqAI Trainers</h2>
          <p className="text-green-100/80 mt-3 text-base max-w-xl mx-auto">Every course you complete makes your profile stronger, your match scores higher, and your career opportunities broader. Start now — it&apos;s free.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href="https://marqaitrainers.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-400 hover:bg-green-300 text-green-900 font-bold px-8 h-12 text-base rounded-xl shadow-lg">
                <GraduationCap className="h-5 w-5 mr-2" /> Open Training Portal
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
