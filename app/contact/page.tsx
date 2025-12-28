import { sendEmail } from "./actions";
import SubmitButton from "./SubmitButton";

export default function Contact({
  searchParams,
}: {
  searchParams?: { sent?: string; error?: string };
}) {
  const sent = searchParams?.sent === "1";
  const error = searchParams?.error === "1";

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      {sent && <p>Sent.</p>}
      {error && <p>Invalid email or message.</p>}

      <form action={sendEmail} style={{ display: "grid", gap: 12 }}>
        {/* honeypot */}
        <input
          name="company"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: "none" }}
        />

        <input name="email" placeholder="Your email" required />
        <textarea name="message" placeholder="Message" rows={6} required />
        <SubmitButton />
      </form>
    </div>
  );
}
