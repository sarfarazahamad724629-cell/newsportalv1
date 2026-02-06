import { useState } from "react";
import "./Stylings/ParagraphSplitter.css";

export default function ParagraphSplitter({ state, setState, onInsert }) {
  const { inputText, parts, targetWords } = state;
const setInputText = (v) =>
  setState(s => ({ ...s, inputText: v }));

const setTargetWords = (v) =>
  setState(s => ({ ...s, targetWords: v }));

const setParts = (v) =>
  setState(s => ({ ...s, parts: v }));


  function splitParagraph() {
  if (!inputText.trim()) {
    setParts([]);
    return;
  }

  const words = inputText.trim().split(/\s+/);
  const results = [];

  let startIndex = 0;

  while (startIndex < words.length) {
    let endIndex = Math.min(
      startIndex + Number(targetWords),
      words.length
    );

    while (
      endIndex < words.length &&
      !words[endIndex - 1].includes("।")
    ) {
      endIndex++;
    }

    results.push(words.slice(startIndex, endIndex).join(" "));
    startIndex = endIndex;
  }

  setParts(results);
}


  function copyPart(text) {
    navigator.clipboard.writeText(text);
  }

  function downloadPart(text, index) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `part-${index + 1}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="paragraph-splitter">
      <div className="ps-card">
        <h1 className="ps-title">Hindi Paragraph Splitter</h1>

        <div className="ps-controls">
          <input
            type="number"
            min="50"
            step="50"
            value={targetWords}
            onChange={(e) => setTargetWords(e.target.value)}
            className="ps-input"
            placeholder="Target words"
          />
          <span className="ps-hint">
            Split after this many words (waits for "।")
          </span>
        </div>

        <textarea
          className="ps-textarea"
          placeholder="Yahan long Hindi paragraph paste karein..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <button onClick={splitParagraph} className="ps-primary-btn">
          Split Paragraph
        </button>

        {parts.length > 0 && (
  <div className="ps-results">
    {parts.map((part, index) => (
      <div key={index} className="ps-part">
        <h3>Part {index + 1}</h3>

        <p>{part}</p>

        <button
          onClick={() => onInsert(part)}
        >
          Insert into Post
        </button>
      </div>
    ))}
  </div>
)}

      </div>
    </div>
  );
}
