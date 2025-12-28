"use server";

import { Resend } from "resend";
import { redirect } from "next/navigation";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  // honeypot (spam bots fill this)
  const company = String(formData.get("company") || "").trim();
  if (company) redirect("/contact?sent=1");

  if (!isValidEmail(email) || message.length < 5) {
    redirect("/contact?error=1");
  }

  await resend.emails.send({
    from: "Muath's Blog <onboarding@resend.dev>",
    to: ["moaathx1x@gmail.com"], // your inbox
    replyTo: email,              // makes replies go to the sender
    subject: `New message from ${email}`,
    text: `Sender email (unverified): ${email}\n\n${message}`,
  });

  redirect("/contact?sent=1");
}
