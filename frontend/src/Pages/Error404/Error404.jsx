import React from "react";
import "semantic-ui-css/semantic.min.css";
import { useNavigate } from "react-router-dom";
import estilo from "./Error404.module.css";

const Error404 = () => {
  const navigate = useNavigate();
  const handleRegresarClick = () => {
    navigate("/");
  };
  const currentYear = new Date().getFullYear();

  return (
    <div className={estilo.contenedor}>
      <div className={estilo.cuadro}>
        <h1>Página no encontrada 404</h1>
        <button onClick={handleRegresarClick} className={estilo.btonAc}>
          Regresar
        </button>
      </div>
      <footer className={estilo.footer}>
        <p>Copyright © {currentYear} Uzai Velasco Hernandez</p>
      </footer>
    </div>
  );
};

export default Error404;
