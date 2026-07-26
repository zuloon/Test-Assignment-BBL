import { useState } from "react";
import { copyTextToClipboard } from "../utils/clipboard";

export function useClipboardStatus(timeoutMs = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyToClipboard(id: string, text: string) {
    await copyTextToClipboard(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), timeoutMs);
  }

  return { copiedId, copyToClipboard };
}
