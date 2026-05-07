interface UserAccessData {
  plan?: string;
  subscriptionEndsAt?: string | Date | null;
  trialEndsAt?: string | Date | null;
  isPaid?: boolean;
  isBlocked?: boolean;
}

interface TokenData {
  hasAccess?: boolean;
  plan?: string;
}

export const checkAccess = (user: UserAccessData): boolean => {
  const now = new Date();

  if (user.plan === "basic") return true;

  if (user.plan === "monthly") {
    if (user.subscriptionEndsAt) {
      return now <= new Date(user.subscriptionEndsAt);
    }
    return true;
  }

  if (user.plan === "yearly") {
    if (user.subscriptionEndsAt) {
      return now <= new Date(user.subscriptionEndsAt);
    }
    return true;
  }

  if (user.plan === "trial") {
    if (user.trialEndsAt) {
      return now <= new Date(user.trialEndsAt);
    }
    return true;
  }

  if (user.isPaid === true && user.isBlocked === false) return true;

  return false;
};

export const hasAccessFromToken = (tokenData: TokenData | null): boolean => {
  if (!tokenData) return false;

  if (tokenData.hasAccess !== undefined) return tokenData.hasAccess === true;

  const plan = tokenData.plan || "none";
  if (plan === "basic") return true;
  if (plan === "trial") return true;

  return false;
};