"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, app } from "../lib/firebaseConfig";
import { handleLoginWithGoogle } from "../lib/authUtils";
import { getCheckoutUrl } from "@/stripe/stripePayment";

interface LoginPageProps {
  t: {
    heading: string;
    subheading1: string;
    subheading2: string;
    placeholders: {
      email: string;
      password: string;
    };
    forgotPassword: string;
    button: string;
    orLoginWith: string;
    buttons: {
      google: string;
    };
    errors: {
      invalidEmail: string;
      passwordTooShort: string;
      emailNotVerified: string;
      userNotFound: string;
      invalidCredential: string;
      wrongPassword: string;
      invalidEmailEntered: string;
      userDisabled: string;
      genericError: string;
      unknownError: string;
    };
  };
}

const ClientLogin = ({ t }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectCheckout = searchParams.get("redirectCheckout") === "true";

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError(t.errors.invalidEmail);
      return;
    }

    if (password.length < 6) {
      setError(t.errors.passwordTooShort);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user.emailVerified) {
        setError(t.errors.emailNotVerified);
        await auth.signOut();
        return;
      }

      const user = result.user;
      await fetch("/api/setCookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      if (redirectCheckout) {
        const priceId = "price_1QRz6s2MjSfMyWwFCqevn9Zx";
        try {
          const checkoutUrl = await getCheckoutUrl(app, priceId);
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
            return;
          } else {
            console.error("No checkout URL returned.");
            window.location.href = "/";
            return;
          }
        } catch (err) {
          console.error("Error fetching checkout URL", err);
          window.location.href = "/";
          return;
        }
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            setError(t.errors.userNotFound);
            break;
          case "auth/invalid-credential":
            setError(t.errors.invalidCredential);
            break;
          case "auth/wrong-password":
            setError(t.errors.wrongPassword);
            break;
          case "auth/invalid-email":
            setError(t.errors.invalidEmailEntered);
            break;
          case "auth/user-disabled":
            setError(t.errors.userDisabled);
            break;
          default:
            setError(t.errors.genericError);
        }
      } else {
        setError(t.errors.unknownError);
      }
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Heading */}
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          {t.heading}
        </h2>
        <p className="mt-2 text-center text-sm">
          {t.subheading1}{" "}
          <Link
            href="/sign-up"
            className="font-medium text-blue-500 hover:text-blue-400"
            prefetch={false}
          >
            {t.subheading2}
          </Link>
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleLoginWithEmail}>
        <div>
          <Input
            id="email"
            name="email"
            type="text"
            autoComplete="email"
            required
            placeholder={t.placeholders.email}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
        </div>
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder={t.placeholders.password}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
        </div>
        <div className="text-right">
          <Link
            href="/reset-password"
            className="font-medium text-blue-500 hover:text-blue-400"
            prefetch={false}
          >
            {t.forgotPassword}
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-500 mt-2" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <div>
          <Button type="submit" className="w-full justify-center">
            {t.button}
          </Button>
        </div>
      </form>

      {/* Divider and "Or login with" */}
      <div className="relative flex justify-center items-center text-sm">
        <div className="w-full border-t border-borderColor mr-3" />
        <p className="flex-none text-gray-400">{t.orLoginWith}</p>
        <div className="w-full border-t border-borderColor ml-3" />
      </div>

      {/* Google login */}
      <div>
        <Button
          type="button"
          onClick={handleLoginWithGoogle}
          className="w-full justify-center bg-white text-black border border-borderColor shadow-md gap-2"
        >
          <FcGoogle /> {t.buttons.google}
        </Button>
      </div>
    </div>
  );
};

export default ClientLogin;
