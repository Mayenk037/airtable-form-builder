// src/FormBuilder.jsx
// Simple starting point for your Form Builder

import { useEffect, useState } from "react";

function FormBuilder() {
  const [userId, setUserId] = useState("");
  const [bases, setBases] = useState([]);
  const [loadingBases, setLoadingBases] = useState(false);
  const [selectedBaseId, setSelectedBaseId] = useState("");

  // Detect userId from URL ?userId=xxxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    if (id) {
      setUserId(id);
    }
  }, []);

  // Fetch Airtable bases for this user
  const fetchBases = async () => {
    if (!userId) return;

    try {
      setLoadingBases(true);
      const res = await fetch(
        `http://localhost:5000/api/airtable/bases?userId=${userId}`
      );
      const data = await res.json();

      if (res.ok) {
        setBases(data.bases || []);
      } else {
        alert("Error fetching bases (probably fake token, but UI is correct)");
      }
    } catch (err) {
      console.error("Error fetching bases:", err);
    } finally {
      setLoadingBases(false);
    }
  };

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Airtable Form Builder
      </h1>

      {!userId && (
        <p style={{ opacity: 0.7 }}>
          ⚠️ No userId found. Connect Airtable first.
        </p>
      )}

      {/* Button to load bases */}
      <button
        onClick={fetchBases}
        disabled={!userId}
        style={{
          padding: "0.5rem 1rem",
          background: "#f97316",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        Load Airtable Bases
      </button>

      {/* Bases dropdown */}
      {loadingBases ? (
        <p>Loading bases...</p>
      ) : (
        bases.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Select Airtable Base:
            </label>
            <select
              value={selectedBaseId}
              onChange={(e) => setSelectedBaseId(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                width: "300px",
              }}
            >
              <option value="">-- Choose Base --</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )
      )}
    </div>
  );
}

export default FormBuilder;
