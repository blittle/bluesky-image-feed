import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("users/:handle", "routes/users.$handle.tsx"),
] satisfies RouteConfig;
