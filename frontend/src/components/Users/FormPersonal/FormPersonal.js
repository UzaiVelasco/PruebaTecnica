import React, { useState, useEffect } from "react";
import { Form, Button, Dropdown, Checkbox } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useAuth } from "../../../hooks/userAuth";
import { ToastContainer, toast } from "react-toastify";
import { BASE_API } from "../../../server/BASE_API";
import "./FormPersonal.css";
import { map } from "lodash";

export function FormPersonal(props) {
  const { personal } = props;
  const [refetch] = useState(false);
  const { auth } = useAuth();
  const [hobbies, setHobbies] = useState(null);
  const [hobbiesFormato, setHobbiesFormato] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  // eslint-disable-next-line
  const [loading, setLoading] = useState(true);
  const [personalRegistrado, setPersonalRegistrado] = useState(null);

  async function getHobbies() {
    try {
      const response = await axios.get(`${BASE_API}/hobbies`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const result = response.data;
      setHobbies(result);
      return result;
    } catch (error) {
      window.location.reload();
      window.location.href = "/Login";
    }
  }

  useEffect(() => {
    getHobbies();
    // eslint-disable-next-line
  }, [refetch]);

  useEffect(() => {
    setHobbiesFormato(formatoDelDropDown(hobbies));
  }, [hobbies]);

  function formatoDelDropDown(hobbies) {
    if (!hobbies) {
      return [];
    }

    console.log(hobbies);
    return map(hobbies, (item) => ({
      key: item.id,
      text: item.descripcion,
      value: item.id,
    }));
  }

  const addUser = async (data) => {
    try {
      const result = await createUserApi(data, auth.token);
      setPersonalRegistrado(result);
      return result.id; // Devolver el ID del alumno registrado
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (alumnoId, data) => {
    try {
      await updateUserApi(alumnoId, data, auth.token);
      return alumnoId; // Devolver el ID del alumno actualizado
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (personalRegistrado !== null) {
      toast.success("Personal registrado exitosamente");
    }
  }, [personalRegistrado]);

  async function createUserApi(data) {
    try {
      setLoading(true);
      const url = `${BASE_API}/register/`;
      const headers = {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(url, data, { headers });
      const result = response.data;
      setPersonalRegistrado(result);
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Algo salió mal");
      }
      throw error;
    }
  }

  async function updateUserApi(id, data) {
    try {
      const url = `${BASE_API}/users/${id}/`;
      const headers = {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.patch(url, data, { headers });
      toast.success("Datos actualizados exitosamente");
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Algo salió mal");
      }
      throw error;
    }
  }

  const formatName = (value) => {
    const parts = value.split(" ");
    const formattedParts = parts.map((part) => {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });
    return formattedParts.join(" ");
  };

  useEffect(() => {
    const setInitialValues = async () => {
      if (hobbies !== null) {
        formik.setValues(initialValues(personal, hobbies));
      }
    };
    setInitialValues();
    // eslint-disable-next-line
  }, [personal, hobbies]);

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object(personal ? updateSquema() : newSchema()),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        formValue.nombre = formatName(formValue.nombre);
        formValue.apellido = formatName(formValue.apellido);
        formValue.curp = formValue.curp.toUpperCase();
        if (personal) await updateUser(personal.id, formValue);
        else await addUser(formValue);
      } catch (error) {}
    },
  });

  useEffect(() => {
    if (formik.errors) {
      const firstErrorField = Object.keys(formik.errors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.focus();
      }
    }
  }, [formik.isSubmitting, formik.errors]);

  return (
    <>
      <div className="divcampo">
        <label className="campR">
          Campo requerido <span className="astedisco">*</span>
        </label>
      </div>
      <Form className="add-edit-user-form" onSubmit={formik.handleSubmit}>
        <div className="fichero">
          <div className="titulo">
            <h3>Datos Generales</h3>
          </div>
          <div className="datos">
            <div className="input-field">
              <label>
                Apellido paterno <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="apellido_paterno"
                placeholder="Apellido paterno"
                value={formik.values.apellido_paterno}
                onChange={formik.handleChange}
                error={formik.errors.apellido_paterno}
              />
            </div>
            <div className="input-field">
              <label>
                Apellido materno <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="apellido_materno"
                placeholder="Apellido materno"
                value={formik.values.apellido_materno}
                onChange={formik.handleChange}
                error={formik.errors.apellido_materno}
              />
            </div>
            <div className="input-field">
              <label>
                Nombre <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="nombre"
                placeholder="Nombre(s)"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                error={formik.errors.nombre}
              />
            </div>
            <div className="input-field">
              <label>
                Correo electrónico <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="correo"
                placeholder="Correo electrónico"
                value={formik.values.correo}
                onChange={formik.handleChange}
                error={formik.errors.correo}
              />
            </div>
            <div className="input-field">
              <label>
                Fecha de nacimiento <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="fecha_nacimiento"
                type="date"
                placeholder="Fecha de nacimiento"
                value={formik.values.fecha_nacimiento}
                error={formik.errors.fecha_nacimiento}
                onChange={formik.handleChange}
              />
            </div>
            <div className="input-field">
              <label>
                CURP <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="curp"
                placeholder="CURP"
                value={formik.values.curp}
                onChange={(e, { name, value }) => {
                  formik.handleChange(e);
                  formik.setFieldValue(name, value.toUpperCase());
                }}
                error={formik.errors.curp}
              />
            </div>
            <div className="input-field">
              <label>
                RFC <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="rfc"
                placeholder="RFC"
                value={formik.values.rfc}
                onChange={(e, { name, value }) => {
                  formik.handleChange(e);
                  formik.setFieldValue(name, value.toUpperCase());
                }}
                error={formik.errors.rfc}
              />
            </div>
            <div className="input-field">
              <label>
                Hobbies <span className="astedisco">*</span>
              </label>
              <Dropdown
                placeholder="Año del alumno"
                fluid
                selection
                search
                options={hobbiesFormato}
                value={formik.values.hobbies}
                error={formik.errors.hobbies}
                onChange={(_, datos) => {
                  formik.setFieldValue("hobbies", datos.value);
                }}
              />
            </div>
            <div className="input-field">
              <label>
                Contraseña <span className="astedisco">*</span>
              </label>
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
            </div>
          </div>
        </div>
        {(personal === undefined && (
          <Button type="submit" content="Registrar personal" />
        )) ||
          (personal && (
            <Button type="submit" content="Actualizar datos personal" />
          ))}
      </Form>
      <ToastContainer />
    </>
  );
}

