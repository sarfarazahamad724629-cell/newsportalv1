import React, { useEffect, useState } from "react";
import "./Stylings/SocialliaGen.css";

const SocialliaGen = () => {
  const [prompt, setPrompt] = useState("");
  const [imageEl, setImageEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [puterLoaded, setPuterLoaded] = useState(false);

  // Explicitly load Puter script
  useEffect(() => {
    if (!window.puter) {
      const script = document.createElement("script");
      script.src = "https://js.puter.com/v2/";
      script.async = true;
      script.onload = () => setPuterLoaded(true);
      document.body.appendChild(script);
    } else {
      setPuterLoaded(true);
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return alert("Please enter a prompt");
    if (!puterLoaded) return alert("AI engine is still loading");

    setLoading(true);
    setImageEl(null);

    try {
      const imageElement = await window.puter.ai.txt2img(prompt, {
        model: "gpt-image-1.5",
      });

      setImageEl(imageElement);
    } catch (err) {
      console.error(err);
      alert("Image generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sociallia-gen">
      <h1>SocialliaGen</h1>

      <label>Prompt</label>
      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to generate..."
      />

      <button onClick={handleGenerate} disabled={loading || !puterLoaded}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {!puterLoaded && <p>Loading AI engine…</p>}

      {imageEl && (
        <div className="gen-output">
          <h2>Output</h2>
          <div
            className="image-wrapper"
            ref={(ref) => {
              if (ref && imageEl) {
                ref.innerHTML = "";
                ref.appendChild(imageEl);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SocialliaGen;
