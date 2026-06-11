import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Plus, MessageSquare, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/chat")({
  head: () => ({ meta: [{ title: "AI Chat — StudyMate AI" }] }),
  component: Chat,
});

type Msg = { id: string; role: "user" | "ai"; text: string };

const suggested = [
  "Explain Binary Tree",
  "Summarize Chapter 2",
  "Generate Important Questions",
  "Create Flashcards",
];

const aiResponses: Record<string, string> = {
  default: "Great question! Based on your uploaded notes, here's what I found: This concept builds on the foundations we covered earlier. Let me break it down step by step for you...",
};

function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now() + "u", role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: Date.now() + "a", role: "ai", text: aiResponses.default }]);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-8rem)] -m-4 lg:-m-8 grid lg:grid-cols-[280px_1fr]">
      {/* History sidebar */}
      <aside className="hidden lg:flex flex-col border-r bg-card/50">
        <div className="p-4">
          <Button className="w-full bg-gradient-primary shadow-glow" onClick={() => setMessages([])}>
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <div className="px-3 pb-3 text-xs font-semibold text-muted-foreground uppercase">Recent</div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chatHistory.map((c) => (
            <button key={c.id} className="w-full text-left p-3 rounded-lg hover:bg-muted transition flex gap-2 items-start">
              <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.time}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold">How can I help you study?</h2>
                <p className="text-muted-foreground mt-1">Ask anything about your uploaded notes.</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-8 max-w-2xl mx-auto">
                  {suggested.map((s) => (
                    <Card
                      key={s}
                      onClick={() => send(s)}
                      className="p-4 cursor-pointer hover:shadow-glow/30 hover:-translate-y-0.5 transition-all text-left border-border/50"
                    >
                      <p className="text-sm font-medium">{s}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to ask</p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => <MessageBubble key={m.id} msg={m} />)
            )}
            {typing && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-gradient-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>
                <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-muted">
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="border-t bg-background/80 backdrop-blur p-4">
          <form
            className="max-w-3xl mx-auto flex gap-2"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your uploaded notes..."
                className="w-full h-12 px-4 pr-12 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
            </div>
            <Button type="submit" disabled={!input.trim()} className="h-12 w-12 bg-gradient-primary shadow-glow p-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? "bg-muted" : "bg-gradient-primary text-primary-foreground"}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
        isUser ? "bg-gradient-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm",
      )}>
        {msg.text}
      </div>
    </div>
  );
}
