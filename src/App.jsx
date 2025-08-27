import './App.css'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import AshokaChakra from './components/AshokaChakra.jsx'
import { BrowserRouter, Routes, Route, Link, useLocation, useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import Internships from './pages/Internships.jsx'
import Teams from './pages/Teams.jsx'
import Blogs from './pages/Blogs.jsx'
import BlogDetail from './pages/BlogDetail.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import SocialIcon from './components/SocialIcon.jsx'
import SocialMediaCard from './components/SocialMediaCard.jsx'
import Button from './components/Button.jsx'
import SubmitCircleButton from './components/SubmitCircleButton.jsx'
import ImageSlider from './components/ImageSlider.jsx'
import Admin from './pages/Admin.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import LoadingPage from './components/LoadingPage.jsx'
import ProfileDropdown from './components/ProfileDropdown.jsx'
import EventDetail from './pages/EventDetail.jsx'
import InternshipDetail from './pages/InternshipDetail.jsx'
import { getToken, removeToken, setToken, isAuthenticated } from './utils/auth'
import useWindowSize from './hooks/useWindowSize.jsx'
import useAuth from './hooks/useAuth.jsx'
import UserEvents from './pages/UserEvents.jsx'

function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authState, setAuthState] = useState({
    isAdmin: false,
    isLoggedIn: false
  })
  const [navHidden, setNavHidden] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle navigation to home page sections
  const handleSectionNavigation = (sectionId) => {
    const scrollToTarget = () => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      // If targeting hero, also ensure window is at the very top
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    if (location.pathname === '/') {
      // Already on home page
      scrollToTarget()
    } else {
      // Navigate to home first, then scroll
      navigate('/')
      setTimeout(scrollToTarget, 100)
    }
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken()
      const isAdmin = localStorage.getItem('is_admin') === 'true'
      
      // Use isAuthenticated() which checks token validity
      const isValidAuth = token && isAuthenticated()
      
      setAuthState({
        isAdmin: isValidAuth && isAdmin,
        isLoggedIn: isValidAuth
      })
    }
    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  // Listen for authentication changes (for OAuth login)
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken()
      const isAdmin = localStorage.getItem('is_admin') === 'true'
      const isValidAuth = token && isAuthenticated()
      
      setAuthState({
        isAdmin: isValidAuth && isAdmin,
        isLoggedIn: isValidAuth
      })
    }
    
    checkAuth()
    
    // Check periodically for a short time after page load
    const interval = setInterval(checkAuth, 500)
    const timeout = setTimeout(() => clearInterval(interval), 3000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [location.pathname])

  // Hide nav when scrolling down, show when scrolling up
  useEffect(() => {
    let lastY = window.scrollY || 0
    let rafId = 0
    const update = () => {
      const y = window.scrollY || 0
      const delta = y - lastY
      const scrollingDown = delta > 0
      const thresholdPassed = y > 64
      if (Math.abs(delta) > 4) {
        setNavHidden(scrollingDown && thresholdPassed)
        lastY = y
      }
      rafId = 0
    }
    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    // Update on route change (for instant UI update after login/logout)
    const token = getToken()
    setAuthState({
      isAdmin: !!token && localStorage.getItem('is_admin') === 'true',
      isLoggedIn: !!token
    })
  }, [location])

  const handleLogout = () => {
    removeToken()
    localStorage.removeItem('is_admin')
    setAuthState({ isAdmin: false, isLoggedIn: false })
    window.location.href = '/'
  }

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: navHidden ? -96 : 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 20 }}
      className="sticky top-0 z-50 border-b"
    >
      <div className="bg-gradient-to-r from-[color:var(--color-india-saffron)] via-white to-[color:var(--color-india-green)]">
        <div className="container-responsive">
          <div className="flex h-16 md:h-18 items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                {/* Think India Logo (scroll to Hero) */}
                <button onClick={() => handleSectionNavigation('hero')} className="contents" aria-label="Go to Hero">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg cursor-pointer"
                  >
                    <img 
                      src="/src/assets/Think_India_Logo.svg" 
                      alt="Think India Logo" 
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                </button>
                {/* SVNIT Logo */}
                <a href="https://www.svnit.ac.in/index.php" target="_blank" rel="noopener noreferrer">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="h-12 w-12 flex items-center justify-center"
                  >
                    <img 
                      src="/src/assets/NIT_Surat_Logo.svg" 
                      alt="NIT Surat Logo" 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                </a>
              </motion.div>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col items-center ml-2 sm:ml-3 md:ml-4"
              >
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => handleSectionNavigation('hero')}
                  className="font-black text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-wide text-[color:var(--color-ashoka-blue)] text-left"
                >
                  Think India
                </motion.button>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  href="https://www.svnit.ac.in/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base md:text-lg tracking-wide text-[color:var(--color-ashoka-blue)] font-bold -mt-1"
                >
                  SVNIT
                </motion.a>
              </motion.div>
            </div>
            <motion.nav 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden md:flex items-center gap-4 text-sm md:text-base font-semibold"
            >
              {(() => {
                const base = [
                  { to: "/#about", text: "About" },
                  // When logged in, show Events page link instead of Glimpses anchor
                  authState.isLoggedIn
                    ? { to: "/user/events", text: "Events" }
                    : { to: "/#glimpses", text: "Glimpses" },
                  { to: "/internships", text: "Internships" },
                  { to: "/blogs", text: "Blogs" },
                  { to: "/teams", text: "Team" },
                  { to: "/#contact", text: "Contact" }
                ]
                return base
              })().map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                >
                  {item.to.startsWith('/#') ? (
                    <button 
                      onClick={() => handleSectionNavigation(item.to.substring(2))}
                      className="relative hover:text-[color:var(--color-ashoka-blue)] transition-colors duration-200 group"
                    >
                      {item.text}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[color:var(--color-ashoka-blue)] transition-all duration-300 group-hover:w-full" />
                    </button>
                  ) : (
                    <Link 
                      className="relative hover:text-[color:var(--color-ashoka-blue)] transition-colors duration-200 group" 
                      to={item.to}
                    >
                      {item.text}
                      <motion.span
                        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[color:var(--color-ashoka-blue)] group-hover:w-full transition-all duration-300"
                        whileHover={{ width: "100%" }}
                      />
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.nav>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-2 md:gap-3"
            >
              {/* Desktop Auth Buttons - Hidden on mobile */}
              {authState.isLoggedIn ? (
                <div className="hidden md:block">
                  <ProfileDropdown authState={authState} handleLogout={handleLogout} />
                </div>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 15 }}
                    className="hidden md:block"
                  >
                    <Button as={Link} to="/login" variant="secondary" size="sm">Login</Button>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 15 }}
                    className="hidden md:block"
                  >
                    <Button as={Link} to="/signup" variant="primary" size="sm">Sign up</Button>
                  </motion.div>
                </>
              )}
              
              {/* Mobile Menu Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 15 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-6 h-6 text-[color:var(--color-ashoka-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </motion.div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-[color:var(--color-india-saffron)]" />
        <div className="bg-white" />
        <div className="bg-[color:var(--color-india-green)]" />
      </div>
      
      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: mobileMenuOpen ? 'auto' : 0,
          opacity: mobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden overflow-hidden bg-white border-t border-gray-200 relative z-50"
        style={{ maxHeight: mobileMenuOpen ? 'calc(100vh - 80px)' : '0' }}
      >
        <div className="container-responsive py-4 max-h-full overflow-y-auto">
          <nav className="flex flex-col space-y-4">
            {(() => {
              const items = [
                { to: "/#about", text: "About" },
                authState.isLoggedIn
                  ? { to: "/user/events", text: "Events" }
                  : { to: "/#glimpses", text: "Glimpses" },
                { to: "/internships", text: "Internships" },
                { to: "/blogs", text: "Blogs" },
                { to: "/teams", text: "Team" },
                { to: "/#contact", text: "Contact" }
              ]
              return items
            })().map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ x: -20, opacity: 0 }}
                animate={{ 
                  x: mobileMenuOpen ? 0 : -20,
                  opacity: mobileMenuOpen ? 1 : 0
                }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                {item.to.startsWith('/#') ? (
                  <button 
                    onClick={() => {
                      handleSectionNavigation(item.to.substring(2))
                      setMobileMenuOpen(false)
                    }}
                    className="block py-2 px-4 text-inverse-lg font-semibold text-[color:var(--color-ashoka-blue)] hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                  >
                    {item.text}
                  </button>
                ) : (
                  <Link 
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-4 text-inverse-lg font-semibold text-[color:var(--color-ashoka-blue)] hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {item.text}
                  </Link>
                )}
              </motion.div>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-3 pb-2">
              {authState.isAdmin ? (
                <>
                  <Button as={Link} to="/admin" variant="secondary" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Admin Dashboard
                  </Button>
                  <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} variant="logout" size="sm" className="w-full">
                    Logout
                  </Button>
                </>
              ) : authState.isLoggedIn ? (
                <>
                  <Button as={Link} to="/user/dashboard" variant="secondary" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Button>
                  <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} variant="logout" size="sm" className="w-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="secondary" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Button>
                  <Button as={Link} to="/signup" variant="primary" size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </motion.div>
    </motion.header>
  )
}

// Import the LoggedInHero component
import LoggedInHero from './components/LoggedInHero.jsx';

function Hero() {
  const { width, height } = useWindowSize();
  const isPortrait = height > width;
  const isTooNarrow = width < 500;
  const { isLoggedIn, user } = useAuth();
  
  // If user is logged in, render the LoggedInHero component instead
  if (isLoggedIn) {
    // Replace this with the actual API endpoint when provided
    const heroImagesApiEndpoint = 'http://localhost:8082/heroImages'; // This will be replaced with the actual endpoint
    return <LoggedInHero userName={user?.name || ''} apiEndpoint={heroImagesApiEndpoint} />;
  }

  const renderChakras = () => {
    if (isTooNarrow) {
      return null; // Hide on very narrow screens
    }

    if (isPortrait) {
      // Show one centered chakra in portrait mode
      return (
        <motion.div
          key="portrait-chakra"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center -z-10 overflow-hidden"
        >
          <AshokaChakra size={Math.min(width, height) * 0.8} opacity={0.08} />
        </motion.div>
      );
    }

    // Default: show two chakras on wider screens
    return (
      <>
        <motion.div
          key="desktop-chakra-1"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <AshokaChakra className="pointer-events-none absolute -right-24 top-10 -z-10" size={700} opacity={0.12} />
        </motion.div>
        <motion.div
          key="desktop-chakra-2"
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 100, opacity: 1 }}
          transition={{ 
            duration: 2.5, 
            delay: 0.5,
            ease: "easeInOut",
            opacity: { duration: 0.5, delay: 0.5 }
          }}
        >
          <AshokaChakra className="pointer-events-none absolute -left-40 bottom-10 -z-10" size={420} opacity={0.08} rotate={30} />
        </motion.div>
      </>
    );
  };

  return (
    <section id="hero" className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 -z-10"
      >
        <div className="h-full bg-gradient-to-b from-[color:var(--color-india-saffron)] via-white to-[color:var(--color-india-green)]" />
      </motion.div>
      
      {renderChakras()}

      <div className="container-responsive py-12 sm:py-16 md:py-20 lg:py-24">
        <motion.div 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }} 
          className="max-w-3xl text-[color:var(--color-ashoka-blue)] md:ml-12 lg:ml-20"
        >
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight"
          >
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-[color:var(--color-india-saffron)] font-black tracking-tight drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]"
            >
              Think
            </motion.span>{' '}
            <motion.span 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-[color:var(--color-india-green)]"
            >
              India
            </motion.span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mt-6 text-xl sm:text-2xl"
          >
            A pan-India initiative empowering students with a 'Nation First' mindset.
            <br />
            Join the country's brightest young minds in nation-building and intellectual engagement.
          </motion.p>
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            {(() => { const MotionLink = motion(Link); return (
              <MotionLink 
                whileHover={{ y: -3, scale: 1.02, boxShadow: "0 10px 25px rgba(255, 153, 51, 0.3)" }} 
                whileTap={{ scale: 0.98 }} 
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                to="/signup" 
                className="btn-responsive inline-flex items-center justify-center rounded-xl bg-[color:var(--color-india-saffron)] text-white font-semibold shadow-md"
              >
                Join Our Mission
              </MotionLink>
            )})()}
            <motion.a 
              whileHover={{ y: -3, scale: 1.02, boxShadow: "0 10px 25px rgba(19, 136, 8, 0.3)" }} 
              whileTap={{ scale: 0.98 }} 
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              href="#initiatives" 
              className="btn-responsive inline-flex items-center justify-center rounded-xl bg-[color:var(--color-india-green)] text-white font-semibold shadow-md"
            >
              Learn More
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function Section({ id, title, children, className = '' }) {
  return (
    <motion.section 
      id={id} 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`py-8 sm:py-10 md:py-14 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2 
          initial={{ y: 30, opacity: 0 }} 
          whileInView={{ y: 0, opacity: 1 }} 
          viewport={{ once: true }} 
          transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.1 }} 
          className="text-4xl sm:text-5xl font-extrabold text-[color:var(--color-ashoka-blue)]"
        >
          {title}
        </motion.h2>
        <motion.div 
          initial={{ y: 40, opacity: 0 }} 
          whileInView={{ y: 0, opacity: 1 }} 
          viewport={{ once: true, amount: 0.2 }} 
          transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }} 
          className="mt-6"
        >
          {children}
        </motion.div>
      </div>
    </motion.section>
  )
}

function Footer() {
  return (
    <footer className="text-white" style={{ backgroundColor: 'var(--color-footer-blue)' }}>
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-[color:var(--color-india-saffron)]" />
        <div className="bg-white" />
        <div className="bg-[color:var(--color-india-green)]" />
      </div>
      <div className="container-responsive py-responsive">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg flex items-center justify-center bg-white shrink-0">
                <img 
                  src="/src/assets/Think_India_Logo.svg" 
                  alt="Think India Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-2xl font-extrabold">Think India</div>
            </div>
            <p className="mt-3 text-white/75 max-w-sm mx-auto md:mx-0">Empowering students to shape the future of India.</p>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold">Quick Links</div>
            <div className="my-2 h-0.5 w-16 mx-auto md:mx-0 bg-white/30" />
            <ul className="mt-2 space-y-2 text-white/80">
              <li><Link className="hover:text-white" to="/">Home</Link></li>
              <li><a className="hover:text-white" href="#about">About</a></li>
              <li><a className="hover:text-white" href="#glimpses">Glimpses</a></li>
              <li><Link className="hover:text-white" to="/teams">Team</Link></li>
              <li><a className="hover:text-white" href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold">Resources</div>
            <div className="my-2 h-0.5 w-16 mx-auto md:mx-0 bg-white/30" />
            <ul className="mt-2 space-y-2 text-white/80">
              <li><Link className="hover:text-white" to="/blogs">Blog</Link></li>
              <li><Link className="hover:text-white" to="/internships">Internships</Link></li>
              <li><Link className="hover:text-white" to="/admin">Admin Dashboard</Link></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg font-semibold">Connect On</div>
            <div className="my-2 h-0.5 w-16 mx-auto md:mx-0 bg-white/30" />
            <div className="mt-3 flex justify-center md:justify-start">
              <SocialMediaCard />
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-white/70">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="text-lg"> 2024 Think India, SVNIT</div>
            <div className="text-right">
              <div className="text-lg">Developed by <span className="text-white font-bold">Achir Jain</span></div>
              <div className="text-md">Managed by <span className="text-white font-bold">Vivek Yadav</span></div>
            </div>
          </div>
          
          {/* Mobile Layout - Same content, different pattern */}
          <div className="md:hidden text-center space-y-2">
            <div className="text-md"> 2024 Think India, SVNIT</div>
            <div className="text-lg">Developed by  <span className="text-white font-bold">Achir Jain</span></div>
            <div className="text-md">Managed by  <span className="text-white font-bold">Vivek Yadav</span></div>
          </div>
        </div>
      </div>
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-[color:var(--color-india-saffron)]" />
        <div className="bg-white" />
        <div className="bg-[color:var(--color-india-green)]" />
      </div>
    </footer>
  )
}

