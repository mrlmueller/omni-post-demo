"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AdminHelperProps {
  token: string;
}

export default function AdminHelper({ token }: AdminHelperProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [makingAdmin, setMakingAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/get-current-user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setUserId(data.uid);
          setUserEmail(data.email);
        } else {
          console.error("Error getting user ID:", data.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getCurrentUser();
    }
  }, [token]);

  const makeAdmin = async () => {
    if (!userId) return;
    
    setMakingAdmin(true);
    try {
      const response = await fetch("/api/admin/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: userId }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `User ${data.uid} is now an admin! Please refresh the page.`
        });
      } else {
        console.error("Error making admin:", data);
        toast({
          title: "Error",
          description: `Failed to make admin: ${data.message || "Unknown error"}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error making admin:", error);
      toast({
        title: "Error",
        description: `Error: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setMakingAdmin(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Helper</CardTitle>
        <CardDescription>Use this to set up admin rights for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading user information...</p>
        ) : (
          <>
            <div className="mb-4">
              <p><strong>Your User ID:</strong> {userId || "Not found"}</p>
              <p><strong>Your Email:</strong> {userEmail || "Not found"}</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              After making yourself an admin, you&apos;ll need to refresh the page.
              Then you can remove this helper component.
            </p>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={makeAdmin} 
          disabled={!userId || makingAdmin || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {makingAdmin ? "Processing..." : "Make Myself Admin"}
        </Button>
      </CardFooter>
    </Card>
  );
}