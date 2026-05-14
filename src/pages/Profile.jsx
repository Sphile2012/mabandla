import { useState, useEffect, useRef } from 'react';
import { prince } from '@/api/princeClient';
import { motion } from 'framer-motion';
import { User, Building2, Save, CheckCircle, Shield, LogOut, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const banks = ['FNB','Standard Bank','ABSA','Nedbank','Capitec','African Bank','Discovery Bank','TymeBank','Investec'];
const grades = ['Grade 10','Grade 11','Grade 12'];

// Reusable dark section card — plain function, no forwardRef needed
function Section({ sectionRef = null, icon, title, desc, children }) {
  return (
    <div ref={sectionRef} className="rounded-2xl p-5 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">{desc}</p>
      {children}
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const bankingRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '', phone_number: '', grade: '',
    bank_name: '', account_holder: '', account_number: '', account_type: '',
  });

  useEffect(() => {
    if (window.location.hash === '#banking') {
      setTimeout(() => bankingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    }
    prince.auth.me().then(u => {
      setUser(u);
      setFormData({
        full_name: u.full_name || '',
        phone_number: u.phone_number || '',
        grade: u.grade || '',
        bank_name: u.bank_name || '',
        account_holder: u.account_holder || '',
        account_number: u.account_number || '',
        account_type: u.account_type || '',
      });
    }).catch(() => navigate(createPageUrl('Login')));
  }, []);

  const set = field => e => setFormData(p => ({ ...p, [field]: e.target.value }));
  const setS = field => v => setFormData(p => ({ ...p, [field]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) { toast.error('Full name is required'); return; }
    setLoading(true); setSaved(false);
    try {
      await prince.auth.updateMe(formData);
      const updated = await prince.auth.me();
      setUser(updated);
      setSaved(true);
      toast.success('Profile updated!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    prince.auth.logout('/');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080d1a' }}>
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const now = new Date();
  const trialActive = user.trial_end_date && new Date(user.trial_end_date) > now;
  const subActive = user.subscription_active && user.subscription_end_date && new Date(user.subscription_end_date) > now;

  return (
    <div className="min-h-screen pb-12" style={{ background: '#080d1a' }}>
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4" style={{ background: 'linear-gradient(135deg,#0f0a2e,#1a0a3e,#0a1628)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.25) 0%,transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
            {initials}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{user.full_name}</h1>
          <p className="text-slate-400 text-sm mb-3">{user.email}</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {user.grade && <Badge variant="outline" className="bg-white/10 text-slate-200 border-white/15">{user.grade}</Badge>}
            {trialActive && <Badge variant="warning" className="">Trial Active</Badge>}
            {subActive && <Badge variant="success" className="">{user.subscription_tier} · Active</Badge>}
            {!trialActive && !subActive && user.subscription_tier && <Badge variant="destructive" className="">Subscription Expired</Badge>}
          </div>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="space-y-5">

          {/* Personal Info */}
          <Section icon={<User className="w-4 h-4 text-violet-400" />} title="Personal Information" desc="Your account details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Full Name *</Label>
                <Input value={formData.full_name} onChange={set('full_name')} placeholder="Your full name" className="mt-1.5" required />
              </div>
              <div>
                <Label className="text-slate-300">Email Address</Label>
                <Input value={user.email} disabled className="mt-1.5 opacity-50" />
              </div>
              <div>
                <Label className="text-slate-300">Phone Number</Label>
                <Input type="tel" value={formData.phone_number} onChange={set('phone_number')} placeholder="e.g. 0812345678" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-slate-300">Grade Level</Label>
                <Select value={formData.grade} onValueChange={setS('grade')}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* Banking */}
          <Section sectionRef={bankingRef} icon={<Building2 className="w-4 h-4 text-violet-400" />} title="Banking Details" desc="Used for refunds only">
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
              <Shield className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300">Securely stored and only used for refunds. Never shared with third parties.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Bank Name</Label>
                <Select value={formData.bank_name} onValueChange={setS('bank_name')}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select your bank" /></SelectTrigger>
                  <SelectContent>{banks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Account Holder Name</Label>
                <Input value={formData.account_holder} onChange={set('account_holder')} placeholder="Full name as per bank account" className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Account Number</Label>
                  <Input value={formData.account_number} onChange={set('account_number')} placeholder="Account number" className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-slate-300">Account Type</Label>
                  <Select value={formData.account_type} onValueChange={setS('account_type')}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Section>

          {/* Subscription */}
          <Section icon={<CreditCard className="w-4 h-4 text-violet-400" />} title="Subscription" desc="Your current plan">
            {trialActive ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div>
                  <p className="text-white font-semibold">Free Trial</p>
                  <p className="text-amber-300 text-sm">Expires {new Date(user.trial_end_date).toLocaleDateString()}</p>
                </div>
                <Link to={createPageUrl('Pricing')}>
                  <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                    Subscribe
                  </button>
                </Link>
              </div>
            ) : subActive ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div>
                  <p className="text-white font-semibold">{user.subscription_tier} Plan</p>
                  <p className="text-emerald-300 text-sm">Valid until {new Date(user.subscription_end_date).toLocaleDateString()}</p>
                </div>
                <Badge variant="success" className="">Active</Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-semibold">No Active Plan</p>
                  <p className="text-slate-400 text-sm">Subscribe to access all lessons</p>
                </div>
                <Link to={createPageUrl('Pricing')}>
                  <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                    View Plans
                  </button>
                </Link>
              </div>
            )}
          </Section>

          {/* Save */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="h-11 px-6 rounded-xl font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
