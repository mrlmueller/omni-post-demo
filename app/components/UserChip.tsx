"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

const UserChip = ({ initialUserName }: { initialUserName: any }) => {
  // user ship
  const [userName, setUserName] = useState<String | null>(initialUserName);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user1) => {
      if (user1) {
        try {
          setUserName(user1.displayName);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{userName ? <p className="">{userName}</p> : <></>}</>;
};

export default UserChip;
