import React, { useEffect } from "react";
import useAuth from "../hooks/useAuth";

const ProtectedPage = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">
        Esta es una página protegida
      </h1>
    </div>
  );
};

export default ProtectedPage;
