export interface MenuModuleDef {
  module: string;
  moduleName: string;
  groupKey: string;
}

export const MENU_CATALOG: MenuModuleDef[] = [
  { module: 'users', moduleName: '用户管理', groupKey: 'permissionGroupGovernanceConfig' },
  { module: 'roles', moduleName: '角色管理', groupKey: 'permissionGroupGovernanceConfig' },
  { module: 'permissionManagement', moduleName: '权限管理', groupKey: 'permissionGroupGovernanceConfig' },
  { module: 'system', moduleName: '系统管理', groupKey: 'permissionGroupGovernanceConfig' },
  { module: 'dataSourceManagement', moduleName: '数据源管理', groupKey: 'permissionGroupMessageCenter' },
  { module: 'schedulerManagement', moduleName: '定时任务', groupKey: 'permissionGroupMessageCenter' },
  { module: 'notifyChannelManagement', moduleName: '通知通道', groupKey: 'permissionGroupMessageCenter' },
];
