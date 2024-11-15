import React, { useState, useEffect } from "react";
import { map } from "lodash";
import { Tooltip } from "react-tooltip";
import { Button, Icon } from "semantic-ui-react";
import "./TableUsers.css";
import { useNavigate } from "react-router-dom";

export function TableUsers(props) {
  const { users, deleteUsers, updateUsers, onRefetch } = props;
  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [realTimeSearch, setRealTimeSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setSearchText(searchText.toLowerCase());
  }, [searchText]);

  const handleRealTimeSearchChange = (value) => {
    setRealTimeSearch(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setSearchText(realTimeSearch.toLowerCase());
  }, [realTimeSearch]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredUsers = users.filter((user) =>
    user.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    setSearchText(searchText.toLowerCase());
    if (searchText === "") {
      setCurrentPage(1);
    }
  }, [searchText]);

  useEffect(() => {
    const lastPage = Math.ceil(filteredUsers.length / itemsPerPage);
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [filteredUsers, currentPage]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateUser = async (data) => {
    navigate("/registro-personal", {
      state: { usuario: data },
    });
  };

  return (
    <div>
      <div className="buscar">
        <div className="buscar-item">
          <Icon name="search" className="bot" />
          <input
            placeholder="Buscar por nombre"
            value={realTimeSearch}
            onChange={(e) => handleRealTimeSearchChange(e.target.value)}
            className="busper"
          />
        </div>
      </div>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>APELLIDOS</th>
              <th>CORREO ELECTRONICO</th>
              <th>CURP</th>
              <th>RFC</th>
              <th>ROL</th>
              <th>CALLE</th>
              <th>NÚMERO</th>
              <th>COLONIA</th>
              <th>CODIGO POSTAL</th>
              <th>FOTO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {map(paginatedUsers, (user, index) => (
              <tr key={index}>
                <td>{user.nombre}</td>
                <td>{user.apellido}</td>
                <td>{user.correo}</td>
                <td>{user.curp}</td>
                <td>{user.rfc}</td>
                <td>{user.rol}</td>
                <td>{user.calle}</td>
                <td>{user.numero}</td>
                <td>{user.colonia}</td>
                <td>{user.codigo_postal}</td>
                <td></td>
                <Actions
                  user={user}
                  //deleteUser={deleteUsers}
                  updateUsers={updateUser}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <div className="pagination">
          {Array.from({
            length: Math.ceil(users.length / itemsPerPage),
          }).map((_, index) => {
            const pageNumber = index + 1;
            const maxVisibleButtons = 4;
            const startPage = Math.max(
              1,
              currentPage - Math.floor(maxVisibleButtons / 2)
            );
            const endPage = Math.min(
              startPage + maxVisibleButtons - 1,
              Math.ceil(users.length / itemsPerPage)
            );
            const showStartEllipsis = startPage > 1;
            const showEndEllipsis =
              endPage < Math.ceil(users.length / itemsPerPage);
            if (Math.ceil(users.length / itemsPerPage) === 1) {
              return null;
            }
            if (pageNumber >= startPage && pageNumber <= endPage) {
              return (
                <button
                  key={pageNumber}
                  className={`pagination-button ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            } else if (showStartEllipsis && pageNumber === 1) {
              return (
                <button key="startEllipsis" className="pagination-button">
                  {"..."}
                </button>
              );
            } else if (
              showEndEllipsis &&
              pageNumber === Math.ceil(users.length / itemsPerPage)
            ) {
              return (
                <button key="endEllipsis" className="pagination-button">
                  {"..."}
                </button>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

function Actions(props) {
  const { user, updateUsers } = props;
  return (
    <td textAlign="center">
      <div className="action-buttons">
        <Button
          data-tooltip-id="my-tooltip"
          data-tooltip-content="Actualizar datos"
          icon
          className="yellow"
          onClick={() => {
            updateUsers(user);
          }}
        >
          <Icon name="pencil" style={{ color: "white" }}></Icon>
        </Button>
      </div>
      <Tooltip id="my-tooltip" />
    </td>
  );
}
