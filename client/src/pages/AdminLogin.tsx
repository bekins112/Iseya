import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import iseyaLogo from "@assets/Iseya_(3)_1770122415773.png";

export default function AdminLogin() {
  const { login, isLoggingIn, isAuthenticated, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaKey, setCaptchaKey] = useState(Date.now());

  const refreshCaptcha = useCallback(() => {
    setCaptchaAnswer("");
    setCaptchaKey(Date.now());
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      setLocation("/admin/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              Your account does not have admin privileges. Please contact an administrator if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!captchaAnswer.trim()) {
      setError("Please enter the text shown in the image.");
      return;
    }
    try {
      const loggedInUser = await login({ email, password, captcha: captchaAnswer });
      if (loggedInUser.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setError("This account does not have admin access.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
      refreshCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img src={iseyaLogo} alt="Iṣéyá" className="h-10 w-auto" />
            </div>
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display" data-testid="text-admin-login-title">Admin Portal</CardTitle>
            <CardDescription>
              Sign in with your admin credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription data-testid="text-admin-login-error">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-admin-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    data-testid="input-admin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="button-toggle-admin-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Security Check</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-lg overflow-hidden border">
                    <img
                      src={`/api/auth/captcha?t=${captchaKey}`}
                      alt="CAPTCHA"
                      className="h-12 w-full object-contain"
                      data-testid="img-admin-captcha"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={refreshCaptcha}
                    className="shrink-0"
                    data-testid="button-refresh-admin-captcha"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Enter text from image"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                  data-testid="input-admin-captcha"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-bold"
                disabled={isLoggingIn}
                data-testid="button-admin-login-submit"
              >
                {isLoggingIn ? "Signing In..." : "Sign In as Admin"}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Only authorized administrators can access this portal
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
