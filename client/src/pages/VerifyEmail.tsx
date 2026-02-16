import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MailCheck, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function VerifyEmail() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sendCode = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/send-verification"),
    onSuccess: () => {
      setSuccess("Verification code sent to your email!");
      setError("");
    },
    onError: (err: any) => {
      setError(err.message || "Failed to send verification code");
      setSuccess("");
    },
  });

  const verifyCode = useMutation({
    mutationFn: (code: string) =>
      apiRequest("POST", "/api/auth/verify-email", { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
    },
    onError: (err: any) => {
      setError(err.message || "Verification failed");
      setSuccess("");
    },
  });

  if (!isAuthenticated || !user) {
    setLocation("/login");
    return null;
  }

  if ((user as any)?.emailVerified) {
    setLocation("/dashboard");
    return null;
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    verifyCode.mutate(code);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <a href="/" className="flex items-center gap-2">
            <img src={iseyaLogo} alt="Iseya" className="h-8 w-auto" />
          </a>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center pt-16 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="text-center pt-8 pb-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <MailCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display font-bold">Verify Your Email</CardTitle>
              <CardDescription>
                We need to verify your email address ({user?.email}) before you can continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <MailCheck className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => sendCode.mutate()}
                disabled={sendCode.isPending}
                data-testid="button-send-code"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${sendCode.isPending ? "animate-spin" : ""}`} />
                {sendCode.isPending ? "Sending..." : "Send Verification Code"}
              </Button>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    data-testid="input-verification-code"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold group"
                  disabled={verifyCode.isPending || code.length !== 6}
                  data-testid="button-verify-email"
                >
                  {verifyCode.isPending ? "Verifying..." : "Verify Email"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                The code expires in 15 minutes. Check your spam folder if you don't see it.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
