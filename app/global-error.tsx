"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="uz">
      <body
        style={{
          background: "#0a0714",
          color: "#f2f0fa",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Ilovada jiddiy xatolik
        </h1>
        <p style={{ color: "#a29dc4", fontSize: "0.875rem" }}>
          Sahifani yangilab ko&apos;ring.
        </p>
        <button
          onClick={reset}
          style={{
            background: "linear-gradient(100deg, #a855f7, #6366f1)",
            color: "#fff",
            border: 0,
            padding: "0.7rem 1.4rem",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Qayta urinish
        </button>
      </body>
    </html>
  );
}
