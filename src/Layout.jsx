import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Grid3X3, Heart, Menu, X, User, LogOut, GraduationCap, Info, CreditCard, MessageCircle, Shield, Download, Moon, Sun, Trophy, BookOpen, RotateCw, MessageSquare, CheckCircle, MessageSquare as ForumIcon, Users, Baby, Award, Bot, Flame, PenLine, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from './components/notifications/NotificationBell';
import BrandLogo from '@/components/BrandLogo';
import { useTheme } from 'next-themes';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Lessons', icon: Grid3X3, page: 'Categories' },
  { name: 'Practice', icon: PenLine, page: 'Practice' },
  { name: 'Daily Challenge', icon: Flame, page: 'DailyChallenge' },
  { name: 'AI Study Assistant', icon: Bot, page: 'AIChat' },
  { name: 'User Guide', icon: BookOpen, page: 'UserGuide' },
  { name: 'Leaderboard', icon: Trophy, page: 'Leaderboard' },
  { name: 'Formula Sheets', icon: BookOpen, page: 'FormulaSheets' },
  { name: 'Flashcards', icon: RotateCw, page: 'Flashcards' },
  { name: 'Worked Examples', icon: CheckCircle, page: 'WorkedExamples' },
  { name: 'Forum', icon: ForumIcon, page: 'Forum' },
  { name: 'Study Groups', icon: Users, page: 'StudyGroups' },
  { name: 'Certificates', icon: Award, page: 'Certificates', requiresAuth: true },
  { name: 'Parent Portal', icon: Baby, page: 'ParentPortal', requiresAuth: true },
  { name: 'Pricing', icon: CreditCard, page: 'Pricing' },
  { name: 'About', icon: Info, page: 'About' },
  { name: 'Feedback', icon: MessageSquare, page: 'Feedback' },
  { name: 'Favourites', icon: Heart, page: 'Favorites', requiresAuth: true },
  { name: 'Messages', icon: MessageCircle, page: 'Messages', requiresAuth: true },
  { name: 'Dashboard', icon: GraduationCap, page: 'StudentDashboard', requiresAuth: true },
];

const bottomNavItems = [
  { name: 'Home', icon: Home, page: 'Home', match: ['Home'] },
  { name: 'Learn', icon: BookOpen, page: 'Categories', match: ['Categories', 'VideoPlayer', 'Favorites', 'FormulaSheets'] },
  { name: 'Practice', icon: PenLine, page: 'Practice', match: ['Practice', 'DailyChallenge', 'Flashcards', 'WorkedExamples'] },
  { name: 'Progress', icon: BarChart3, page: 'StudentDashboard', match: ['StudentDashboard', 'Leaderboard', 'Certificates'] },
  { name: 'Profile', icon: User, page: 'Profile', match: ['Profile', 'PublicProfile', 'ChangePassword'] },
];

const desktopPrimaryPages = new Set(['Home', 'Categories', 'Practice', 'DailyChallenge']);

