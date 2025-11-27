// frontend/src/components/FormBuilder.jsx

import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

export default function FormBuilder() {
  const [userId, setUserId] = useState(null);
  const [bases, setBases] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [selectedFields, setSelectedFields] = useState({});
  const [loadingBases, setLoadingBases] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [formTitle, setFormTitle] = useState("My Airtable Form");
  const [formDescription, setFormDescription] = useState("");
  const [message, setMessage] = useState("");

    useEffect(() => {
    // 1. Try to read from URL: ?userId=...
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("userId");

    if (fromUrl) {
      setUserId(fromUrl);
      localStorage.setItem("userId", fromUrl);
      fetchBases(fromUrl);
      return;
    }

    // 2. Fall back to localStorage
    const stored = localStorage.getItem("userId");
    if (stored) {
      setUserId(stored);
      fetchBases(stored);
    }
  }, []);


  const fetchBases = async (uid) => {
    try {
      setLoadingBases(true);
      const res = await fetch(`${API_BASE_URL}/api/airtable/bases?userId=${uid}`);
      const data = await res.json();
      setBases(data.bases || []);
    } catch (err) {
      console.error("Error fetching bases:", err);
      setMessage("Failed to fetch bases");
    } finally {
      setLoadingBases(false);
    }
  };

  const fetchTables = async (baseId) => {
    if (!userId || !baseId) return;
    try {
      setLoadingTables(true);
      const res = await fetch(
        `${API_BASE_URL}/api/airtable/bases/${baseId}/tables?userId=${userId}`
      );
      const data = await res.json();
      setTables(data.tables || []);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setMessage("Failed to fetch tables");
    } finally {
      setLoadingTables(false);
    }
  };

  const handleBaseChange = (e) => {
    const baseId = e.target.value;
    setSelectedBaseId(baseId);
    setSelectedTableId("");
    setTables([]);
    setSelectedFields({});
    if (baseId) fetchTables(baseId);
  };

  const handleTableChange = (e) => {
    const tableId = e.target.value;
    setSelectedTableId(tableId);
    setSelectedFields({});
  };

  const mapAirtableTypeToQuestionType = (airtableType) => {
    if (airtableType === "singleSelect") return "singleSelect";
    if (airtableType === "multipleSelects") return "multiSelect";
    if (airtableType === "multilineText") return "longText";
    if (airtableType === "attachment") return "attachment";
    return "shortText";
  };

  const toggleField = (tableId, field) => {
    const key = `${tableId}:${field.id}`;
    setSelectedFields((prev) => {
      const copy = { ...prev };
      if (copy[key]) {
        delete copy[key];
      } else {
        copy[key] = {
          questionKey: field.name.replace(/\s+/g, "_").toLowerCase(),
          airtableFieldId: field.id,
          label: field.name,
          type: mapAirtableTypeToQuestionType(field.type),
          required: false,
          options: field.options?.choices?.map((c) => c.name) || [],
          conditionalRules: null,
        };
      }
      return copy;
    });
  };

  const handleSubmitFormDefinition = async () => {
    if (!userId) {
      setMessage("User not connected. Please Connect Airtable first.");
      return;
    }
    if (!selectedBaseId || !selectedTableId) {
      setMessage("Please select base and table.");
      return;
    }
    const questions = Object.values(selectedFields);
    if (questions.length === 0) {
      setMessage("Please select at least one field.");
      return;
    }

    const body = {
      userId,
      title: formTitle,
      description: formDescription,
      airtableBaseId: selectedBaseId,
      airtableTableId: selectedTableId,
      questions,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Error creating form:", data);
        setMessage(data.message || "Failed to create form");
        return;
      }
      setMessage(`✅ Form created with id: ${data._id || data.form?._id}`);
    } catch (err) {
      console.error("Error creating form:", err);
      setMessage("Error creating form");
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", marginTop: "16px" }}>
      <h3>Form Builder</h3>
      {!userId && <p>❗No userId found. Please connect Airtable first.</p>}

      <div style={{ marginBottom: "8px" }}>
        <label>
          Form title:{" "}
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>
          Description:{" "}
          <input
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label>
          Select Base:{" "}
          {loadingBases ? (
            <span>Loading bases...</span>
          ) : (
            <select value={selectedBaseId} onChange={handleBaseChange}>
              <option value="">-- choose --</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>

      {selectedBaseId && (
        <div style={{ marginBottom: "8px" }}>
          <label>
            Select Table:{" "}
            {loadingTables ? (
              <span>Loading tables...</span>
            ) : (
              <select value={selectedTableId} onChange={handleTableChange}>
                <option value="">-- choose --</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>
      )}

      {selectedTableId && (
        <div style={{ marginTop: "12px" }}>
          <h4>Fields</h4>
          <p>Select which Airtable fields become questions in your form.</p>
          {tables
            .find((t) => t.id === selectedTableId)
            ?.fields.map((field) => {
              const key = `${selectedTableId}:${field.id}`;
              const selected = !!selectedFields[key];

              return (
                <div key={field.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleField(selectedTableId, field)}
                    />{" "}
                    {field.name} ({field.type})
                  </label>
                </div>
              );
            })}
        </div>
      )}

      <button style={{ marginTop: "12px" }} onClick={handleSubmitFormDefinition}>
        Save Form
      </button>

      {message && <p style={{ marginTop: "8px" }}>{message}</p>}
    </div>
  );
}
