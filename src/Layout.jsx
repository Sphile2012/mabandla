import React, { useState, useEffect } from 'react';
import { prince } from '@/api/princeClient';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Grid3X3, Heart, Upload, Menu, X, User, LogOut, GraduationCap, Info, CreditCard, MessageCircle, Building2, Shield, Download, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from './components/notifications/NotificationBell';

const ADMIN_EMAIL = 'lusindisomabandla72@gmail.com';

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Lessons', icon: Grid3X3, page: 'Categories' },
  { name: 'Pricing', icon: CreditCard, page: 'Pricing' },
  { name: 'About', icon: Info, page: 'About' },
  { name: 'Favourites', icon: Heart, page: 'Favorites', requiresAuth: true },
  { name: 'Messages', icon: MessageCircle, page: 'Messages', requiresAuth: true },
  { name: 'Dashboard', icon: GraduationCap, page: 'StudentDashboard', requiresAuth: true },
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
  const navigate = useNavigate();

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
  const hasAccess = checkAccess(user);
  const trialExpired = user && !hasAccess;

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen" style={{background:'#080d1a'}}>
      {/* Trial expired banner */}
      {trialExpired && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2.5 px-4 text-sm font-medium">
          ⏰ Your free trial has ended. <Link to={createPageUrl('Pricing')} className="underline font-bold ml-1">Subscribe now to continue learning →</Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#7c3aed,#2563eb,#06b6d4)',boxShadow:'0 4px 20px rgba(124,58,237,0.5)'}}>
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{background:'#22d3ee',boxShadow:'0 0 8px #22d3ee'}} />
              </div>
              <div className="hidden sm:block">
                <div className="leading-none" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'18px',fontWeight:'800',letterSpacing:'-0.03em'}}>
                  <span style={{color:'#e2e8f0'}}>Prince</span>
                  <span style={{background:'linear-gradient(135deg,#a78bfa,#60a5fa,#22d3ee)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}> Math</span>
                </div>
                <div style={{fontSize:'9px',color:'#475569',letterSpacing:'0.2em',textTransform:'uppercase',marginTop:'2px'}}>Academy · Grade 10–12</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.requiresAuth && !user) return null;
                const isActive = currentPageName === item.page;
                return (
                  <Link key={item.name} to={createPageUrl(item.page)}>
                    <button className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}>
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link to={createPageUrl('AdminUpload')}>
                  <button className={`nav-link ${currentPageName === 'AdminUpload' ? 'nav-link-active' : 'nav-link-inactive'}`} style={{color:'#22d3ee'}}>
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </Link>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {user && <NotificationBell user={user} />}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 rounded-xl transition-all hover:bg-white/5">
                      <Avatar className="w-8 h-8" style={{ring:'2px solid rgba(124,58,237,0.5)'}}>
                        <AvatarFallback style={{background:'linear-gradient(135deg,#7c3aed,#2563eb)',color:'white',fontSize:'12px',fontWeight:'700'}}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 rounded-2xl p-1" style={{background:'#0f172a',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
                    <div className="px-3 py-3 rounded-xl mb-1" style={{background:'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(37,99,235,0.2))'}}>
                      <p className="font-semibold text-white text-sm">{user.full_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium" style={{background:'rgba(34,211,238,0.15)',color:'#22d3ee'}}>
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                      {user.subscription_tier && !isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium" style={{background:'rgba(124,58,237,0.2)',color:'#a78bfa'}}>
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
                        <Download className="w-4 h-4 mr-2 text-green-400" /> Download App
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator style={{background:'rgba(255,255,255,0.08)'}} />
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('AdminUpload')} className="cursor-pointer rounded-xl" style={{color:'#22d3ee'}}>
                            <Shield className="w-4 h-4 mr-2" /> Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator style={{background:'rgba(255,255,255,0.08)'}} />
                    <DropdownMenuItem onClick={() => prince.auth.logout('/')} className="cursor-pointer rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to={createPageUrl('Register')}>
                    <Button className="btn-primary text-sm px-4 h-9 rounded-xl border-0">Start Free Trial</Button>
                  </Link>
                  <Button onClick={() => prince.auth.redirectToLogin(window.location.href)} variant="outline" size="sm" className="rounded-xl h-9 text-slate-300 border-slate-700 hover:bg-white/5 hover:text-white">
                    Sign In
                  </Button>
                </div>
              )}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} transition={{duration:0.2}} className="md:hidden" style={{borderTop:'1px solid rgba(255,255,255,0.08)',background:'rgba(8,13,26,0.98)'}}>
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
                {isAdmin && (
                  <Link to={createPageUrl('AdminUpload')} onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{color:'#22d3ee'}}>
                      <Shield className="w-5 h-5" />Admin Panel
                    </button>
                  </Link>
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
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>

      {/* Footer */}
      <footer style={{background:'rgba(255,255,255,0.02)',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#7c3aed,#2563eb)'}}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white" style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'16px',fontWeight:'800',letterSpacing:'-0.02em'}}>
                  Prince<span style={{background:'linear-gradient(135deg,#a78bfa,#60a5fa,#22d3ee)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}> Math</span> Academy
                </div>
                <p className="text-xs text-slate-500">Grade 10-12 Mathematics by Prince Mabandla</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              {['About','Pricing','DownloadApp','Categories'].map(p => (
                <Link key={p} to={createPageUrl(p)} className="hover:text-violet-400 transition-colors">{p === 'DownloadApp' ? 'Download App' : p === 'Categories' ? 'Lessons' : p}</Link>
              ))}
            </div>
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} Prince Mabandla</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
