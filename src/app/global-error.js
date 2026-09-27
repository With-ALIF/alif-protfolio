"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0f0f0f", color: "#fff" }}>
          <div style={{ textAlign: "center" }}>
            <h1>Something went wrong</h1>
            <p>{error?.message || "Unexpected error."}</p>
            <button onClick={reset}>Try again</button>
          </div>
        </div>
      </body>
    </html>
  );
}
