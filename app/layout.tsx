import "./globals.css";
import Link from "next/link";
import MobileNav from "./components/MobileNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MobileNav />
<div className="shell">
  <aside className="sidebar"> ... </aside>
  <main className="main">{children}</main>
</div>
        <div className="shell">
          <aside
  style={{
    width: 260,
    padding: 24,
    borderRight: "1px solid #eee",
    display: "none",
  }}
  className="sidebar"
>
          </aside>
          <main className="main">
            <div className="content">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
