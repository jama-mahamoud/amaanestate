export const parseAuthError = (error: any): string => {
  if (!error) return "Something went wrong. Please try again.";

  console.error("[Auth Error Parser] Raw Error:", error);

  // Handle Firebase error code logic
  const code = error.code || "";
  const message = error.message || "";
  
  if (typeof code !== "string" && typeof message !== "string") {
    return "Something went wrong. Please try again.";
  }

  const searchTarget = (code + " " + message).toLowerCase();

  // Pre-defined mapping of auth error codes to user-friendly messages
  if (searchTarget.includes("invalid-credential") || searchTarget.includes("wrong-password")) {
    return "Invalid email or password.";
  }
  if (searchTarget.includes("user-not-found")) {
    return "No account found with this email.";
  }
  if (searchTarget.includes("email-already-in-use")) {
    return "This email is already registered.";
  }
  if (searchTarget.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (searchTarget.includes("weak-password")) {
    return "Password must be at least 6 characters.";
  }
  if (searchTarget.includes("too-many-requests")) {
    return "Too many attempts. Please try again later.";
  }
  if (searchTarget.includes("network-request-failed")) {
    return "Network error. Check your internet connection.";
  }
  if (searchTarget.includes("user-disabled")) {
    return "This account has been disabled. Please contact support.";
  }
  if (searchTarget.includes("operation-not-allowed")) {
    return "This sign-in method is not enabled in Firebase Auth.";
  }
  if (searchTarget.includes("requires-recent-login")) {
    return "You need to log in again to perform this action.";
  }
  if (searchTarget.includes("popup-closed-by-user")) {
    return "Sign-in popup was closed before completing.";
  }
  if (searchTarget.includes("cancelled-popup-request")) {
    return "The sign-in popup request was cancelled or blocked. Please avoid double-clicking the button or make sure popups are allowed (try opening in a new tab if you are inside an iframe).";
  }
  if (searchTarget.includes("unauthorized-domain")) {
    return "This domain is not authorized for sign-in in Firebase Console.";
  }
  if (searchTarget.includes("admin-restricted-operation")) {
    return "This operation is restricted to administrators.";
  }
  if (searchTarget.includes("api-key-not-valid") || searchTarget.includes("api key not valid")) {
    return "Authentication disabled: Invalid or missing Firebase API Key. Please check VITE_FIREBASE_API_KEY.";
  }
  if (searchTarget.includes("requested action is invalid")) {
    return "The requested action is invalid: Please verify your Firebase API key and configuration.";
  }

  // Fallback showing the actual message to help debugging
  return typeof error.message === 'string' && error.message.length > 0 
    ? error.message.replace(/^Firebase:\s*/, "") 
    : "Something went wrong. Please try again.";
};
