import { useEffect } from "react";
import { useLocation } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";

export default function ResetPassword() {
  usePageTitle("Reset Password");
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/forgot-password");
  }, [setLocation]);

  return null;
}
