// Global state for modal management
let authModalState = {
  isOpen: false,
  defaultTab: "login" as "login" | "signup",
  onOpen: (tab: "login" | "signup" = "login") => {},
  onClose: () => {},
};

let cartDrawerState = {
  isOpen: false,
  onOpen: () => {},
  onClose: () => {},
};

export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

// Modal state setters (to be called from components)
export const setAuthModalHandlers = (handlers: typeof authModalState) => {
  authModalState = handlers;
};

export const setCartDrawerHandlers = (handlers: typeof cartDrawerState) => {
  cartDrawerState = handlers;
};

export const navigationActions = {
  shop: () => {
    // Navigate to ecommerce homepage
    if (typeof window !== "undefined") {
      window.location.href = "/ecommerce-home";
    }
  },
  bookSalon: () => {
    // Navigate to booking homepage
    if (typeof window !== "undefined") {
      window.location.href = "/booking-home";
    }
  },
  listBusiness: () => scrollToSection("list-business"),
  downloadApp: () => scrollToSection("app"),
  home: () => scrollToSection("home"),
  getStarted: () => {
    authModalState.onOpen("signup");
  },
  login: () => {
    authModalState.onOpen("login");
  },
  openCart: () => {
    cartDrawerState.onOpen();
  },
};
