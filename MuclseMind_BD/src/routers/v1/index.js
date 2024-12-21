const express = require("express");
const router = express.Router();
const UserRoute = require("./UserRoutes.js");
const PatientRoute = require("./PatientRoutes.js");
const AppointmentRoute = require("./AppointmentRoutes.js");
const OperatingHoursRoute = require("./OperatingHoursRoutes.js");
const TreatmentRoute = require("./TreatmentRoutes.js");
const MedicationRoute = require("./MedicationRoutes.js");
const DentalTeamRoute = require("./DentalTeamRoutes.js");
const StaffAttendanceRoute = require("./staffAttendanceRoutes.js");
const HolidayRoute = require("./holidayRoutes.js");
const DashboardStatsRoute = require("./dashboardStatsRoutes.js");
const BillingRoute = require("./billingRoutes.js");
const Prescriptions = require("./prescriptionRoutes.js");
const ClinicRoutes = require("./ClinicRoutes.js");
const PaymentRoutes = require("./paymentRoutes.js");
const InvoiceRoute = require("../../AI/Routes/Invoice.js");
const PrescriptionAnalyzerRoutes = require("../../AI/Routes/prescriptionAnalyzerRoutes.js");

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
  {
    path: "/staff-attendances",
    route: StaffAttendanceRoute,
  },
  {
    path: "/holidays",
    route: HolidayRoute,
  },
  {
    path: "/dashboard",
    route: DashboardStatsRoute,
  },
  {
    path: "/billing",
    route: BillingRoute,
  },
  {
    path: "/prescription",
    route: Prescriptions,
  },
  {
    path: "/clinic",
    route: ClinicRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/ai",
    route: InvoiceRoute,
  },
  {
    path: "/ai",
    route: PrescriptionAnalyzerRoutes,
  },
];

Routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
