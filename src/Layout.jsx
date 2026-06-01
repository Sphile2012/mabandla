import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Grid3X3, Heart, Menu, X, User, LogOut, GraduationCap,
  Info, CreditCard, MessageCircle, Shield, Download, Trophy,
  BookOpen, RotateCw, MessageSquare, CheckCircle, Users, Baby, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from './components/notifications/NotificationBell';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@princemath.co.za';
const GOLD = '#f5c842';
const GOLD_DARK = '#d97706';

const desktopNavItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Lessons', icon: Grid3X3, page: 'Categories' },
  { name: 'Leaderboard', icon: Trophy, page: 'Leaderboard' },
  { name: 'Pricing', icon: CreditCard, page: 'Pricing' },
  { name: 'About', icon: Info, page: 'About' },
];

const allNavItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Lessons', icon: Grid3X3, page: 'Categories' },
  { name: 'Leaderboard', icon: Trophy, page: 'Leaderboard' },
  { name: 'Formula Sheets', icon: BookOpen, page: 'FormulaSheets' },
  { name: 'Flashcards', icon: RotateCw, page: 'Flashcards' },
  { name: 'Worked Examples', icon: CheckCircle, page: 'WorkedExamples' },
  { name: 'Forum', icon: MessageSquare, page: 'Forum' },
  { name: 'Study Groups', icon: Users, page: 'StudyGroups' },
  { name: 'Pricing', icon: CreditCard, page: 'Pricing' },
  { name: 'About', icon: Info, page: 'About' },
  { name: 'Favourites', icon: Heart, page: 'Favorites', requiresAuth: true },
  { name: 'Messages', icon: MessageCircle, page: 'Messages', requiresAuth: true },
  { name: 'Dashboard', icon: GraduationCap, page: 'StudentDashboard', requiresAuth: true },
  { name: 'Certificates', icon: Award, page: 'Certificates', requiresAuth: true },
  { name: 'Parent Portal', icon: Baby, page: 'ParentPortal', requiresAuth: true },
];

