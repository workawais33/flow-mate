"use client";

import { useState }from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const plans = [
  {
    name: "Basic",
    price: "$10",
    period: "one-time",
    plan: "basic",
    features: [
      "Full dashboard access",
      "Lifetime access",
      "No recurring billing"
    ]
  },
  {
    name: "Monthly",
    price: "$30",
    period: "/month",
    plan: "monthly",
    features: [
      "Unlimited access",
      "Priority updates",
      "Cancel anytime"
    ]
  },
  {
    name: "Yearly",
    price: "$100",
    period: "/year",
    plan: "yearly",
    features: [
      "Unlimited access",
      "Best value",
      "Save $260/year"
    ]
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  const handleCheckout = async (plan: string) => {
    try {
      setLoading(plan);

      let userId = localStorage.getItem("userId");

      if (!userId) {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const meData = await meRes.json();
        userId = meData.user?.id || meData.user?._id;
        if (userId) localStorage.setItem("userId", userId);
      }

      if (!userId) {
        toast.error("Please log in again");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Checkout failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading("");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg">Unlock FlowMate productivity power</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.plan} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-2xl font-semibold mb-4">{plan.name}</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.plan)}
                disabled={loading === plan.plan}
                className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:opacity-90"
              >
                {loading === plan.plan ? "Redirecting..." : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}