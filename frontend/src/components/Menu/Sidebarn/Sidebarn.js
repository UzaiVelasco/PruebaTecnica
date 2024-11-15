import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Icon, Button, Input } from "semantic-ui-react";
import { useAuth } from "../../../hooks/userAuth";
import { useNavigate } from "react-router-dom";
import "./Siderbarn.css";

function Sidebarm({ closeOpen, setCloseOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const handleItemClick = (name) => {
    setActiveItem(name);
    setSubmenuVisible(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredMenuItems = (label) => {
    const normalizedLabel = normalizeText(label);
    const normalizedSearchTerm = normalizeText(searchTerm);

    // Verifica si el término de búsqueda está contenido en alguna palabra del label
    return normalizedLabel
      .split(" ")
      .some((word) => word.includes(normalizedSearchTerm));
  };

  return (
    <div>
      {!closeOpen && (
        <Button className="openMenu" onClick={() => setCloseOpen(true)}>
          <Icon name="arrow right" style={{ marginRight: "8px" }} />
          <span>Menú</span>
        </Button>
      )}
      {closeOpen && (
        <Menu
          as={Menu}
          animation="overlay"
          icon="labeled"
          vertical
          width="thin"
          className={`menuc ${closeOpen ? "" : "hidden"}`}
          style={{ marginTop: "20px" }}
        >
          <Button
            className="closeOp"
            onClick={() => setCloseOpen(false)}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Icon name="arrow left" style={{ marginRight: "8px" }} />
            <span>Ocultar Menú</span>
          </Button>

          <Input
            icon="search"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ margin: "10px", width: "90%" }}
          />
          {filteredMenuItems("Inicio") && (
            <Menu.Item
              as={Link}
              to={"/"}
              active={pathname === "/"}
              onClick={() => handleItemClick("/")}
            >
              <Icon name="home"></Icon>Inicio
            </Menu.Item>
          )}

          {auth?.me?.rol === "admin" && filteredMenuItems("Alta personal") && (
            <Menu.Item
              as={Link}
              to={"/alta-personal"}
              active={pathname === "/alta-personal"}
              onClick={() => handleItemClick("Personal")}
            >
              <Icon name="user"></Icon>Registro de personal
            </Menu.Item>
          )}
          {auth?.me?.rol === "admin" &&
            filteredMenuItems("Gestion personal") && (
              <Menu.Item
                as={Link}
                to={"/gestion-personal"}
                active={pathname === "/gestion-personal"}
                onClick={() => handleItemClick("Gestion-personal")}
              >
                <Icon name="user"></Icon>Gestion del personal
              </Menu.Item>
            )}
          <Menu.Item onClick={handleLogout}>
            <Icon name="power off"></Icon>Cerrar sesión
          </Menu.Item>
        </Menu>
      )}
    </div>
  );
}
export default Sidebarm;
