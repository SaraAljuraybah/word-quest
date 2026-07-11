import { useCallback, useEffect, useState } from "react";
import { getProfile } from "../services/profileService";

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const result = await getProfile();

    setProfile(result.profile);
    setError(result.error?.message || "");
    setIsLoading(false);

    return result.profile;
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
    profile,
    setProfile,
    isLoading,
    error,
    refreshProfile,
  };
}
