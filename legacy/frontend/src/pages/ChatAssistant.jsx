import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { backendAPI } from "../services/api";

export default function ChatAssistant() {
  const [uploadId, setUploadId] = useState(
    Number(localStorage.getItem("dw_upload_id") || 1),
  );
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me anything about your transport data. Example: Which route is most profitable?",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("dw_upload_id", String(uploadId));
  }, [uploadId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    const content = text.trim();
    setText("");
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await backendAPI.chat({
        upload_id: Number(uploadId),
        messages: next,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply || "No response" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.response?.data?.detail || "Chat unavailable",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-[78vh] flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            AI Business Brain
          </h1>
          <p className="text-sm text-slate-500">
            Dataset-aware assistant for route and profitability decisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Upload ID</label>
          <input
            type="number"
            min="1"
            value={uploadId}
            onChange={(e) => setUploadId(Number(e.target.value || 1))}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-blue-700 text-white"
                  : "bg-white border border-slate-200 text-slate-800"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-slate-500">Thinking...</div>}
      </div>

      <form
        onSubmit={send}
        className="p-4 border-t border-slate-200 bg-white flex gap-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about profit, routes, trucks, losses..."
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
        />
        <button
          className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 font-semibold"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
