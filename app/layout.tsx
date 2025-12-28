import "./globals.css";
import Link from "next/link";
import MobileNav from "./components/MobileNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Mobile */}
        <div className="mobileOnly">
          <MobileNav />
          <main className="mobileMain">{children}</main>
        </div>

        {/* Desktop */}
        <div className="desktopOnly layout">
          <aside className="sidebar">
            <div className="sidebarBrand">
              <Link href="/" className="brand">
                Muath&apos;s blog
              </Link>
            </div>

            <nav className="sidebarNav">
              <Link href="/" className="navLink">Home</Link>
              <Link href="/writing" className="navLink">Writing</Link>
              <Link href="/reading" className="navLink">Reading</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </aside>

          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
