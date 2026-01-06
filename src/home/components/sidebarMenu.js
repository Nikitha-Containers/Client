import DashboardIcon from "@mui/icons-material/Addchart";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export const SIDEBAR_MENU = {
  Stores: [
    {
      label: "Dashboard",
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

  Planning: [
    {
      label: "Dashboard",
      path: "/planning_dashboard",
      icon: DashboardIcon,
      key: "Dashboard",
    },
    {
      label: "Sync With SO",
      path: "/planning",
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

  Designing: [
    {
      label: "Designing Dashboard",
      path: "/designing_dashboard",
      icon: DashboardIcon,
      key: "Dashboard",
    },
    {
      label: "Sync With SO",
      path: "/planning",
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
    },
    {
      label: "Sheet Store",
      path: "/upload_sheet",
      icon: DashboardIcon,
      key: "Sheet Taken",
    },
  ],

  Coating: [
    {
      label: "Coating Dashboard",
      path: "/coating_dashboard",
      icon: FormatPaintIcon,
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
  ],
};
