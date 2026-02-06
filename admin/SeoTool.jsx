import React, { useState, useEffect } from "react";
import "./Stylings/SeoTool.css";

const SeoTool = ({ state, setState, onApply }) => {
  const { input, output, loading, error } = state;
  const [puterLoaded, setPuterLoaded] = useState(false);

  /* =======================
     STATE HELPERS
  ======================= */

  const setInput = (key, value) =>
    setState(s => ({
      ...s,
      input: { ...s.input, [key]: value },
    }));

  const setOutput = (data) =>
    setState(s => ({
      ...s,
      output: data,
    }));

  const setLoading = (v) =>
    setState(s => ({ ...s, loading: v }));

  const setError = (msg) =>
    setState(s => ({ ...s, error: msg }));

  /* =======================
     LOAD PUTER AI
  ======================= */

  useEffect(() => {
    if (window.puter?.ai) {
      setPuterLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;

    script.onload = () => {
      if (window.puter?.ai) setPuterLoaded(true);
    };

    document.body.appendChild(script);
  }, []);

  /* =======================
     AI TEXT EXTRACTOR
     (CRITICAL FIX)
  ======================= */

  const extractText = (res) => {
    if (!res) return "";

    // string response
    if (typeof res === "string") return res;

    // OpenAI-style
    if (res?.choices?.[0]?.message?.content)
      return res.choices[0].message.content;

    // Puter new format
    if (Array.isArray(res?.output)) {
      return res.output
        .flatMap(o => o.content || [])
        .map(c => c.text || "")
        .join("");
    }

    // recursive fallbacks
    if (res?.message) return extractText(res.message);
    if (res?.content) return extractText(res.content);
    if (res?.text) return extractText(res.text);

    return "";
  };

  /* =======================
     GENERATE SEO
  ======================= */
  const normalizeTags = (tags) => {
  if (!tags) return [];

  // already array
  if (Array.isArray(tags)) {
    return tags.map(t => String(t).trim()).filter(Boolean);
  }

  // string → split
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
  }

  // anything else → ignore
  return [];
};

const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    // attempt repair
    try {
      const fixed = text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");

      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
};



  const handleGenerate = async () => {
    if (!input.title || !input.content) {
      setError("Please provide both headline and content");
      return;
    }

    if (!window.puter?.ai || !puterLoaded) {
      setError("AI is still initializing");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const prompt = `
You are a **TOP-TIER PROFESSIONAL HINDI NEWS SEO WRITER** trained for **NEWS PORTALS, AGENCIES, and GOOGLE DISCOVER**.

You must rewrite the given news content into a **fresh, original, SEO-optimized Hindi news article** suitable for **daily publication**, while keeping the **same meaning, facts, names, places, and attribution**.

STRICT SYSTEM RULES (NO EXCEPTIONS):

1. OUTPUT MUST BE **VALID JSON ONLY**
2. DO NOT use markdown
3. DO NOT add explanations, comments, or extra text
4. DO NOT ask questions
5. DO NOT shorten, summarize, or omit any part of the article
6. DO NOT add new facts or opinions
7. DO NOT remove author credit or source names

CONTENT REWRITE RULES (VERY IMPORTANT):

* Rewrite the **ENTIRE ARTICLE**, paragraph by paragraph
* Maintain **same length as input content (±10%)**
* Language must be **PURE, STANDARD, PROFESSIONAL HINDI**
* Style must be **journalistic news writing**, not blog or marketing
* Sentence structure must be **reworked**, not copied
* Preserve:

  * Names
  * Locations
  * Quotes (if any)
  * Credits
  * Source identifiers
* Ensure the content is **plagiarism-safe** and **editor-approved**
* Avoid English words inside Hindi content unless they are proper nouns

FIELD-WISE RULES:

SEO Title:

* Hindi only
* News-style headline
* SEO optimized with main keywords
* Informative and professional
* NOT clickbait
* Do NOT include unnecessary adjectives
* Must Include Names If Present In Input Title

SEO Content:

* Hindi only(Use pure Hindi, no English words)
* Use Proper Hindi Words
* Full rewritten article
* Same length as input (±10%)
* Neutral, factual, news tone
* Optimized with natural keyword placement
* Paragraph spacing must be preserved logically

Permalink Text:

* English only(Pure English, no Hindi Or Hindi words)
* lowercase
* hyphen-separated
* SEO friendly
* Must include:

  * Main topic in short(6-8 words,10 words max)
  * Sentence Used In Slug Should Be Always Meaningful

Tags:

* Must be a JSON ARRAY
* Tags Must Be Related To The Article
* Tags Must Not Be Generic type or Poor SEO type
* Tags Can Be 3 Worded Max with Spaces
* Minimum 7 tags
* English only
* Tags must be:

  * Relevant to the article (SEO focused)
  * News-appropriate
  * SEO focused
* Avoid unrelated geographic or political tags unless present in content
* Example: Winter Skin Care , Green Vegetables , Natural Beauty , Skin Glow Tips, Shahnaz Hussain ,Herbal Beauty ,Healthy Diet


Search Description:

* Hindi only(Pure Hindi, no English words)
* Maximum 30 words
* SEO-optimized summary
* Neutral, informative, news-style
* No promotional language

OUTPUT FORMAT (MUST MATCH EXACTLY):

{
"SEO Title": "",
"SEO Content": "",
"Permalink Text": "",
"Tags": [],
"Search Description": "",
}

INPUT DATA BELOW.
DO NOT REPEAT INPUT.
DO NOT COMMENT.
DO NOT EXPLAIN.

Title: ${input.title}
Content: ${input.content}`;

      const response = await window.puter.ai.chat(prompt, {
        model: "gpt-4.1-nano",
      });

      const text = extractText(response);

      if (!text || typeof text !== "string") {
        throw new Error("Empty AI response");
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("RAW AI RESPONSE:", text);
        throw new Error("Invalid JSON returned");
      }

      const parsed = safeParseJSON(jsonMatch[0]);

if (!parsed) {
  console.error("BROKEN JSON FROM AI:", jsonMatch[0]);
  throw new Error("AI returned invalid JSON");
}


      setOutput({
        title: parsed["SEO Title"] || "",
        content: parsed["SEO Content"] || "",
        slug: parsed["Permalink Text"] || "",
        tags: normalizeTags(parsed["Tags"]),
        description: parsed["Search Description"] || "",
      });

    } catch (err) {
      console.error(err);
      setError("Failed to generate SEO data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     RENDER
  ======================= */

    return (
    <div className="socialia-wrapper">

      {/* TITLE BAR */}
      <h2 className="socialia-title">
        Socialia – Your Writing Assistant
      </h2>

      <div className="socialia-layout">

        {/* ================= INPUT PANEL ================= */}
        <div className="socialia-panel input-panel">
          <h3>Input</h3>

          <label>Title</label>
          <input
            value={input.title}
            onChange={e => setInput("title", e.target.value)}
          />

          <label>Content</label>
          <textarea
            value={input.content}
            onChange={e => setInput("content", e.target.value)}
          />

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !puterLoaded}
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {!puterLoaded && (
            <p className="info-text">
              Initializing AI…
            </p>
          )}

          {error && (
            <p className="error-text">
              {error}
            </p>
          )}
        </div>

        {/* ================= OUTPUT PANEL ================= */}
        <div className="socialia-panel output-panel">
          <h3>Output</h3>

          {/* ROW 1 */}
          <div className="two-col">
            <div className="field">
              <label>Title</label>
              <div className="copy-box">
                <input value={output.title || ""} readOnly />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(output.title || "")
                  }
                >
                  📋
                </button>
              </div>
            </div>

            <div className="field">
              <label>Tags</label>
              <div className="copy-box">
                <input
                  value={(output.tags || []).join(", ")}
                  readOnly
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      (output.tags || []).join(", ")
                    )
                  }
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* ROW 2 */}
          <div className="two-col">
            <div className="field">
              <label>Permalink / Slug</label>
              <div className="copy-box">
                <input value={output.slug || ""} readOnly />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(output.slug || "")
                  }
                >
                  📋
                </button>
              </div>
            </div>

            <div className="field">
              <label>Search Description</label>
              <div className="copy-box">
                <input
                  value={output.description || ""}
                  readOnly
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      output.description || ""
                    )
                  }
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <label>Content</label>
          <textarea value={output.content || ""} readOnly />

          {/* ACTIONS */}
          <div className="output-actions">
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `Title: ${output.title}\n\n` +
                  `Slug: ${output.slug}\n\n` +
                  `Tags: ${(output.tags || []).join(", ")}\n\n` +
                  `Description: ${output.description}\n\n` +
                  `Content:\n${output.content}`
                )
              }
            >
              Copy All
            </button>

            <button onClick={() => onApply?.(output)}>
              Apply To Post
            </button>
          </div>

        </div>
      </div>
    </div>
  );

};

export default SeoTool;
