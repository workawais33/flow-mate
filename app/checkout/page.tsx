"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");
  const plan = searchParams.get("plan");  

  const handlePayment = async (): Promise<void> => {
    if (!userId || !plan) {
      console.error("Missing userId or plan");
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,  
          plan,  
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error(data.error);
      }

    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  useEffect(() => {
    if (userId && plan) {
      handlePayment();
    }
  }, [userId, plan]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting to secure payment...
    </div>
  );
}