"use client"; // Indicate that this is a client component

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Globe } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { changeLocale } from "../actions";

const LocaleDropdown = () => {
  const [selectedLocale, setSelectedLocale] = useState("en"); // Default locale

  // Function to read the cookie for locale
  const getLocaleFromCookies = () => {
    if (typeof document === "undefined") return "en"; // Fallback if in a non-browser environment
    const match = document.cookie.match(/locale=([^;]+)/);
    return match ? (match[1] as Locale) : "en"; // Default to 'en' if not found
  };

  useEffect(() => {
    const locale = getLocaleFromCookies();
    setSelectedLocale(locale); // Initialize state with the cookie value
  }, []);

  const toggleLocale = async () => {
    const newLocale = selectedLocale === "en" ? "de" : "en";
    setSelectedLocale(newLocale);
    document.cookie = `locale=${newLocale}; path=/`; // Set the cookie
    
    // Use try/catch for server action to prevent issues
    try {
      await changeLocale(newLocale);
      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Failed to change locale:", error);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem] scale-100 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={true}>
          {selectedLocale === "en" ? "English" : "Deutsch"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleLocale}>
          {selectedLocale === "en" ? "Deutsch" : "English"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleDropdown;
