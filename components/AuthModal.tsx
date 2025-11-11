"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  login,
  signup,
  confirmRegistration,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  googleAuth,
} from "../lib/api/auth";

// Declare Google types for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<
    "email" | "otp" | "reset"
  >("email");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer" as "customer" | "salon_owner",
  });

  // Load Google Sign-In script
  useEffect(() => {
    if (!isOpen) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isOpen]);

  const handleGoogleSignIn = async (credential: string) => {
    setIsLoading(true);
    try {
      const response = await googleAuth(credential);
      toast.success(`Welcome, ${response.user.name}!`);
      onClose();
      // Refresh the page to update UI with logged-in state
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({
        identifier: loginForm.email,
        password: loginForm.password,
      });

      toast.success(`Welcome back, ${response.user.name}!`);
      setLoginForm({ email: "", password: "" });
      onClose();

      // Refresh the page to update UI with logged-in state
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !signupForm.name ||
      !signupForm.email ||
      !signupForm.password ||
      !signupForm.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Validate phone number (basic validation)
    if (signupForm.phone && !/^\d{10}$/.test(signupForm.phone)) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    setIsLoading(true);
    try {
      const response = await signup({
        name: signupForm.name,
        email: signupForm.email,
        phone: signupForm.phone || "0000000000", // Default if not provided
        password: signupForm.password,
        role: signupForm.role,
      });

      toast.success(
        "Account created! Please check your email for the verification code (OTP)."
      );
      setShowOtpVerification(true);
    } catch (error: any) {
      const errorMessage = error.message || "Signup failed. Please try again.";
      toast.error(errorMessage);

      // If account already exists, suggest login
      if (errorMessage.includes("already registered")) {
        setTimeout(() => {
          toast.info("You can try logging in with your existing credentials.", {
            duration: 5000,
          });
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await confirmRegistration(signupForm.email, otp);

      toast.success("Account verified successfully! You can now login.");
      setShowOtpVerification(false);
      setSignupForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "customer",
      });
      setOtp("");
      // Switch to login tab
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      if (loginTab) loginTab.click();
    } catch (error: any) {
      toast.error(
        error.message || "OTP verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!signupForm.email) {
      toast.error("Email not found. Please try signing up again.");
      return;
    }

    setIsLoading(true);
    try {
      // Resend signup request to get new OTP
      await signup({
        name: signupForm.name,
        email: signupForm.email,
        phone: signupForm.phone || "0000000000",
        password: signupForm.password,
        role: signupForm.role,
      });

      toast.success("Verification code resent! Please check your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(forgotPasswordEmail);
      toast.success("Password reset code sent! Please check your email.");
      setForgotPasswordStep("otp");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to send reset code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || resetOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      await verifyResetOTP(forgotPasswordEmail, resetOtp);
      toast.success("Code verified! Please enter your new password.");
      setForgotPasswordStep("reset");
    } catch (error: any) {
      toast.error(
        error.message || "Invalid or expired code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(forgotPasswordEmail, resetOtp, newPassword);
      toast.success(
        "Password reset successfully! You can now login with your new password."
      );

      // Reset forgot password state and go back to login
      setShowForgotPassword(false);
      setForgotPasswordStep("email");
      setForgotPasswordEmail("");
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    if (!forgotPasswordEmail) {
      toast.error("Email not found. Please start over.");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(forgotPasswordEmail);
      toast.success("Reset code resent! Please check your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="font-display text-2xl text-center font-bold">
            Welcome to{" "}
            <span className="bg-clip-text text-orange-400">ProBeauty</span>
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Join our beauty community and discover personalized solutions ✨
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="login"
              className="rounded-md text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 transition-all font-medium"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-md text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 transition-all font-medium"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your ProBeauty account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email or Phone</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="text"
                        placeholder="Enter your email or phone"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, email: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({
                            ...loginForm,
                            password: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setForgotPasswordStep("email");
                      }}
                      className="text-sm text-[#FF7A00] hover:text-[#e66900] font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FF7A00] hover:bg-[#e66900]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Sign-In Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.google) {
                        window.google.accounts.id.initialize({
                          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                          callback: (response: any) =>
                            handleGoogleSignIn(response.credential),
                        });
                        window.google.accounts.id.prompt();
                      }
                    }}
                    disabled={isLoading}
                    className="w-full h-11 flex items-center justify-center gap-3 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      Sign in with Google
                    </span>
                  </button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {showOtpVerification ? "Verify Your Email" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {showOtpVerification
                    ? `Enter the 6-digit code sent to ${signupForm.email}`
                    : "Join ProBeauty and start your beauty journey"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showOtpVerification ? (
                  <form onSubmit={handleSignup} className="space-y-3">
                    {/* Row 1: Name and Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="signup-name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your name"
                            className="pl-10 h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-all"
                            value={signupForm.name}
                            onChange={(e) =>
                              setSignupForm({
                                ...signupForm,
                                name: e.target.value,
                              })
                            }
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="signup-email"
                          className="text-sm font-medium text-gray-700"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Your email"
                            className="pl-10 h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-all"
                            value={signupForm.email}
                            onChange={(e) =>
                              setSignupForm({
                                ...signupForm,
                                email: e.target.value,
                              })
                            }
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Phone and Account Type */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="signup-phone"
                          className="text-sm font-medium text-gray-700"
                        >
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="10 digits"
                            className="pl-10 h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-all"
                            value={signupForm.phone}
                            onChange={(e) =>
                              setSignupForm({
                                ...signupForm,
                                phone: e.target.value,
                              })
                            }
                            disabled={isLoading}
                            required
                            maxLength={10}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="signup-role"
                          className="text-sm font-medium text-gray-700"
                        >
                          Account Type
                        </Label>
                        <select
                          id="signup-role"
                          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                          value={signupForm.role}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              role: e.target.value as
                                | "customer"
                                | "salon_owner",
                            })
                          }
                          disabled={isLoading}
                          required
                        >
                          <option value="customer">Customer</option>
                          <option value="salon_owner">Salon Owner</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Password and Confirm Password */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="signup-password"
                          className="text-sm font-medium text-gray-700"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min 8 chars"
                            className="pl-10 pr-10 h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-all"
                            value={signupForm.password}
                            onChange={(e) =>
                              setSignupForm({
                                ...signupForm,
                                password: e.target.value,
                              })
                            }
                            disabled={isLoading}
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="signup-confirm-password"
                          className="text-sm font-medium text-gray-700"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm"
                            className="pl-10 pr-10 h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-all"
                            value={signupForm.confirmPassword}
                            onChange={(e) =>
                              setSignupForm({
                                ...signupForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            disabled={isLoading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 mt-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                          Or sign up with
                        </span>
                      </div>
                    </div>

                    {/* Google Sign-Up Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.google) {
                          window.google.accounts.id.initialize({
                            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                            callback: (response: any) =>
                              handleGoogleSignIn(response.credential),
                          });
                          window.google.accounts.id.prompt();
                        }
                      }}
                      disabled={isLoading}
                      className="w-full h-11 flex items-center justify-center gap-3 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="font-medium text-gray-700 group-hover:text-gray-900">
                        Sign up with Google
                      </span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpVerification} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-input">Verification Code</Label>
                      <Input
                        id="otp-input"
                        type="text"
                        placeholder="Enter 6-digit code"
                        className="text-center text-2xl tracking-widest"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        disabled={isLoading}
                        required
                        maxLength={6}
                        pattern="\d{6}"
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Check your email inbox for the verification code
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#FF7A00] hover:bg-[#e66900]"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Complete Registration"
                      )}
                    </Button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="flex-1 text-sm text-[#FF7A00] hover:text-[#e66900] font-medium"
                        disabled={isLoading}
                      >
                        Resend Code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtpVerification(false);
                          setOtp("");
                        }}
                        className="flex-1 text-sm text-gray-600 hover:text-gray-800 underline"
                        disabled={isLoading}
                      >
                        Back to signup
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forgot Password Modal Overlay */}
        {showForgotPassword && (
          <div className="absolute inset-0 bg-white z-10 rounded-lg p-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {forgotPasswordStep === "email" && "Reset Password"}
                  {forgotPasswordStep === "otp" && "Verify Code"}
                  {forgotPasswordStep === "reset" && "Create New Password"}
                </CardTitle>
                <CardDescription>
                  {forgotPasswordStep === "email" &&
                    "Enter your email to receive a reset code"}
                  {forgotPasswordStep === "otp" &&
                    `Enter the 6-digit code sent to ${forgotPasswordEmail}`}
                  {forgotPasswordStep === "reset" && "Enter your new password"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {forgotPasswordStep === "email" && (
                  <form
                    onSubmit={handleForgotPasswordEmail}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={forgotPasswordEmail}
                          onChange={(e) =>
                            setForgotPasswordEmail(e.target.value)
                          }
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#FF7A00] hover:bg-[#e66900]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        "Send Reset Code"
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                      }}
                      className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
                      disabled={isLoading}
                    >
                      Back to Login
                    </button>
                  </form>
                )}

                {forgotPasswordStep === "otp" && (
                  <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-otp">Verification Code</Label>
                      <Input
                        id="reset-otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        className="text-center text-2xl tracking-widest"
                        value={resetOtp}
                        onChange={(e) =>
                          setResetOtp(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        disabled={isLoading}
                        required
                        maxLength={6}
                        pattern="\d{6}"
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Check your email inbox for the verification code
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#FF7A00] hover:bg-[#e66900]"
                      disabled={isLoading || resetOtp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResendResetOtp}
                        className="flex-1 text-sm text-[#FF7A00] hover:text-[#e66900] font-medium"
                        disabled={isLoading}
                      >
                        Resend Code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordStep("email");
                          setForgotPasswordEmail("");
                          setResetOtp("");
                        }}
                        className="flex-1 text-sm text-gray-600 hover:text-gray-800 underline"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {forgotPasswordStep === "reset" && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password (min 8 characters)"
                          className="pl-10 pr-10"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-new-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="pl-10 pr-10"
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#FF7A00] hover:bg-[#e66900]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordStep("email");
                        setForgotPasswordEmail("");
                        setResetOtp("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                      }}
                      className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
