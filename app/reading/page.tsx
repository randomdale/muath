import Image from "next/image";

export default function ReadingPage() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Reading</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Consooming...</p>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 18,
          alignItems: "flex-start",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 14,
          padding: 18,
          maxWidth: 640,
        }}
      >
        <div
          style={{
            width: 120,
            flex: "0 0 120px",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
        >
          <Image
            src="/books/lolita.jpg"
            alt="Lolita book cover"
            width={240}
            height={360}
            style={{ width: "100%", height: "auto", display: "block" }}
            priority
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
            Lolita
          </div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>Vladimir Nabokov</div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.12)",
              }}
            >
              Currently reading
            </span>
          </div>

          <p style={{ marginTop: 12, opacity: 0.9, maxWidth: 420 }}>
            Notes and highlights will probably land in the Writing page later.
          </p>
        </div>
      </div>
    </div>
  );
}
