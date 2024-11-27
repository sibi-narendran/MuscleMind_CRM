const express = require("express");
const router = express.Router();
const UserRoute = require("./UserRoutes.js");
const PatientRoute = require("./PatientRoutes.js");
const Routes = [
  {
    path: "/user",
    route: UserRoute,
  },
  {
    path: "/patients",
    route: PatientRoute,
  },
];

Routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
