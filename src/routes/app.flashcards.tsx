import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shuffle, Check, Layers } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { flashcards } from "@/lib/mock-data";

export const Route = createFileRoute("/app/flashcards")({
  head: () => ({ meta: [{ title: "Flashcards — StudyMate AI" }] }),
  component: Flashcards,
});

function Flashcards() {
  const [deck, setDeck] = useState(flashcards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState<Set<string>>(new Set());

  const card = deck[index];
  const next = () => { setFlipped(false); setIndex((i) => (i + 1) % deck.length); };
  const prev = () => { setFlipped(false); setIndex((i) => (i - 1 + deck.length) % deck.length); };
  const shuffle = () => { setFlipped(false); setIndex(0); setDeck((d) => [...d].sort(() => Math.random() - 0.5)); };
  const mark = () => {
    setLearned((s) => new Set(s).add(card.id));
    setTimeout(next, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Flashcards"
        subtitle="Tap a card to flip it. Mark cards you've mastered."
        action={
          <Badge variant="secondary" className="bg-accent/15 text-accent border-0 text-sm">
            {learned.size}/{deck.length} learned
          </Badge>
        }
      />

      <Progress value={(learned.size / deck.length) * 100} className="h-2" />

      <div className="relative h-80 sm:h-96" style={{ perspective: 1500 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id + (flipped ? "-b" : "-f")}
            initial={{ opacity: 0, rotateY: flipped ? -180 : 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Card
              onClick={() => setFlipped((f) => !f)}
              className={`h-full p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer shadow-glow border-border/50 ${
                flipped ? "bg-gradient-primary text-primary-foreground" : "bg-card"
              }`}
            >
              <Badge variant={flipped ? "secondary" : "outline"} className="mb-4">
                {flipped ? "Answer" : "Question"}
              </Badge>
              <p className="text-xl sm:text-2xl font-display font-semibold leading-relaxed max-w-2xl">
                {flipped ? card.answer : card.question}
              </p>
              <p className={`mt-6 text-xs ${flipped ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                Tap card to {flipped ? "see question" : "reveal answer"}
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground tabular-nums">{index + 1} / {deck.length}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={shuffle}><Shuffle className="h-4 w-4" /> Shuffle</Button>
          <Button onClick={mark} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Check className="h-4 w-4" /> Learned
          </Button>
          <Button variant="outline" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card className="p-6 shadow-card border-border/50">
        <h3 className="font-display font-semibold mb-4">Progress</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold font-display text-gradient">{learned.size}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{deck.length - learned.size}</p>
            <p className="text-xs text-muted-foreground">To review</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{Math.round((learned.size / deck.length) * 100)}%</p>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
