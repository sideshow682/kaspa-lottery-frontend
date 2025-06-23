import { useEffect, useState } from 'react';

export default function KaspaLottery() {
  const [username, setUsername] = useState('');
  const [kaspaAddress, setKaspaAddress] = useState('');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState({ winner: '', address: '', total: 0 });
  const [history, setHistory] = useState([]);
  const [adminKey, setAdminKey] = useState('');
  const [adminMode, setAdminMode] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://kaspa-lottery-backend.onrender.com';
  const LOCAL_ADMIN_KEY = 'kaspa123admin';

  useEffect(() => {
    fetchSummary();
    fetchHistory();
    const key = localStorage.getItem('kaspa-admin-key');
    if (key === LOCAL_ADMIN_KEY) setAdminMode(true);
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/summary`);
      const data = await res.json();
      setSummary(data);
    } catch {
      setMessage("Can't connect to server.");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      const data = await res.json();
      setHistory(data);
    } catch {}
  };

  const isValidKaspaAddress = (addr) => /^kaspa:q[a-z0-9]{60,70}$/.test(addr);

  const handleSubmit = async () => {
    setMessage('');
    if (!username || !kaspaAddress) return setMessage('Name and Kaspa address required.');
    if (!isValidKaspaAddress(kaspaAddress)) return setMessage('Invalid Kaspa address.');

    try {
      const res = await fetch(`${API_BASE}/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, address: kaspaAddress })
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.message);
      setMessage(data.message);
      fetchSummary();
    } catch {
      setMessage('Submission failed.');
    }
  };

  const handleAdminLogin = () => {
    if (adminKey === LOCAL_ADMIN_KEY) {
      setAdminMode(true);
      localStorage.setItem('kaspa-admin-key', adminKey);
    } else {
      setMessage('Incorrect admin key.');
    }
  };

  const handleDraw = async () => {
    try {
      const res = await fetch(`${API_BASE}/draw`);
      const data = await res.json();
      setMessage(`Winner: ${data.winner}`);
      fetchSummary();
      fetchHistory();
    } catch {
      setMessage("Draw failed.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center' }}>🎲 Kaspa Lottery</h1>

      <p><b>Last winner:</b> {summary.winner} ({summary.address})</p>
      <p><b>Total participants:</b> {summary.total}</p>

      <input
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: '100%', padding: 12, marginBottom: 10 }}
      />
      <input
        placeholder="Your Kaspa address"
        value={kaspaAddress}
        onChange={(e) => setKaspaAddress(e.target.value)}
        style={{ width: '100%', padding: 12, marginBottom: 10 }}
      />
      <button onClick={handleSubmit} style={{ width: '100%', padding: 12, backgroundColor: '#0057ff', color: '#fff', border: 'none' }}>
        Enter Lottery
      </button>

      {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}

      {!adminMode && (
        <div style={{ marginTop: 30 }}>
          <input
            type="password"
            placeholder="Admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            style={{ padding: 10, width: '70%' }}
          />
          <button onClick={handleAdminLogin} style={{ padding: 10, marginLeft: 10 }}>
            Admin Access
          </button>
        </div>
      )}

      {adminMode && (
        <div style={{ marginTop: 30 }}>
          <h3>🛡️ Admin Panel</h3>
          <button onClick={handleDraw} style={{ padding: 12, backgroundColor: '#000', color: '#fff' }}>
            🎯 Manual Draw
          </button>
          <ul style={{ marginTop: 20 }}>
            {history.map((entry, i) => (
              <li key={i}>{entry.date.split('T')[0]} – {entry.winner} ({entry.address})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
