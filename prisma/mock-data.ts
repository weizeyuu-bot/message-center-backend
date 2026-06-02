const fullPermission = { query: true, operate: true };
const readOnlyPermission = { query: true, operate: false };
const noPermission = { query: false, operate: false };

export const mockRoles: any[] = [
	{
		id: 'ROLE_ADMIN',
		name: '系统管理员',
		description: '拥有全部治理与消息中心权限',
		permissions: {
			users: fullPermission,
			roles: fullPermission,
			permissionManagement: fullPermission,
			system: fullPermission,
			dataSourceManagement: fullPermission,
			schedulerManagement: fullPermission,
			notifyChannelManagement: fullPermission,
		},
	},
	{
		id: 'ROLE_USER_ADMIN',
		name: '用户治理管理员',
		description: '负责用户、角色、权限与系统配置管理',
		permissions: {
			users: fullPermission,
			roles: fullPermission,
			permissionManagement: fullPermission,
			system: fullPermission,
			dataSourceManagement: noPermission,
			schedulerManagement: noPermission,
			notifyChannelManagement: noPermission,
		},
	},
	{
		id: 'ROLE_MC_OPERATOR',
		name: '消息运营专员',
		description: '负责消息中心配置与任务运维',
		permissions: {
			users: noPermission,
			roles: noPermission,
			permissionManagement: noPermission,
			system: readOnlyPermission,
			dataSourceManagement: fullPermission,
			schedulerManagement: fullPermission,
			notifyChannelManagement: fullPermission,
		},
	},
	{
		id: 'ROLE_MC_VIEWER',
		name: '消息运营访客',
		description: '仅查看消息中心运行信息',
		permissions: {
			users: noPermission,
			roles: noPermission,
			permissionManagement: noPermission,
			system: readOnlyPermission,
			dataSourceManagement: readOnlyPermission,
			schedulerManagement: readOnlyPermission,
			notifyChannelManagement: readOnlyPermission,
		},
	},
	{
		id: 'ROLE_BUYER',
		name: '业务用户',
		description: '仅保留个人信息访问权限',
		permissions: {
			users: noPermission,
			roles: noPermission,
			permissionManagement: noPermission,
			system: noPermission,
			dataSourceManagement: noPermission,
			schedulerManagement: noPermission,
			notifyChannelManagement: noPermission,
		},
	},
];

export const mockUsers: any[] = [
	{
		username: 'user1',
		password: 'User@123456',
		name: '消息运营-张明',
		email: 'user1@example.com',
		phone: '13800000011',
		department: '消息运营部',
		role: 'ROLE_MC_OPERATOR',
		status: 'ACTIVE',
	},
	{
		username: 'user2',
		password: 'User@123456',
		name: '消息运营-李静',
		email: 'user2@example.com',
		phone: '13800000012',
		department: '消息运营部',
		role: 'ROLE_MC_OPERATOR',
		status: 'ACTIVE',
	},
	{
		username: 'user3',
		password: 'User@123456',
		name: '治理管理-王琳',
		email: 'user3@example.com',
		phone: '13800000013',
		department: '平台治理部',
		role: 'ROLE_USER_ADMIN',
		status: 'ACTIVE',
	},
	{
		username: 'user4',
		password: 'User@123456',
		name: '治理管理-赵强',
		email: 'user4@example.com',
		phone: '13800000014',
		department: '平台治理部',
		role: 'ROLE_USER_ADMIN',
		status: 'ACTIVE',
	},
	{
		username: 'user5',
		password: 'User@123456',
		name: '消息审计-陈晨',
		email: 'user5@example.com',
		phone: '13800000015',
		department: '消息审计组',
		role: 'ROLE_MC_VIEWER',
		status: 'ACTIVE',
	},
	{
		username: 'user6',
		password: 'User@123456',
		name: '消息审计-刘涛',
		email: 'user6@example.com',
		phone: '13800000016',
		department: '消息审计组',
		role: 'ROLE_MC_VIEWER',
		status: 'ACTIVE',
	},
	{
		username: 'user7',
		password: 'User@123456',
		name: '业务侧-周宁',
		email: 'user7@example.com',
		phone: '13800000017',
		department: '业务支持部',
		role: 'ROLE_BUYER',
		status: 'INACTIVE',
	},
];

export const mockSuppliers: any[] = [];

export const mockMaterials: any[] = [];

export const mockPriceRecords: any[] = [];

export const mockPurchaseOrders: any[] = [];

export const mockDeliveryPlans: any[] = [];

export const mockInvoices: any[] = [];

export const mockProcessCategories: any[] = [];

export const mockFormConfigs: any[] = [];

export const mockProcessModels: any[] = [];

export const mockDeployments: any[] = [];

export const mockProcessNodes: any[] = [];

export const mockProcessInstances: any[] = [];