import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid rgba(255, 122, 0, 0.2)',
          borderRadius: '12px',
          padding: '16px',
        },
        className: 'font-medium',
      }}
    />
  );
}