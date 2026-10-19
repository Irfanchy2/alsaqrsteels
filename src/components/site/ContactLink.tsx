"use client";

import { track } from "@/lib/track";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  channel: "phone" | "email" | "maps";
};

// Plain anchor that records a privacy-safe "contact_click" event.
export default function ContactLink({ channel, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track({ name: "contact_click", props: { channel } });
        onClick?.(e);
      }}
    />
  );
}
