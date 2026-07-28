import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

type CookieStatus = "success" | "error";
type CookieOptions = {
  path?: string;
  maxAge?: number;
};

export async function setOAuthStatusCookie(
  status: CookieStatus,
  message: string,
  httpStatus: number = 200,
  options?: CookieOptions
) {
  const headersList = await headers();
  const ua = headersList.get("user-agent");
  const device = new UAParser(ua || "").getDevice();

  const isMobile = device?.type === "mobile";

  const errorPageHtml = `
    <html>
      <head>
        <title>OAuth Error</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            height: 100vh;
            margin: 0; 
            text-align: center;
            background-color: #f8f9fa;
          }
          .container {
            padding-left: 1.25rem; /* 20px */
            padding-right: 1.25rem; /* 20px */
            padding-top: 1.25rem; /* 20px */
            padding-bottom: 2.25rem; /* 20px */
            margin-left: 1rem; /* 16px */
            margin-right: 1rem; /* 16px */
            background-color: #ffffff; /* Background color */
            border: 1px solid #e0e0e0; /* Light gray border */
            border-radius: 0.5rem; /* Rounded corners */
          }
          button {
            padding-left: 1rem; /* 16px */
            padding-right: 1rem; /* 16px */
            min-width: 5rem; /* 80px */
            height: 2.5rem; /* 40px */
            font-size: 0.875rem; /* 14px */
            line-height: 1.25rem; /* 20px */
            gap: 0.5rem; /* 8px */
            background-color: #3b82f6; /* Button background color */
            color: white; /* Button text color */
            border: none; /* Remove border */
            border-radius: 0.25rem; /* Border radius for button */
            cursor: pointer; /* Pointer cursor */
          }
          button:hover {
            background-color: #2563eb; /* Darker shade of blue on hover */
          }
        </style>
        <script>
          // Auto-close window after 10 seconds for non-mobile devices
          ${!isMobile ? "setTimeout(() => { window.close(); }, 10000);" : ""}
        </script>
      </head>
      <body>
        <div class="container">
          <h1>Error Occurred</h1>
          <p>${message}</p>
          <button ${
            isMobile
              ? `onclick="window.location.href='https://omni-post.app'"`
              : `onclick="window.close()"`
          }>
            ${isMobile ? "Go to Homepage" : "Close Window"}
          </button>
        </div>
      </body>
    </html>
  `;

  // Handling mobile devices
  if (isMobile) {
    if (status === "error") {
      return new NextResponse(errorPageHtml, {
        status: httpStatus,
        headers: { "Content-Type": "text/html" },
      });
    } else {
      return new NextResponse(
        `
          <html>
            <script>
              window.location.href = "https://omni-post.app";
            </script>
          </html>
        `,
        {
          status: httpStatus,
          headers: { "Content-Type": "text/html" },
        }
      );
    }
  }

  // Handling non-mobile devices (error page or success)
  if (status === "error") {
    return new NextResponse(errorPageHtml, {
      status: httpStatus,
      headers: { "Content-Type": "text/html" },
    });
  }

  // For non-mobile devices, close the window in case of success
  return new NextResponse(
    `
      <html>
        <script>
          window.close();
        </script>
      </html>
    `,
    {
      status: httpStatus,
      headers: { "Content-Type": "text/html" },
    }
  );
}
