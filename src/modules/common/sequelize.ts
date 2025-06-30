import { Role } from "@/modules/roles/role-model";
import { User } from "@/modules/users/user-model";
import { RefreshToken } from "@/modules/refresh-tokens/refresh-token-model";
import { DashboardTotal } from "@/modules/dashboard-totals/dashboard-total-model";
import { Announcement } from "@/modules/announcements/announcement-models";
import { UserLogs } from "@/modules/user-logs/user-logs-model";
import { Menu } from "@/modules/access-managements/menus/menu-model";
import { Permission } from "@/modules/access-managements/permissions/permission-model";
import { MenuPermission } from "@/modules/access-managements/menu-permissions/menu-permission-model";
import { RoleMenuPermission } from "../access-managements/role-menu-permissions/role-menu-permission-model";
import { Origin } from "../origins/origin-model";

export async function sequelizeMigrate(): Promise<void> {
  try {
    console.log("Running database migrations...");

    // Sync independent tables concurrently
    await Promise.all([
      DashboardTotal.sync({ alter: false }),
      Announcement.sync({ alter: false }),
      UserLogs.sync({ alter: false }),
      Origin.sync({ alter: false }),
    ]);

    // Sync dependent tables sequentially
    await Role.sync({ alter: true });
    await User.sync({ alter: true });
    await RefreshToken.sync({ alter: true });
    await Menu.sync({ alter: false });
    await Permission.sync({ alter: false });
    await MenuPermission.sync({ alter: false });
    await RoleMenuPermission.sync({ alter: false });

    console.log("Database migrations completed.");
  } catch (error) {
    console.error("Failed to run migrations:", error);
    process.exit(1);
  }
}

// Models associations
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

User.hasMany(RefreshToken, { foreignKey: "userId" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

Menu.hasMany(MenuPermission, { foreignKey: "menuId" });
MenuPermission.belongsTo(Menu, { foreignKey: "menuId" });
Permission.hasMany(MenuPermission, { foreignKey: "permissionId" });
MenuPermission.belongsTo(Permission, { foreignKey: "permissionId" });

Role.hasMany(RoleMenuPermission, { foreignKey: "roleId" });
RoleMenuPermission.belongsTo(Role, { foreignKey: "roleId" });
Menu.hasMany(RoleMenuPermission, { foreignKey: "menuId" });
RoleMenuPermission.belongsTo(Menu, { foreignKey: "menuId" });
Permission.hasMany(RoleMenuPermission, { foreignKey: "permissionId" });
RoleMenuPermission.belongsTo(Permission, { foreignKey: "permissionId" });

export {
  Role,
  User,
  RefreshToken,
  DashboardTotal,
  Announcement,
  UserLogs,
  Menu,
  Permission,
  MenuPermission,
  RoleMenuPermission,
  Origin,
};
