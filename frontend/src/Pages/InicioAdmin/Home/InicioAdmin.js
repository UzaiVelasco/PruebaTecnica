import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/userAuth";
import "semantic-ui-css/semantic.min.css";
import axios from "axios";
import { BASE_API } from "../../../server/BASE_API";

function InicioAdmin() {
  const { auth } = useAuth();
  const [refetch] = useState(false);

  async function getUser() {
    try {
      const response = await axios.get(`${BASE_API}/users/${auth.me.id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const result = response.data;
      return result;
    } catch (error) {
      window.location.reload();
      window.location.href = "/login";
    }
  }
  useEffect(() => {
    getUser();
    // eslint-disable-next-line
  }, [refetch]);

  if (!auth) {
    return <Navigate to={"/login"}></Navigate>;
  }
  return <HomeAdmin />;
}

function HomeAdmin() {
  const { auth } = useAuth();
  return (
    <div>
      <div>
        <h1>Inicio </h1>
      </div>
      <div>
        <div className="card">
          <h2>¡Bienvenido(a)!</h2>
          <h3>{`${auth.me.nombre} ${auth.me.apellido}`}</h3>
          <div>
            Tu usuario para ingresar al sistema es:
            <strong>{`  ${auth.me.correo}`}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InicioAdmin;
