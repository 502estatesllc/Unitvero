'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const EMPTY_FORM = {
  subject: '',
  category: 'general',
  description: '',
};

export default function SupportPage() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState('');
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ticketForm, setTicketForm] = useState(EMPTY_FORM);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketStatus, setTicketStatus] = useState('open');
  const [ticketReply, setTicketReply] = useState('');
  const [ticketNotice, setTicketNotice] = useState('');

  async function loadTickets() {
    try {
      const response = await fetch('/api/support/tickets');
      const payload = await response.json();
      if (!response.ok) {
        setTickets([]);
        return;
      }
      setTickets(payload.tickets || []);
      if (selectedTicketId && !payload.tickets.some((ticket) => ticket.id === selectedTicketId)) {
        setSelectedTicketId(null);
        setSelectedTicket(null);
        setMessages([]);
      }
    } catch (error) {
      setTickets([]);
    }
  }

  async function loadTicket(ticketId) {
    const response = await fetch(`/api/support/tickets/${ticketId}/messages`);
    const payload = await response.json();
    if (!response.ok) {
      setTicketNotice(payload?.error || 'Unable to load your ticket.');
      return;
    }
    setSelectedTicketId(ticketId);
    setSelectedTicket(payload.ticket);
    setTicketStatus(payload.ticket?.status || 'open');
    setMessages(payload.messages || []);
    setTicketNotice('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setReply('Thinking…');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          email: '',
          page: 'support-page',
          userRole: 'landlord',
          source: 'support-page',
        }),
      });

      const payload = await response.json();
      setReply(payload?.reply || 'Please use the representative ticket flow for a human response.');
    } catch (error) {
      setReply('I am having trouble reaching the support assistant right now. Please use the representative ticket flow for immediate help.');
    } finally {
      setBusy(false);
    }
  }

  async function createRepresentativeTicket(event) {
    event.preventDefault();
    const subject = ticketForm.subject.trim();
    const description = ticketForm.description.trim();

    if (!subject || !description) {
      setTicketNotice('Please enter a subject and a problem description.');
      return;
    }

    setTicketSubmitting(true);
    setTicketNotice('');

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          category: ticketForm.category,
          description,
          priority: 'normal',
          source: 'support-page',
          aiContext: { summary: message || description },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setTicketNotice(payload?.error || 'Unable to create your ticket.');
        return;
      }

      setTicketForm(EMPTY_FORM);
      setTicketNotice(`Ticket created: ${payload.ticket?.reference_number || 'Reference pending'}`);
      await loadTickets();
      if (payload.ticket?.id) {
        await loadTicket(payload.ticket.id);
      }
    } catch (error) {
      setTicketNotice('The representative ticket could not be created at this time.');
    } finally {
      setTicketSubmitting(false);
    }
  }

  async function sendTicketReply(event) {
    event.preventDefault();
    if (!selectedTicket || !ticketReply.trim()) return;

    const response = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: ticketReply.trim(),
        status: ticketStatus,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setTicketNotice(payload?.error || 'Unable to send your message.');
      return;
    }

    setTicketReply('');
    setTicketNotice('Message sent successfully.');
    await loadTicket(selectedTicket.id);
    await loadTickets();
  }

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#edf4ff', color: '#0f172a', padding: '40px 18px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 20, boxShadow: '0 24px 70px rgba(15, 23, 42, 0.08)', border: '1px solid #dfe8f3', overflow: 'hidden' }}>
        <header style={{ background: 'linear-gradient(135deg, #0f172a, #17263f)', color: '#fff', padding: '28px 28px 22px' }}>
          <Link href="/" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 800, letterSpacing: '.08em' }}>UNITVERO</Link>
          <h1 style={{ margin: '14px 0 0', fontSize: 'clamp(2rem, 3vw, 3rem)', letterSpacing: '-0.06em' }}>Support</h1>
        </header>

        <div style={{ padding: '28px 28px 40px', display: 'grid', gap: 22, lineHeight: 1.7 }}>
          <p>Need help with your Unitvero account? Use the categories below to find the right support path.</p>

          <section style={{ display: 'grid', gap: 12 }}>
            <h2>Common help categories</h2>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>Account access:</strong> sign-in issues, password resets, invitation acceptance, account lockouts, and role access.</li>
              <li><strong>Payments:</strong> rent payment issues, payout setup, Stripe onboarding, failed charges, and payment history questions.</li>
              <li><strong>Maintenance:</strong> submitting repair requests, upload issues, expense records, and receipt questions.</li>
              <li><strong>Privacy / delete account:</strong> account data review, privacy questions, or deletion requests.</li>
            </ul>
          </section>

          <section>
            <h2>AI support</h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="Tell us what you need help with…"
                style={{ width: '100%', resize: 'vertical', borderRadius: 12, border: '1px solid #dbe4f0', padding: 12 }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <button type="submit" disabled={busy} style={{ background: '#1d4ed8', color: '#fff', border: 0, borderRadius: 999, padding: '10px 18px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer' }}>
                  {busy ? 'Thinking…' : 'Ask support'}
                </button>
              </div>
            </form>
            {reply && (
              <div style={{ marginTop: 16, background: '#f8fbff', border: '1px solid #dfeaf8', borderRadius: 14, padding: 14, whiteSpace: 'pre-wrap' }}>
                {reply}
              </div>
            )}
          </section>

          <section style={{ display: 'grid', gap: 16 }}>
            <h2>Talk to a Representative</h2>
            <form onSubmit={createRepresentativeTicket} style={{ display: 'grid', gap: 12, background: '#f8fbff', border: '1px solid #dfeaf8', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontWeight: 700 }}>Subject</span>
                  <input value={ticketForm.subject} onChange={(event) => setTicketForm((current) => ({ ...current, subject: event.target.value }))} placeholder="I need help with my tenant invite" style={{ border: '1px solid #dbe4f0', borderRadius: 10, padding: '10px 12px' }} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontWeight: 700 }}>Category</span>
                  <select value={ticketForm.category} onChange={(event) => setTicketForm((current) => ({ ...current, category: event.target.value }))} style={{ border: '1px solid #dbe4f0', borderRadius: 10, padding: '10px 12px' }}>
                    <option value="general">General</option>
                    <option value="account">Account</option>
                    <option value="payments">Payments</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="privacy">Privacy</option>
                    <option value="technical">Technical</option>
                  </select>
                </label>
              </div>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 700 }}>Problem description</span>
                <textarea value={ticketForm.description} onChange={(event) => setTicketForm((current) => ({ ...current, description: event.target.value }))} rows={5} placeholder="Describe the issue and include any relevant page, account details, or screenshots." style={{ width: '100%', resize: 'vertical', border: '1px solid #dbe4f0', borderRadius: 10, padding: 12 }} />
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" disabled={ticketSubmitting} style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 999, padding: '10px 18px', fontWeight: 800, cursor: ticketSubmitting ? 'not-allowed' : 'pointer' }}>
                  {ticketSubmitting ? 'Creating ticket…' : 'Create support ticket'}
                </button>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>Use the representative ticket form above for a human support request.</span>
              </div>
              {ticketNotice && (
                <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 10, padding: 10 }}>{ticketNotice}</div>
              )}
            </form>
          </section>

          <section style={{ display: 'grid', gap: 16 }}>
            <h2>My support tickets</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) minmax(0, 1fr)', gap: 18 }}>
              <aside style={{ background: '#f8fafc', border: '1px solid #dfeaf8', borderRadius: 16, padding: 12 }}>
                {tickets.length === 0 ? (
                  <div style={{ color: '#64748b' }}>No tickets created yet.</div>
                ) : (
                  tickets.map((ticket) => (
                    <button key={ticket.id} type="button" onClick={() => loadTicket(ticket.id)} style={{ width: '100%', textAlign: 'left', background: selectedTicketId === ticket.id ? '#eff6ff' : '#fff', border: '1px solid #dbeafe', borderRadius: 12, padding: 12, marginBottom: 10, cursor: 'pointer' }}>
                      <div style={{ fontWeight: 800 }}>{ticket.reference_number}</div>
                      <div style={{ fontWeight: 700 }}>{ticket.subject}</div>
                      <div style={{ color: '#64748b', fontSize: 13 }}>{ticket.category} · {ticket.status}</div>
                    </button>
                  ))
                )}
              </aside>

              <div style={{ background: '#f8fafc', border: '1px solid #dfeaf8', borderRadius: 16, padding: 16 }}>
                {!selectedTicket ? (
                  <div style={{ color: '#64748b' }}>Open a ticket to read its updates and send a reply.</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: 12, fontWeight: 800, letterSpacing: '.08em' }}>{selectedTicket.reference_number}</div>
                        <h3 style={{ margin: '4px 0 0' }}>{selectedTicket.subject}</h3>
                      </div>
                      <div style={{ fontWeight: 700, color: '#1d4ed8' }}>{selectedTicket.status}</div>
                    </div>

                    <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
                      {messages.length === 0 ? (
                        <div style={{ color: '#64748b' }}>No messages yet.</div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>{message.sender_role} · {new Date(message.created_at).toLocaleString()}</div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{message.message}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={sendTicketReply} style={{ display: 'grid', gap: 10 }}>
                      <label style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontWeight: 700 }}>Status</span>
                        <select value={ticketStatus} onChange={(event) => setTicketStatus(event.target.value)} style={{ border: '1px solid #dbe4f0', borderRadius: 10, padding: '10px 12px' }}>
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting_on_user">Waiting on User</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </label>
                      <textarea value={ticketReply} onChange={(event) => setTicketReply(event.target.value)} rows={4} placeholder="Type a follow-up message…" style={{ width: '100%', resize: 'vertical', border: '1px solid #dbe4f0', borderRadius: 10, padding: 12 }} />
                      <button type="submit" style={{ justifySelf: 'start', background: '#1d4ed8', color: '#fff', border: 0, borderRadius: 999, padding: '10px 18px', fontWeight: 800 }}>Send message</button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Use the in-app support flow or submit a representative ticket below. Email notifications are only sent when your verified Unitvero support address is configured in the server environment.</p>
          </section>

          <section>
            <h2>Need help faster?</h2>
            <p>Include your account email, the page you were viewing, the issue you expected, and any screenshots or error messages to help us review it quickly.</p>
          </section>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderTop: '1px solid #ece6d8', paddingTop: 18, color: '#5d6878' }}>
            <Link href="/privacy" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Privacy</Link>
            <Link href="/terms" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Terms</Link>
            <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
