// src/App.jsx
console.log("🚀 Loaded COMBINED App.jsx");
import { useEffect, useState } from "react";
import FormBuilder from "./components/FormBuilder.jsx";
import FormRenderer from "./components/FormRenderer.jsx";

const API_BASE_URL = "http://localhost:5000";

function App() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [previewFormId, setPreviewFormId] = useState("");

  // On first load: if Airtable callback added ?userId=... to URL, store it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("userId");

    if (uid) {
      localStorage.setItem("userId", uid);
      console.log("Stored Airtable userId from URL:", uid);
    }
  }, []);

  // ---------- Airtable Connect Handler (same logic as before) ----------
  const handleConnectAirtable = async () => {
    try {
      setIsConnecting(true);
      setStatusMessage("");

      const res = await fetch(`${API_BASE_URL}/api/auth/airtable/login`);
      const data = await res.json();

      if (data.url) {
        // Redirect to Airtable OAuth screen
        window.location.href = data.url;
      } else {
        setStatusMessage("Could not get Airtable login URL from backend.");
      }
    } catch (err) {
      console.error("Error starting Airtable login:", err);
      setStatusMessage("Failed to start Airtable login.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#0f172a",
        color: "#e5e7eb",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "16px" }}>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>
            Smart Airtable Form Builder
          </h1>
          <p style={{ opacity: 0.8, fontSize: "0.95rem" }}>
            Connect Airtable, build a form from a base & table, preview it, and
            submit responses that sync with MongoDB (and optionally Airtable).
          </p>
        </header>

        {/* Connect Airtable section */}
        <section
          style={{
            marginBottom: "20px",
            padding: "16px",
            borderRadius: "12px",
            background: "#020617",
            border: "1px solid rgba(148,163,184,0.5)",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
            1. Connect Airtable
          </h2>
          <button
            type="button"
            onClick={handleConnectAirtable}
            disabled={isConnecting}
            style={{
              padding: "0.6rem 1.4rem",
              borderRadius: "999px",
              border: "none",
              background: isConnecting ? "#facc15" : "#f97316",
              color: "#020617",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: isConnecting ? "not-allowed" : "pointer",
            }}
          >
            {isConnecting ? "Redirecting to Airtable..." : "Connect Airtable"}
          </button>

          {statusMessage && (
            <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>
              {statusMessage}
            </p>
          )}

          <p style={{ marginTop: "6px", fontSize: "0.8rem", opacity: 0.7 }}>
            After you approve access on Airtable, you will be redirected back
            here with a <code>?userId=...</code> in the URL. We store that in{" "}
            <code>localStorage</code> so the builder can call Airtable APIs.
          </p>
        </section>

        {/* Builder + Preview layout */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          {/* Left: Form Builder */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "#020617",
              border: "1px solid rgba(148,163,184,0.5)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
              2. Build a Form from Airtable
            </h2>
            <p style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: 8 }}>
              Select a base, choose a table, and pick which Airtable fields
              should become questions in your form. Then click{" "}
              <strong>Save Form</strong>.
            </p>
            <FormBuilder />
          </div>

          {/* Right: Form Preview */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "#020617",
              border: "1px solid rgba(148,163,184,0.5)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
              3. Preview & Submit Form
            </h2>
            <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
              Paste a <code>formId</code> from MongoDB (for example, from the{" "}
              <strong>Save Form</strong> response or Compass) to render and test
              that form.
            </p>

            <input
              style={{
                width: "100%",
                padding: "6px 10px",
                marginTop: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(148,163,184,0.7)",
                background: "#020617",
                color: "#e5e7eb",
              }}
              placeholder="Enter formId here..."
              value={previewFormId}
              onChange={(e) => setPreviewFormId(e.target.value)}
            />

            {previewFormId && (
              <div
                style={{
                  marginTop: "12px",
                  background: "#020617",
                  borderRadius: "8px",
                  border: "1px solid rgba(148,163,184,0.4)",
                  padding: "10px",
                }}
              >
                <FormRenderer formId={previewFormId} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
