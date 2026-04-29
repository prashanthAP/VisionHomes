import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Building2, Pencil, Palette, Hammer, Users,
  Phone, Mail, MapPin, ChevronUp, MessageCircle,
  ArrowRight, Star, Menu, X
} from 'lucide-react';
import heroVideo from '../assets/HeroVideo.mp4';

const NAV_SECTIONS = ['home', 'about', 'services', 'gallery', 'testimonials', 'contact'] as const;
const HERO_VIDEO_URL = heroVideo;
const HERO_VIDEO_FALLBACK_URL = 'https://videos.pexels.com/video-files/7578552/7578552-uhd_2560_1440_25fps.mp4';
const WHATSAPP_NUMBER = '919110461028';
const WHATSAPP_MESSAGE = 'Hi VisionHomes, Please help me to decide proper planning and construction for my dream home';
const LEAD_SUBMIT_ENDPOINT = '/api/leads';
const LEAD_MIN_FILL_MS = 2500;
const LEAD_SUBMIT_COOLDOWN_MS = 30000;

type LeadFormValues = {
  fullName: string;
  email: string;
  phone: string;
  service: string;
  brief: string;
};

type ToastType = 'success' | 'error' | 'info';

type ToastMessage = {
  id: number;
  type: ToastType;
  text: string;
};

