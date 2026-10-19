"use client";

import { useEffect, useState } from "react";

// Shows how many attachments went with this reference, from the browser's own
// record of the submission (nothing is fetched from the server).
export default function SubmittedDetails({ reference }: { reference: string }) {
  const [files, setFiles] = useState<number | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("asq-last-enquiry");
      if (!raw) return;
      const last = JSON.parse(raw) as { reference: string; files: number };
      if (last.reference === reference) setFiles(last.files);
    } catch {}
  }, [reference]);
  if (files === null) return null;
  return (
    <p className="mt-3 text-steel-text">
      {files === 0 ? "No files were attached." : `${files} ${files === 1 ? "file was" : "files were"} attached and stored privately.`}
    </p>
  );
}