function initialValues(datoPersonal) {
  return {
    apellido: datoPersonal?.apellido || "",
    nombre: datoPersonal?.nombre || "",
    curp: datoPersonal?.curp || "",
    correo: datoPersonal?.correo || "",
  };
}

function newSchema() {
  return {
    apellido_paterno: Yup.string().matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']+$/,
      "Solo se permiten letras en los apellidos"
    ),
    apellido_materno: Yup.string().matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']+$/,
      "Solo se permiten letras en los apellidos"
    ),
    nombre: Yup.string().matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']+$/,
      "Solo se permiten letras en el nombre"
    ),
    curp: Yup.string()
      .required(true)
      .matches(
        /^[A-Z]{4}\d{6}[HM]{1}[A-Z]{5}[A-Z\d]{1}\d{1}$/,
        "El formato de la CURP no es válido"
      )
      .max(18, "La CURP no debe tener más de 18 caracteres"),
    password: Yup.string().required(true),
    correo: Yup.string()
      .email("Correo electrónico inválido")
      .required("El correo es obligatorio"),
  };
}
function updateSquema() {
  return {
    apellido_paterno: Yup.string().matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']+$/,
      "Solo se permiten letras en los apellidos"
    ),
    apellido_materno: Yup.string().matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']+$/,
      "Solo se permiten letras en los apellidos"
    ),
    nombre: Yup.string().matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']+$/,
      "Solo se permiten letras en el nombre"
    ),
    curp: Yup.string()
      .required(true)
      .matches(
        /^[A-Z]{4}\d{6}[HM]{1}[A-Z]{5}[A-Z\d]{1}\d{1}$/,
        "El formato de la CURP no es válido"
      )
      .max(18, "La CURP no debe tener más de 18 caracteres"),
    password: Yup.string().required(true),
    correo: Yup.string().required(true),
  };
}
