import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Search,
  Filter,
  FileText,
  Trash2,
  Eye,
  Sparkles,
  FileType,
  File as FileIcon,
  FileCode,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/widgets";
import { LoadingState } from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api/auth";
import { refreshNotificationsAfterActivity } from "@/lib/notifications";
import { fetchNotes, uploadNote, deleteNote, type Note } from "@/lib/api/notes";
import { toast } from "sonner";

export const Route = createFileRoute("/app/upload")({
  head: () => ({ meta: [{ title: "Upload Notes — StudyMate AI" }] }),
  component: UploadPage,
});

const fileIcons: Record<string, typeof FileText> = { pdf: FileType, docx: FileIcon, txt: FileCode };

type FileTypeFilter = "all" | "pdf" | "docx" | "txt";
type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

function applyFiltersAndSort(
  notes: Note[],
  query: string,
  fileTypeFilter: FileTypeFilter,
  sortBy: SortOption,
) {
  return notes
    .filter((note) => note.fileName.toLowerCase().includes(query.toLowerCase()))
    .filter((note) => fileTypeFilter === "all" || note.fileType === fileTypeFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "name-asc":
          return a.fileName.localeCompare(b.fileName);
        case "name-desc":
          return b.fileName.localeCompare(a.fileName);
        case "newest":
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });
}

function formatUploadedAt(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const hasActiveFilters = fileTypeFilter !== "all" || sortBy !== "newest";

  const loadNotes = useCallback(async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load notes.");
      }
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (!fileList.length || isUploading) return;

    for (const file of fileList) {
      setIsUploading(true);
      setUploadingFileName(file.name);
      setProgress(0);

      try {
        const note = await uploadNote(file, setProgress);
        setNotes((prev) => [note, ...prev]);
        toast.success(`${file.name} uploaded successfully!`);
        refreshNotificationsAfterActivity();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error(`Failed to upload ${file.name}.`);
        }
      } finally {
        setProgress(null);
        setUploadingFileName(null);
        setIsUploading(false);
      }
    }
  };

  const performDelete = async (note: Note) => {
    setDeletingNoteId(note.noteId);

    try {
      await deleteNote(note.noteId);
      setNotes((prev) => prev.filter((n) => n.noteId !== note.noteId));
      toast.success(`"${note.fileName}" deleted successfully.`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete note.");
      }
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleDelete = (note: Note) => {
    if (deletingNoteId !== null) return;
    setNoteToDelete(note);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    const note = noteToDelete;
    setNoteToDelete(null);
    await performDelete(note);
  };

  const filtered = applyFiltersAndSort(notes, query, fileTypeFilter, sortBy);

  const clearFilters = () => {
    setFileTypeFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Upload Notes" subtitle="PDF, DOCX, or TXT — up to 10MB per file." />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />

      <Card
        className={`relative p-10 border-2 border-dashed transition-all ${
          dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/20"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
          }
        }}
      >
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Upload className="h-7 w-7 text-primary-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold">Drop your files here</h3>
          <p className="text-muted-foreground mt-1">or click to browse from your device</p>
          <Button
            className="mt-6 bg-gradient-primary shadow-glow hover:opacity-90"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Choose Files"
            )}
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">Supports PDF, DOCX, TXT • 10MB max</p>
        </div>

        {progress !== null && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium truncate pr-4">Uploading {uploadingFileName}</span>
              <span className="text-muted-foreground shrink-0">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:flex sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold">Your Notes ({filtered.length})</h2>
        <div className="flex gap-2 col-span-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={hasActiveFilters ? "border-primary text-primary" : undefined}
              >
                <Filter className="h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    !
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-type-filter">File type</Label>
                  <Select
                    value={fileTypeFilter}
                    onValueChange={(value) => setFileTypeFilter(value as FileTypeFilter)}
                  >
                    <SelectTrigger id="file-type-filter">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">DOCX</SelectItem>
                      <SelectItem value="txt">TXT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort-by">Sort by</Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger id="sort-by">
                      <SelectValue placeholder="Newest first" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loadingNotes ? (
        <LoadingState label="Loading notes" className="py-16 text-muted-foreground" />
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          {notes.length === 0
            ? "No notes uploaded yet. Drop a PDF, DOCX, or TXT file above to get started."
            : "No notes match your search or filters."}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => {
            const Icon = fileIcons[f.fileType] ?? FileText;
            return (
              <Card
                key={f.noteId}
                className="p-5 shadow-card hover:shadow-glow/40 hover:-translate-y-0.5 transition-all border-border/50 group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{f.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatUploadedAt(f.uploadedAt)} • {f.uploadStatus}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(f.fileUrl, "_blank", "noopener,noreferrer")}
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-primary" asChild>
                    <Link to="/app/study-guide" search={{ noteId: f.noteId }}>
                      <Sparkles className="h-3.5 w-3.5" /> Guide
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deletingNoteId === f.noteId}
                    onClick={() => handleDelete(f)}
                  >
                    {deletingNoteId === f.noteId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <AlertDialog
        open={noteToDelete !== null}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
      >
        <AlertDialogContent className="max-w-md text-center">
          <AlertDialogHeader className="items-center space-y-3">
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {noteToDelete ? (
                <>
                  You are about to delete{" "}
                  <span className="font-medium text-foreground">"{noteToDelete.fileName}"</span>.
                  <br />
                  This action cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
