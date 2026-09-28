// Small markdown helper for club posts.
// Supports the handful of bits people actually type on a wall.
//
// SECURITY: the post body is untrusted user input that is rendered with
// dangerouslySetInnerHTML. We therefore HTML-escape the entire input FIRST,
// so any raw HTML the user typed (e.g. <script>, <img onerror=...>) becomes
// inert text, and only THEN apply our own markdown -> HTML transforms. The
// tags we emit are a fixed, safe allowlist; user text can never introduce
// new tags or attributes because its angle brackets are already entities.

function escapeHtml(src) {
  return src
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only allow links whose scheme is safe. Blocks javascript:, data:, vbscript:,
// etc. Relative links (/mod, #anchor) and http(s)/mailto are allowed.
function safeUrl(url) {
  const trimmed = url.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (/^(\/|#|\.\/|\.\.\/)/.test(trimmed)) return trimmed;
  return "#";
}

function renderMarkdown(src) {
  const text = String(src ?? "");

  // 1) Neutralize all HTML in the raw input before doing anything else.
  const escaped = escapeHtml(text);

  // 2) Apply the limited markdown vocabulary to the now-safe text.
  //    Note: the link regex matches on the escaped text, so the label and URL
  //    contain no raw <, >, or quotes; we still scheme-check the URL.
  return escaped
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
      const href = escapeHtml(safeUrl(url));
      return `<a href="${href}" rel="nofollow noopener noreferrer">${label}</a>`;
    })
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n/g, "<br>");
}

module.exports = { renderMarkdown, escapeHtml, safeUrl };
