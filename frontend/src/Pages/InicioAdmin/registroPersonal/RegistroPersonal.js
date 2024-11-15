import React from "react";
import "semantic-ui-css/semantic.min.css";
import { useAuth } from "../../../hooks/userAuth";
import { Navigate } from "react-router-dom";
import { FormPersonal } from "../../../components/Users/FormPersonal/FormPersonal";

function RegistroPersonal() {
  const { auth } = useAuth();
  if (auth?.me?.rol !== "admin") {
    return <Navigate to={"/"}></Navigate>;
  }
  return <LogicaPersonal />;
}

function LogicaPersonal() {
  return (
    <div>
      <h1 className="tituloin">Registrar personal </h1>
      <FormPersonal />
    </div>
  );
}

export default RegistroPersonal;
