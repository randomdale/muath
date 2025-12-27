"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobileNav">
      <div className="mobileTop">
        <Link href="/" className="brand">Muath</Link>
        <button className="menuBtn" onClick={() => setOpen(!open)}>
          ☰ Menu
        </button>
      </div>

      {open && (
        <div className="mobileMenu">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/writing" onClick={() => setOpen(false)}>Writing</Link>
          <Link href="/reading" onClick={() => setOpen(false)}>Reading</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
        </div>
      )}
    </div>
  );
}
