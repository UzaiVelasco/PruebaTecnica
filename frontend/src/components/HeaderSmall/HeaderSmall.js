import React from "react";
import "./HeaderSmall.css";

function HeaderSmall(props) {
  const { btTitulo } = props;

  return (
    <div className="rectangulo">
      <h1 className="nombre-top">Sistema web para control de usuarios</h1>
      <h1 className="tituloin">{btTitulo}</h1>
    </div>
  );
}
export default HeaderSmall;
