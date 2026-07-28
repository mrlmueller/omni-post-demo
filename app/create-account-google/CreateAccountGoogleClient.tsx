"use client";

import { Button, Checkbox, Input, Link } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface CreateAccountGoogleTranslations {
  nameLabel: string;
  emailLabel: string;
  termsCheckbox: string;
  termsLink: string;
  privacyLink: string;
  and: string;
  termsError: string;
  createAccountButton: string;
  genericError: string;
}

interface CreateAccountGoogleClientProps {
  t: CreateAccountGoogleTranslations;
}

export default function CreateAccountGoogleClient({ t }: CreateAccountGoogleClientProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = async () => {
    setLoading(true);
    setError(null);

    if (!acceptedTerms) {
      setError(t.termsError);
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/finalize-user-creation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          acceptedTerms,
          displayName: name,
          email,
        }),
      });

      router.push("/");
    } catch (error) {
      setError(t.genericError);
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateUser();
      }}
    >
      <div>
        <Input
          id="name"
          name="name"
          type="text"
          label={t.nameLabel}
          fullWidth
          readOnly
          value={name || ""}
          size="md"
        />
      </div>
      <div>
        <Input
          id="email"
          name="email"
          type="email"
          label={t.emailLabel}
          fullWidth
          readOnly
          value={email || ""}
          size="md"
        />
      </div>
      <div>
        <Checkbox
          type="checkbox"
          id="acceptedTerms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        />
        <label htmlFor="acceptedTerms">
          {t.termsCheckbox} {""}
          <Link href="/nutzungsbedingungen" className="text-blue-500">
            {t.termsLink}
          </Link>
          {""} {t.and} {""}
          <Link href="/datenschutzerklaerung" className="text-blue-500">
            {t.privacyLink}
          </Link>
        </label>
      </div>
      {error && <div className="text-red-500 text-center">{error}</div>}
      <div>
        <Button
          type="submit"
          fullWidth
          color="primary"
          isLoading={loading}
          disabled={!acceptedTerms || loading}
          className="group relative flex justify-center"
        >
          {t.createAccountButton}
        </Button>
      </div>
    </form>
  );
}