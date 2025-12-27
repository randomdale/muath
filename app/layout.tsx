import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <h2 className="brand">Muath</h2>
            <nav className="nav">
              <Link href="/">Home</Link>
              <Link href="/writing">Writing</Link>
              <Link href="/reading">Reading</Link>
              <Link href="/about">About</Link>
            </nav>
          </aside>

          <main className="main">
            <div className="content">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
