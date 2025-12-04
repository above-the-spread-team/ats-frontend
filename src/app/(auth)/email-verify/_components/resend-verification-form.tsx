import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AlertMessage from "./alert-message";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ResendVerificationFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  showRegistrationMessage?: boolean;
  resendSuccess: boolean;
  errorMessage: string;
}

export default function ResendVerificationForm({
  email,
  onEmailChange,
  onSubmit,
  isPending,
  showRegistrationMessage = false,
  resendSuccess,
  errorMessage,
}: ResendVerificationFormProps) {
  return (
    <div className="space-y-2 pt-4">
      {showRegistrationMessage && !resendSuccess && (
        <AlertMessage
          variant="info"
          icon={Mail}
          title="Registration successful!"
          message="A verification email has been sent to your email address."
        />
      )}

      {resendSuccess && (
        <AlertMessage
          variant="success"
          icon={CheckCircle2}
          title="Verification email sent!"
          message="Please check your inbox and click the verification link."
        />
      )}

      {errorMessage && !resendSuccess && (
        <AlertMessage
          variant="error"
          icon={AlertCircle}
          message={errorMessage}
        />
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend Verification Email
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
