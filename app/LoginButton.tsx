"use client";
import { Button } from "@/components/ui/button";
import {
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  User,
} from "firebase/auth";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { auth } from "./lib/firebaseConfig";

interface AuthButtonProps {
  initialUser: User | null;
}

interface tAuthButton {
  login: string;
  register: string;
}

interface Props {
  initialUser: User | null;
  t: tAuthButton;
}

const AuthButton: React.FC<Props> = ({ initialUser, t }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  const updateCookie = async (user: User) => {
    await fetch("/api/setCookie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: user }),
    });
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onIdTokenChanged(
      auth,
      (user: User | null) => {
        if (user) {
          updateCookie(user);
        }
      },
      (error: Error) => {
        console.error("Error in onIdTokenChanged:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <div></div>
      ) : (
        <div>
          <Link href={"/login"}>
            <Button
              variant="outline"
              disabled={isLoading}
              className="border-2 border-blue-500 hover:bg-blue-50"
            >
              {t.login}
            </Button>
          </Link>
          <Link href={"/sign-up"}>
            <Button
              variant="default"
              disabled={isLoading}
              className="bg-blue-500 text-white hover:bg-blue-600 ml-2"
            >
              {t.register}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
