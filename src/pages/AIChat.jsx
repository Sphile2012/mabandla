import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, LoaderCircle, Send, Sparkles, UserRound } from 'lucide-react';
import { prince } from '@/api/princeClient';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const suggestedQuestions = [
  'Can you explain quadratic equations?',
  'How do I find the gradient of a line?',
  'Help me understand trigonometric ratios.',
];

export default function AIChat() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    prince.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const sendMessage = async (event) => {
    event?.preventDefault();
    const question = draft.trim();
    if (!question || sending || !user) return;
    if (question.length > 2000) {
      setError('Please keep your question under 2,000 characters.');
      return;
    }

    const nextMessages = [...messages.slice(-11), { role: 'user', content: question }];
    setMessages(nextMessages);
    setDraft('');
    setSending(true);
    setError('');

    try {
      const result = await prince.functions.invoke('aiChat', { messages: nextMessages });
      if (typeof result?.answer !== 'string' || !result.answer.trim()) {
        throw new Error('The AI tutor returned an empty answer. Please try again.');
      }
      setMessages([...nextMessages, { role: 'assistant', content: result.answer.trim() }]);
    } catch (requestError) {
      setError(requestError.message || 'The AI tutor is unavailable right now. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading account">
        <LoaderCircle className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-5">
        <div className="mb-2 flex items-center gap-2 text-violet-300">
          <Bot className="h-5 w-5" />
          <span className="text-sm font-semibold">Study assistant</span>
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Ask a maths question</h1>
        <p className="mt-2 text-sm text-slate-400">
          Get a step-by-step explanation for Grade 10–12 mathematics.
        </p>
      </header>

      {!user ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-slate-200">Sign in to ask the AI study assistant a question.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild><Link to={createPageUrl('Login')}>Sign in</Link></Button>
            <Button asChild variant="outline"><Link to={createPageUrl('Register')}>Create account</Link></Button>
          </div>
        </section>
      ) : (
        <>
          <section
            aria-label="Conversation"
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5"
          >
            {messages.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <div className="mb-3 rounded-2xl bg-violet-500/15 p-3 text-violet-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="font-medium text-white">What are you working on?</p>
                <p className="mt-1 text-sm text-slate-400">Ask a question or choose an example below.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setDraft(question)}
                      className="rounded-full border border-violet-400/20 bg-violet-400/5 px-3 py-2 text-left text-xs text-violet-200 transition-colors hover:bg-violet-400/10"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <span className="mt-1 rounded-full bg-violet-500/15 p-2 text-violet-300">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'border border-white/10 bg-white/[0.05] text-slate-100'
                }`}>
                  {message.content}
                </p>
                {message.role === 'user' && (
                  <span className="mt-1 rounded-full bg-white/10 p-2 text-slate-300">
                    <UserRound className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-sm text-slate-400" role="status">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Working through your question…
              </div>
            )}
            {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-200">{error}</p>}
            <div ref={bottomRef} />
          </section>

          <form onSubmit={sendMessage} className="mt-3 flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            <Textarea
              value={draft}
              onChange={(event) => { setDraft(event.target.value); setError(''); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage(event);
                }
              }}
              maxLength={2000}
              rows={2}
              placeholder="Type your maths question…"
              aria-label="Your maths question"
              disabled={sending}
              className="max-h-36 min-h-12 resize-y border-0 bg-transparent text-white shadow-none focus-visible:ring-0"
            />
            <Button type="submit" disabled={!draft.trim() || sending} size="icon" aria-label="Send question" className="mb-1 shrink-0">
              {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-2 text-center text-xs text-slate-500">
            AI can make mistakes. Check important answers with your teacher or study materials.
          </p>
        </>
      )}
    </div>
  );
}
