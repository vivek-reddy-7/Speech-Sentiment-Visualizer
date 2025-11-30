import { useEffect, useRef } from "react";

function useAutoScroll(content) {
  const panelRef = useRef(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [content]);

  return panelRef;
}

export { useAutoScroll };
