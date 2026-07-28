"use client";

import { Input, Textarea } from "@nextui-org/react";
import { Button } from "@/components/ui/button";
import { User } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { firestore } from "../lib/firebaseConfig";
import { OldFeatureRequest as FeatureRequest } from "../components/interfaces/interfaces";

interface FeatureRequestFormProps {
  setFeatureRequests: React.Dispatch<React.SetStateAction<FeatureRequest[]>>;
  user: User | null;
  loading?: boolean;
  t: {
    header: string;
    titleLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    submitButton: string;
    notLoggedInToast: string;
    missingFieldsToast: string;
    successToast: string;
    errorToast: string;
  };
}

export default function FeatureRequestForm({
  setFeatureRequests,
  user,
  loading,
  t,
}: FeatureRequestFormProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const { toast } = useToast();

  const saveFeature = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: t.notLoggedInToast,
        variant: "destructive"
      });
      return;
    }

    try {
      const token = await user.getIdToken();
      // Prüfe, ob User existiert
      const doesUserExistResponse = await fetch("/api/does-user-exist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const { exists } = await doesUserExistResponse.json();

      if (!exists) {
        // User existiert nicht -> redirect; BITTE ANPASSEN!
        const redirectUrl = `/create-account-google?token=${encodeURIComponent(
          token
        )}&name=${encodeURIComponent(
          user.displayName || ""
        )}&email=${encodeURIComponent(user.email || "")}`;
        window.location.href = redirectUrl;
        return;
      }

      if (title.trim() === "" || description.trim() === "") {
        toast({
          title: "Error",
          description: t.missingFieldsToast,
          variant: "destructive"
        });
        return;
      }

      const newRequest: FeatureRequest = {
        id: "",
        status: "requested",
        title,
        description,
        userId: user.uid,
        createdAt: new Date(),
        likes: 0,
        dislikes: 0,
        likedBy: [],
        dislikedBy: [],
      };

      const docRef = await addDoc(
        collection(firestore, "feature_requests"),
        newRequest
      );

      toast({
        title: "Success",
        description: t.successToast
      });
      setTitle("");
      setDescription("");

      setFeatureRequests((prevRequests) => [
        { ...newRequest, id: docRef.id },
        ...prevRequests,
      ]);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: t.errorToast,
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <div className="max-w-full p-5 xl:p-9 border-1 rounded-xl border-borderColor shadow-lg">
        <h2 className="text-3xl font-semibold text-card-foreground">{t.header}</h2>
        <div className="h-1px bg-borderColor my-7"></div>
        <Input
          type="text"
          label={t.titleLabel}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="bordered"
          isDisabled={!user}
          className="mb-5"
          size="lg"
        />
        <Textarea
          className="mt-6"
          label={t.descriptionLabel}
          placeholder={t.descriptionPlaceholder}
          disableAnimation
          variant="bordered"
          classNames={{
            input: "resize-y min-h-[180px] lg:min-h-[150px]",
            label: "text-base",
          }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          isDisabled={!user}
        />
        <div className="h-1px bg-borderColor my-7"></div>
        <Button
          className="mt-4 bg-blue-500 text-white hover:bg-blue-600 px-6 py-2 w-full md:w-auto"
          size="lg"
          onClick={saveFeature}
          disabled={loading || !user}
        >
          {t.submitButton}
        </Button>
      </div>
    </div>
  );
}
