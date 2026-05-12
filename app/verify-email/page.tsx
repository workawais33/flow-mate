"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    if (!userId || !token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Email verified! Redirecting to dashboard...");
          toast.success("Email verified successfully!");
          setTimeout(() => router.push("/dashboard"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === "verifying" && (
          <>
            <div className="text-4xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-gray-600">Please wait</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-gray-600">{message}</p>
            <a href="/login" className="text-blue-600 underline mt-4 inline-block">
              Back to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}