function checkAccess(user) {
  if (!user) return false;
  if (user.email === ADMIN_EMAIL || user.role === 'admin') return true;
  const now = new Date();
  if (user.trial_end_date && new Date(user.trial_end_date) > now) return true;
  if (user.subscription_active && user.subscription_end_date && new Date(user.subscription_end_date) > now) return true;
  return false;
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    prince.auth.me().then(u => {
      if (u && u.email === ADMIN_EMAIL && u.role !== 'admin') {
        prince.auth.updateMe({ role: 'admin' }).then(() => setUser({ ...u, role: 'admin' })).catch(() => setUser(u));
      } else {
        setUser(u);
      }
    }).catch(() => setUser(null));
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL || user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const hasAccess = checkAccess(user);
  const trialExpired = user && !hasAccess;
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen" style={{ background: '#0f0c07' }}>

      {/* Trial expired banner */}
      {trialExpired && (
        <div className="text-center py-2.5 px-4 text-sm font-bold"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, color: '#0f0c07' }}>
          ⏰ Your free trial has ended.{' '}
          <Link to={createPageUrl('Pricing')} className="underline ml-1">Subscribe now →</Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50"
        style={{ background: 'rgba(15,12,7,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(245,200,66,0.12)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, boxShadow: '0 4px 16px rgba(245,200,66,0.4)' }}>
                <GraduationCap className="w-5 h-5 text-black" />
              </div>
              <div className="hidden sm:block">
                <div className="font-black text-white leading-none" style={{ fontFamily: "'Sora',sans-serif", fontSize: '17px', letterSpacing: '-0.02em' }}>
                  Prince <span style={{ color: GOLD }}>Math</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '9px' }}>
                  Academy · Grade 10–12
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {desktopNavItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link key={item.name} to={createPageUrl(item.page)}>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        color: isActive ? GOLD : 'rgba(255,255,255,0.55)',
                        background: isActive ? 'rgba(245,200,66,0.1)' : 'transparent',
                        border: isActive ? '1px solid rgba(245,200,66,0.25)' : '1px solid transparent',
                      }}>
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  </Link>
                );
              })}
              {(isAdmin || isTeacher) && (
                <Link to={createPageUrl('AdminUpload')}>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ color: '#22d3ee' }}>
                    <Shield className="w-4 h-4" />
                    {isAdmin ? 'Admin' : 'Teacher'}
                  </button>
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user && <NotificationBell user={user} />}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-white/5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, color: '#0f0c07', fontSize: '12px', fontWeight: '800' }}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-semibold text-white max-w-[90px] truncate">
                        {user.full_name?.split(' ')[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-2xl p-1"
                    style={{ background: '#1a1508', border: '1px solid rgba(245,200,66,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>

                    {/* User header */}
                    <div className="px-3 py-3 rounded-xl mb-1"
                      style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.1)' }}>
                      <p className="font-bold text-white text-sm">{user.full_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{user.email}</p>
                      {(isAdmin || isTeacher) && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}>
                          <Shield className="w-3 h-3" /> {isAdmin ? 'Admin' : 'Teacher'}
                        </span>
                      )}
                      {user.subscription_tier && !isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'rgba(245,200,66,0.15)', color: GOLD }}>
                          {user.subscription_tier} Plan
                        </span>
                      )}
                    </div>

                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="cursor-pointer rounded-xl"
                        style={{ color: 'rgba(255,255,255,0.75)' }}>
                        <User className="w-4 h-4 mr-2" style={{ color: GOLD }} /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Favorites')} className="cursor-pointer rounded-xl"
                        style={{ color: 'rgba(255,255,255,0.75)' }}>
                        <Heart className="w-4 h-4 mr-2 text-rose-400" /> My Favourites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('StudentDashboard')} className="cursor-pointer rounded-xl"
                        style={{ color: 'rgba(255,255,255,0.75)' }}>
                        <GraduationCap className="w-4 h-4 mr-2" style={{ color: GOLD }} /> My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('DownloadApp')} className="cursor-pointer rounded-xl"
                        style={{ color: 'rgba(255,255,255,0.75)' }}>
                        <Download className="w-4 h-4 mr-2 text-green-400" /> Download App
                      </Link>
                    </DropdownMenuItem>

                    {(isAdmin || isTeacher) && (
                      <>
                        <DropdownMenuSeparator style={{ background: 'rgba(245,200,66,0.1)' }} />
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('AdminUpload')} className="cursor-pointer rounded-xl"
                            style={{ color: '#22d3ee' }}>
                            <Shield className="w-4 h-4 mr-2" /> {isAdmin ? 'Admin Panel' : 'Teacher Panel'}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator style={{ background: 'rgba(245,200,66,0.1)' }} />
                    <DropdownMenuItem
                      onClick={() => prince.auth.logout('/')}
                      className="cursor-pointer rounded-xl"
                      style={{ color: '#f87171' }}>
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Not logged in — show Sign In + Register on desktop */
                <div className="hidden md:flex items-center gap-2">
                  <Link to={createPageUrl('Login')}>
                    <button className="px-4 h-9 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                      style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(245,200,66,0.2)' }}>
                      Sign In
                    </button>
                  </Link>
                  <Link to={createPageUrl('Register')}>
                    <button className="px-4 h-9 rounded-xl text-sm font-bold text-black transition-all hover:-translate-y-0.5"
                      style={{ background: `linear-gradient(135deg,#fde68a,${GOLD})`, boxShadow: '0 4px 14px rgba(245,200,66,0.4)' }}>
                      Start Free Trial
                    </button>
                  </Link>
                </div>
              )}

              {/* Hamburger — always visible */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl transition-all hover:bg-white/5"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ borderTop: '1px solid rgba(245,200,66,0.1)', background: 'rgba(15,12,7,0.98)' }}>
              <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
                {allNavItems.map((item) => {
                  if (item.requiresAuth && !user) return null;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link key={item.name} to={createPageUrl(item.page)} onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                          color: isActive ? GOLD : 'rgba(255,255,255,0.65)',
                          background: isActive ? 'rgba(245,200,66,0.08)' : 'transparent',
                        }}>
                        <item.icon className="w-5 h-5" style={{ color: isActive ? GOLD : 'rgba(255,255,255,0.4)' }} />
                        {item.name}
                      </button>
                    </Link>
                  );
                })}
                {(isAdmin || isTeacher) && (
                  <Link to={createPageUrl('AdminUpload')} onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ color: '#22d3ee' }}>
                      <Shield className="w-5 h-5" />
                      {isAdmin ? 'Admin Panel' : 'Teacher Panel'}
                    </button>
                  </Link>
                )}

                {/* Auth buttons in mobile menu */}
                {user ? (
                  <div className="pt-3 mt-2" style={{ borderTop: '1px solid rgba(245,200,66,0.1)' }}>
                    <button
                      onClick={() => { prince.auth.logout('/'); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                      style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-3 mt-2" style={{ borderTop: '1px solid rgba(245,200,66,0.1)' }}>
                    <Link to={createPageUrl('Register')} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full h-11 rounded-xl font-bold text-black text-sm"
                        style={{ background: `linear-gradient(135deg,#fde68a,${GOLD})`, boxShadow: '0 4px 14px rgba(245,200,66,0.35)' }}>
                        Start Free Trial
                      </button>
                    </Link>
                    <Link to={createPageUrl('Login')} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full h-11 rounded-xl font-semibold text-sm"
                        style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(245,200,66,0.2)', background: 'transparent' }}>
                        Sign In
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main content */}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>

      {/* Footer */}
      <footer style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(245,200,66,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})` }}>
                <GraduationCap className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="font-black text-white" style={{ fontFamily: "'Sora',sans-serif", fontSize: '15px' }}>
                  Prince <span style={{ color: GOLD }}>Math</span> Academy
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Grade 10–12 Mathematics by Prince Mabandla</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {['About', 'Pricing', 'DownloadApp', 'Categories'].map(p => (
                <Link key={p} to={createPageUrl(p)}
                  className="transition-colors hover:text-yellow-400">
                  {p === 'DownloadApp' ? 'Download App' : p === 'Categories' ? 'Lessons' : p}
                </Link>
              ))}
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              © {new Date().getFullYear()} Prince Mabandla
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
