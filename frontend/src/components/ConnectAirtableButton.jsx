// frontend/src/components/ConnectAirtableButton.jsx

import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000"; // backend

function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("userId");
}

export default function ConnectAirtableButton() {
  const [userId, setUserId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromUrl = getUserIdFromUrl();
    if (fromUrl) {
      localStorage.setItem("userId", fromUrl);
      setUserId(fromUrl);
    } else {
      const stored = localStorage.getItem("userId");
      if (stored) setUserId(stored);
    }

    if (localStorage.getItem("userId")) {
      setConnected(true);
    }
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/airtable/login`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to get Airtable login URL");
      }
    } catch (err) {
      console.error("Error starting Airtable login:", err);
      alert("Error starting Airtable login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "16px", padding: "8px", border: "1px solid #ddd" }}>
      <h3>Airtable Connection</h3>
      {connected ? (
        <p>
          ✅ Airtable connected for user: <strong>{userId}</strong>
        </p>
      ) : (
        <>
          <p>Connect your Airtable account to start building forms.</p>
          <button onClick={handleConnect} disabled={loading}>
            {loading ? "Redirecting..." : "Connect Airtable"}
          </button>
        </>
      )}
    </div>
  );
}
