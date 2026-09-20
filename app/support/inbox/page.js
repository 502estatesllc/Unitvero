'use client';

import { useEffect, useState } from 'react';

export default function SupportInboxPage() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('in_progress');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadInbox() {
    setLoading(true);
    setError('');
    const response = await fetch('/api/support/inbox');
    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error || 'Access denied.');
      setTickets([]);
      setLoading(false);
      return;
    }

    setTickets(payload.tickets || []);
    setLoading(false);
  }

  async function loadTicket(ticketId) {
    const response = await fetch(`/api/support/tickets/${ticketId}/messages`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error || 'Unable to load this ticket.');
      return;
    }

    setSelected(payload.ticket);
    setStatus(payload.ticket?.status || 'in_progress');
    setMessages(payload.messages || []);
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;

    const response = await fetch(`/api/support/tickets/${selected.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply.trim(), status }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error || 'Unable to send a reply.');
      return;
    }

    setReply('');
    await loadTicket(selected.id);
    await loadInbox();
  }

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#edf4ff', padding: 24, color: '#0f172a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 18 }}>
        <header style={{ background: '#0f172a', color: '#fff', borderRadius: 18, padding: 20 }}>
          <div style={{ fontWeight: 800, letterSpacing: '.08em', fontSize: 12, opacity: 0.8 }}>UNITVERO</div>
          <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(2rem, 3vw, 2.5rem)' }}>Support Inbox</h1>
        </header>

        {error && (
          <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: 12, color: '#9f1239' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: 18 }}>Loading tickets…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)', gap: 18 }}>
            <aside style={{ background: '#fff', borderRadius: 16, border: '1px solid #dfeaf8', padding: 16 }}>
              <h2 style={{ marginTop: 0 }}>Open tickets</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {tickets.length === 0 ? (
                  <div style={{ color: '#64748b' }}>No tickets available.</div>
                ) : (
                  tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => loadTicket(ticket.id)}
                      style={{
                        textAlign: 'left',
                        background: selected?.id === ticket.id ? '#eff6ff' : '#f8fafc',
                        border: '1px solid #dbeafe',
                        borderRadius: 12,
                        padding: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 4 }}>{ticket.reference_number}</div>
                      <div style={{ fontWeight: 700 }}>{ticket.subject}</div>
                      <div style={{ color: '#64748b', marginTop: 6 }}>{ticket.category} · {ticket.status}</div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #dfeaf8', padding: 16 }}>
              {!selected ? (
                <div style={{ color: '#64748b' }}>Select a ticket to read the conversation.</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 800, letterSpacing: '.08em' }}>{selected.reference_number}</div>
                      <h2 style={{ margin: '4px 0 0' }}>{selected.subject}</h2>
                    </div>
                    <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ border: '1px solid #dbeafe', borderRadius: 10, padding: '10px 12px' }}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_on_user">Waiting on User</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, background: '#f8fafc', display: 'grid', gap: 12, marginBottom: 16 }}>
                    {messages.length === 0 ? (
                      <div style={{ color: '#64748b' }}>No messages yet.</div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 10 }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 700 }}>
                            {message.sender_role} · {new Date(message.created_at).toLocaleString()}
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{message.message}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={sendReply} style={{ display: 'grid', gap: 10 }}>
                    <textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      rows={5}
                      placeholder="Reply to the user…"
                      style={{ width: '100%', borderRadius: 10, border: '1px solid #dbeafe', padding: 12, resize: 'vertical' }}
                    />
                    <button type="submit" style={{ justifySelf: 'start', background: '#0f172a', color: '#fff', border: 0, borderRadius: 999, padding: '10px 18px', fontWeight: 800 }}>Send reply</button>
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
