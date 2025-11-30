import React from "react";
import "./KeywordsDisplay.css";
import  {useAutoScroll}  from '../util/useAutoScroll';

export default function KeywordsDisplay({ keywords }) {
  const keywordsPanelRef = useAutoScroll(keywords)
  
  return (
    <div className="panel keywords-panel content-panel" ref={keywordsPanelRef}>
      <h2 className="panel-title">Keywords</h2>
      <div className="keywords-container" >
        {keywords.map((kw, idx) => (
          <span key={`${kw}-${idx}`} className="keyword-tag fade-in-tag">
            {kw}
          </span>
        ))}
        {keywords.length === 0 && (
          <span className="keywords-placeholder">
            Keywords will appear here as you speak.
          </span>
        )}
      </div>
    </div>
  );
}
