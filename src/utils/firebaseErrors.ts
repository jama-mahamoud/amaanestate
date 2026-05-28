export const parseAuthError = (error: any): string => {
  if (!error) return "Something went wrong. Please try again.";

  // Handle Firebase error code logic
  const code = error.code || error.message || "";
  
  if (typeof code !== "string") {
    return "Something went wrong. Please try again.";
  }

  // Pre-defined mapping of auth error codes to user-friendly messages
  const errorMap: Record<string, string> = {
    // Standard auth codes
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",
    "auth/requires-recent-login": "You need to log in again to perform this action.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
    "auth/unauthorized-domain": "This domain is not authorized for sign-in.",
    "auth/admin-restricted-operation": "This operation is restricted to administrators."
  };

  for (const [key, msg] of Object.entries(errorMap)) {
    if (code.includes(key)) {
      return msg;
    }
  }

  // Fallback for general firebase and unhandled errors
  if (code.includes("Firebase:")) {
    return "Something went wrong with authentication. Please try again.";
  }

  // Very generic fallback
  return error.message && typeof error.message === 'string' && !error.message.includes("Firebase:") 
    ? error.message 
    : "Something went wrong. Please try again.";
};
