import MainMenu from "../components/Menu/MainMenu/MainMenu";
import InicioAdmin from "../Pages/InicioAdmin/Home/InicioAdmin";
const routesAdmin = [
  {
    path: "/",
    layout: MainMenu,
    component: InicioAdmin,
  },
];
export default routesAdmin;
