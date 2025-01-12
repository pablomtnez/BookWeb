import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

const useAuth = () => {
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth"); // Redirige al login si no hay token
    }
  }, [navigate]); // `navigate` es una dependencia

  return { checkAuth };
};

export default useAuth;
