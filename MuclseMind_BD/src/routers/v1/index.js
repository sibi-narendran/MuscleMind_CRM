const express = require("express");
const router = express.Router();
const UserRoute = require("./UserRoutes.js");
const PatientRoute = require("./PatientRoutes.js");
const AppointmentRoute = require("./AppointmentRoutes.js");
const ClinicRoute = require("./ClinicRoutes.js");
const OperatingHoursRoute = require("./OperatingHoursRoutes.js");
const TreatmentRoute = require("./TreatmentRoutes.js");
const MedicationRoute = require("./MedicationRoutes.js");
const DentalTeamRoute = require("./DentalTeamRoutes.js");

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
  {
    path: "/clinics",
    route: ClinicRoute,
  },
  {
    path: "/operating-hours",
    route: OperatingHoursRoute,
  },
  {
    path: "/treatments",
    route: TreatmentRoute,
  },
  {
    path: "/medications",
    route: MedicationRoute,
  },
  {
    path: "/dental-team",
    route: DentalTeamRoute,
  },

];

Routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
