"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Spinner } from "@nextui-org/react";
import { TiUserAddOutline } from "react-icons/ti";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import your AdminFeedbackPanel
import AdminFeedbackPanel from "./AdminFeedbackPanel";

// Display user ID only during development for setup
const IS_DEV = process.env.NODE_ENV === 'development';

interface UserWithSocialsOrStripeId {
  uid: string;
  displayName: string;
  email: string;
  lastLogin: string | null;
  socials?: { [key: string]: string };
  stripeId?: string;
}

export default function AdminPage() {
  // -----------------------------
  // 1. States
  // -----------------------------
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithSocialsOrStripeId[]>([]);
  const [isAddingStripe, setIsAddingStripe] = useState<string | null>(null);

  const router = useRouter();

  // -----------------------------
  // 2. Check Admin Status via API
  // -----------------------------
  const checkAdminStatus = async (authToken: string, uid: string) => {
    try {
      const response = await fetch("/api/admin/check-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ uid }),
      });
      
      if (response.ok) {
        setAuthorized(true);
      } else {
        console.error("Admin access denied");
        setAuthorized(false);
        router.push("/");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setAuthorized(false);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // 3. Fetching User Data
  // -----------------------
  const fetchUsers = async (authToken: string) => {
    try {
      const response = await fetch("/api/admin/list-all-users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data: UserWithSocialsOrStripeId[] = await response.json();
        setUsers(data);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // -------------------------------------------
  // 4. Add user to Stripe (Button)
  // -------------------------------------------
  const handleAddUserToStripe = async (user: UserWithSocialsOrStripeId) => {
    setIsAddingStripe(user.uid);
    try {
      const response = await fetch("/api/admin/create-stripe-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      if (response.ok) {
        console.log("Stripe creation started...");
      } else {
        const errorData = await response.json();
        console.error("Error creating Stripe user:", errorData);
      }
    } catch (error) {
      console.error("Error creating Stripe user:", error);
    } finally {
      setIsAddingStripe(null);
    }
  };

  // ------------------------
  // 5. On Mount: Auth-Check
  // ------------------------
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setUserId(user.uid);
          const idToken = await user.getIdToken();
          setToken(idToken);
          
          // Check admin access with user ID
          checkAdminStatus(idToken, user.uid);
        } catch (err) {
          console.error("Error getting token:", err);
          setLoading(false);
          setAuthorized(false);
          router.push("/");
        }
      } else {
        // No user => not authorized
        setLoading(false);
        setAuthorized(false);
        router.push("/");
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------
  // 6. Load users if admin
  // ----------------------------
  useEffect(() => {
    if (authorized && token) {
      fetchUsers(token);
    }
  }, [authorized, token]);

  // -------------------------------------
  // 7. Render the component
  // -------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // If we got here and `authorized` is false, we're presumably navigating away in the effect.
  // Render nothing or a short message:
  if (!authorized) {
    return null;
  }

  // Otherwise, we are admin & loading is done
  return (
    <div className="container mx-auto px-4">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-gray-700">
            Willkommen im Admin-Dashboard. Hier kannst du Benutzer verwalten,
            Stripe-Anbindungen hinzufügen und mehr.
          </p>
          {IS_DEV && userId && (
            <div className="mt-4 p-3 bg-yellow-100 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Your User ID:</strong> {userId} <br />
                <span className="text-xs">(This is only shown in development mode)</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs using shadcn Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="mt-4">
            <h2 className="text-2xl font-semibold mb-4">Nutzerübersicht</h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Stripe</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>{user.displayName || "No Name"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.lastLogin ?? "–"}</TableCell>
                      <TableCell>
                        {user.stripeId ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            {user.stripeId}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            Noch kein Stripe
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.stripeId ? (
                          <span className="text-gray-400">–</span>
                        ) : (
                          <Button
                            variant="outline"
                            className="flex items-center"
                            disabled={isAddingStripe === user.uid}
                            onClick={() => handleAddUserToStripe(user)}
                          >
                            <TiUserAddOutline className="mr-2" />
                            {isAddingStripe === user.uid
                              ? "Wird hinzugefügt..."
                              : "Zu Stripe hinzufügen"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="feedback">
          <AdminFeedbackPanel token={token} />
        </TabsContent>
      </Tabs>
    </div>
  );
}