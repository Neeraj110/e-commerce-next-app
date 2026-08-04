"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Search, Send, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

const promptSuggestions = [
  "Suggest a gift under ₹2000",
  "Show me popular electronics",
  "What should I buy for daily use?",
  "Compare budget-friendly options",
];

const Chatbot = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = query.trim();
    if (!message || loading) return;

    const userMessage: ChatMessage = { role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (err) {
      console.error(err);
      toast.error("AI assistant could not answer right now");
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-9rem)] bg-muted/30 px-4 py-6 sm:px-6 lg:py-8">
      <div className="mx-auto grid h-[calc(100vh-12rem)] max-w-7xl gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="hidden rounded-lg border bg-background p-5 shadow-sm lg:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Product discovery
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Try asking
            </p>
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuery(prompt)}
                className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
          <header className="border-b px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground lg:hidden">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">AI Product Assistant</h1>
                <p className="text-sm text-muted-foreground">
                  Ask for recommendations, comparisons, and product details.
                </p>
              </div>
            </div>
          </header>

          <div
            ref={messagesContainerRef}
            className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
          >
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Bot className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold">
                  Find the right product faster
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ask about price, category, use case, or product differences.
                </p>
                <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2 lg:hidden">
                  {promptSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setQuery(prompt)}
                      className="rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === "user";

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[min(42rem,85%)] rounded-lg px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "border bg-muted/50"
                      }`}
                    >
                      <p className="mb-1 text-xs font-medium opacity-70">
                        {isUser ? "You" : "AI Assistant"}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {isUser && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching products
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t p-3 sm:p-4">
            <div className="flex items-center gap-2 rounded-md border bg-background p-2">
              <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                placeholder="Ask about products, budgets, or categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !query.trim()}
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Chatbot;
