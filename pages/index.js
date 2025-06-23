export default function Home() {
  return (
    <div style={{ fontFamily: 'Arial', padding: 30, textAlign: 'center' }}>
      <h1>🎲 Bienvenue sur Kaspa Lottery</h1>
      <p>Connexion au backend : <code>{process.env.NEXT_PUBLIC_BACKEND_URL}</code></p>
      <p>Le frontend fonctionne !</p>
    </div>
  );
}