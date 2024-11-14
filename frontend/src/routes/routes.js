import { BasicLayout } from "../components/basic/BasicLayout";
import Error404 from "../Pages/Error404/Error404";
import routesLogin from "./router.login";
const routes = [
  ...routesLogin,
  {
    path: "*",
    layout: BasicLayout,
    component: Error404,
  },
];

export default routes;
