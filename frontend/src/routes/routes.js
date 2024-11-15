import { BasicLayout } from "../components/basic/BasicLayout";
import Error404 from "../Pages/Error404/Error404";
import routesLogin from "./router.login";
import routesAdmin from "./router.admin";
const routes = [
  ...routesAdmin,
  ...routesLogin,
  {
    path: "*",
    layout: BasicLayout,
    component: Error404,
  },
];

export default routes;
