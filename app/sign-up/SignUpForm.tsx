"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { handleLoginWithGoogle } from "../lib/authUtils";
import { auth } from "../lib/firebaseConfig";

// Define the type for our signup translation data
interface SignupTranslations {
  header: string;
  subheader1: string;
  subheader2: string;
  placeholders: {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
  };
  checkbox: {
    label: string;
  };
  buttons: {
    create_account: string;
    google: string;
    creating: string;
  };
  text: {
    or_sign_in_with: string;
  };
  errors: {
    invalid_name: string;
    invalid_email: string;
    weak_password: string;
    passwords_mismatch: string;
    terms_not_accepted: string;
    email_in_use: string;
    invalid_email_error: string;
    weak_password_error: string;
    generic_error: string;
    unknown_error: string;
  };
  success: {
    email_sent: string;
  };
}

interface SignUpFormProps {
  t: SignupTranslations;
}

/**
 * Helper component that parses the checkbox label string.
 * It looks for the key phrases and replaces them with Next.js Links.
 */
const ParsedCheckboxLabel: React.FC<{ label: string }> = ({ label }) => {
  // English version
  if (label.includes("Terms of Service") && label.includes("Privacy Policy")) {
    const termsText = "Terms of Service";
    const privacyText = "Privacy Policy";
    const termsIndex = label.indexOf(termsText);
    const privacyIndex = label.indexOf(privacyText);
    const beforeTerms = label.slice(0, termsIndex);
    const afterTerms = label.slice(termsIndex + termsText.length, privacyIndex);
    const afterPrivacy = label.slice(privacyIndex + privacyText.length);
    return (
      <>
        {beforeTerms}
        <Link href="/nutzungsbedingungen" className="text-blue-500">
          {termsText}
        </Link>
        {afterTerms}
        <Link href="/datenschutzerklaerung" className="text-blue-500">
          {privacyText}
        </Link>
        {afterPrivacy}
      </>
    );
  }
  // German version
  else if (
    label.includes("Nutzungsbedingungen") &&
    label.includes("Datenschutzerklärung")
  ) {
    const termsText = "Nutzungsbedingungen";
    const privacyText = "Datenschutzerklärung";
    const termsIndex = label.indexOf(termsText);
    const privacyIndex = label.indexOf(privacyText);
    const beforeTerms = label.slice(0, termsIndex);
    const afterTerms = label.slice(termsIndex + termsText.length, privacyIndex);
    const afterPrivacy = label.slice(privacyIndex + privacyText.length);
    return (
      <>
        {beforeTerms}
        <Link href="/nutzungsbedingungen" className="text-blue-500">
          {termsText}
        </Link>
        {afterTerms}
        <Link href="/datenschutzerklaerung" className="text-blue-500">
          {privacyText}
        </Link>
        {afterPrivacy}
      </>
    );
  }
  // If nothing to replace, return the label as is.
  return <>{label}</>;
};

const SignUpForm: React.FC<SignUpFormProps> = ({ t }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectCheckout = searchParams.get("redirectCheckout") === "true";

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim() || name.length > 30) {
      setError(t.errors.invalid_name);
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError(t.errors.invalid_email);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t.errors.weak_password);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.errors.passwords_mismatch);
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError(t.errors.terms_not_accepted);
      setLoading(false);
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(result.user, { displayName: name });
      await sendEmailVerification(result.user);

      setMessage(t.success.email_sent);

      const user = result.user;
      const token = await user.getIdToken();

      await fetch("/api/save-user-to-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          providerId: user.providerData[0].providerId,
          token,
          acceptedTerms,
        }),
      });

      // User must verify email before login and checkout
      await auth.signOut();

      onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
          setLoading(false);
          router.push(
            `/login?verify=true${
              redirectCheckout ? "&redirectCheckout=true" : ""
            }`
          );
        }
      });
    } catch (error: any) {
      setLoading(false);
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            setError(t.errors.email_in_use);
            break;
          case "auth/invalid-email":
            setError(t.errors.invalid_email_error);
            break;
          case "auth/weak-password":
            setError(t.errors.weak_password_error);
            break;
          default:
            setError(t.errors.generic_error);
        }
      } else {
        setError(t.errors.unknown_error);
      }
      console.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 pb-20 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t.header}
          </h2>
          <p className="mt-2 text-center text-sm">
            {t.subheader1}{" "}
            <Link
              href="/login"
              className="font-medium text-blue-500 hover:text-blue-400"
              prefetch={false}
            >
              {t.subheader2}
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSignUp}>
          {/* Name */}
          <div>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={t.placeholders.name}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              autoComplete="name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t.placeholders.email}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t.placeholders.password}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t.placeholders.confirm_password}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center">
            {/* shadcn/ui Checkbox uses onCheckedChange. 
                'checked' can be boolean or "indeterminate" in Radix. */}
            <Checkbox
              id="acceptedTerms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => {
                setAcceptedTerms(!!checked);
                setError(null);
              }}
              className="mr-2"
            />
            <label htmlFor="acceptedTerms" className="cursor-pointer">
              <ParsedCheckboxLabel label={t.checkbox.label} />
            </label>
          </div>

          {/* Error and success messages */}
          {error && (
            <div className="text-red-500 mt-2" role="alert" aria-live="polite">
              {error}
            </div>
          )}
          {message && (
            <div
              className="text-green-500 mt-2"
              role="alert"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              className="relative flex w-full justify-center"
              disabled={loading}
            >
              {/* You can conditionally show loading text or a spinner */}
              {loading ? t.buttons.creating : t.buttons.create_account}
            </Button>
          </div>
        </form>

        {/* Divider and "Or sign in with" */}
        <div className="relative flex justify-center items-center text-sm">
          <div className="w-full border-t border-borderColor mr-3" />
          <p className="flex-none text-gray-400">{t.text.or_sign_in_with}</p>
          <div className="w-full border-t border-borderColor ml-3" />
        </div>

        {/* Google login */}
        <div>
          <Button
            type="button"
            onClick={handleLoginWithGoogle}
            className="relative flex w-full justify-center bg-white text-black border border-borderColor shadow-md gap-2"
          >
            <FcGoogle />
            {t.buttons.google}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
