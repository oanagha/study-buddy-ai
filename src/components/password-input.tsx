import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type"> & {
  autoComplete?: string;
  readOnlyUntilFocus?: boolean;
};

export function PasswordInput({
  className,
  autoComplete = "off",
  readOnlyUntilFocus = false,
  id,
  name,
  placeholder = "",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [readOnly, setReadOnly] = useState(readOnlyUntilFocus);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name ?? (id ? `password-field-${id}` : undefined)}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        readOnly={readOnly}
        onFocus={(e) => {
          if (readOnlyUntilFocus) setReadOnly(false);
          props.onFocus?.(e);
        }}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setVisible((current) => !current)}
        disabled={props.disabled}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
