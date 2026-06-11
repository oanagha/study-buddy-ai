import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, FileText, ArrowLeft, Copy, Bookmark } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { recentUploads } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/summaries")({
  head: () => ({ meta: [{ title: "AI Summaries — StudyMate AI" }] }),
  component: Summaries,
});

const summaryData = {
  short: "Trees are hierarchical data structures consisting of nodes connected by edges. A binary tree restricts each node to at most two children. Binary Search Trees (BSTs) maintain ordering, allowing O(log n) search, insert, and delete operations in the average case.",
  detailed: `A tree is a non-linear hierarchical data structure that consists of nodes connected by edges. Each tree has a root node, and every other node is connected by exactly one edge from a parent node.

**Binary Trees**
A binary tree is a tree where each node has at most two children, referred to as the left child and the right child. Binary trees are widely used in expression parsing, decision trees, and search algorithms.

**Binary Search Trees (BST)**
A BST is a binary tree with an ordering property: for every node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater. This property enables efficient search operations.

**Traversals**
Trees can be traversed in multiple ways: inorder (left-root-right), preorder (root-left-right), and postorder (left-right-root). Each serves different use cases such as expression evaluation or copying trees.

**Balanced Trees**
AVL trees and Red-Black trees are self-balancing BSTs that guarantee O(log n) operations by maintaining height balance through rotations.`,
  keyPoints: [
    "Trees are hierarchical, non-linear data structures.",
    "Binary trees have at most 2 children per node.",
    "BST property: left < root < right.",
    "Average-case complexity for BST operations is O(log n).",
    "Self-balancing variants (AVL, Red-Black) guarantee O(log n).",
    "Tree traversals: inorder, preorder, postorder, level-order.",
  ],
};

function Summaries() {
  const [active, setActive] = useState<string | null>(null);

  if (active) {
    const note = recentUploads.find((n) => n.id === active)!;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setActive(null)} className="-ml-3">
          <ArrowLeft className="h-4 w-4" /> Back to notes
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-display">{note.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">AI summary • Generated just now</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("Copied!")}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            <Button variant="outline" size="sm"><Bookmark className="h-3.5 w-3.5" /> Save</Button>
          </div>
        </div>
        <Card className="p-6 sm:p-8 shadow-card border-border/50">
          <Tabs defaultValue="short">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="short">Short Summary</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Summary</TabsTrigger>
              <TabsTrigger value="key">Key Points</TabsTrigger>
            </TabsList>
            <TabsContent value="short" className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-foreground/90">{summaryData.short}</p>
            </TabsContent>
            <TabsContent value="detailed">
              <div className="space-y-4 text-foreground/90 leading-relaxed">
                {summaryData.detailed.split("\n\n").map((p, i) => {
                  if (p.startsWith("**")) {
                    return <h3 key={i} className="font-display font-semibold text-lg pt-2">{p.replace(/\*\*/g, "")}</h3>;
                  }
                  return <p key={i}>{p}</p>;
                })}
              </div>
            </TabsContent>
            <TabsContent value="key">
              <ul className="space-y-3">
                {summaryData.keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-3 p-3 rounded-lg bg-muted/40">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="AI Summaries" subtitle="Pick a note to generate an AI-powered summary." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentUploads.map((n) => (
          <Card key={n.id} className="p-5 shadow-card hover:shadow-glow/40 hover:-translate-y-0.5 transition-all border-border/50">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm truncate">{n.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
            <Button className="w-full mt-4 bg-gradient-primary hover:opacity-90" onClick={() => setActive(n.id)}>
              <Sparkles className="h-4 w-4" /> Generate Summary
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
