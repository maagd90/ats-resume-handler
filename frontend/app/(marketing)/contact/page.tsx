"use client";

import { useState } from "react";
import { SUPPORT_EMAIL } from "@/lib/marketing/content";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!email.trim() || !message.trim()) {
      setStatus("Please enter your email and message.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch(`${API_URL}/api/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error("Send failed");
      setStatus("Message sent. We typically respond within 2 business days.");
      setMessage("");
    } catch {
      setStatus(`Could not send — email us directly at ${SUPPORT_EMAIL}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Contact support</h1>
      <p className="mt-2 text-muted-foreground">
        Expected response time: 2 business days. You can also email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 hover:underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <div className="card mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-2" required />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="textarea mt-2 min-h-[120px]" required />
        </div>
        <button type="button" onClick={handleSend} disabled={loading} className="btn-primary">
          {loading ? "Sending…" : "Send message"}
        </button>
        {status && <p className="text-sm text-brand-700 dark:text-brand-300">{status}</p>}
      </div>
    </div>
  );
}
