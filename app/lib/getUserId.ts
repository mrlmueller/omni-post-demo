import { useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

type SetUserId = (userId: string | null) => void;

export const useAuthListener = (setUserId: SetUserId): void => {
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, [setUserId]);
};
