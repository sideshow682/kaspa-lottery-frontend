// === Kaspa Lottery Frontend with Green Theme, Countdown, and txid field ===
import { useEffect, useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [kaspaAddress, setKaspaAddress] = useState('');
  const [txid, setTxid] = useState('');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState({ winner: '', address: '', total: 0 });
  const [history, setHistory] = useState([]);
  const [adminKey, setAdminKey] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [countdown, setCountdown] = useState('');

  const LOCAL_ADMIN_KEY = 'kaspa123admin';
  const BACKEND_URL = 'https://kaspa-lottery-backend.onrender.com';

  useEffect(() => {
    fetchSummary();
    fetchHistory();
    const saved = localStorage.getItem('kaspa-admin-key');
    if (saved === LOCAL_ADMIN_KEY) setAdminMode(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateCountdown = () => {
    const now = new Date();
    const target = new Date();
    target.setUTCHours(0, 0, 0, 0);
    if (target < now) target.setUTCDate(target.getUTCDate() + 1);
    const secondsLeft = Math.floor((target - now) / 1000);
    const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const s = String(secondsLeft % 60).padStart(2, '0');
    setCountdown(`${h}:${m}:${s}`);
  };

  const isValidKaspaAddress = (address) => {
    return /^kaspa:q[a-z0-9]{60,70}$/.test(address);
  };

  const fetchSummary = async () => {
    const res = await fetch(BACKEND_URL + '/summary');
    const data = await res.json();
    setSummary(data);
  };

  const fetchHistory = async () => {
    const res = await fetch(BACKEND_URL + '/history');
    const data = await res.json();
    setHistory(data);
  };

  const submitTicket = async () => {
    if (!username || !kaspaAddress || !txid) return setMessage('All fields required.');
    if (!isValidKaspaAddress(kaspaAddress)) return setMessage('Invalid Kaspa address.');
    try {
      const res = await fetch(BACKEND_URL + '/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, address: kaspaAddress, txid })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchSummary();
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("Network error.");
    }
  };

  const forceDraw = async () => {
    const res = await fetch(BACKEND_URL + '/draw');
    const data = await res.json();
    setMessage(`Winner: ${data.winner}`);
    fetchSummary();
    fetchHistory();
  };

  const tryLoginAdmin = () => {
    if (adminKey === LOCAL_ADMIN_KEY) {
      setAdminMode(true);
      localStorage.setItem('kaspa-admin-key', adminKey);
    } else {
      setMessage("Incorrect admin key.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'Arial', backgroundColor: '#004e1a', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>🎲 Kaspa Lottery</h1>

      <p><b>⏳ Next Draw In:</b> {countdown}</p>
      <p><b>🏆 Last winner:</b> {summary.winner} ({summary.address})</p>
      <p><b>🎟️ Total participants:</b> {summary.total}</p>

      <input
        type="text"
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc' }}
      />
      <input
        type="text"
        placeholder="Your Kaspa address"
        value={kaspaAddress}
        onChange={(e) => setKaspaAddress(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc' }}
      />
      <input
        type="text"
        placeholder="Kaspa txid (payment proof)"
        value={txid}
        onChange={(e) => setTxid(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc' }}
      />

      <button onClick={submitTicket} style={{ width: '100%', padding: 12, backgroundColor: '#00c753', color: 'white', borderRadius: 6, border: 'none' }}>
        Enter Lottery
      </button>

      {message && <p style={{ color: 'lime', marginTop: 10 }}>{message}</p>}

      {!adminMode && (
        <div style={{ marginTop: 30 }}>
          <input
            type="password"
            placeholder="Admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            style={{ padding: 10, width: '70%', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button onClick={tryLoginAdmin} style={{ padding: 10, marginLeft: 10, backgroundColor: '#333', color: 'white', borderRadius: 6 }}>
            Admin Access
          </button>
        </div>
      )}

      {adminMode && (
        <div style={{ marginTop: 30 }}>
          <h3>🛡️ Admin Panel</h3>
          <button onClick={forceDraw} style={{ padding: 12, background: 'black', color: 'white', borderRadius: 6 }}>
            🎯 Draw Winner
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
