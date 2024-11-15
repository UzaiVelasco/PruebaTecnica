import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { TableUsers } from "../../../components/Users/TableUsers/TableUsers";
import { useAuth } from "../../../hooks/userAuth";
import { Navigate } from "react-router-dom";
import { BASE_API } from "../../../server/BASE_API";
import Swal from "sweetalert2";

function GestionPersonal() {
  const { auth } = useAuth();
  if (auth?.me?.rol !== "admin") {
    return <Navigate to={"/"}></Navigate>;
  }
  return <LogicaGestionPersonal />;
}

function LogicaGestionPersonal() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refetch, setRefetch] = useState(false);
  const [users, setUsers] = useState(null);

  async function getUsersApi() {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_API}/users`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const result = response.data;
      setLoading(false);
      setUsers(result);
      return result;
    } catch (error) {
      setLoading(false);
      window.location.reload();
      window.location.href = "/login";
    }
  }

  useEffect(() => {
    getUsersApi();
    // eslint-disable-next-line
  }, [refetch]);

  const onRefetch = () => {
    setRefetch((prev) => !prev);
  };

  const ondelete = async (datosUsuario) => {
    const confirmMessage = `¿Seguro que desea eliminar definitivamente al usuario con la siguiente curp: ${datosUsuario.curp}?
    (Esta acción no se puede deshacer)`;

    const result = await Swal.fire({
      //title: '¿Estás seguro?',
      text: confirmMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      confirmButtonColor: "#2f6d02",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#920804",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${BASE_API}/users`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const result = response.data;
        onRefetch();
        return result;
      } catch (error) {}
    }
  };

  return (
    <>
      <div>
        <div>
          <h1 className="tituloin">Gestión personal</h1>
          <br></br>
        </div>
        <div className="tab-content">
          {loading ? (
            <Loader active inline="centered">
              Cargando....
            </Loader>
          ) : (
            <TableUsers
              users={users}
              deleteManager={ondelete}
              onRefetch={onRefetch}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default GestionPersonal;
