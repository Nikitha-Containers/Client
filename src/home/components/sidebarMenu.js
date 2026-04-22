import DashboardIcon from "@mui/icons-material/Addchart";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export const SIDEBAR_MENU = {
  Designing: [
    {
      label: "Designing Dashboard",
      path: "/designing_dashboard",
      icon: DashboardIcon,
      key: "Dashboard",
      matchRoutes: ["/designing_dashboard", "/edit_design"],
    },
    {
      label: "Sync With SO",
      path: "/sync_with_so",
      icon: AssignmentAddIcon,
      key: "Sync With SO",
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  "Printing Manager": [
    {
      label: "Printing Manager",
      path: "/printingmanager_dashboard",
      icon: DesignServicesIcon,
      key: "Dashboard",
      matchRoutes: ["/printingmanager_dashboard", "/edit_print"],
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  "Flim Plate": [
    {
      label: "Flim Plate",
      path: "/flimplate_dashboard",
      icon: DesignServicesIcon,
      key: "Dashboard",
      matchRoutes: ["/flimplate_dashboard", "/edit_flimplate"],
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  Planning: [
    {
      label: "Planning Dashboard",
      path: "/planning_dashboard",
      icon: DashboardIcon,
      key: "Dashboard",
      matchRoutes: ["/planning_dashboard", "/edit_plan"],
    },
    {
      label: "Sync With SO",
      path: "/sync_with_so",
      icon: AssignmentAddIcon,
      key: "Sync With SO",
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
    {
      label: "Machine Calendar",
      path: "/machine_calendar",
      icon: DashboardIcon,
      key: "Machine Calendar",
    },
  ],

  Coating: [
    {
      label: "Coating Dashboard",
      path: "/coating_dashboard",
      icon: FormatPaintIcon,
      key: "Dashboard",
      matchRoutes: ["/coating_dashboard", "/edit_coating"],
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  Printing: [
    {
      label: "Printing Dashboard",
      path: "/printingteam_dashboard",
      icon: FormatPaintIcon,
      key: "Dashboard",
      matchRoutes: ["/printingteam_dashboard", "/edit_printingteam"],
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  Varnish: [
    {
      label: "Varnish Dashboard",
      path: "/varnish_dashboard",
      icon: FormatPaintIcon,
      key: "Dashboard",
      matchRoutes: ["/varnish_dashboard", "/edit_varnish"],
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  Fabrication: [
    {
      label: "Fabrication",
      path: "/fabrication_dashboard",
      icon: DesignServicesIcon,
      key: "Dashboard",
      matchRoutes: ["/fabrication_dashboard", "/edit_fabrication"],
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  Stores: [
    {
      label: "Store Dashboard",
      path: "/store_dashboard",
      icon: DashboardIcon,
      key: "Dashboard",
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  Admin: [
    {
      label: "Admin Dashboard",
      path: "/admin_dashboard",
      icon: AdminPanelSettingsIcon,
      key: "All",
    },
    {
      label: "Create User",
      path: "/create_user",
      icon: PersonAddIcon,
      key: "All",
    },
    {
      label: "Machine Config",
      path: "/machine_config",
      icon: PersonAddIcon,
      key: "All",
    },
    {
      label: "Add Employee",
      path: "/employee_config",
      icon: PersonAddIcon,
      key: "All",
    },
  ],
};