const splitCaptionForTyping = (caption: string) => {
  const words = caption.trim().split(/\s+/);
  const typingWordCount = words.length > 4 ? 3 : 2;
  const staticWords = words.slice(0, Math.max(words.length - typingWordCount, 0)).join(' ');
  const typingWords = words.slice(-typingWordCount).join(' ');
  return { staticWords, typingWords };
};

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [typedCaptionTail, setTypedCaptionTail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leadFormValues, setLeadFormValues] = useState<LeadFormValues>({
    fullName: '',
    email: '',
    phone: '',
    service: '',
    brief: ''
  });
  const [leadFormErrors, setLeadFormErrors] = useState<Partial<LeadFormValues>>({});
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);
  const [isLeadSubmitting, setIsLeadSubmitting] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastLeadSubmitAt, setLastLeadSubmitAt] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const manualNavLockRef = useRef(false);
  const formStartedAtRef = useRef<number>(Date.now());

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1768223933860-6d62bc5b2ff3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
      caption: 'Architecting Dreams, Constructing Legacies.',
      subcaption: 'Construction Excellence'
    },
    {
      image: 'https://images.unsplash.com/photo-1669387448840-610c588f003d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
      caption: 'Where Elegance Meets Functionality.',
      subcaption: 'Interior Design'
    },
    {
      image: 'https://images.unsplash.com/photo-1622015663319-e97e697503ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
      caption: 'Strategic Insights for Prime Real Estate.',
      subcaption: 'Expert Consultation'
    }
  ];

  const services = [
    {
      icon: Building2,
      title: 'Real Estate',
      description: 'Property sourcing and investment portfolio management for discerning clients.'
    },
    {
      icon: Pencil,
      title: 'Design',
      description: 'Architectural blueprints and 3D conceptualization that bring visions to life.'
    },
    {
      icon: Palette,
      title: 'Interior Designing',
      description: 'Curated aesthetics for modern living spaces that reflect your unique style.'
    },
    {
      icon: Hammer,
      title: 'Construction',
      description: 'End-to-end building solutions with precision engineering and quality craftsmanship.'
    },
    {
      icon: Users,
      title: 'Labouring',
      description: 'Skilled workforce management for seamless project execution and delivery.'
    }
  ];

  const gallery = [
    {
      image: 'https://images.unsplash.com/photo-1666037805138-f227944ed8d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      title: 'The Grand Hall',
      description: 'Double-height ceilings with gold-leaf accents and floor-to-ceiling glass.'
    },
    {
      image: 'https://images.unsplash.com/photo-1760072513457-651955c7074d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      title: 'Gourmet Kitchen',
      description: 'Minimalist matte black cabinetry paired with gold fixtures and marble islands.'
    },
    {
      image: 'https://images.unsplash.com/photo-1763352360624-320d03c124a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      title: 'Zen Garden',
      description: 'A harmonious blend of stone, water, and manicured greenery for urban peace.'
    },
    {
      image: 'https://images.unsplash.com/photo-1765434669956-afcd50058d69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      title: 'Master Bedroom',
      description: 'A sanctuary of velvet textures, ambient lighting, and bespoke furniture.'
    },
    {
      image: 'https://images.unsplash.com/photo-1754788358645-d6e6cca12e25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      title: 'Spa Bathroom',
      description: 'Floating vanities and rain showers designed for a five-star hotel experience.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah J.',
      role: 'Google Review',
      text: 'VisionConsultation transformed our vision into a breathtaking reality. Their attention to detail in the construction phase was unmatched.',
      rating: 5
    },
    {
      name: 'Mithun R.',
      role: 'Property Investor',
      text: 'The interior design team has a magical touch. Our home feels like a piece of art.',
      rating: 5
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const preloadedImages: HTMLImageElement[] = [];
    heroSlides.forEach((slide) => {
      const image = new window.Image();
      image.src = slide.image;
      preloadedImages.push(image);
    });

    return () => {
      preloadedImages.length = 0;
    };
  }, [heroSlides]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    const currentCaption = heroSlides[currentHeroSlide].caption;
    const { typingWords } = splitCaptionForTyping(currentCaption);
    let currentIndex = 0;
    let typeTimer: number | undefined;

    setTypedCaptionTail('');
    const startTimer = window.setTimeout(() => {
      typeTimer = window.setInterval(() => {
        currentIndex += 1;
        setTypedCaptionTail(typingWords.slice(0, currentIndex));

        if (currentIndex >= typingWords.length) {
          window.clearInterval(typeTimer);
        }
      }, 60);
    }, 250);

    return () => {
      window.clearTimeout(startTimer);
      if (typeTimer) {
        window.clearInterval(typeTimer);
      }
    };
  }, [currentHeroSlide]);

  useEffect(() => {
    const sections = NAV_SECTIONS
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) return;

    const getHeaderOffset = () => (headerRef.current?.offsetHeight ?? 88) + 12;

    const updateActiveSectionOnScroll = () => {
      if (manualNavLockRef.current) return;

      const currentScroll = window.scrollY + getHeaderOffset() + 24;
      let currentSectionId = sections[0].id;

      for (const section of sections) {
        if (currentScroll >= section.offsetTop) {
          currentSectionId = section.id;
        } else {
          break;
        }
      }

      // Keep the final nav item active only when genuinely near the page bottom.
      const doc = document.documentElement;
      const maxScrollY = Math.max(doc.scrollHeight - window.innerHeight, 0);
      const isNearBottom = maxScrollY > 0 && window.scrollY >= maxScrollY - 24;
      if (isNearBottom) {
        currentSectionId = sections[sections.length - 1].id;
      }

      setActiveSection(currentSectionId);
      if (window.location.hash !== `#${currentSectionId}`) {
        window.history.replaceState(null, '', `#${currentSectionId}`);
      }
    };

    updateActiveSectionOnScroll();
    window.addEventListener('scroll', updateActiveSectionOnScroll, { passive: true });
    window.addEventListener('resize', updateActiveSectionOnScroll);

    return () => {
      window.removeEventListener('scroll', updateActiveSectionOnScroll);
      window.removeEventListener('resize', updateActiveSectionOnScroll);
    };
  }, []);

  useEffect(() => {
    const applyHashSection = () => {
      const hashSection = window.location.hash.replace('#', '');
      if (!hashSection || !NAV_SECTIONS.includes(hashSection as (typeof NAV_SECTIONS)[number])) return;
      setActiveSection(hashSection);
    };

    applyHashSection();
    window.addEventListener('hashchange', applyHashSection);
    return () => window.removeEventListener('hashchange', applyHashSection);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!isMobileMenuOpen) return;

      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      manualNavLockRef.current = true;
      const headerOffset = (headerRef.current?.offsetHeight ?? 88) + 12;
      const targetY = element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
      setActiveSection(sectionId);
      window.history.pushState(null, '', `#${sectionId}`);
      setIsMobileMenuOpen(false);
      window.setTimeout(() => {
        manualNavLockRef.current = false;
      }, 700);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateLeadForm = (values: LeadFormValues) => {
    const errors: Partial<LeadFormValues> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s]{10,15}$/;

    if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!values.email.trim()) errors.email = 'Email address is required.';
    else if (!emailRegex.test(values.email.trim())) errors.email = 'Enter a valid email address.';

    if (!values.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!phoneRegex.test(values.phone.trim())) errors.phone = 'Enter a valid phone number.';

    if (!values.service.trim()) errors.service = 'Please select a service.';
    if (!values.brief.trim()) errors.brief = 'Project brief is required.';

    return errors;
  };

  const addToast = (type: ToastType, text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const buildWhatsappMessage = (values: LeadFormValues) => {
    const details: string[] = [];
    if (values.fullName.trim()) details.push(`Name: ${values.fullName.trim()}`);
    if (values.phone.trim()) details.push(`Phone: ${values.phone.trim()}`);
    if (values.email.trim()) details.push(`Email: ${values.email.trim()}`);
    if (values.service.trim()) details.push(`Service: ${values.service.trim()}`);
    if (values.brief.trim()) details.push(`Brief: ${values.brief.trim()}`);

    if (details.length === 0) return WHATSAPP_MESSAGE;
    return `${WHATSAPP_MESSAGE}\n\n${details.join('\n')}`;
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildWhatsappMessage(leadFormValues)
  )}`;

  const handleLeadFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setLeadFormValues((prev) => ({ ...prev, [name]: value }));
    setLeadFormErrors((prev) => ({ ...prev, [name]: undefined }));
    if (isLeadSubmitted) setIsLeadSubmitted(false);
  };

  const handleLeadFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLeadSubmitting) return;

    const errors = validateLeadForm(leadFormValues);
    setLeadFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast('error', 'Please correct the highlighted form fields.');
      return;
    }

    if (honeypotValue.trim()) {
      addToast('error', 'Submission blocked.');
      return;
    }

    const fillDurationMs = Date.now() - formStartedAtRef.current;
    if (fillDurationMs < LEAD_MIN_FILL_MS) {
      addToast('error', 'Please take a moment to review details before submitting.');
      return;
    }

    if (lastLeadSubmitAt && Date.now() - lastLeadSubmitAt < LEAD_SUBMIT_COOLDOWN_MS) {
      addToast('info', 'Please wait a few seconds before submitting again.');
      return;
    }

    setIsLeadSubmitting(true);
    try {
      const response = await fetch(LEAD_SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...leadFormValues,
          submittedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Lead submission API returned a non-success response.');
      }

      setIsLeadSubmitted(true);
      setLastLeadSubmitAt(Date.now());
      setLeadFormValues({ fullName: '', email: '', phone: '', service: '', brief: '' });
      setHoneypotValue('');
      formStartedAtRef.current = Date.now();
      addToast('success', 'Inquiry submitted successfully. Our team will contact you soon.');
    } catch {
      addToast('error', 'Unable to submit inquiry right now. Please try again shortly.');
    } finally {
      setIsLeadSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          activeSection === 'home'
            ? 'bg-transparent border-b border-transparent'
            : isScrolled
            ? 'bg-neutral-900/55 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
            : 'bg-neutral-900/20 backdrop-blur-md border-b border-white/10'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1
            className="text-3xl tracking-wide cursor-pointer"
            style={{ fontFamily: 'Playfair Display, serif', color: '#FEF3C7' }}
            onClick={() => scrollToSection('home')}
          >
            VisionHomes
          </h1>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_SECTIONS.map((sectionId) => {
              const item = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
              return (
              <button
                key={sectionId}
                onClick={() => scrollToSection(sectionId)}
                className={`text-sm tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${
                  activeSection === sectionId
                    ? 'text-yellow-200 border-b border-yellow-200 pb-1'
                    : 'text-neutral-200 hover:text-yellow-200'
                }`}
              >
                {item}
              </button>
              );
            })}
            <button
              onClick={() => scrollToSection('contact')}
              className="px-6 py-2 border-2 border-yellow-200 text-yellow-200 hover:bg-yellow-200 hover:text-neutral-900 transition-all"
            >
              Get Started
            </button>
          </nav>

          <button
            type="button"
            className="lg:hidden text-yellow-200 hover:text-yellow-100 transition-colors"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              id="mobile-navigation-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-yellow-200/20 bg-neutral-900/95 backdrop-blur-sm"
            >
              <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
                {NAV_SECTIONS.map((sectionId) => {
                  const item = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
                  return (
                  <button
                    key={sectionId}
                    onClick={() => scrollToSection(sectionId)}
                    className={`text-left text-sm tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${
                      activeSection === sectionId
                        ? 'text-yellow-200 border-b border-yellow-200 pb-1'
                        : 'text-neutral-200 hover:text-yellow-200'
                    }`}
                  >
                    {item}
                  </button>
                  );
                })}
                <button
                  onClick={() => scrollToSection('contact')}
                  className="mt-2 w-full px-6 py-2 border-2 border-yellow-200 text-yellow-200 hover:bg-yellow-200 hover:text-neutral-900 transition-all"
                >
                  Get Started
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative h-screen overflow-hidden bg-neutral-900">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
          <source src={HERO_VIDEO_FALLBACK_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-transparent" />

        {/* Image slider temporarily disabled in favor of hero video
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={currentHeroSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              initial={{ scale: 1.08, filter: 'brightness(0.85)' }}
              animate={{ scale: 1, filter: 'brightness(1)' }}
              exit={{ scale: 1.03, filter: 'brightness(0.85)' }}
              transition={{ duration: 5, ease: 'easeOut' }}
              style={{ backgroundImage: `url(${heroSlides[currentHeroSlide].image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-transparent" />
          </motion.div>
        </AnimatePresence>
        */}

        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-6">
            <motion.div
              key={`content-${currentHeroSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-3xl"
            >
              <p className="text-yellow-200 text-sm tracking-widest mb-4 uppercase">
                {heroSlides[currentHeroSlide].subcaption}
              </p>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-6 text-white leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {splitCaptionForTyping(heroSlides[currentHeroSlide].caption).staticWords}
                {' '}
                <span className="text-yellow-200">
                  {typedCaptionTail}
                  <span className="inline-block ml-1 h-[1em] w-[2px] translate-y-1 bg-yellow-200 animate-pulse" />
                </span>
              </h2>
              <button
                onClick={() => scrollToSection('contact')}
                className="group px-8 py-4 bg-yellow-200 text-neutral-900 hover:bg-yellow-300 transition-all flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Slide indicators hidden while hero video is active */}
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-4xl md:text-5xl mb-6 text-neutral-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Indian Homes for Rural and Urban
            </h2>
            <p className="text-lg text-neutral-600 leading-relaxed">
              We are a high-end real estate and architectural consultancy dedicated to transforming
              spaces into timeless masterpieces. Our expertise spans across real estate investment,
              architectural design, interior design, construction, and workforce management. With a
              commitment to luxury, authority, and modernity, we create living spaces that inspire.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-neutral-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl mb-4 text-neutral-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Our Services
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Comprehensive solutions for your real estate and construction needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white p-8 hover:shadow-2xl transition-all duration-300 border border-neutral-100"
              >
                <div className="w-16 h-16 mb-6 flex items-center justify-center border-2 border-yellow-200 group-hover:bg-yellow-200 transition-colors">
                  <service.icon className="w-8 h-8 text-neutral-900" />
                </div>
                <h3
                  className="text-2xl mb-4 text-neutral-900"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {service.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl mb-4 text-neutral-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Masterpiece Gallery
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Explore our portfolio of stunning spaces designed to inspire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden aspect-[4/3] cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3
                      className="text-2xl mb-2 text-yellow-200"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-200">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-neutral-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl mb-4 text-yellow-200"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Client Testimonials
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Hear what our clients have to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-neutral-800 p-8 border border-yellow-200/20"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-200 text-yellow-200" />
                  ))}
                </div>
                <p className="text-neutral-200 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="text-yellow-200">{testimonial.name}</p>
                  <p className="text-sm text-neutral-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-neutral-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl mb-4 text-neutral-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Get In Touch
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Let's bring your vision to life. Fill out the form below and our team will contact you shortly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form - Left */}
            <div className="bg-white p-8 md:p-12 shadow-lg">
              <form className="space-y-6" onSubmit={handleLeadFormSubmit} noValidate>
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="companyWebsite">Company Website</label>
                  <input
                    id="companyWebsite"
                    type="text"
                    name="companyWebsite"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypotValue}
                    onChange={(event) => setHoneypotValue(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={leadFormValues.fullName}
                    onChange={handleLeadFormChange}
                    className={`w-full px-4 py-3 border focus:outline-none focus:border-yellow-200 transition-colors ${
                      leadFormErrors.fullName ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {leadFormErrors.fullName && (
                    <p className="mt-2 text-sm text-red-600">{leadFormErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-neutral-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={leadFormValues.email}
                    onChange={handleLeadFormChange}
                    className={`w-full px-4 py-3 border focus:outline-none focus:border-yellow-200 transition-colors ${
                      leadFormErrors.email ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {leadFormErrors.email && (
                    <p className="mt-2 text-sm text-red-600">{leadFormErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-neutral-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={leadFormValues.phone}
                    onChange={handleLeadFormChange}
                    className={`w-full px-4 py-3 border focus:outline-none focus:border-yellow-200 transition-colors ${
                      leadFormErrors.phone ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="+91 XXXXX XXXXX"
                  />
                  {leadFormErrors.phone && (
                    <p className="mt-2 text-sm text-red-600">{leadFormErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-neutral-700">Service Interested In</label>
                  <select
                    name="service"
                    value={leadFormValues.service}
                    onChange={handleLeadFormChange}
                    className={`w-full px-4 py-3 border focus:outline-none focus:border-yellow-200 transition-colors ${
                      leadFormErrors.service ? 'border-red-500' : 'border-neutral-300'
                    }`}
                  >
                    <option value="">Select a service</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="design">Design</option>
                    <option value="interior">Interior Designing</option>
                    <option value="construction">Construction</option>
                    <option value="labouring">Labouring</option>
                  </select>
                  {leadFormErrors.service && (
                    <p className="mt-2 text-sm text-red-600">{leadFormErrors.service}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-neutral-700">Project Brief</label>
                  <textarea
                    rows={5}
                    name="brief"
                    value={leadFormValues.brief}
                    onChange={handleLeadFormChange}
                    className={`w-full px-4 py-3 border focus:outline-none focus:border-yellow-200 transition-colors resize-none ${
                      leadFormErrors.brief ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    placeholder="Tell us about your project..."
                  />
                  {leadFormErrors.brief && (
                    <p className="mt-2 text-sm text-red-600">{leadFormErrors.brief}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLeadSubmitting}
                  className="w-full px-8 py-4 bg-yellow-200 text-neutral-900 hover:bg-yellow-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLeadSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
                {isLeadSubmitted && (
                  <p className="text-sm text-green-700">
                    Thanks! Your inquiry has been submitted successfully.
                  </p>
                )}
              </form>
            </div>

            {/* Contact Details - Right */}
            <div className="flex flex-col justify-center space-y-8">
              <div>
                <h3
                  className="text-3xl mb-6 text-neutral-900"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Contact Information
                </h3>
                <p className="text-neutral-600 mb-8 leading-relaxed">
                  Reach out to us for consultation, project inquiries, or partnership opportunities. Our team is ready to transform your vision into reality.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 border-2 border-yellow-200 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-neutral-900" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-neutral-900">Phone</h4>
                    <p className="text-neutral-600">+91 98765 43210</p>
                    <p className="text-neutral-600">+91 98765 43211</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 border-2 border-yellow-200 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-neutral-900" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-neutral-900">Email</h4>
                    <p className="text-neutral-600">info@visionhomes.com</p>
                    <p className="text-neutral-600">contact@visionhomes.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 flex-shrink-0 border-2 border-yellow-200 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-neutral-900" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-neutral-900">Location</h4>
                    <p className="text-neutral-600">
                      VisionHomes Design and construction firm<br />
                      Kinnal road, Koppal<br />
                      Karnataka 583231, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <h4 className="mb-4 text-neutral-900">Office Hours</h4>
                <p className="text-neutral-600">Monday - Saturday: 9:00 AM - 7:00 PM</p>
                <p className="text-neutral-600">Sunday: By Appointment Only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3
                className="text-2xl mb-4 text-yellow-200"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                VisionHomes
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                Architecting dreams and constructing legacies for rural and urban India.
              </p>
            </div>

            <div>
              <h4 className="mb-4">Contact Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-yellow-200" />
                  <span>+91 XXXXX XXXXX</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-yellow-200" />
                  <span>info@visionhomes.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-yellow-200" />
                  <span>Mumbai, Maharashtra, India</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 border border-yellow-200 flex items-center justify-center hover:bg-yellow-200 hover:text-neutral-900 transition-colors">
                  IG
                </a>
                <a href="#" className="w-10 h-10 border border-yellow-200 flex items-center justify-center hover:bg-yellow-200 hover:text-neutral-900 transition-colors">
                  LI
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
            <p>&copy; 2026 VisionConsultation. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all">
            <Phone className="w-7 h-7 text-white" />
          </div>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-neutral-900 text-white px-4 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-sm">
            Chat with us
          </span>
        </div>
      </a>

      {/* Toast Notifications */}
      <div className="fixed right-6 top-24 z-[80] flex w-[min(92vw,26rem)] flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-md border px-4 py-3 text-sm shadow-lg ${
                toast.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : toast.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-blue-200 bg-blue-50 text-blue-800'
              }`}
            >
              {toast.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-yellow-200 text-neutral-900 flex items-center justify-center hover:bg-yellow-300 transition-colors shadow-lg"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
