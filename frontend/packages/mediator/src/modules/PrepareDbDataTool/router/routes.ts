import type { AppRouteConfig } from "@frontend/mediator/router/types";

export const prepareDbRoutes: AppRouteConfig[] = [
  {
    path: "/prepare-db",
    name: "prepare-db-root",
    title: "Prepare DB Data",
    component: "layout",
    meta: { isMenu: true },
    children: [
      { path: "/prepare-db", redirect: "/prepare-db/connection", meta: { isMenu: false, title: "Prepare DB Data" } },
      {
        path: "/prepare-db/connection",
        name: "prepare-db-connection",
        title: "数据库连接",
        component: "modules/PrepareDbDataTool/view/DatabaseConnection",
        meta: { isMenu: true },
      },
      {
        path: "/prepare-db/custom-lists",
        name: "prepare-db-custom-lists",
        title: "自定义列表",
        component: "modules/PrepareDbDataTool/view/CustomValueLists",
        meta: { isMenu: true },
      },
      {
        path: "/prepare-db/schema",
        name: "prepare-db-schema",
        title: "Schema管理",
        component: "modules/PrepareDbDataTool/view/SchemaManager",
        meta: { isMenu: true },
      },
      {
        path: "/prepare-db/insert",
        name: "prepare-db-insert",
        title: "数据插入",
        component: "modules/PrepareDbDataTool/view/DataInsert",
        meta: { isMenu: true },
      },
    ],
  },
];
