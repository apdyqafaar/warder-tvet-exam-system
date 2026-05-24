"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  GraduationCap, BookOpen, ClipboardCheck, Users, Award,
  ChevronRight, Zap, Globe, ShieldCheck, BarChart3, FileText,
  Clock, CheckCircle2, ArrowRight, Star, MapPin, Phone, Mail,
  TrendingUp, Lock, Cpu, Network, Layers, Target,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   KEYFRAMES
───────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

* { font-family: 'Plus Jakarta Sans', sans-serif; }
.mono { font-family: 'JetBrains Mono', monospace; }

@keyframes fadeUp   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes slideInL { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
@keyframes slideInR { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
@keyframes scaleIn  { from { opacity:0; transform:scale(0.88); } to { opacity:1; transform:scale(1); } }
@keyframes pulse2   { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.5;transform:scale(1.4);} }
@keyframes ticker   { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
@keyframes gridMove { 0%{background-position:0 0;} 100%{background-position:60px 60px;} }
@keyframes borderSpin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
@keyframes countUp  { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
@keyframes shimmer  { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
@keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }

.animate-fadeUp   { animation: fadeUp   0.7s ease both; }
.animate-fadeIn   { animation: fadeIn   0.6s ease both; }
.animate-slideInL { animation: slideInL 0.7s ease both; }
.animate-slideInR { animation: slideInR 0.7s ease both; }
.animate-scaleIn  { animation: scaleIn  0.6s ease both; }
.animate-float    { animation: float 4s ease-in-out infinite; }

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
.delay-600 { animation-delay: 0.6s; }

.ticker-wrap { overflow:hidden; }
.ticker-track { display:flex; animation: ticker 28s linear infinite; white-space:nowrap; }
.ticker-track:hover { animation-play-state:paused; }

.grid-bg {
  background-image: linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridMove 8s linear infinite;
}

.shimmer-text {
  background: linear-gradient(90deg, currentColor 0%, rgba(255,255,255,0.8) 50%, currentColor 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}

.card-shine {
  position: relative;
  overflow: hidden;
}
.card-shine::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.card-shine:hover::before { opacity: 1; }

.line-draw {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  transition: stroke-dashoffset 1.2s ease;
}
.in-view .line-draw { stroke-dashoffset: 0; }

/* Scroll reveal */
.reveal { opacity:0; transform:translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
.reveal.visible { opacity:1; transform:translateY(0); }
.reveal-left { opacity:0; transform:translateX(-30px); transition: opacity 0.7s ease, transform 0.7s ease; }
.reveal-left.visible { opacity:1; transform:translateX(0); }
.reveal-right { opacity:0; transform:translateX(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
.reveal-right.visible { opacity:1; transform:translateX(0); }
.reveal-scale { opacity:0; transform:scale(0.9); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal-scale.visible { opacity:1; transform:scale(1); }
`;

/* ─────────────────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1800;
        const step = Math.ceil(end / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(start);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────── */
const features = [
  { icon: ClipboardCheck, title: "AI-Assisted Exams",       desc: "Intelligent question banks adapt to curriculum changes. Auto-grading, instant scoring, and detailed per-student breakdowns." },
  { icon: Users,          title: "Three-Tier Roles",        desc: "Students, teachers, and admins each get purpose-built dashboards. Nothing extra, nothing missing." },
  { icon: ShieldCheck,    title: "Exam Integrity",          desc: "Session locking, IP logging, and role-based access keep every assessment honest and auditable." },
  { icon: Award,          title: "TVET Competency Aligned", desc: "Question tagging maps directly to Ethiopia's national occupational standards — no manual alignment needed." },
  { icon: Globe,          title: "Region-Wide Access",      desc: "Runs on any device with a browser. Remote centers in the Somali Region can participate without special hardware." },
  { icon: Zap,            title: "Zero-Delay Results",      desc: "Grades, percentages, and performance charts are ready the second an exam is submitted." },
  { icon: BarChart3,      title: "Analytics Dashboard",     desc: "Track cohort performance over time, spot weak topics, and export reports for regional bureau reviews." },
  { icon: FileText,       title: "Question Bank",           desc: "Build a reusable library of vetted questions organized by program, level, and competency unit." },
  { icon: Lock,           title: "Offline-Safe Sessions",   desc: "In-progress exams survive brief connectivity drops. Students never lose work due to network hiccups." },
];

const stats = [
  { value: 500,  suffix: "+", label: "Registered Students",  icon: Users },
  { value: 30,   suffix: "+", label: "Expert Teachers",      icon: GraduationCap },
  { value: 20,   suffix: "+", label: "Programs Offered",     icon: BookOpen },
  { value: 100,  suffix: "%", label: "Digital Examinations", icon: Cpu },
];

const programs = [
  { name: "Automotive Technology", level: "Level I–IV" },
  { name: "Construction",          level: "Level I–III" },
  { name: "ICT",                   level: "Level I–IV" },
  { name: "Electrical",            level: "Level I–IV" },
  { name: "Textile & Garment",     level: "Level I–III" },
  { name: "Health Science",        level: "Level I–III" },
];

const timeline = [
  { year: "2010", title: "College Founded",      desc: "Warder TVET College established under the Somali Regional State Education Bureau." },
  { year: "2015", title: "Cooperative Model",    desc: "Adopted Ethiopia's 70/30 cooperative training model, deepening industry partnerships." },
  { year: "2019", title: "Digital Transition",   desc: "First cohort assessed using electronic question banks. Manual paper exams phased out." },
  { year: "2022", title: "Platform Launch",      desc: "Full online examination system deployed across all programs and departments." },
  { year: "2024", title: "500+ Students Online", desc: "Platform scaled to serve the entire student body with real-time analytics and reporting." },
  { year: "2025", title: "Regional Expansion",   desc: "Onboarding partner TVET centers across the Somali Region onto the shared platform." },
];

const howItWorks = [
  { step: "01", icon: Target,    title: "Enter Your ID",       desc: "Students log in with their assigned student ID — no passwords, no confusion, no wasted time before an exam." },
  { step: "02", icon: Layers,    title: "Start the Exam",      desc: "The system loads your assigned exam, starts the timer, and guides you through question by question." },
  { step: "03", icon: CheckCircle2, title: "Submit & Score",   desc: "One click to submit. Your score, breakdown by topic, and any instructor notes are shown instantly." },
  { step: "04", icon: TrendingUp, title: "Track Progress",     desc: "Students and teachers see a full history of results. Patterns become visible, interventions become possible." },
];

const testimonials = [
  { name: "Abdullahi Hassan",  role: "ICT Student, Level III",          text: "Before this platform, we'd wait two weeks for results. Now I know how I did before I leave the building." },
  { name: "Faadumo Warsame",   role: "Automotive Technology Teacher",   text: "Building a question bank used to mean piles of printed papers. Now it's organized, searchable, and reusable every semester." },
  { name: "Ismail Abdi",       role: "Department Head, Construction",   text: "The analytics actually tell me which competency units students are struggling with. That changes how I plan my lessons." },
];

const tickerItems = [
  "Warder TVET College", "Somali Regional State", "Digital Examinations",
  "Competency Certifications", "Technical Education", "500+ Students",
  "Ethiopia TVET Framework", "Industry-Ready Graduates",
];

/* ─────────────────────────────────────────────────────
   HEADER
───────────────────────────────────────────────────── */
function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl z-50 rounded-2xl transition-all duration-500 ${
      scrolled ? "bg-stone-50/95 backdrop-blur-xl shadow-lg shadow-stone-200/60 border border-stone-200" : "bg-stone-100/50 backdrop-blur-sm border border-stone-200/40"
    }`}>
      <div className="flex items-center justify-between h-[68px] px-5 gap-4">
        <Link href="/" className="flex items-center gap-3 no-underline shrink-0 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shrink-0 group-hover:scale-105 transition-transform">
            <GraduationCap size={18} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-stone-800 tracking-tight">Warder TVET</span>
            <span className="mono text-[9px] font-semibold text-stone-400 uppercase tracking-[0.15em]">College · EST 2010</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {[["About","#about"],["Features","#features"],["Programs","#programs"],["How It Works","#howitworks"]].map(([label, href]) => (
            <a key={label} href={href} className="px-3.5 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 rounded-lg transition-all">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <Link href="/dashboard" className="hidden sm:block px-3.5 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 rounded-lg transition-all no-underline">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/sign-in" className="hidden sm:block px-3.5 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 rounded-lg transition-all no-underline">
              Sign In
            </Link>
          )}
          <Link href="/exam/onboard-examinees" className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:opacity-90 rounded-xl transition-all no-underline shadow-sm shadow-primary/30">
            <Zap size={13} strokeWidth={2.5} />Go to Exam
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────
   TICKER
───────────────────────────────────────────────────── */
function Ticker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="ticker-wrap border-y border-stone-200 bg-stone-50 py-3">
      <div className="ticker-track">
        {items.map((t, i) => (
          <span key={i} className="mono text-xs font-semibold text-stone-400 uppercase tracking-widest mx-8 shrink-0">
            <span className="text-primary mr-3">◆</span>{t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-16 px-6 bg-stone-100 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-stone-200/80 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-stone-200/60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/10 pointer-events-none" />

      {/* Floating accent dot */}
      <div className="absolute top-1/3 right-[15%] w-3 h-3 rounded-full bg-primary/40 animate-float pointer-events-none" />
      <div className="absolute bottom-1/3 left-[12%] w-2 h-2 rounded-full bg-primary/30 animate-float pointer-events-none" style={{animationDelay:"1.5s"}} />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center gap-8">

        {/* Live badge */}
        <div className="animate-fadeIn flex items-center gap-2.5 px-4 py-2 rounded-full bg-stone-50 border border-stone-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" style={{animation:"pulse2 2s ease infinite"}} />
          <span className="mono text-xs font-semibold text-stone-500 uppercase tracking-widest">Somali Region · Ethiopia · Est. 2010</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fadeUp delay-100 text-5xl md:text-7xl font-black text-stone-900 leading-[1.04] tracking-tight">
          The future of<br />
          <span className="text-primary relative">
            technical education
            <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 400 12" fill="none">
              <path d="M2 10 Q100 2 200 8 Q300 14 398 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" className="line-draw in-view" />
            </svg>
          </span>
          <br />is already here.
        </h1>

        {/* Sub */}
        <p className="animate-fadeUp delay-200 text-xl text-stone-500 max-w-2xl leading-relaxed">
          Warder TVET College's official digital examination platform — built for students,
          teachers, and administrators across the Somali Regional State of Ethiopia.
          Secure, real-time, and aligned with national competency standards.
        </p>

        {/* CTA row */}
        <div className="animate-fadeUp delay-300 flex items-center gap-3 flex-wrap justify-center">
          <Link href="/exam/onboard-examinees" className="group flex items-center gap-2.5 px-7 py-3.5 text-base font-bold text-white bg-primary hover:opacity-90 rounded-2xl transition-all no-underline shadow-md shadow-primary/25">
            <Zap size={17} strokeWidth={2.5} />
            Go to Exam Portal
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/auth/sign-in" className="flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-2xl transition-all no-underline">
            Sign In to Dashboard
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Trust line */}
        <p className="animate-fadeUp delay-400 mono text-xs text-stone-400 uppercase tracking-widest flex items-center gap-2">
          <CheckCircle2 size={13} className="text-emerald-500" />
          Certified · National Standards · Trusted by 500+ students
        </p>

        {/* Stats row */}
        <div className="animate-fadeUp delay-500 w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-10 border-t border-stone-200">
          {stats.map(({ value, suffix, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-primary/30 hover:shadow-sm transition-all">
              <Icon size={18} className="text-primary mb-1" />
              <span className="text-3xl font-black text-stone-900 tabular-nums leading-none">
                <Counter end={value} suffix={suffix} />
              </span>
              <span className="mono text-[10px] font-semibold text-stone-400 uppercase tracking-wider text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   ABOUT
───────────────────────────────────────────────────── */
function About() {
  useReveal();
  return (
    <section id="about" className="bg-stone-50 py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="reveal-left">
            <span className="mono text-xs font-bold uppercase tracking-widest text-primary block mb-4">About the College</span>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight tracking-tight mb-6">
              Warder Polytechnic<br />
              <span className="text-primary">TVET College</span>
            </h2>
            <p className="text-stone-500 leading-relaxed mb-4 text-base">
              We're a Technical and Vocational Education and Training institution in the
              Somali Regional State of Ethiopia. Founded in 2010, we've grown into the
              region's leading center for hands-on technical skills development.
            </p>
            <p className="text-stone-500 leading-relaxed mb-5 text-base">
              Our cooperative training model is{" "}
              <strong className="text-stone-800 font-bold">70% practical</strong> and{" "}
              <strong className="text-stone-800 font-bold">30% theoretical</strong> — because graduates are
              assessed on what they can actually do, not just what they can recall.
            </p>
            <p className="text-stone-500 leading-relaxed mb-7 text-base">
              Competency certifications are issued in partnership with the Somali Regional
              State Education, Vocational, Technical and Science Bureau — recognized
              nationally under the Ethiopian TVET framework.
            </p>

            {/* Mini metrics */}
            <div className="flex gap-6 flex-wrap">
              {[["15+", "Years Operating"], ["6", "Departments"], ["95%", "Employment Rate"]].map(([v, l]) => (
                <div key={l} className="flex flex-col gap-0.5">
                  <span className="text-2xl font-black text-primary">{v}</span>
                  <span className="mono text-xs text-stone-400 uppercase tracking-wider">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: cards */}
          <div className="reveal-right flex flex-col gap-3">
            {[
              { icon: BookOpen,      title: "Cooperative Training",  desc: "Industry partners co-design curriculum and host students for 70% of their training hours. Graduates arrive job-ready, not just qualified." },
              { icon: Award,         title: "National Certification", desc: "Every graduate who passes their competency assessment receives a nationally recognized certificate from the regional bureau." },
              { icon: GraduationCap, title: "Community Impact",       desc: "Since 2010 we've trained over 2,000 graduates who now work across construction, ICT, healthcare, and automotive sectors in the region." },
              { icon: Network,       title: "Industry Network",       desc: "Active partnerships with local businesses ensure practical placements, equipment donations, and a direct path from training to employment." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-shine flex items-start gap-4 p-5 rounded-2xl bg-white border border-stone-200 hover:border-primary/25 hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-all">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-800 mb-1">{title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   PROGRAMS
───────────────────────────────────────────────────── */
function Programs() {
  return (
    <section id="programs" className="bg-stone-100 py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="reveal text-center max-w-2xl mx-auto mb-14">
          <span className="mono text-xs font-bold uppercase tracking-widest text-primary block mb-4">Our Programs</span>
          <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight tracking-tight mb-5">
            Six pathways to<br />a technical career
          </h2>
          <p className="text-stone-500 text-base leading-relaxed">
            Every program runs from Level I to Level IV, with competency assessments at
            each stage. All are accredited under Ethiopia's national TVET framework.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map(({ name, level }, i) => (
            <div
              key={name}
              className="reveal card-shine group relative p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-default overflow-hidden"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl group-hover:bg-primary/10 transition-colors" />
              <div className="mono text-3xl font-black text-stone-200 group-hover:text-primary/20 transition-colors mb-3 leading-none">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-base font-bold text-stone-800 mb-1.5 group-hover:text-primary transition-colors">{name}</h3>
              <span className="mono text-xs font-semibold text-stone-400 uppercase tracking-wider">{level}</span>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View curriculum <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────────────── */
function Features() {
  return (
    <section id="features" className="bg-stone-50 py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="reveal text-center max-w-2xl mx-auto mb-14">
          <span className="mono text-xs font-bold uppercase tracking-widest text-primary block mb-4">Platform Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight tracking-tight mb-5">
            Built for the full<br />exam lifecycle
          </h2>
          <p className="text-stone-500 text-base leading-relaxed">
            From question creation to certification — every step is handled on one platform,
            with no paper, no manual entry, and no waiting.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="reveal card-shine group p-6 rounded-2xl bg-white border border-stone-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-default"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-stone-100 group-hover:bg-primary group-hover:text-white text-stone-500 transition-all duration-300 mb-5">
                <Icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-stone-800 mb-2 group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────────────── */
function HowItWorks() {
  return (
    <section id="howitworks" className="bg-stone-100 py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="reveal text-center max-w-2xl mx-auto mb-16">
          <span className="mono text-xs font-bold uppercase tracking-widest text-primary block mb-4">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight tracking-tight mb-5">
            From login to results<br />in four steps
          </h2>
          <p className="text-stone-500 text-base leading-relaxed">
            The process is deliberate and fast. No orientation needed — first-time
            students navigate it without help.
          </p>
        </div>

        <div className="relative">
          {/* Connector line desktop */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-stone-200" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="reveal flex flex-col items-center text-center gap-4" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-50 border-2 border-stone-200 group-hover:border-primary transition-all z-10">
                  <Icon size={24} className="text-primary" />
                  <span className="mono absolute -top-2.5 -right-2.5 text-[10px] font-black text-white bg-primary w-5 h-5 rounded-full flex items-center justify-center">{step}</span>
                </div>
                <h3 className="text-sm font-bold text-stone-800">{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   TIMELINE
───────────────────────────────────────────────────── */
function Timeline() {
  return (
    <section className="bg-stone-50 py-28 px-6 overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <div className="reveal text-center mb-16">
          <span className="mono text-xs font-bold uppercase tracking-widest text-primary block mb-4">Our Journey</span>
          <h2 className="text-4xl md:text-5xl font-black text-stone-900 leading-tight tracking-tight">
            15 years of progress
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-stone-200 md:left-1/2" />

          <div className="flex flex-col gap-10">
            {timeline.map(({ year, title, desc }, i) => (
              <div
                key={year}
                className={`reveal relative flex gap-6 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Content */}
                <div className={`flex-1 pl-12 md:pl-0 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <span className="mono text-xs font-bold text-primary uppercase tracking-widest block mb-1">{year}</span>
                  <h3 className="text-base font-bold text-stone-800 mb-1">{title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                </div>

                {/* Dot */}
                <div className="absolute left-0 top-1 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-stone-50 border-2 border-primary z-10 shrink-0">
                  <span className="mono text-[10px] font-black text-primary">{year.slice(2)}</span>
                </div>

                {/* Spacer other side */}
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────────────── */
function Testimonials() {
  return (
    <section className="bg-stone-100 py-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="reveal text-center max-w-xl mx-auto mb-14">
          <span className="mono text-xs font-bold uppercase tracking-widest text-primary block mb-4">Voices from Campus</span>
          <h2 className="text-4xl font-black text-stone-900 leading-tight tracking-tight">
            What people actually say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, text }, i) => (
            <div
              key={name}
              className="reveal card-shine flex flex-col gap-4 p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-primary/25 hover:shadow-md transition-all duration-300"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-0.5">
                {Array(5).fill(0).map((_, j) => (
                  <Star key={j} size={13} className="text-primary fill-primary" />
                ))}
              </div>
              <p className="text-sm text-stone-600 leading-relaxed flex-1">"{text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-stone-200">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800 leading-tight">{name}</p>
                  <p className="mono text-[10px] text-stone-400 uppercase tracking-wide">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   CTA
───────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="bg-stone-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="reveal relative overflow-hidden rounded-3xl bg-primary px-10 py-16 text-center flex flex-col items-center gap-6">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:"linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
              backgroundSize:"40px 40px"
            }} />
          {/* Corner circles */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          <span className="mono relative z-10 text-xs font-bold uppercase tracking-widest text-white/50">For Students</span>
          <h2 className="relative z-10 text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Ready to take<br />your exam?
          </h2>
          <p className="relative z-10 text-white/65 text-base max-w-lg leading-relaxed">
            Enter the exam portal with your student ID. Your exam loads instantly, the
            timer starts when you're ready, and your results are there when you submit.
          </p>
          <div className="relative z-10 flex flex-wrap gap-3 justify-center">
            <Link href="/exam/onboard-examinees" className="group flex items-center gap-2.5 px-8 py-3.5 text-base font-bold text-primary bg-white hover:bg-stone-50 rounded-2xl transition-all no-underline shadow-lg">
              <Zap size={17} strokeWidth={2.5} />
              Go to Exam Portal
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/sign-in" className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-2xl transition-all no-underline">
              Teacher / Admin Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   CONTACT STRIP
───────────────────────────────────────────────────── */
function ContactStrip() {
  return (
    <section className="bg-stone-100 border-t border-stone-200 py-14 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="reveal grid sm:grid-cols-3 gap-6">
          {[
            { icon: MapPin,  label: "Location",  value: "Warder, Somali Regional State, Ethiopia" },
            { icon: Phone,   label: "Phone",     value: "+251 XXX XXX XXX" },
            { icon: Mail,    label: "Email",     value: "info@wardertvet.edu.et" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="mono text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-stone-700">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-stone-900 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-stone-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shrink-0">
              <GraduationCap size={18} strokeWidth={2.3} />
            </div>
            <div>
              <span className="block text-base font-bold text-stone-100">Warder TVET College</span>
              <span className="mono text-xs text-stone-500 uppercase tracking-wider">Somali Regional State · Ethiopia</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {[["About","#about"],["Features","#features"],["Programs","#programs"],["How It Works","#howitworks"]].map(([label, href]) => (
              <a key={label} href={href} className="text-sm text-stone-400 hover:text-stone-200 transition-colors no-underline">{label}</a>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <span className="mono text-xs text-stone-500">© {new Date().getFullYear()} Warder TVET College. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/auth/sign-in" className="mono text-xs text-stone-500 hover:text-stone-300 transition-colors no-underline">Sign In</Link>
            <Link href="/exam/onboard-examinees" className="mono text-xs text-primary hover:opacity-80 transition-colors no-underline font-semibold">Go to Exam →</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────── */
export default function HomePage({isLoggedIn}:{isLoggedIn:boolean}) {
  useReveal();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bg-stone-100 min-h-screen antialiased">
        <Header isLoggedIn={isLoggedIn} />
        <Hero />
        <Ticker />
        <About />
        <Programs />
        <Features />
        <HowItWorks />
        <Timeline />
        <Testimonials />
        <CTA />
        <ContactStrip />
        <Footer />
      </div>
    </>
  );
}
