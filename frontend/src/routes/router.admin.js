import MainMenu from "../components/Menu/MainMenu/MainMenu";
import InicioAdmin from "../Pages/InicioAdmin/Home/InicioAdmin";
import RegistroPersonal from "../Pages/InicioAdmin/registroPersonal/RegistroPersonal";
const routesAdmin = [
  {
    path: "/",
    layout: MainMenu,
    component: InicioAdmin,
  },
  {
    path: "/registro-personal",
    layout: MainMenu,
    component: RegistroPersonal,
  },
];
export default routesAdmin;
