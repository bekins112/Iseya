import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iṣéyá" className="h-8 w-auto" />
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center pt-16 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-display" data-testid="text-forgot-password-title">
                {success ? "Check Your Email" : "Forgot Password?"}
              </CardTitle>
              <CardDescription>
                {success
                  ? "We've sent a password reset link to your email address."
                  : "Enter the email address associated with your account and we'll send you a link to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground" data-testid="text-forgot-password-success">
                    If an account exists with <strong>{email}</strong>, you'll receive a reset link shortly. Check your spam folder if you don't see it.
                  </p>
                  <Link href="/login">
                    <Button variant="outline" className="w-full" data-testid="link-back-to-login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription data-testid="text-forgot-password-error">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        data-testid="input-forgot-email"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold"
                    disabled={isSubmitting}
                    data-testid="button-send-reset-link"
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <div className="text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline" data-testid="link-back-to-login">
                      <ArrowLeft className="w-3 h-3 inline mr-1" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
