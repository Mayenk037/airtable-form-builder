// frontend/src/components/FormRenderer.jsx

import { useEffect, useState } from "react";
import { shouldShowQuestion } from "../utils/shouldShowQuestion";

const API_BASE_URL = "http://localhost:5000";

export default function FormRenderer({ formId }) {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!formId) return;
    fetchForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/forms/${formId}`);
      const data = await res.json();
      if (!res.ok) {
        console.error("Error fetching form:", data);
        setMessage(data.message || "Failed to fetch form");
        return;
      }
      setForm(data);
    } catch (err) {
      console.error("Error fetching form:", err);
      setMessage("Error fetching form");
    }
  };

  const handleChange = (q, value) => {
    setAnswers((prev) => ({ ...prev, [q.questionKey]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    try {
      const body = {
        formId: form._id,
        answers,
      };

      const res = await fetch(`${API_BASE_URL}/api/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Error submitting response:", data);
        setMessage(data.message || "Error submitting response");
        return;
      }

      setMessage("✅ Response submitted successfully!");
      setAnswers({});
    } catch (err) {
      console.error("Error submitting response:", err);
      setMessage("Error submitting response");
    }
  };

  if (!formId) return <p>Please provide a formId.</p>;
  if (!form) return <p>Loading form...</p>;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "16px",
        marginTop: "16px",
        maxWidth: "600px",
      }}
    >
      <h3>{form.title}</h3>
      {form.description && <p>{form.description}</p>}

      <form onSubmit={handleSubmit}>
        {form.questions.map((q) => {
          const visible = shouldShowQuestion(q.conditionalRules, answers);
          if (!visible) return null;

          const value = answers[q.questionKey] || "";

          if (q.type === "longText") {
            return (
              <div key={q.questionKey} style={{ marginBottom: "8px" }}>
                <label>
                  {q.label}
                  {q.required && " *"}
                  <br />
                  <textarea
                    value={value}
                    onChange={(e) => handleChange(q, e.target.value)}
                    rows={3}
                    style={{ width: "100%" }}
                  />
                </label>
              </div>
            );
          }

          if (q.type === "singleSelect") {
            return (
              <div key={q.questionKey} style={{ marginBottom: "8px" }}>
                <label>
                  {q.label}
                  {q.required && " *"}
                  <br />
                  <select
                    value={value}
                    onChange={(e) => handleChange(q, e.target.value)}
                  >
                    <option value="">-- select --</option>
                    {q.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          }

          if (q.type === "multiSelect") {
            const arrValue = Array.isArray(value) ? value : [];
            const toggleOption = (opt) => {
              if (arrValue.includes(opt)) {
                handleChange(
                  q,
                  arrValue.filter((o) => o !== opt)
                );
              } else {
                handleChange(q, [...arrValue, opt]);
              }
            };

            return (
              <div key={q.questionKey} style={{ marginBottom: "8px" }}>
                <fieldset>
                  <legend>
                    {q.label}
                    {q.required && " *"}
                  </legend>
                  {q.options.map((opt) => (
                    <label key={opt} style={{ marginRight: "8px" }}>
                      <input
                        type="checkbox"
                        checked={arrValue.includes(opt)}
                        onChange={() => toggleOption(opt)}
                      />{" "}
                      {opt}
                    </label>
                  ))}
                </fieldset>
              </div>
            );
          }

          // default = shortText
          return (
            <div key={q.questionKey} style={{ marginBottom: "8px" }}>
              <label>
                {q.label}
                {q.required && " *"}
                <br />
                <input
                  value={value}
                  onChange={(e) => handleChange(q, e.target.value)}
                />
              </label>
            </div>
          );
        })}

        <button type="submit" style={{ marginTop: "8px" }}>
          Submit
        </button>
      </form>

      {message && <p style={{ marginTop: "8px" }}>{message}</p>}
    </div>
  );
}
