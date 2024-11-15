import Login from "../Pages/Login/Login";
import { BasicLayout } from "../components/basic/BasicLayout";
const routesLogin = [
  {
    path: "/login",
    layout: BasicLayout,
    component: Login,
  },
];

export default routesLogin;
