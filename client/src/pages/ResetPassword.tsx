import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ResetPassword() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/forgot-password");
  }, [setLocation]);

  return null;
}