function ContactSection() {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')
    const form = event.currentTarget
    try {
      const formData = new FormData()
      formData.append('Name', form.name.value || '')
      formData.append('Email', form.email.value || '')
      formData.append('Message', form.message.value || '')

      let res = await fetch('http://localhost:8082/recommend', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      })
      if (!res.ok) {
        // retry without explicit cors if needed
        res = await fetch('http://localhost:8082/recommend', { method: 'POST', body: formData })
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      // backend returns plain text id (e.g., 1)
      const txt = await res.text().catch(() => '')
      setSubmitSuccess(txt ? 'Thanks! Your recommendation has been submitted.' : 'Thanks! Your recommendation has been submitted.')
      form.reset()
    } catch (e) {
      setSubmitError(typeof e?.message === 'string' ? e.message : 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-8 sm:py-10 md:py-12 mt-0 md:mt-6 mb-0">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_10%_10%,#0F1C3F_0%,#0F1C3F_40%,#111827_100%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 items-start">
            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">GET IN TOUCH</h2>
              <div className="mt-3 flex items-center gap-4">
                <span className="h-1 w-16 bg-[color:var(--color-india-saffron)] rounded" />
                <span className="h-1 w-12 bg-white/90 rounded" />
                <span className="h-1 w-16 bg-[color:var(--color-india-green)] rounded" />
              </div>
              <p className="mt-8 max-w-xl text-white/85 text-base">
                Interested in joining us but do not know where to start? Do you have a mind-blowing idea that you
                need help with? Reach out to us, we are happy to help!
              </p>
              <div className="mt-8 space-y-4">
                <div>
                  <div className="font-semibold mb-2">Connect On</div>
                  <div className="flex flex-wrap gap-3">
                    <SocialMediaCard />
                  </div>
                </div>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-[color:var(--color-india-green)]/40"
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <label htmlFor="name" className="block text-sm font-medium text-[color:var(--color-ashoka-blue)]">Name</label>
                    <motion.input 
                      whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(15, 28, 63, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      id="name" 
                      name="name" 
                      type="text" 
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-[color:var(--color-ashoka-blue)] placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
                    />
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-[color:var(--color-ashoka-blue)]">Email <span className="text-red-500">*</span></label>
                    <motion.input 
                      whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(15, 28, 63, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      id="email" 
                      name="email" 
                      type="email" 
                      required 
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-[color:var(--color-ashoka-blue)] placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
                    />
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <label htmlFor="message" className="block text-sm font-medium text-[color:var(--color-ashoka-blue)]">Message <span className="text-red-500">*</span></label>
                    <motion.textarea 
                      whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(15, 28, 63, 0.1)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      id="message" 
                      name="message" 
                      required 
                      rows="4" 
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-[color:var(--color-ashoka-blue)] placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" 
                    />
                  </motion.div>
                  {submitError && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-sm text-red-600"
                    >
                      {submitError}
                    </motion.div>
                  )}
                  {submitSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-sm text-green-600"
                    >
                      {submitSuccess}
                    </motion.div>
                  )}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className="flex justify-end"
                  >
                    <SubmitCircleButton type="submit" disabled={submitting} ariaLabel="Send" />
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  const [eventImages, setEventImages] = useState([])
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (isLoggedIn) return // Do not fetch glimpses for logged-in users
    let cancelled = false
    const load = async () => {
      try {
        // Fetch glimpses list
        let res = await fetch('http://localhost:8082/glimpses', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        })
        if (!res.ok) {
          res = await fetch('http://localhost:8082/glimpses', { method: 'GET', mode: 'cors' })
        }
        if (!res.ok) throw new Error(`Failed to fetch glimpses: HTTP ${res.status}`)

        const glimpses = await res.json()
        const list = Array.isArray(glimpses) ? glimpses : []

        const imageUtils = {
          detectMime: (b64) => {
            if (!b64 || typeof b64 !== 'string') return ''
            const head = b64.slice(0, 16)
            if (head.startsWith('/9j/')) return 'image/jpeg'
            if (head.startsWith('iVBORw0KGgo')) return 'image/png'
            if (head.startsWith('R0lGOD')) return 'image/gif'
            if (head.startsWith('UklGR')) return 'image/webp'
            return ''
          },
          
          sanitizeBase64: (raw) => {
            if (!raw || typeof raw !== 'string') return ''
            let cleaned = raw.trim()
            if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
              try { cleaned = JSON.parse(cleaned) } catch {}
            }
            cleaned = String(cleaned).replace(/^data:[^;]+;base64,/, '')
            return cleaned.replace(/[^A-Za-z0-9+/=]/g, '')
          },
          
          extractBase64: (payload) => {
            let mime = '', dataUri = '', base64 = ''
            if (payload == null) return { base64, mime, dataUri }
            
            if (typeof payload === 'string') {
              const trimmed = payload.trim()
              if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                try {
                  const unwrapped = JSON.parse(trimmed)
                  if (typeof unwrapped === 'string') return imageUtils.extractBase64(unwrapped)
                } catch {}
              }
              if (trimmed.startsWith('data:')) {
                dataUri = trimmed
                const match = trimmed.match(/^data:([^;]+);base64,(.*)$/)
                if (match) { mime = match[1]; base64 = match[2] }
                return { base64, mime, dataUri }
              }
              base64 = imageUtils.sanitizeBase64(trimmed)
              return { base64, mime, dataUri }
            }
            
            const candidates = [payload.base64Image, payload.base64, payload.data, payload.image, payload.base64EncodedImage]
            for (const c of candidates) {
              if (typeof c === 'string' && c.trim()) return imageUtils.extractBase64(c)
            }
            mime = payload.imageType || payload.mimeType || payload.contentType || mime
            const anyString = Object.values(payload).find((v) => typeof v === 'string')
            if (anyString) return imageUtils.extractBase64(anyString)
            return { base64, mime, dataUri }
          }
        }

        // Fetch each image by imageId
        const slides = await Promise.all(
          list.map(async (ev, i) => {
            const imageId = ev.imageId ?? ev.imageID ?? ev.image_id ?? ev.imageid
            const alt = ev.name || ev.eventName || `Glimpse ${i + 1}`
            if (imageId === undefined || imageId === null) return { src: '', alt }
            try {
              let imgRes = await fetch(`http://localhost:8082/image/${encodeURIComponent(imageId)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json, text/plain, */*' },
              })
              if (!imgRes.ok) {
                imgRes = await fetch(`http://localhost:8082/image/${encodeURIComponent(imageId)}`, { method: 'GET', mode: 'cors' })
              }
              if (!imgRes.ok) throw new Error('image fetch error')
              const contentType = imgRes.headers.get('content-type') || ''
              let base64 = '', mime = '', dataUri = ''
              
              if (contentType.includes('application/json')) {
                const json = await imgRes.json()
                const ext = imageUtils.extractBase64(json)
                base64 = imageUtils.sanitizeBase64(ext.base64)
                mime = ext.mime || imageUtils.detectMime(base64) || 'image/jpeg'
                dataUri = ext.dataUri
              } else {
                const text = await imgRes.text()
                const maybeJson = text.trim()
                if (maybeJson.startsWith('{') || maybeJson.startsWith('[') || (maybeJson.startsWith('"') && maybeJson.endsWith('"'))) {
                  try {
                    const parsed = JSON.parse(maybeJson)
                    const ext = imageUtils.extractBase64(parsed)
                    base64 = imageUtils.sanitizeBase64(ext.base64)
                    mime = ext.mime || imageUtils.detectMime(base64) || 'image/jpeg'
                    dataUri = ext.dataUri
                  } catch {
                    base64 = imageUtils.sanitizeBase64(maybeJson)
                    mime = imageUtils.detectMime(base64) || 'image/jpeg'
                  }
                } else {
                  base64 = imageUtils.sanitizeBase64(maybeJson)
                  mime = imageUtils.detectMime(base64) || 'image/jpeg'
                }
              }
              const src = dataUri || (base64 ? `data:${mime};base64,${base64}` : '')
              return { src, alt }
            } catch {
              return { src: '', alt }
            }
          })
        )

        const normalized = slides.filter((s) => s.src)
        if (!cancelled && normalized.length) setEventImages(normalized)
      } catch {
        // Ignore; ImageSlider will use its fallback slides
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  return (
    <>
      <Hero />
      <Section id="about" title="About Us">
        <p className="text-gray-700 max-w-3xl text-lg sm:text-xl">
          Think India is a student and young professionals movement aiming to bring together intellectuals, policymakers, and leaders to work towards a prosperous and self-reliant Bharat.
        </p>
      </Section>
      <Section id="initiatives" title="Key Initiatives">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { title: 'Internships', desc: 'Meaningful opportunities in governance, policy, and industry.', barClass: 'bg-[color:var(--color-india-saffron)]' },
            { title: 'Research', desc: 'Collaborative projects addressing national priorities.', barClass: 'bg-white' },
            { title: 'Leadership', desc: 'Workshops and programs that build character and capability.', barClass: 'bg-[color:var(--color-india-green)]' },
          ].map((card, index) => (
            <motion.div 
              key={card.title} 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ 
                type: 'spring', 
                stiffness: 100, 
                damping: 20, 
                delay: index * 0.1 
              }}
              className="glass-card-container"
            >
              <motion.div
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative overflow-hidden rounded-2xl p-8 bg-[var(--bg-saffron-50)] shadow-sm cursor-pointer"
              >
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                  className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${card.barClass} origin-left`} 
                />
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="mt-2 text-xl font-extrabold text-[color:var(--color-ashoka-blue)]"
                >
                  {card.title}
                </motion.div>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="mt-2 text-base text-[color:var(--color-ashoka-blue)]/80"
                >
                  {card.desc}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Section>
      {!isLoggedIn && (
        <Section id="glimpses" title="Glimpses" className="pb-0">
          <ImageSlider
            className="mb-0"
            intervalMs={8000}
            images={eventImages}
            overlay={false}
            innerClassName="w-full h-[55vh] sm:h-[65vh] md:h-[80vh] lg:h-[100vh]"
            imageClassName="h-full w-full object-contain md:object-cover"
          />
        </Section>
      )}
      <ContactSection />
    </>
  )
}

function OAuthCallbackHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    const isAdmin = searchParams.get('isAdmin')

    if (token) {
      setToken(token)

      if (isAdmin === 'true') {
        localStorage.setItem('is_admin', 'true')
        window.location.href = '/'
      } else {
        localStorage.removeItem('is_admin')
        window.location.href = '/'
      }
    }
  }, [searchParams, navigate])

  return null
}

export default function App() {

  // Smooth-scroll to in-page anchors when the hash changes
  function ScrollToHash() {
    const location = useLocation();
    const lastHash = useRef('');

    useEffect(() => {
      if (location.hash) {
        lastHash.current = location.hash.slice(1);
      } else if (lastHash.current) {
        // Optional: Smooth scroll to top if URL hash is removed
        // window.scrollTo({ top: 0, behavior: 'smooth' });
        lastHash.current = '';
      }
    }, [location.hash]);

    useEffect(() => {
      const handleHashChange = () => {
        const hash = window.location.hash.slice(1);
        if (hash) {
          let element = document.getElementById(hash);
          // Fallback mapping: legacy "events" -> "glimpses"
          if (!element && hash === 'events') {
            element = document.getElementById('glimpses');
          }
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      };

      // Add a click listener to the document to handle clicks on <a> tags
      const handleClick = (e) => {
        const target = e.target.closest('a');

        // Check if the link is a simple hash link for the current page
        if (target && target.hash && target.getAttribute('href').startsWith('#')) {
          e.preventDefault();
          let hash = target.hash.slice(1);
          let element = document.getElementById(hash);
          // Fallback mapping for legacy links
          if (!element && hash === 'events') {
            hash = 'glimpses';
            element = document.getElementById(hash);
          }

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Update URL hash without causing a page reload
            if (window.history.pushState) {
              window.history.pushState(null, '', `#${hash}`);
            }
          }
        }
      };

      document.addEventListener('click', handleClick);
      window.addEventListener('hashchange', handleHashChange, false);

      return () => {
        document.removeEventListener('click', handleClick);
        window.removeEventListener('hashchange', handleHashChange, false);
      };
    }, []);

    return null;
  }

  // Show loading screen only once per tab session
  const [isLoading, setIsLoading] = useState(() => {
    try {
      return sessionStorage.getItem('hasSeenLoading') !== 'true'
    } catch {
      return true
    }
  })

  useEffect(() => {
    if (!isLoading) return
    // Show loading page for ~2 seconds only on first load per session
    const timer = setTimeout(() => {
      setIsLoading(false)
      try { sessionStorage.setItem('hasSeenLoading', 'true') } catch {}
    }, 2000)
    return () => clearTimeout(timer)
  }, [isLoading])

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <BrowserRouter>
      <ScrollToHash />
      <OAuthCallbackHandler />
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/internships/:id" element={<InternshipDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/user/events" element={<UserEvents />} />
            <Route path="/user/past-events" element={<Navigate to="/user/events" replace />} />
            <Route path="/user/upcoming-events" element={<Navigate to="/user/events" replace />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/events/:id" element={<EventDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
