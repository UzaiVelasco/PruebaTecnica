import React, { useState, useEffect } from "react";
import { Form, Button, Dropdown } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/userAuth";
import { ToastContainer, toast } from "react-toastify";
import { BASE_API } from "../../../server/BASE_API";
import { Navigate } from "react-router-dom";
import { map } from "lodash";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./FormPersonal.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

export function FormPersonal() {
  const { auth } = useAuth();
  const location = useLocation();
  const personal = location.state?.usuario;
  if (auth?.me?.rol !== "admin") {
    return <Navigate to={"/"}></Navigate>;
  }
  return <LogicaFormPersonal personal={personal} />;
}

function LogicaFormPersonal(props) {
  const { personal } = props;
  const [refetch] = useState(false);
  const { auth } = useAuth();
  const [hobbies, setHobbies] = useState(null);
  const [hobbiesFormato, setHobbiesFormato] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [personalRegistrado, setPersonalRegistrado] = useState(null);
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const [address, setAddress] = useState({
    colonia: "",
    codigo_postal: "",
    lat: 17.0676,
    lon: -96.7219,
  });

  const [isModified, setIsModified] = useState({
    calle: false,
    numero: false,
    colonia: false,
    codigo_postal: false,
  });

  const rolOptions = [
    { key: "admin", text: "Admin", value: "admin" },
    { key: "auxiliar", text: "Auxiliar", value: "auxiliar" },
  ];

  const customIcon = new L.divIcon({
    className: "leaflet-div-icon",
    html: `<i class="big map pin icon" style="color: #008e86;"></i>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setAddress((prevState) => ({
      ...prevState,
      lat,
      lon: lng,
    }));

    axios
      .get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      .then((response) => {
        const { address } = response.data;
        const newAddress = {
          lat,
          lon: lng,
          calle: address.road || "",
          numero: address.house_number || "",
          colonia: address.suburb || address.neighbourhood || "",
          codigo_postal: address.postcode || "",
        };
        setAddress(newAddress);
      })
      .catch((err) => console.log(err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIsModified((prev) => ({
      ...prev,
      [name]: true,
    }));
    formik.handleChange(e);

    if (name === "calle" || name === "codigo_postal" || name === "colonia") {
      axios
        .get(
          `https://nominatim.openstreetmap.org/search?street=${formik.values.calle}&postalcode=${formik.values.codigo_postal}&city=${formik.values.colonia}&format=json`
        )
        .then((response) => {
          if (response.data && response.data[0]) {
            const { lat, lon } = response.data[0];
            setAddress((prevState) => ({
              ...prevState,
              lat,
              lon,
              colonia: formik.values.colonia,
            }));
          }
        })
        .catch((err) => console.log(err));
    }
  };

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
      window.location.href = "/login";
    }
  }
  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });

    return null;
  };

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
      return result.id;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (alumnoId, data) => {
    try {
      await updateUserApi(alumnoId, data, auth.token);
      return alumnoId;
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
      const url = `${BASE_API}/register/`;
      const headers = {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.post(url, data, { headers });
      const result = response.data;
      setPersonalRegistrado(result);
      window.location.reload();
      return result;
    } catch (error) {
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
    initialValues: {
      ...address,
      rol: "",
      hobbies: [],
    },
    validationSchema: Yup.object(personal ? updateSquema() : newSchema()),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        formValue.nombre = formatName(formValue.nombre);
        formValue.apellido = formatName(formValue.apellido);
        formValue.curp = formValue.curp.toUpperCase();

        if (croppedImage) {
          const formData = new FormData();
          formData.append("file", croppedImage);
          formData.append("upload_preset", "registro");

          const cloudinaryResponse = await axios.post(
            "https://api.cloudinary.com/v1_1/dxxl0fvtw/image/upload",
            formData
          );
          formValue.foto = cloudinaryResponse.data.secure_url;
        }
        if (personal) await updateUser(personal.id, formValue);
        else await addUser(formValue);
      } catch (error) {}
    },
  });

  // Actualiza los campos del formulario cuando cambia la dirección en el mapa
  useEffect(() => {
    // Solo actualiza si `address` tiene datos válidos
    if (address) {
      if (!isModified.calle && formik.values.calle !== address.calle) {
        formik.setFieldValue("calle", address.calle || "");
      }
      if (!isModified.numero && formik.values.numero !== address.numero) {
        formik.setFieldValue("numero", address.numero || "");
      }
      if (!isModified.colonia && formik.values.colonia !== address.colonia) {
        formik.setFieldValue("colonia", address.colonia || "");
      }
      if (
        !isModified.cp &&
        formik.values.codigo_postal !== address.codigo_postal
      ) {
        formik.setFieldValue("codigo_postal", address.codigo_postal || "");
      }
    }
    // Solo depende de `address` y de los campos `isModified` para evitar renderizados infinitos
  }, [address, isModified]);

  useEffect(() => {
    if (formik.errors) {
      const firstErrorField = Object.keys(formik.errors)[0];
      const errorElement = document.getElementsByName(firstErrorField)[0];
      if (errorElement) {
        errorElement.focus();
      }
    }
  }, [formik.isSubmitting, formik.errors]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      setCroppedImage(cropperRef.current.getCroppedCanvas().toDataURL());
    }
  };

  let cropperRef = React.createRef();

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
                Nombre(s) <span className="astedisco">*</span>
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
                Apellidos <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="apellido"
                placeholder="Apellidos"
                value={formik.values.apellido}
                onChange={formik.handleChange}
                error={formik.errors.apellido}
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
                Rol <span className="astedisco">*</span>
              </label>
              <Dropdown
                name="rol"
                placeholder="Rol"
                options={rolOptions}
                value={formik.values.rol}
                onChange={(e, { name, value }) =>
                  formik.setFieldValue(name, value)
                }
                selection
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
                name="hobbies"
                placeholder="Selecciona tus hobbies"
                fluid
                multiple
                selection
                options={hobbiesFormato}
                value={formik.values.hobbies || []} // Usa un arreglo vacío si está undefined
                onChange={(e, { name, value }) =>
                  formik.setFieldValue(name, value)
                }
              />
            </div>

            <div className="input-field">
              <label>
                Calle <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="calle"
                placeholder="Calle"
                value={formik.values.calle}
                onChange={handleInputChange}
                error={formik.errors.calle}
              />
            </div>
            <div className="input-field">
              <label>
                Número <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="numero"
                placeholder="Número"
                value={formik.values.numero}
                onChange={handleInputChange}
                error={formik.errors.numero}
              />
            </div>
            <div className="input-field">
              <label>
                Colonia <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="colonia"
                placeholder="Colonia"
                value={formik.values.colonia}
                onChange={handleInputChange}
                error={formik.errors.colonia}
              />
            </div>
            <div className="input-field">
              <label>
                Código Postal <span className="astedisco">*</span>
              </label>
              <Form.Input
                name="codigo_postal"
                placeholder="Código Postal"
                value={formik.values.codigo_postal}
                onChange={handleInputChange}
                error={formik.errors.codigo_postal}
              />
            </div>
            <div className="input-field"></div>
            <div className="input-field mapa">
              <label>Ubicación en el Mapa</label>
              <MapContainer
                center={[address.lat, address.lon]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[address.lat, address.lon]} icon={customIcon}>
                  <Popup>
                    Dirección: {address.calle}, {address.numero},{" "}
                    {address.colonia}, {address.codigo_postal}
                  </Popup>
                </Marker>
                <MapClickHandler />
              </MapContainer>
            </div>

            <div className="input-field">
              <label>
                Foto <span className="astedisco">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                name="foto"
              />
              {image && (
                <div>
                  <Cropper
                    ref={cropperRef}
                    src={image}
                    style={{ height: 400, width: "100%" }}
                    initialAspectRatio={1}
                    guides={false}
                    viewMode={1}
                    scalable={true}
                  />
                  <Button type="button" onClick={handleCrop}>
                    Recortar Imagen
                  </Button>
                </div>
              )}
            </div>

            {!personal && (
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
            )}
          </div>
        </div>
        {(personal === undefined && (
          <Button
            type="submit"
            className="botonEnviar"
            content="Registrar personal"
          />
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
    rol: datoPersonal?.rol || "",
    rfc: datoPersonal?.rfc || "",
    calle: datoPersonal?.calle || "",
    numero: datoPersonal?.numero || "",
    colonia: datoPersonal?.colonia || "",
    codigo_postal: datoPersonal?.codigo_postal || "",
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
    calle: Yup.string().required("La calle es requerida"),
    numero: Yup.string().required("El número es requerido"),
    colonia: Yup.string().required("La colonia es requerida"),
    codigo_postal: Yup.string().required("El código postal es requerido"),
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
