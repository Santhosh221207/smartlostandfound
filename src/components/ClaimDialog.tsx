import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitClaim, FriendlyError } from "@/lib/reports";
import type { Report } from "@/lib/constants";

export function ClaimDialog({ report, trigger }: { report: Report; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const isFound = report.report_type === "found";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email.";
    if (message.trim().length < 10) next.message = "Add a short message (10+ characters).";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      await submitClaim({
        report_id: report.id,
        claimant_name: name.trim(),
        claimant_email: email.trim(),
        message: message.trim(),
      });
      setDone(true);
      toast.success("Your request has been submitted.");
    } catch (error) {
      toast.error(
        error instanceof FriendlyError ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setDone(false);
          setErrors({});
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isFound ? `Claim "${report.item_name}"` : `Contact about "${report.item_name}"`}
          </DialogTitle>
          <DialogDescription>
            {isFound
              ? `Your request goes to ${report.contact_name}, who reported finding this item. Their contact details stay private.`
              : `Your request goes to ${report.contact_name}, who reported this item lost. Their contact details stay private.`}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-4 py-2">
            <p className="text-sm">
              Your request has been submitted. You&apos;ll be contacted at{" "}
              <span className="font-medium">{email}</span>.
            </p>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claim-name">Name</Label>
              <Input id="claim-name" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-email">Email</Label>
              <Input
                id="claim-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-message">Message</Label>
              <Textarea
                id="claim-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isFound
                    ? "Describe something about the item that proves it's yours."
                    : "Let them know what you found and where."
                }
              />
              {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Send request
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
