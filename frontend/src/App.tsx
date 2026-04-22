import { useState, type SubmitEvent } from "react";
import type { TrackingResult } from "./types/TrackingResult";

function App() {
	const [url, setUrl] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [trackingResults, setTrackingResults] = useState<TrackingResult[]>([]);

	console.log(trackingResults)

	const handleSubmitAsync = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

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
			setTrackingResults((prev) => [...prev, data.data]);
			setUrl("");
		} catch (err: unknown) {
			if (err instanceof Error) {
				setMessage(err.message);
			} else {
				setMessage("Erro desconhecido");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<main style={styles.page}>
			<section style={styles.card} key={"monitoration-form"}>
				<h1 style={styles.title}>Monitorar Página</h1>

				<form onSubmit={handleSubmitAsync} style={styles.form}>
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

			<RenderIf condition={trackingResults.length > 0}>
				<section key={"monitorationResults"} style={{ marginTop: "30px" }}>
					<h2>Resultados</h2>

					<ul style={styles.list}>
						{trackingResults.map((result, index) => {
							return (
								<li key={index}>
									<article style={styles.resultCard}>
										<h3>Tenativa {index + 1}</h3>
										<p>
											<strong>Valor Antigo:</strong> {result.oldValue}
										</p>
										<p>
											<strong>Valor Novo:</strong> {result.newValue}
										</p>

										<p style={styles.date}>
											<strong>Data:</strong>{" "}
											{new Date(result.date).toLocaleString("pt-br")}
										</p>

										<p >
											<strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer">
												{result.url.substring(0, 24)}...
											</a>
										</p>
									</article>
								</li>
							);
						})}
					</ul>
				</section>
			</RenderIf>
		</main>
	);
}

function RenderIf({ condition, children }: { condition: boolean; children: React.ReactNode }) {
	return condition ? children : null;
}

const styles: Record<string, React.CSSProperties> = {
	page: {
		flex: 1,
		minHeight: "100dvh",
		backgroundColor: "#ffffff",
		display: "flex",
		flexDirection: "column",
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
		flexDirection: "column",
		gap: "12px",
		border: "1px solid #e0e0e0",
	},

	resultCard: {
		backgroundColor: "#f9f9f9",
		padding: "30px",
		borderRadius: "12px",
		boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
		width: "300px",
		display: "flex",
		flexDirection: "column",
		border: "1px solid #e0e0e0",
	},

	title: {
		margin: 0,
		textAlign: "center",
	},

	form: {
		display: "flex",
		flexDirection: "column",
		gap: "15px",
	},

	fieldSet: {
		display: "flex",
		flexDirection: "column",
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
		fontWeight: "bold",
		transition: "0.2s",
	},

	list: {
		listStyle: "none",
		padding: 0,
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: "24px",
	},

	message: {
		textAlign: "center",
		fontSize: "14px",
		border: "1px solid #ccc",
		padding: "10px",
		borderRadius: "6px",
		backgroundColor: "#f0f0f0",
	},

	date: {
		fontSize: "12px",
		color: "#666",
		border: "1px solid #ccc",
		padding: "10px",
		borderRadius: "6px",
		backgroundColor: "#f0f0f0",
		width: "fit-content"
	}
};

export default App;
