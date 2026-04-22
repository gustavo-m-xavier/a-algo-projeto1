import { useState, useEffect, useRef } from "react";
import type { TrackingResult } from "./types/TrackingResult";

function App() {
	const [url, setUrl] = useState("");
	const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
	const [loading, setLoading] = useState(false);
	const [trackingResults, setTrackingResults] = useState<TrackingResult[]>([]);
	const [logs, setLogs] = useState<string[]>([]);
	const eventSourceRef = useRef<EventSource | null>(null);
	const logsEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [logs]);

	useEffect(() => {
		if (!message || !message.ok) return;
		const timer = setTimeout(() => setMessage(null), 5000);
		return () => clearTimeout(timer);
	}, [message]);

	const handleSubmit = async (event: { preventDefault(): void }) => {
		event.preventDefault();

		if (!url) {
			setMessage({ text: "Por favor, insira uma URL", ok: false });
			return;
		}

		if (!url.startsWith("http")) {
			setMessage({ text: "URL inválida — use http:// ou https://", ok: false });
			return;
		}

		setLoading(true);
		setMessage(null);
		setLogs([]);

		const es = new EventSource("http://localhost:3000/logs");
		eventSourceRef.current = es;

		es.onmessage = (event) => {
			const data = JSON.parse(event.data) as { message: string };
			setLogs((prev) => [...prev, data.message]);
		};

		es.onerror = () => {
			es.close();
		};

		try {
			const response = await fetch("http://localhost:3000/monitor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ url }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Erro no servidor");
			}

			setMessage({ text: data.message, ok: true });
			setTrackingResults((prev) => [...prev, data.data]);
			setUrl("");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Erro desconhecido";
			setMessage({ text: msg, ok: false });
		} finally {
			setLoading(false);
			eventSourceRef.current?.close();
			eventSourceRef.current = null;
		}
	};

	return (
		<main style={s.page}>
			<div style={s.wrapper}>
				<header style={s.header}>
					<span style={s.logo}>&#9646;</span>
					<h1 style={s.title}>Monitoramento de Páginas</h1>
				</header>

				<section style={s.card}>
					<form onSubmit={handleSubmit} style={s.form}>
						<label style={s.label} htmlFor="url">URL da Página</label>
						<div style={s.inputRow}>
							<input
								id="url"
								type="text"
								placeholder="https://exemplo.com"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								style={s.input}
								disabled={loading}
							/>
							<button type="submit" style={s.button} disabled={loading}>
								{loading ? "Acompanhando..." : "Acompanhar"}
							</button>
						</div>
					</form>

					{message && (
						<div style={{ ...s.toast, ...(message.ok ? s.toastOk : s.toastErr) }}>
							{message.text}
						</div>
					)}
				</section>

				{(loading || logs.length > 0) && (
					<section style={s.logSection}>
						<div style={s.logHeader}>
							<span style={s.logDot} />
							<span style={s.logTitle}>Log do backend</span>
							{loading && <span style={s.logBadge}>ao vivo</span>}
						</div>
						<div style={s.logBox}>
							{logs.map((line, i) => (
								<div key={i} style={s.logLine}>
									<span style={s.logPrompt}>&gt;</span>
									<span>{line}</span>
								</div>
							))}
							{loading && (
								<div style={s.logLine}>
									<span style={s.logPrompt}>&gt;</span>
									<span style={s.logCursor}>_</span>
								</div>
							)}
							<div ref={logsEndRef} />
						</div>
					</section>
				)}

				{trackingResults.length > 0 && (
					<section style={s.resultsSection}>
						<h2 style={s.resultsTitle}>Resultados</h2>
						<ul style={s.list}>
							{trackingResults.map((result, index) => (
								<li key={index}>
									<article style={s.resultCard}>
										<div style={s.resultBadge}>#{index + 1}</div>
										<div style={s.resultRow}>
											<span style={s.resultLabel}>Antigo</span>
											<span style={s.resultValue}>{result.oldValue}</span>
										</div>
										<div style={s.resultRow}>
											<span style={s.resultLabel}>Novo</span>
											<span style={{ ...s.resultValue, color: "#76b900" }}>{result.newValue}</span>
										</div>
										<div style={s.resultRow}>
											<span style={s.resultLabel}>Data</span>
											<span style={s.resultMeta}>
												{new Date(result.date).toLocaleString("pt-BR")}
											</span>
										</div>
										<div style={s.resultRow}>
											<span style={s.resultLabel}>URL</span>
											<a
												href={result.url}
												target="_blank"
												rel="noopener noreferrer"
												style={s.link}
											>
												{result.url.length > 32 ? result.url.substring(0, 32) + "…" : result.url}
											</a>
										</div>
									</article>
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
		</main>
	);
}

const GREEN = "#76b900";
const BLACK = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#222222";
const TEXT = "#ffffff";
const MUTED = "#888888";

const s: Record<string, React.CSSProperties> = {
	page: {
		flex: 1,
		backgroundColor: BLACK,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "48px 16px",
		fontFamily: "'Segoe UI', Arial, sans-serif",
		color: TEXT,
	},

	wrapper: {
		width: "100%",
		maxWidth: "720px",
		display: "flex",
		flexDirection: "column",
		gap: "24px",
	},

	header: {
		display: "flex",
		alignItems: "center",
		gap: "12px",
	},

	logo: {
		fontSize: "28px",
		color: GREEN,
		lineHeight: 1,
	},

	title: {
		margin: 0,
		fontSize: "22px",
		fontWeight: 700,
		color: TEXT,
		letterSpacing: "0.02em",
	},

	card: {
		backgroundColor: CARD,
		border: `1px solid ${BORDER}`,
		borderRadius: "10px",
		padding: "24px",
		display: "flex",
		flexDirection: "column",
		gap: "16px",
	},

	form: {
		display: "flex",
		flexDirection: "column",
		gap: "10px",
	},

	label: {
		fontSize: "13px",
		color: MUTED,
		textTransform: "uppercase",
		letterSpacing: "0.08em",
	},

	inputRow: {
		display: "flex",
		gap: "10px",
	},

	input: {
		flex: 1,
		padding: "11px 14px",
		borderRadius: "6px",
		border: `1px solid ${BORDER}`,
		backgroundColor: "#1a1a1a",
		color: TEXT,
		fontSize: "14px",
		outline: "none",
	},

	button: {
		padding: "11px 22px",
		cursor: "pointer",
		borderRadius: "6px",
		border: "none",
		backgroundColor: GREEN,
		color: "#000000",
		fontWeight: 700,
		fontSize: "14px",
		letterSpacing: "0.03em",
		whiteSpace: "nowrap",
		transition: "opacity 0.15s",
	},

	toast: {
		padding: "10px 14px",
		borderRadius: "6px",
		fontSize: "13px",
		borderLeft: `3px solid`,
	},

	toastOk: {
		backgroundColor: "#0d1f00",
		borderColor: GREEN,
		color: "#a8d970",
	},

	toastErr: {
		backgroundColor: "#1f0d0d",
		borderColor: "#cc3333",
		color: "#ff8080",
	},

	logSection: {
		backgroundColor: CARD,
		border: `1px solid ${BORDER}`,
		borderRadius: "10px",
		overflow: "hidden",
	},

	logHeader: {
		display: "flex",
		alignItems: "center",
		gap: "8px",
		padding: "10px 16px",
		borderBottom: `1px solid ${BORDER}`,
		backgroundColor: "#0d0d0d",
	},

	logDot: {
		width: "8px",
		height: "8px",
		borderRadius: "50%",
		backgroundColor: GREEN,
		display: "inline-block",
	},

	logTitle: {
		fontSize: "12px",
		color: MUTED,
		textTransform: "uppercase",
		letterSpacing: "0.08em",
		flex: 1,
	},

	logBadge: {
		fontSize: "11px",
		color: GREEN,
		border: `1px solid ${GREEN}`,
		borderRadius: "4px",
		padding: "1px 6px",
		textTransform: "uppercase",
		letterSpacing: "0.06em",
	},

	logBox: {
		padding: "14px 16px",
		maxHeight: "260px",
		overflowY: "auto",
		display: "flex",
		flexDirection: "column",
		gap: "4px",
		fontFamily: "'Consolas', 'Courier New', monospace",
		fontSize: "13px",
	},

	logLine: {
		display: "flex",
		gap: "10px",
		color: "#cccccc",
	},

	logPrompt: {
		color: GREEN,
		userSelect: "none",
	},

	logCursor: {
		color: GREEN,
		animation: "blink 1s step-end infinite",
	},

	resultsSection: {
		display: "flex",
		flexDirection: "column",
		gap: "16px",
	},

	resultsTitle: {
		margin: 0,
		fontSize: "16px",
		color: MUTED,
		textTransform: "uppercase",
		letterSpacing: "0.08em",
	},

	list: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		display: "flex",
		flexDirection: "column",
		gap: "12px",
	},

	resultCard: {
		backgroundColor: CARD,
		border: `1px solid ${BORDER}`,
		borderLeft: `3px solid ${GREEN}`,
		borderRadius: "8px",
		padding: "18px 20px",
		display: "flex",
		flexDirection: "column",
		gap: "10px",
	},

	resultBadge: {
		fontSize: "11px",
		color: GREEN,
		fontWeight: 700,
		letterSpacing: "0.06em",
	},

	resultRow: {
		display: "flex",
		gap: "12px",
		alignItems: "baseline",
	},

	resultLabel: {
		fontSize: "11px",
		color: MUTED,
		textTransform: "uppercase",
		letterSpacing: "0.06em",
		minWidth: "52px",
	},

	resultValue: {
		fontSize: "14px",
		color: TEXT,
	},

	resultMeta: {
		fontSize: "13px",
		color: MUTED,
	},

	link: {
		color: GREEN,
		textDecoration: "none",
		fontSize: "13px",
	},
};

export default App;
