'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Bot, Database, Sparkles, TrendingUp, Zap, Layers, MousePointer2 } from 'lucide-react'
import LoginModal from '@/components/auth/LoginModal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh selection:bg-vivid-red/20 overflow-x-hidden">
      
      {/* Narrative Section 1: The Weight of Noise */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 pt-20 overflow-hidden">
        {/* Abstract Light Glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-electric-purple/5 rounded-full blur-[120px] -mr-96 -mt-96 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-vivid-red/5 rounded-full blur-[100px] -ml-64 -mb-64 opacity-30"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <header className="flex items-center justify-between mb-24 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="text-3xl font-heading font-extrabold tracking-tighter flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-vivid-red to-vivid-purple flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </span>
              Datawiser
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-white/80 border border-black/5 hover:bg-white text-sm font-bold transition-all shadow-sm"
              >
                Log In
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-vivid-red text-white hover:scale-105 active:scale-95 text-sm font-bold transition-all shadow-xl shadow-vivid-red/10"
              >
                Sign Up
              </button>
            </div>
          </header>

          <div className="max-w-4xl animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vivid-red/10 text-vivid-red text-xs font-black mb-8 uppercase tracking-widest border border-vivid-red/20">
              <span className="w-1.5 h-1.5 rounded-full bg-vivid-red animate-pulse"></span>
              The era of spreadsheets is over
            </div>
            
            <h1 className="text-6xl md:text-8xl font-heading font-black leading-[0.95] mb-10 tracking-tighter text-foreground">
              Data is <span className="opacity-20 italic">Chaos.</span><br/>
              Decision is <span className="text-gradient-vivid">Everything.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/50 mb-12 max-w-2xl font-medium leading-relaxed">
              Your business speaks a thousand languages through data. Most of it is noise. We translated the chaos into a vivid story of growth.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative px-10 py-5 rounded-2xl bg-vivid-red text-white font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-vivid-red/10 flex items-center"
              >
                Start Your Story
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#narrative"
                className="px-10 py-5 rounded-2xl bg-white/50 border border-black/5 font-bold text-foreground/60 hover:text-foreground transition-all flex items-center gap-2"
              >
                Watch the Transition
              </a>
            </div>
          </div>
        </div>

        {/* Floating Preview (Polished for Light Mode) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block pr-24 w-1/3 animate-in fade-in zoom-in duration-1000 delay-300">
          <div className="relative">
            <div className="w-64 h-80 rounded-[40px] glass-panel p-6 rotate-12 absolute -right-20 -top-20 z-0 opacity-20 border-black/5 shadow-none"></div>
            <div className="w-72 h-96 rounded-[40px] glass-panel p-8 border-black/5 -rotate-6 relative z-10 shadow-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-vivid-rose/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-vivid-rose" />
                </div>
                <div className="flex-1 h-3 rounded-full bg-black/[0.03]"></div>
              </div>
              <div className="space-y-4">
                <div className="w-full h-4 rounded-full bg-black/[0.02]"></div>
                <div className="w-[80%] h-4 rounded-full bg-black/[0.02]"></div>
                <div className="w-full h-32 rounded-3xl bg-gradient-to-br from-vivid-red/10 to-vivid-purple/5 mt-10 flex items-end p-4">
                  <div className="flex gap-2 w-full items-end h-full">
                    <div className="h-full w-1/4 bg-vivid-red/20 rounded-t-lg"></div>
                    <div className="h-[60%] w-1/4 bg-vivid-red/20 rounded-t-lg"></div>
                    <div className="h-[85%] w-1/4 bg-vivid-red/20 rounded-t-lg"></div>
                    <div className="h-[40%] w-1/4 bg-vivid-red/20 rounded-t-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Transformation */}
      <section id="narrative" className="py-32 px-6 bg-soft-slate/50 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-vivid-rose font-black tracking-widest text-xs uppercase mb-4 block">The Catalyst</span>
              <h2 className="text-5xl font-heading font-black mb-8 leading-none tracking-tighter">
                From Raw Data to <br/>
                <span className="text-gradient-vivid italic">Pure Wisdom.</span>
              </h2>
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-black/5 shadow-sm">
                    <Database className="w-6 h-6 text-vivid-rose" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">The Intake</h4>
                    <p className="text-foreground/40 font-medium">Throw your CSVs and Excels at us. We ingest the complexity so you don't have to think about it.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-black/5 shadow-sm">
                    <Sparkles className="w-6 h-6 text-vivid-red" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">The Alchemy</h4>
                    <p className="text-foreground/40 font-medium">Our AI profiles every row, finding patterns that human eyes miss in a sea of numbers.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-black/5 shadow-sm">
                    <Bot className="w-6 h-6 text-vivid-purple" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">The Dialogue</h4>
                    <p className="text-foreground/40 font-medium">Don't search for answers. Ask for them. Converse with your data as if it were your smartest analyst.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-vivid-red/10 via-transparent to-vivid-rose/10 blur-[100px] opacity-40"></div>
              <div className="relative glass-panel rounded-[40px] p-2 border-white shadow-3xl overflow-hidden aspect-[4/5] flex flex-col">
                <div className="p-6 border-b border-black/[0.03] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Neural Link Preview</div>
                </div>
                <div className="flex-1 p-10 flex flex-col justify-center gap-8">
                  <div className="w-full h-10 rounded-2xl bg-black/[0.02] flex items-center px-4">
                    <div className="w-1/3 h-2 rounded-full bg-vivid-red/30"></div>
                  </div>
                  <div className="w-full h-10 rounded-2xl bg-black/[0.02] flex items-center px-4">
                    <div className="w-2/3 h-2 rounded-full bg-black/5"></div>
                  </div>
                  <div className="w-full h-48 rounded-3xl border border-black/[0.03] bg-soft-slate/30 relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center animate-bounce">
                        <Bot className="w-8 h-8 text-vivid-red" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="w-full h-3 rounded-full bg-black/[0.02]"></div>
                    <div className="w-[80%] h-3 rounded-full bg-black/[0.02]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Call to Wisdom */}
      <section className="py-40 px-6 relative text-center">
        <div className="container mx-auto max-w-4xl relative z-10">
          <h2 className="text-5xl md:text-7xl font-heading font-black mb-10 tracking-tight text-foreground">
            See the future <br/>
            <span className="text-gradient-vivid italic">Clearly.</span>
          </h2>
          <p className="text-xl text-foreground/40 mb-12 max-w-2xl mx-auto font-medium">
            Join forward-thinking businesses who have mastered the art of listening to their data.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-12 py-6 rounded-2xl bg-foreground text-white font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Open Datawiser
          </button>
        </div>
      </section>

      <footer className="py-20 border-t border-black/5 text-center">
         <div className="container mx-auto px-6">
            <p className="text-foreground/20 text-[10px] font-black tracking-[0.4em] uppercase">
              © 2026 Datawiser Ecosystem. Built for the light.
            </p>
         </div>
      </footer>

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
