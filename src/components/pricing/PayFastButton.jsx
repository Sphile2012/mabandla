import React, { useState } from 'react';
import { prince } from '@/api/princeClient';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PayFastButton({ grade, tier, price, highlighted, color }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const user = await prince.auth.me().catch(() => null);
      if (!user) {
        prince.auth.redirectToLogin(window.location.href);
        return;
      }

      // Strip any non-numeric chars (handles 'R100', 'R 100', 'R150', etc.)
      const amountNum = parseInt(String(price).replace(/[^0-9]/g, ''), 10);
      if (!amountNum || amountNum <= 0) {
        toast.error('Invalid price amount');
        setLoading(false);
        return;
      }

      const response = await prince.functions.invoke('createPayFastPayment', {
        grade,
        tier,
        amount: amountNum,
      });

      // Handle both { paymentUrl, paymentData } and { data: { paymentUrl, paymentData } }
      const result = response?.data || response;
      const { paymentUrl, paymentData } = result;

      if (!paymentUrl || !paymentData) {
        throw new Error('Invalid payment response from server');
      }

      // Build and submit form to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;
      form.style.display = 'none';

      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // Note: don't remove form — browser needs it during redirect
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + (error.message || 'Please try again'));
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={`w-full h-11 md:h-12 ${
        highlighted
          ? 'bg-white text-slate-800 hover:bg-white/90 font-semibold'
          : `bg-gradient-to-r ${color} text-white hover:opacity-90`
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span className="text-sm md:text-base">Processing...</span>
        </>
      ) : (
        <>
          <span className="text-sm md:text-base">Pay with Your Bank</span>
          <ArrowRight className="w-4 h-4 ml-1 md:ml-2" />
        </>
      )}
    </Button>
  );
}