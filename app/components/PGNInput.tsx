"use client";

import { useRef, useState } from "react";
import { useGameSlice } from "../../store/gameSlice";
import { parsePgnToGameAnalysis, cleanPGN } from "../../lib/pgn";

export default function PgnInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const { setPGN, setMeta, setPlies, setError, reset } = useGameSlice();

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    reset();
    setError(null);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setInput(text);
    reset();
    setError(null);
    handleParse(text); // Auto-parse after upload
  };

  // Optionally allow handleParse to accept a string
  const handleParse = (customInput?: string) => {
    const pgnToParse = cleanPGN(customInput ?? input);
    try {
      const result = parsePgnToGameAnalysis(pgnToParse);
      console.log("PGN parse result:", result); // Debug log
      if (!result.plies || result.plies.length === 0) {
        console.warn("No plies parsed from PGN!");
      }
      setPGN(pgnToParse);
      setMeta({
        ...result.meta,
        engineName: "",
        engineDepth: 0,
        analyzedAt: 0,
      });
      setPlies(result.plies);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to parse PGN");
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-32 p-2 border rounded text-slate-900 dark:text-white bg-white dark:bg-slate-800"
        placeholder="Paste PGN here or upload a .pgn file"
        value={input}
        onChange={handlePaste}
      />
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => handleParse()}
          disabled={!input.trim()}
        >
          Parse PGN
        </button>
        <input
          type="file"
          accept=".pgn"
          ref={fileInputRef}
          onChange={handleFile}
          className="hidden"
        />
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload .pgn
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => {
            setInput("");
            reset();
            setError(null);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
