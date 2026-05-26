'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

type Stock = {
  id: string;
  ticker: string;
  company_name: string | null;
  thesis: string | null;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [thesis, setThesis] = useState('');

  useEffect(() => {
    checkUserAndLoad();
  }, []);

async function checkUserAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
      return;
    }
    await loadStocks();
  }

  async function loadStocks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setStocks(data || []);
    setLoading(false);
  }

  async function addStock(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('stocks').insert({
      user_id: user.id,
      ticker: ticker.toUpperCase().trim(),
      company_name: companyName.trim() || null,
      thesis: thesis.trim() || null,
    });

    if (error) {
      alert('Error adding stock: ' + error.message);
      return;
    }

    setTicker('');
    setCompanyName('');
    setThesis('');
    setShowForm(false);
    await loadStocks();
  }

  async function deleteStock(id: string) {
    if (!confirm('Delete this stock and all its catalysts/notes?')) return;
    const { error } = await supabase.from('stocks').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else await loadStocks();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>📈 Stock Tracker</h1>
        <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
      </header>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{ padding: '10px 20px', marginBottom: 20, cursor: 'pointer', background: '#0070f3', color: 'white', border: 'none', borderRadius: 6, fontSize: 16 }}
      >
        {showForm ? '✕ Cancel' : 'Add one to get started'}
      </button>

      {showForm && (
        <form onSubmit={addStock} style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Ticker *</label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g., AAPL"
              required
              style={{ width: '100%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Company Name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Apple Inc."
              style={{ width: '100%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Thesis</label>
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="Why are you tracking this stock?"
              rows={3}
              style={{ width: '100%', padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>
            Save Stock
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : stocks.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>
          No stocks yet. Click "+ Add Stock" to start tracking.
        </p>
      ) : (
        <div>
          {stocks.map((stock) => (
            <div key={stock.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href={`/dashboard/stock/${stock.id}`} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{stock.ticker}</div>
                {stock.company_name && <div style={{ color: '#666', fontSize: 14 }}>{stock.company_name}</div>}
                {stock.thesis && <div style={{ color: '#444', marginTop: 6, fontSize: 14 }}>{stock.thesis}</div>}
              </Link>
              <button
                onClick={() => deleteStock(stock.id)}
                style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', marginLeft: 10 }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}