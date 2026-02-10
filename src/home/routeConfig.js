import AdminDashboard from "./pages/admin/AdminDashboard";
import CoatingDashboard from "./pages/dashboard/coating/CoatingDashboard";
import EditCoating from "./pages/dashboard/coating/EditCoating";
import DesigningDashboard from "./pages/dashboard/desigining/DesigningDashboard";
import EditDesign from "./pages/dashboard/desigining/EditDesign";
import EditPlan from "./pages/dashboard/planning/EditPlan";
import Planning from "./pages/dashboard/planning/Planning";
import EditPrint from "./pages/dashboard/printing/EditPrint";
import PrintingManager from "./pages/dashboard/printing/PrintingManager";
import Stores_dashboard from "./pages/dashboard/stores/Stores_dashboard";
import Uploadsheet from "./pages/dashboard/stores/Uploadsheet";
import CreateUser from "./pages/user/CreateUser";
import SyncWithSo from "./pages/dashboard/planning/SyncWithSO";
import PrintingTeamDashboard from "./pages/dashboard/printingTeam/PrintingTeamDashboard";
import EditPrintingTeam from "./pages/dashboard/printingTeam/EditPrintingTeam";
import MachineCalendar from "./pages/dashboard/planning/MachineCalendar";

export const ROUTE_CONFIG = {
  Designing: [
    {
      path: "/designing_dashboard",
      component: DesigningDashboard,
      key: "Dashboard",
    },
    { path: "/edit_design", component: EditDesign, key: "Dashboard" },
    { path: "/sync_with_so", component: SyncWithSo, key: "Sync With SO" },
    { path: "/upload_sheet", component: Uploadsheet, key: "Sheet Taken" },
  ],

  "Printing Manager": [
    {
      path: "/printingmanager_dashboard",
      component: PrintingManager,
      key: "Dashboard",
    },
    { path: "/edit_print", component: EditPrint, key: "Dashboard" },
    { path: "/upload_sheet", component: Uploadsheet, key: "Sheet Taken" },
  ],

  Planning: [
    { path: "/planning_dashboard", component: Planning, key: "Dashboard" },
    { path: "/edit_plan", component: EditPlan, key: "Dashboard" },
    {
      path: "/machine_calendar",
      component: MachineCalendar,
      key: "Machine Calendar",
    },
    { path: "/sync_with_so", component: SyncWithSo, key: "Sync With SO" },
    { path: "/upload_sheet", component: Uploadsheet, key: "Sheet Taken" },
  ],

  Coating: [
    {
      path: "/coating_dashboard",
      component: CoatingDashboard,
      key: "Dashboard",
    },
    { path: "/edit_coating", component: EditCoating, key: "Dashboard" },
    { path: "/upload_sheet", component: Uploadsheet, key: "Sheet Taken" },
  ],

  "Printing Team": [
    {
      path: "/printingteam_dashboard",
      component: PrintingTeamDashboard,
      key: "Dashboard",
    },
    {
      path: "/edit_printingteam",
      component: EditPrintingTeam,
      key: "Dashboard",
    },
    { path: "/upload_sheet", component: Uploadsheet, key: "Sheet Taken" },
  ],

  Stores: [
    { path: "/store_dashboard", component: Stores_dashboard, key: "Dashboard" },
    { path: "/upload_sheet", component: Uploadsheet, key: "Sheet Taken" },
  ],
  Admin: [
    { path: "/admin_dashboard", component: AdminDashboard, key: "All" },
    { path: "/create_user", component: CreateUser, key: "All" },
  ],
};
