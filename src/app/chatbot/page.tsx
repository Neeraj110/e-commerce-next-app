"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot } from "lucide-react";

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="py-8 px-4 sm:px-8 mt-10 min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-5 text-center text-gray-800 dark:text-gray-100 font-sans">
        AI Product Assistant
      </h1>

      <div
        ref={messagesContainerRef}
        className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 mb-6 overflow-y-auto max-h-[70vh] flex flex-col space-y-4 transition-all duration-300"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-12 text-lg">
            Ask me anything about our products!
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 max-w-[80%] animate-fadeIn ${msg.role === "user" ? "ml-auto" : "mr-auto"
                }`}
            >
              {msg.role === "ai" && (
                <Bot className="w-6 h-6 text-gray-500 dark:text-gray-400 mt-1" />
              )}
              <div
                className={`p-4 rounded-2xl shadow-sm ${msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
              >
                <p className="text-xs font-medium text-gray-400 dark:text-gray-300 mb-1">
                  {msg.role === "user" ? "You" : "AI Assistant"}
                </p>
                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              </div>
              {msg.role === "user" && (
                <User className="w-6 h-6 text-gray-500 dark:text-gray-400 mt-1" />
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-start gap-3 max-w-[80%] mr-auto animate-fadeIn">
            <Bot className="w-6 h-6 text-gray-500 dark:text-gray-400 mt-1" />
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI is thinking
                <span className="animate-pulse">...</span>
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg"
      >
        <div className="relative flex-1">
          <Input
            placeholder="Ask about products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-lg"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-full p-3 transition-all duration-200"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default Chatbot;