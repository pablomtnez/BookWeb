import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth"); // Redirige al login si no hay token
    }
  };

  return { checkAuth };
};

export default useAuth;
