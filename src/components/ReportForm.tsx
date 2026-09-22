import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type ReportType } from "@/lib/constants";
import { createReport, uploadPhoto, FriendlyError } from "@/lib/reports";
import { shortId } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FormState {
  item_name: string;
  category: string;
  description: string;
  location: string;
  item_date: string;
  item_time: string;
  identifying_details: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

const EMPTY: FormState = {
  item_name: "",
  category: "",
  description: "",
  location: "",
  item_date: "",
  item_time: "",
  identifying_details: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (!values.item_name.trim()) errors.item_name = "Item name is required.";
  if (!values.category) errors.category = "Please choose a category.";
  if (values.description.trim().length < 10)
    errors.description = "Please describe the item in at least 10 characters.";
  if (!values.location.trim()) errors.location = "Location is required.";
  if (!values.item_date) errors.item_date = "Date is required.";
  if (!values.contact_name.trim()) errors.contact_name = "Your name is required.";
  const email = values.contact_email.trim();
  const phone = values.contact_phone.trim();
  if (!email && !phone) {
    errors.contact_email = "Add an email or a phone number so you can be reached.";
  } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.contact_email = "That email address doesn't look right.";
  } else if (!email && phone.replace(/\D/g, "").length < 7) {
    errors.contact_phone = "That phone number doesn't look right.";
  }
  return errors;
}

export function ReportForm({ type }: { type: ReportType }) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isLost = type === "lost";
  const set = (key: keyof FormState) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function pickFile(selected: File | null) {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Photos must be smaller than 5 MB.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      let imagePath: string | null = null;
      if (file) {
        try {
          imagePath = await uploadPhoto(file);
        } catch {
          toast.warning("We couldn't upload the photo, so the report was saved without it.");
        }
      }
      const id = await createReport({
        report_type: type,
        item_name: values.item_name.trim(),
        category: values.category,
        description: values.description.trim(),
        image_url: imagePath,
        location: values.location.trim(),
        item_date: values.item_date,
        item_time: values.item_time.trim() || null,
        identifying_details: values.identifying_details.trim() || null,
        contact_name: values.contact_name.trim(),
        contact_email: values.contact_email.trim() || null,
        contact_phone: values.contact_phone.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
      setCreatedId(id);
      toast.success(isLost ? "Lost item reported successfully." : "Found item reported successfully.");
    } catch (error) {
      toast.error(
        error instanceof FriendlyError
          ? error.message
          : "Something went wrong. Please try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (createdId) {
    return (
      <div className="rounded-2xl border border-found/30 bg-card p-8 text-center shadow-soft">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-found/10 text-found">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="font-display text-xl font-semibold">
          {isLost ? "Lost item reported successfully." : "Found item reported successfully."}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your report is saved. Keep this report ID for reference.
        </p>
        <p className="mt-4 inline-block rounded-lg bg-surface px-4 py-2 font-mono text-sm font-semibold">
          #{shortId(createdId)}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate({ to: "/item/$id", params: { id: createdId } })}>
            View report
          </Button>
          <Button variant="secondary" onClick={() => navigate({ to: "/matches" })}>
            Check possible matches
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCreatedId(null);
              setValues(EMPTY);
              clearFile();
            }}
          >
            Report another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <Section title="Item details">
        <Field label="Item name" required error={errors.item_name} htmlFor="item_name">
          <Input
            id="item_name"
            value={values.item_name}
            onChange={(e) => set("item_name")(e.target.value)}
            placeholder="e.g. Black Wallet"
            aria-invalid={Boolean(errors.item_name)}
          />
        </Field>

        <Field label="Category" required error={errors.category} htmlFor="category">
          <Select value={values.category} onValueChange={set("category")}>
            <SelectTrigger id="category" aria-invalid={Boolean(errors.category)}>
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Description"
          required
          error={errors.description}
          htmlFor="description"
          className="sm:col-span-2"
        >
          <Textarea
            id="description"
            rows={4}
            value={values.description}
            onChange={(e) => set("description")(e.target.value)}
            placeholder="Colour, brand, contents, condition…"
            aria-invalid={Boolean(errors.description)}
          />
        </Field>

        <Field
          label="Identifying details"
          htmlFor="identifying_details"
          hint="Optional — something only the owner would know"
          className="sm:col-span-2"
        >
          <Input
            id="identifying_details"
            value={values.identifying_details}
            onChange={(e) => set("identifying_details")(e.target.value)}
            placeholder="e.g. College ID inside with the name printed"
          />
        </Field>
      </Section>

      <Section title="Photo">
        <div className="sm:col-span-2">
          {preview ? (
            <div className="relative w-full max-w-xs overflow-hidden rounded-xl border border-border">
              <img src={preview} alt="Selected item" className="h-48 w-full object-cover" />
              <button
                type="button"
                onClick={clearFile}
                aria-label="Remove photo"
                className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 shadow-soft"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="photo"
              className="flex w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/60 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-surface"
            >
              <ImagePlus className="h-6 w-6 text-primary" aria-hidden />
              <span className="text-sm font-medium">Add a photo</span>
              <span className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB</span>
            </label>
          )}
          <input
            ref={fileInput}
            id="photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </Section>

      <Section title={isLost ? "Where and when it was lost" : "Where and when it was found"}>
        <Field
          label={isLost ? "Location lost" : "Location found"}
          required
          error={errors.location}
          htmlFor="location"
        >
          <Input
            id="location"
            value={values.location}
            onChange={(e) => set("location")(e.target.value)}
            placeholder="e.g. Central Library"
            aria-invalid={Boolean(errors.location)}
          />
        </Field>

        <Field label="Date" required error={errors.item_date} htmlFor="item_date">
          <Input
            id="item_date"
            type="date"
            value={values.item_date}
            onChange={(e) => set("item_date")(e.target.value)}
            aria-invalid={Boolean(errors.item_date)}
          />
        </Field>

        <Field label="Approximate time" htmlFor="item_time" hint="Optional">
          <Input
            id="item_time"
            value={values.item_time}
            onChange={(e) => set("item_time")(e.target.value)}
            placeholder="e.g. Around 3 PM"
          />
        </Field>
      </Section>

      <Section
        title="Contact details"
        subtitle="Kept private — other users only see your name and contact you through a request form."
      >
        <Field
          label={isLost ? "Your name" : "Finder name"}
          required
          error={errors.contact_name}
          htmlFor="contact_name"
        >
          <Input
            id="contact_name"
            value={values.contact_name}
            onChange={(e) => set("contact_name")(e.target.value)}
            placeholder="Full name"
            aria-invalid={Boolean(errors.contact_name)}
          />
        </Field>

        <Field label="Email" error={errors.contact_email} htmlFor="contact_email">
          <Input
            id="contact_email"
            type="email"
            value={values.contact_email}
            onChange={(e) => set("contact_email")(e.target.value)}
            placeholder="you@college.edu"
            aria-invalid={Boolean(errors.contact_email)}
          />
        </Field>

        <Field label="Phone" error={errors.contact_phone} htmlFor="contact_phone">
          <Input
            id="contact_phone"
            value={values.contact_phone}
            onChange={(e) => set("contact_phone")(e.target.value)}
            placeholder="Optional if email is given"
            aria-invalid={Boolean(errors.contact_phone)}
          />
        </Field>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={submitting} className="sm:w-auto">
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "Saving report…" : isLost ? "Submit lost report" : "Submit found report"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Reports are stored securely and can be searched by other students.
        </p>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <legend className="px-1 font-display text-sm font-semibold tracking-wide uppercase">
        {title}
      </legend>
      {subtitle && <p className="mt-1 mb-4 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
