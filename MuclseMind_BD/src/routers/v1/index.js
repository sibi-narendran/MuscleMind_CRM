const express = require("express");
const router = express.Router();
const UserRoute = require("./UserRoutes.js");
const PatientRoute = require("./PatientRoutes.js");
const AppointmentRoute = require("./AppointmentRoutes.js");
const Routes = [
  {
    path: "/user",
    route: UserRoute,
  },
  {
    path: "/patients",
    route: PatientRoute,
  },
  {
    path: "/appointments",
    route: AppointmentRoute,
  },
];

Routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
