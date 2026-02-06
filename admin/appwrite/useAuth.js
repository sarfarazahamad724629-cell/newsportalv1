import { useEffect, useState } from "react";
import { account } from "../appwrite/auth";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account.get()
      .then(res => setUser(res))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};

export default useAuth;
