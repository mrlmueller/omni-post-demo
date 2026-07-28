"use client";
import Script from "next/script";
import React from "react";

const Cookiebanner = () => {
  return (
    <div>
      <Script
        id="cookiebot"
        src="https://consent.cookiebot.com/uc.js"
        data-cbid="e3f02f18-ccdc-4bda-9830-971532b31bf2"
        data-blockingmode="auto"
        type="text/javascript"
        strategy="afterInteractive"
      />
    </div>
  );
};

export default Cookiebanner;