function checkAccess(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const now = new Date();
  if (user.trial_end_date && new Date(user.trial_end_date) > now) return true;
  if (user.subscription_active && user.subscription_end_date && new Date(user.subscription_end_date) > now) return true;
  return false;
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (currentPageName === 'Login') return;

    setMounted(true);
    prince.auth.me().then(setUser).catch(() => setUser(null));
  }, [currentPageName]);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const hasAccess = checkAccess(user);
  const trialExpired = Boolean(
    user?.trial_end_date &&
    Number.isFinite(new Date(user.trial_end_date).getTime()) &&
    new Date(user.trial_end_date) <= new Date() &&
    !hasAccess
  );

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  if (currentPageName === 'Login') return children;

  // Signed-out Home is the full-screen cover: no navigation until the learner is inside the app.
  const isCover = currentPageName === 'Home' && !user;

  return (
    <div className="app-shell min-h-screen bg-background text-foreground transition-colors">
      {/* Trial expired banner */}
      {trialExpired && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2.5 px-4 text-sm font-medium">
          ? Your free trial has ended. <Link to={createPageUrl('Pricing')} className="underline font-bold ml-1">Subscribe now to continue learning ?</Link>
        </div>
      )}

      {/* Navigation */}
      <nav className={`glass sticky top-0 z-50 ${isCover ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <BrandLogo className="h-12 w-12 drop-shadow-[0_5px_12px_rgba(37,99,235,0.28)]" showText />
            </Link>

            <nav aria-label="Desktop navigation" className="hidden items-center gap-1 lg:flex">
              {navItems.filter((item) => desktopPrimaryPages.has(item.page)).map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition-colors ${isActive ? 'bg-violet-500/15 text-violet-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-xl px-2 text-slate-300 hover:bg-white/5 hover:text-white" aria-label="Open all pages menu">
                    <Menu className="h-4 w-4" />
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="app-user-menu max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                  {navItems.map((item) => {
                    if (item.requiresAuth && !user) return null;
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link to={createPageUrl(item.page)} className="cursor-pointer rounded-xl text-slate-300 hover:text-white">
                          <item.icon className="mr-2 h-4 w-4 text-violet-400" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  {(isAdmin || isTeacher) && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminUpload')} className="cursor-pointer rounded-xl text-cyan-400">
                          <Shield className="mr-2 h-4 w-4" />
                          {isAdmin ? 'Admin Panel' : 'Teacher Panel'}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Right */}
            <div className="flex items-center gap-2">
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
                  className="theme-toggle p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                  aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'day'} mode`}
                  title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'day'} mode`}
                >
                  {resolvedTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              )}
              {user && <NotificationBell user={user} />}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 rounded-xl transition-all hover:bg-white/5">
                      <Avatar className="w-8 h-8 ring-2 ring-violet-500/50">
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-bold text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="app-user-menu w-60 rounded-2xl border border-white/10 bg-slate-900 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                    <div className="mb-1 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-600/20 px-3 py-3">
                      <p className="font-semibold text-white text-sm">{user.full_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                      {(isAdmin || isTeacher) && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-cyan-400/15 px-2 py-0.5 text-xs font-medium text-cyan-400">
                          <Shield className="w-3 h-3" /> {isAdmin ? 'Admin' : 'Teacher'}
                        </span>
                      )}
                      {user.subscription_tier && !isAdmin && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
                          {user.subscription_tier} Plan
                        </span>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="cursor-pointer rounded-xl text-slate-300 hover:text-white">
                        <User className="w-4 h-4 mr-2 text-violet-400" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Favorites')} className="cursor-pointer rounded-xl text-slate-300 hover:text-white">
                        <Heart className="w-4 h-4 mr-2 text-rose-400" /> My Favourites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('DownloadApp')} className="cursor-pointer rounded-xl text-slate-300 hover:text-white">
                        <Download className="w-4 h-4 mr-2 text-green-400" /> Install App
                      </Link>
                    </DropdownMenuItem>
                    {(isAdmin || isTeacher) && (
                      <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('AdminUpload')} className="cursor-pointer rounded-xl text-cyan-400">
                            <Shield className="w-4 h-4 mr-2" /> {isAdmin ? 'Admin Panel' : 'Teacher Panel'}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={() => prince.auth.logout('/')} className="cursor-pointer rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden items-center gap-2">
                  <Link to={createPageUrl('Register')}>
                    <Button className="btn-primary text-sm px-4 h-9 rounded-xl border-0">Start Free Trial</Button>
                  </Link>
                  <Button onClick={() => prince.auth.redirectToLogin(window.location.href)} variant="outline" size="sm" className="rounded-xl h-9 text-slate-300 border-slate-700 hover:bg-white/5 hover:text-white">
                    Sign In
                  </Button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 lg:hidden"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="primary-mobile-navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div id="primary-mobile-navigation" className="app-mobile-menu border-t border-white/10 bg-[#080d1a]/[0.98]" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => {
                  if (item.requiresAuth && !user) return null;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link key={item.name} to={createPageUrl(item.page)} onClick={() => setMobileMenuOpen(false)}>
                      <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}>
                        <item.icon className="w-5 h-5" />{item.name}
                      </button>
                    </Link>
                  );
                })}
                {(isAdmin || isTeacher) && (
                  <Link to={createPageUrl('AdminUpload')} onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cyan-400">
                      <Shield className="w-5 h-5" />{isAdmin ? 'Admin Panel' : 'Teacher Panel'}
                    </button>
                  </Link>
                )}
                {user && (
                  <div className="pt-3 border-t border-white/10">
                    <Button onClick={() => { prince.auth.logout('/'); setMobileMenuOpen(false); }} variant="outline" className="w-full rounded-xl border-red-700 text-red-400 hover:bg-red-500/10">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                )}
                {!user && (
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <Link to={createPageUrl('Register')} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full btn-primary rounded-xl border-0">Start Free Trial</Button>
                    </Link>
                    <Button onClick={() => { prince.auth.redirectToLogin(window.location.href); setMobileMenuOpen(false); }} variant="outline" className="w-full rounded-xl border-slate-700 text-slate-300 hover:bg-white/5">Sign In</Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main */}
      <main className={`${isCover ? 'min-h-screen' : 'min-h-[calc(100vh-4rem)]'} ${isCover || ['Register', 'ForgotPassword', 'ResetPassword', 'OTPVerify', 'CompleteProfile', 'ChangePassword'].includes(currentPageName) ? '' : 'pb-[calc(5rem+env(safe-area-inset-bottom))]'}`}>{children}</main>

      {/* Footer */}
      <footer className={`app-footer hidden border-t border-white/[0.06] bg-white/[0.02] pb-20 ${isCover ? '' : 'md:block'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-11 w-11" showText />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              {['About', 'Pricing', 'DownloadApp', 'Categories', 'DailyChallenge', 'AIChat', 'UserGuide'].map(p => (
                <Link key={p} to={createPageUrl(p)} className="hover:text-violet-400 transition-colors">
                  {p === 'DownloadApp' ? 'Install App' : p === 'Categories' ? 'Lessons' : p === 'DailyChallenge' ? 'Daily Challenge' : p === 'AIChat' ? 'AI Assistant' : p === 'UserGuide' ? 'User Guide' : p}
                </Link>
              ))}
            </div>
            <p className="text-xs text-slate-600">� {new Date().getFullYear()} Prince Mabandla</p>
          </div>
        </div>
      </footer>

      {!isCover && !['Register', 'ForgotPassword', 'ResetPassword', 'OTPVerify', 'CompleteProfile', 'ChangePassword'].includes(currentPageName) && (
        <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-violet-100 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(116,64,234,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d0a1f]/95">
          <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-2">
            {bottomNavItems.map((item) => {
              const active = item.match.includes(currentPageName);
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold transition-all ${active ? 'text-violet-600 dark:text-violet-300' : 'text-slate-500 hover:text-violet-600'}`}
                >
                  <span className={`flex h-8 w-12 items-center justify-center rounded-full transition-all group-hover:scale-105 ${active ? 'bg-violet-100 dark:bg-violet-500/20' : ''}`}>
                    <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
