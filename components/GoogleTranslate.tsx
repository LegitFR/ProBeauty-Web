"use client";
import { useEffect, useRef } from "react";

// Extend Window interface for Google Translate types
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
  }
}

// Define types for Google Translate API
interface GoogleTranslateAPI {
  translate: {
    TranslateElement: {
      new (
        config: {
          pageLanguage: string;
          includedLanguages?: string;
          layout: number;
          autoDisplay: boolean;
        },
        elementId: string
      ): void;
      InlineLayout: {
        SIMPLE: number;
        HORIZONTAL: number;
        VERTICAL: number;
      };
    };
  };
}

interface GoogleTranslateProps {
  onLanguageChange?: (language: string) => void;
}

const GoogleTranslate = ({ onLanguageChange }: GoogleTranslateProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("GoogleTranslate component mounted");

    // Check if the element exists
    const element = document.getElementById("google_translate_element");
    console.log("google_translate_element exists:", !!element);

    // Check if script is already loaded
    const existingScript = document.querySelector("#google-translate-script");
    if (existingScript) {
      console.log("Script already exists");
      // If script exists, check if already initialized
      const selectElement = document.querySelector(".goog-te-combo");
      if (selectElement) {
        console.log("Select element already exists, dispatching ready event");
        // Dispatch ready event if already loaded
        window.dispatchEvent(new Event("googleTranslateReady"));
      } else {
        console.log("Script exists but select element not found");
      }
      return;
    }

    console.log("Adding Google Translate script...");

    // Define the callback function that Google looks for BEFORE adding the script
    window.googleTranslateElementInit = () => {
      console.log("✓ googleTranslateElementInit called!");

      // Check if element still exists
      const el = document.getElementById("google_translate_element");
      console.log("Element check inside init:", !!el);

      // Use type assertion for Google Translate API
      const googleTranslate = (window as any).google as
        | GoogleTranslateAPI
        | undefined;

      console.log("Google API available:", !!googleTranslate);
      console.log(
        "TranslateElement available:",
        !!googleTranslate?.translate?.TranslateElement
      );

      if (googleTranslate?.translate?.TranslateElement) {
        console.log("Creating TranslateElement...");

        try {
          new googleTranslate.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,es,fr,de,it,pt,ar,hi,zh-CN,ja,ko,ru,tr",
              layout:
                googleTranslate.translate.TranslateElement.InlineLayout
                  .VERTICAL,
              autoDisplay: false,
            },
            "google_translate_element"
          );
          console.log("TranslateElement created successfully");
        } catch (error) {
          console.error("Error creating TranslateElement:", error);
        }

        // Wait for select element to be created before dispatching ready event
        let checkCount = 0;
        const waitForSelect = setInterval(() => {
          checkCount++;
          const selectElement = document.querySelector(".goog-te-combo");

          // Debug: Check what's actually in the element
          if (checkCount === 1) {
            const gtElement = document.getElementById(
              "google_translate_element"
            );
            console.log(
              "Contents of google_translate_element:",
              gtElement?.innerHTML
            );
            console.log("All children:", gtElement?.children);
          }

          console.log(
            `Checking for select element (${checkCount}/100):`,
            !!selectElement
          );

          if (selectElement) {
            clearInterval(waitForSelect);
            console.log("✓✓✓ Google Translate select element created!");
            window.dispatchEvent(new Event("googleTranslateReady"));
          }
        }, 50);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(waitForSelect);
          console.log(
            "Google Translate initialization timeout reached after",
            checkCount,
            "checks"
          );
          // Final debug check
          const gtElement = document.getElementById("google_translate_element");
          console.log("Final contents:", gtElement?.innerHTML);
        }, 5000);
      } else {
        console.error("Google Translate API not available!");
      }
    };

    // Add the Google Translate script
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    script.onload = () => {
      console.log("✓ Google Translate script loaded successfully");
    };

    script.onerror = (error) => {
      console.error("✗ Failed to load Google Translate script:", error);
    };

    document.body.appendChild(script);
    console.log("Script element added to body");

    // Add custom styles for Google Translate widget
    const style = document.createElement("style");
    style.innerHTML = `
      .translate-wrapper {
        position: fixed !important;
        bottom: -1000px !important;
        right: -1000px !important;
        width: 1px !important;
        height: 1px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -99999 !important;
        overflow: hidden !important;
        visibility: hidden !important;
      }

      #google_translate_element {
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      }

      #google_translate_element * {
        display: none !important;
      }

      .goog-te-combo {
        pointer-events: all !important;
        display: block !important;
        position: absolute !important;
        opacity: 0 !important;
      }

      /* Hide all Google Translate UI elements */
      .goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
      }
      
      .goog-te-banner-frame.skiptranslate {
        display: none !important;
      }

      iframe.goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
      }

      .goog-te-ftab {
        display: none !important;
      }

      .goog-te-balloon-frame {
        display: none !important;
      }

      body {
        top: 0px !important;
        position: static !important;
      }

      body > .skiptranslate {
        display: none !important;
      }

      .goog-logo-link {
        display: none !important;
      }

      .goog-te-gadget {
        color: transparent !important;
      }

      .goog-te-gadget-simple {
        background-color: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);

    // No cleanup needed - let the script and style persist across route changes
    // This prevents errors and keeps Google Translate working on all pages
  }, []);

  return (
    <div className="translate-wrapper" ref={containerRef}>
      <div
        id="google_translate_element"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: "" }}
      />
    </div>
  );
};

export default GoogleTranslate;

// "use client";

// import { useEffect, useState } from "react";

// const GoogleTranslate = () => {
//   const [isScriptLoaded, setIsScriptLoaded] = useState(false);

//   useEffect(() => {
//     // 1. Check if script is already there to avoid duplicates
//     if (document.querySelector("#google-translate-script")) {
//       setIsScriptLoaded(true);
//       return;
//     }

//     // 2. Add the Google Translate script
//     const script = document.createElement("script");
//     script.id = "google-translate-script";
//     script.src =
//       "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
//     script.async = true;
//     document.body.appendChild(script);

//     // 3. Define the callback function that Google looks for
//     window.googleTranslateElementInit = () => {
//       new window.google.translate.TranslateElement(
//         {
//           pageLanguage: "en", // Change this to your source language
//           layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
//           autoDisplay: false,
//         },
//         "google_translate_element"
//       );
//     };

//     setIsScriptLoaded(true);
//   }, []);

//   return (
//     <div className="translate-wrapper">
//       {/* This div is where the Google Dropdown will appear */}
//       <div id="google_translate_element"></div>
//     </div>
//   );
// };

// export default GoogleTranslate;
