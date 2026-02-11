"use client";

import { useEffect } from "react";

const containerStyle = {
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  padding: "1rem",
  fontFamily: "system-ui, sans-serif",
  color: "#e5e5e5",
  backgroundColor: "#0a0a0a",
};

const headingStyle = {
  fontSize: "1.5rem",
  fontWeight: 700,
  marginBottom: "0.5rem",
};

const paragraphStyle = {
  color: "#a3a3a3",
  marginBottom: "1.5rem",
};

const contentStyle = {
  textAlign: "center" as const,
  maxWidth: "28rem",
};

const buttonStyle = {
  padding: "0.5rem 1.5rem",
  borderRadius: "0.5rem",
  border: "1px solid #444",
  backgroundColor: "#171717",
  color: "#e5e5e5",
  cursor: "pointer" as const,
  fontSize: "0.875rem",
  fontWeight: 500,
  transition: "border-color 0.15s, background-color 0.15s",
};

const linkStyle = {
  padding: "0.5rem 1.5rem",
  borderRadius: "0.5rem",
  color: "#a3a3a3",
  textDecoration: "none" as const,
  fontSize: "0.875rem",
  fontWeight: 500,
  transition: "color 0.15s",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "0.5rem",
  justifyContent: "center" as const,
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Something went wrong</title>
        <style>{`
          .ge-btn:hover, .ge-btn:focus-visible { border-color: #666; background-color: #222; }
          .ge-link:hover, .ge-link:focus-visible { color: #e5e5e5; }
          .ge-btn:focus-visible, .ge-link:focus-visible { outline: 2px solid #666; outline-offset: 2px; }
        `}</style>
      </head>
      <body style={{ margin: 0 }}>
        <div style={containerStyle}>
          <div style={contentStyle}>
            <h1 style={headingStyle}>Something went wrong</h1>
            <p style={paragraphStyle}>
              An unexpected error occurred. Please try again.
            </p>
            <div style={buttonGroupStyle}>
              <button onClick={reset} className="ge-btn" style={buttonStyle}>
                Try Again
              </button>
              <a href="/" className="ge-link" style={linkStyle}>
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
