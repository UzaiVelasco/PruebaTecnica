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
import styles from "./Login.module.css";

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
          toast.error(error.response.data.message || "Algo salió mal");
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
    <div className={styles.loginContainer}>
      <header className={styles.header}>Bienvenido</header>
      <div>
        <Form onSubmit={formik.handleSubmit}>
          <Form.Input
            name="correo"
            placeholder="Correo electrónico"
            value={formik.values.correo}
            onChange={formik.handleChange}
            error={formik.errors.correo}
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

        <div className="forgot-password">
          <Link to="#">¿Olvidaste tu contraseña?</Link>
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
