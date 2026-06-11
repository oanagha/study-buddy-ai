import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Search, Filter, FileText, Trash2, Eye, Sparkles, FileType, File as FileIcon, FileCode } from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { recentUploads } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/upload")({
  head: () => ({ meta: [{ title: "Upload Notes — StudyMate AI" }] }),
  component: UploadPage,
});

const fileIcons: Record<string, typeof FileText> = { pdf: FileType, docx: FileIcon, txt: FileCode };

function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const simulateUpload = () => {
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p === null) return null;
        if (p >= 100) {
          clearInterval(t);
          toast.success("Notes uploaded successfully!");
          setTimeout(() => setProgress(null), 800);
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  const filtered = recentUploads.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Upload Notes" subtitle="PDF, DOCX, or TXT — up to 20MB per file." />

      <Card
        className={`relative p-10 border-2 border-dashed transition-all ${
          dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/20"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); simulateUpload(); }}
      >
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Upload className="h-7 w-7 text-primary-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold">Drop your files here</h3>
          <p className="text-muted-foreground mt-1">or click to browse from your device</p>
          <Button className="mt-6 bg-gradient-primary shadow-glow hover:opacity-90" onClick={simulateUpload}>
            Choose Files
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">Supports PDF, DOCX, TXT • 20MB max</p>
        </div>

        {progress !== null && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium">Uploading...</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </Card>

      {/* Files header */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:flex sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold">Your Notes ({filtered.length})</h2>
        <div className="flex gap-2 col-span-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline"><Filter className="h-4 w-4" /> Filter</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => {
          const Icon = fileIcons[f.type] ?? FileText;
          return (
            <Card key={f.id} className="p-5 shadow-card hover:shadow-glow/40 hover:-translate-y-0.5 transition-all border-border/50 group">
              <div className="flex items-start gap-3 mb-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.date} • {f.size}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1"><Eye className="h-3.5 w-3.5" /> View</Button>
                <Button size="sm" className="flex-1 bg-gradient-primary"><Sparkles className="h-3.5 w-3.5" /> AI</Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Note deleted")}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
