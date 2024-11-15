import MainMenu from "../components/Menu/MainMenu/MainMenu";
import InicioAdmin from "../Pages/InicioAdmin/Home/InicioAdmin";
import RegistroPersonal from "../Pages/InicioAdmin/registroPersonal/RegistroPersonal";
import GestionPersonal from "../Pages/InicioAdmin/GestionPersonal/GestionPersonal";
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
  {
    path: "/gestion-personal",
    layout: MainMenu,
    component: GestionPersonal,
  },
];
export default routesAdmin;
