/**
 * App.jsx
 * Root component: loads README.md, parses it, manages dark/light mode,
 * renders sticky navbar and all sections with a loading overlay.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Hero      from './components/Hero';
import About     from './components/About';
import Skills    from './components/Skills';
import Projects  from './components/Projects';
import Activities from './components/Activities';
import Education from './components/Education';
import Contact   from './components/Contact';
import Footer    from './components/Footer';

import { portfolioData } from './data/portfolioData';
import { translations } from './utils/translations';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('portfolio_lang');
    return (saved === 'EN' || saved === 'FR') ? saved : 'EN';
  });
  const [loading,       setLoading]       = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const t = translations[language] || translations['EN'];
  const currentPortfolioData = portfolioData[language] || portfolioData['EN'];

  // Persist language
  useEffect(() => {
    localStorage.setItem('portfolio_lang', language);
  }, [language]);

  // ── Nav sections ──────────────────────────────────────────────────────────
  const NAV_LINKS = useMemo(() => [
    { href: '#home',       label: t?.nav?.home       || 'Home'       },
    { href: '#about',      label: t?.nav?.about      || 'About'      },
    { href: '#skills',     label: t?.nav?.skills     || 'Skills'     },
    { href: '#projects',   label: t?.nav?.projects   || 'Projects'   },
    { href: '#activities', label: t?.nav?.activities || 'Activities' },
    { href: '#education',  label: t?.nav?.education  || 'Education'  },
    { href: '#contact',    label: t?.nav?.contact    || 'Contact'    },
  ], [t]);

  const loaderRef = useRef(null);

  // ── Handling Loading Overlay ───────────────────────────────────────────────
  useEffect(() => {
    // Shorter delay + direct state change if animation fails
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // ── Dark mode class on <html> ─────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  // ── Scroll tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      // Scroll progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);

      // Active section detection
      const sections = NAV_LINKS.map(l => l.href.slice(1));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [NAV_LINKS]); // Added NAV_LINKS to deps

  const handleNav = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className='dark'>
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 z-[60] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Loading overlay */}
      {loading && (
        <div ref={loaderRef} className="loader">
          <div className="loader-ring mb-4" />
          <span className="gradient-text font-bold text-lg">Loading Portfolio…</span>
        </div>
      )}

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-lg' : 'bg-transparent'
        }`}
        style={{ borderBottom: scrolled ? '1px solid rgba(99,102,241,0.15)' : 'none' }}
      >
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" onClick={e => handleNav(e, '#home')}
             className="font-black text-xl text-white tracking-tight">
            {'YM'}
            <span className="text-indigo-400"></span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={e => handleNav(e, href)}
                className={`nav-link text-sm font-medium ${activeSection === href.slice(1) ? 'active' : ''}`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 glass p-1 rounded-xl border border-white/10 mr-4">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'EN' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('FR')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'FR' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                FR
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="md:hidden w-10 h-10 rounded-xl glass border flex items-center justify-center text-gray-400"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              aria-label="Menu"
            >
              {menuOpen
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
              }
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div className={`md:hidden glass border-t transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-96 py-4' : 'max-h-0'
        }`} style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
          <div className="flex flex-col px-4 gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={e => handleNav(e, href)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSection === href.slice(1)
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main>
        <Hero      data={currentPortfolioData} t={t.hero} />
        <About     data={currentPortfolioData} t={t.about} />
        <Skills    data={currentPortfolioData} t={t.skills} />
        <Projects  data={currentPortfolioData} t={t.projects} />
        <Activities data={currentPortfolioData} t={t.activities} />
        <Education data={currentPortfolioData} t={t.education} />
        <Contact   data={currentPortfolioData} t={t.contact} />
      </main>

      <Footer data={currentPortfolioData} t={t} />
    </div>
  );
}
