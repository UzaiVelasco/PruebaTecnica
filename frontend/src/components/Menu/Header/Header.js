import React, { useState } from "react";
import { Menu, Button, Dropdown } from "semantic-ui-react";
import "./Header.css";
import { useAuth } from "../../../hooks/userAuth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { auth, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/Login");
  };

  const renderName = () => {
    if (auth?.me?.nombre && auth?.me?.apellido) {
      return `${auth?.me.nombre} ${auth?.me.apellido}`;
    }
    return auth?.me?.correo;
  };

  const getInitials = () => {
    if (auth?.me?.nombre && auth?.me?.apellido) {
      const firstNameInitial = auth.me.nombre.charAt(0);
      const lastNameInitial = auth.me.apellido.charAt(0);
      return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
    }
    return "";
  };

  return (
    <Menu fixed="top" className="principal">
      <Menu.Item className="menu-title">
        <h4>SISTEMA DE REGISTRO PERSONAL</h4>
      </Menu.Item>
      <Menu.Menu position="right" className="menu-right">
        <Menu.Item className="nombre">{renderName()}</Menu.Item>
        <Dropdown
          trigger={
            <Button circular icon className="ico" onClick={handleClick}>
              {getInitials()}
            </Button>
          }
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onOpen={handleClick}
        >
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleLogout}>Cerrar sesión</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Menu>
    </Menu>
  );
};

export default Header;
