"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ResetPasswordFormProps {
  t: {
    emailPlaceholder: string;
    buttonText: string;
    resetEmailSentMessage: string;
  };
}

const ResetPasswordForm = ({ t }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(t.resetEmailSentMessage);
      setError("");
      setTimeout(() => router.push("/"), 5000);
    } catch (error: any) {
      setError(error.message);
      setMessage("");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handlePasswordReset}>
      <div>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && <div className="text-red-500">{error}</div>}
      {message && <div className="text-green-500">{message}</div>}

      <div>
        <Button
          type="submit"
          className="group relative flex w-full justify-center"
        >
          {t.buttonText}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
