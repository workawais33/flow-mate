"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  if (status === "verifying") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Verifying your payment...</div>
          <div className="text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <div className="text-xl mb-2">Payment Successful! </div>
          <div className="text-gray-500">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-5xl mb-4">✗</div>
        <div className="text-xl mb-2">Verification Failed</div>
        <div className="text-gray-500 mb-4">Could not verify your payment</div>
        <a href="/pricing" className="text-blue-500 underline">
          Return to Pricing
        </a>
      </div>
    </div>
  );
}