"use client";

import { useId, useRef, useState } from "react";
import { track } from "@/lib/track";

type Props = {
  number: string; // digits only
  message?: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
};

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

// Opens a review step first: the visitor sees and can edit the exact message
// before anything is handed to WhatsApp.
export default function WhatsAppButton({
  number,
  message = "Hello Al Saqr Al Ahmar, I would like to discuss a steel fabrication requirement.",
  label = "WhatsApp",
  className = "btn btn-whatsapp",
  iconOnly = false,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState(message);
  const id = useId();
  const href = `https://wa.me/${number}?text=${encodeURIComponent(text.trim())}`;

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setText(message);
          ref.current?.showModal();
        }}
        aria-haspopup="dialog"
        aria-label={iconOnly ? "Message us on WhatsApp" : undefined}
      >
        <WhatsAppIcon />
        {iconOnly ? null : <span>{label}</span>}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={`${id}-title`}
        className="m-auto w-[min(34rem,calc(100vw-2rem))] bg-paper p-0 text-ink shadow-2xl"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="p-6 sm:p-7">
          <h2 id={`${id}-title`} className="text-2xl font-bold">
            Review your WhatsApp message
          </h2>
          <p className="mt-2 text-steel-text text-[0.95rem]">
            Edit the message if you like. It opens in WhatsApp, where you choose whether to send it. Avoid sharing
            sensitive documents in the chat — attach drawings through the quote form instead.
          </p>
          <label htmlFor={`${id}-msg`} className="field-label mt-5">
            Message
          </label>
          <textarea
            id={`${id}-msg`}
            className="input"
            rows={5}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="field-hint">To: +{number.replace(/^(\d{3})(\d{2})(\d{3})(\d{4})$/, "$1 $2 $3 $4")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              aria-disabled={text.trim().length === 0}
              onClick={(e) => {
                if (!text.trim()) {
                  e.preventDefault();
                  return;
                }
                track({ name: "contact_click", props: { channel: "whatsapp" } });
                ref.current?.close();
              }}
            >
              <WhatsAppIcon />
              Open WhatsApp
            </a>
            <button type="button" className="btn btn-secondary" onClick={() => ref.current?.close()}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
