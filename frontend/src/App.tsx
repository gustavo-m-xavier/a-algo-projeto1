import { useState } from "react";
import type { MonitorationResults } from "./types/MonitorationResults";

function App() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [monitorationResults, setMonitorationResults] = useState<
    MonitorationResults[]
  >([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!url) {
      setMessage("Por favor, insira uma URL");
      return;
    }

    if (!url.startsWith("http")) {
      setMessage("URL inválida");
      return;
    }

    setLoading(true);
    setMessage("Enviando...");

    try {
      const response = await fetch("http://localhost:3000/monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro");
      }

      setMessage(data.message);
      setMonitorationResults((prev) => [...prev, data.data]);
      setUrl("");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Monitorar Página</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <fieldset style={styles.fieldSet}>
            <label htmlFor="url">URL da Página</label>
            <input
              type="text"
              name="url"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={styles.input}
            />
          </fieldset>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Carregando..." : "Monitorar"}
          </button>
        </form>

        {setTimeout(() => setMessage(""), 5000) && message && (
          <p style={styles.message}>{message}</p>
        )}
      </section>

      {monitorationResults.length > 0 && (
        <section>
          <h2>Resultados das tentativas de Monitoramento</h2>
          {monitorationResults.map((result, index) => {
            return (
              <ul style={styles.list}>
                <li style={styles.resultCard} key={index}>
                  <h3>Resultado da tentativa {index + 1}</h3>
                  <p>
                    <strong>Valor Antigo:</strong> {result.oldValue}
                  </p>
                  <p>
                    <strong>Valor Novo:</strong> {result.newValue}
                  </p>
                </li>
              </ul>
            );
          })}
        </section>
      )}
    </main>
  );
}

const styles = {
  page: {
    flex: 1,
    height: "100vh",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    backgroundColor: "#f9f9f9",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "400px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },

  resultCard: {
    backgroundColor: "#f9f9f9",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "300px",
    display: "flex",
    flexDirection: "column" as const,
  },

  title: {
    margin: 0,
    textAlign: "center" as const,
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
  },

  fieldSet: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
    border: "none",
    padding: 0,
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  button: {
    padding: "12px",
    cursor: "pointer",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007BFF",
    color: "#fff",
    fontWeight: "bold" as const,
    transition: "0.2s",
  },

  list: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    gap: "15px",
  },

  message: {
    textAlign: "center" as const,
    fontSize: "14px",
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "6px",
    backgroundColor: "#f0f0f0",
  },
};

export default App;
