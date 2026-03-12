declare module "virtual:unplugin-convention-routes/vue" {
  import type { RouteRecordRaw } from "vue-router"

  const routes: RouteRecordRaw[]
  export default routes
}

declare module "~pages" {
  import type { RouteRecordRaw } from "vue-router"

  const routes: RouteRecordRaw[]
  export default routes
}
