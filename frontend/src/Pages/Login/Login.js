import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Form } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../hooks/userAuth";
import { BASE_API } from "../../server/BASE_API.js";
import HeaderSmall from "../../components/HeaderSmall/HeaderSmall.js";

export default function Login() {
  const navigate = useNavigate();
  const { login, auth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const currentYear = new Date().getFullYear();

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: Yup.object(validationSchema()),
    onSubmit: async (formValues) => {
      try {
        const response = await axios.post(`${BASE_API}/login/`, {
          correo: formValues.correo,
          password: formValues.password,
        });
        const { token } = response.data;
        login(token);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          toast.error("Usuario o contraseña incorrectos");
        } else {
          toast.error("Se produjo un error. Por favor, inténtalo de nuevo.");
        }
      }
    },
  });

  useEffect(() => {
    if (auth) {
      navigate("/");
    }
  }, [auth, navigate]);

  return (
    <div>
      <div>
        <HeaderSmall btTitulo="Ingresa" />
        <div>
          <Form onSubmit={formik.handleSubmit}>
            <Form.Input
              name="correo"
              placeholder="Correo eléctronico"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.errors.email}
            />
            <Form.Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.errors.password}
              icon={{
                name: showPassword ? "eye" : "eye slash",
                link: true,
                onClick: () => setShowPassword(!showPassword),
              }}
            />
            <button type="submit">Iniciar sesión</button>
          </Form>

          <div style={{ display: "flex" }}>
            <Link>¿Olvidaste tu contraseña?</Link>
          </div>

          <ToastContainer
            position="bottom-center"
            autoClose={1500}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover={false}
          />
        </div>
      </div>
      <footer>
        <p>Copyright © {currentYear} uzai velasco hernandez</p>
      </footer>
    </div>
  );
}

function initialValues() {
  return {
    correo: "",
    password: "",
  };
}

function validationSchema() {
  return {
    correo: Yup.string()
      .email("Correo electrónico inválido")
      .required("El correo es obligatorio"),
    password: Yup.string().required("La contraseña es obligatoria"),
  };
}
