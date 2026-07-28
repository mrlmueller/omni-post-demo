"use client";

import { signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import UserChip from "../UserChip";
import { auth } from "@/app/lib/firebaseConfig";
import { MdOutlineImageNotSupported } from "react-icons/md";

interface ProfileMenuTranslation {
  premiumPlan: string;
  basicPlan: string;
  profile: string;
  logout: string;
  imageAlt: string;
}

interface ProfileMenuProps {
  initialUser: User | null;
  isPremium?: boolean;
  t: ProfileMenuTranslation;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  initialUser,
  isPremium,
  t,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch("/api/deleteCookie");
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeProfileMenu();
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <div className="flex relative" ref={menuRef}>
      <button
        className={`relative h-9 w-9 rounded-full ${
          !initialUser?.photoURL ? "bg-gray-300" : ""
        }`}
        onClick={toggleProfileMenu}
      >
        {initialUser?.photoURL ? (
          <Image
            src={initialUser.photoURL}
            alt={t.imageAlt}
            width={35}
            height={35}
            className="rounded-full"
          />
        ) : (
          <MdOutlineImageNotSupported className="m-auto" size={22} />
        )}
      </button>

      <AnimatePresence>
        {isProfileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-10 w-56 bg-white shadow-md rounded-md"
          >
            <div className="p-4 border-b">
              <UserChip initialUserName={initialUser?.displayName ?? ""} />

              {isPremium ? (
                <div className="text-xs text-gray-500">{t.premiumPlan}</div>
              ) : (
                <div className="text-xs text-gray-500">{t.basicPlan}</div>
              )}
            </div>
            <div>
              <button
                onClick={() => router.push("/user-profile")}
                className="w-full text-left py-2 px-4 hover:bg-gray-100"
              >
                {t.profile}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-4 hover:bg-gray-100"
              >
                {t.logout}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
