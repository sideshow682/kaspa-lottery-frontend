import { useEffect, useState } from 'react';

export default function Home() {
  const [addresses, setAddresses] = useState([]);
  const [username, setUsername] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState({ winner: '', address: '', total: 0 });
  const [history, setHistory] = useState([]);
  const [adminKey, setAdminKey] = useState('');
  const [adminMode, setAdminMode] = useState(false);

  const fetchAddresses = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/addresses');
    const data = await res.json();
    setAddresses(data.addresses);
  };

  const fetchSummary = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/summary');
    const data = await res.json();
    setSummary(data);
  };

  const fetchHistory = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/history');
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchAddresses();
    fetchSummary();
    fetchHistory();
    const saved = localStorage.getItem('kaspa-admin-key');
    if (saved === 'kaspa123admin') setAdminMode(true);
  }, []);

  const submitTicket = async () => {
    if (!username || !selectedAddress) return setMessage('Champs requis.');
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, address: selectedAddress })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      fetchSummary();
    } else setMessage(data);
  };

  const forceDraw = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/draw');
    const data = await res.json();
    setMessage("Gagnant : " + data.winner);
    fetchSummary();
    fetchHistory();
  };

  const tryLoginAdmin = () => {
    if (adminKey === 'kaspa123admin') {
      setAdminMode(true);
      localStorage.setItem('kaspa-admin-key', adminKey);
    } else {
      setMessage("Clé admin incorrecte.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center' }}>🎲 Kaspa Lottery</h1>

      <p><b>Dernier gagnant :</b> {summary.winner} ({summary.address})</p>
      <p><b>Total participants :</b> {summary.total}</p>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Ton nom"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
        />
        <select
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          style={{ width: '100%', padding: 10 }}
        >
          <option value="">-- Adresse Kaspa --</option>
          {addresses.map((a, i) => (
            <option key={i} value={a}>{a}</option>
          ))}
        </select>
        <button onClick={submitTicket} style={{ marginTop: 10, padding: 10, width: '100%' }}>
          Participer
        </button>
      </div>

      {message && <p style={{ color: 'green' }}>{message}</p>}

      <hr />

      {!adminMode && (
        <div style={{ marginTop: 30 }}>
          <input
            type="password"
            placeholder="Clé admin"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            style={{ padding: 8, width: '70%' }}
          />
          <button onClick={tryLoginAdmin} style={{ padding: 8, marginLeft: 10 }}>
            Accès admin
          </button>
        </div>
      )}

      {adminMode && (
        <>
          <h3>🛡️ Panneau Admin</h3>
          <button onClick={forceDraw} style={{ padding: 10, background: 'black', color: 'white' }}>
            🎯 Tirer un gagnant
          </button>
          <ul style={{ marginTop: 20 }}>
            {history.map((entry, i) => (
              <li key={i}>{entry.date.split('T')[0]} – {entry.winner} ({entry.address})</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}