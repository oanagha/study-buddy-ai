import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PinInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  centered?: boolean;
  autoComplete?: string;
};

export function PinInput({
  id,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  autoFocus = false,
  className,
  centered = false,
  autoComplete = "off",
}: PinInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={`security-pin-${id}`}
        type="text"
        inputMode="numeric"
        pattern="\d{4,6}"
        maxLength={6}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        className={cn(
          "pr-10",
          centered && "tracking-widest text-center text-lg",
          !visible && "[-webkit-text-security:disc] [text-security:disc]",
          className,
        )}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        aria-label={visible ? "Hide PIN" : "Show PIN"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
