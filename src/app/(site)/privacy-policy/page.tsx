import { permanentRedirect } from "next/navigation";

// Old URL kept alive for links and search results.
export default function LegacyRedirect() {
  permanentRedirect("/privacy");
}
