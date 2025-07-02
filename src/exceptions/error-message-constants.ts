export enum TokenErrMessage {
  EXPIRED = 'Token has been expired',
  INVALID = 'Invalid token',
  INVALID_PAYLOAD = 'Invalid token payload',
  MISSING = 'Token is missing',
  REFRESH_TOKEN_NOT_FOUND = 'Refresh token not found',
  REVOKED = 'Token has been revoked',
}

export enum UserErrMessage {
  NOT_FOUND = 'User not found',
  ALREADY_EXISTS = 'User already exists',
  EMAIL_ALREADY_EXISTS = 'Email already exists',
}

export enum RoleErrMessage {
  NOT_FOUND = 'Role not found',
  ALREADY_EXISTS = 'Role already exists',
}

export enum MenuErrMessage {
  NOT_FOUND = 'Menu not found',
  ALREADY_EXISTS = 'Menu name already exists',
}

export enum PermissionErrMessage {
  NOT_FOUND = 'Permission not found',
  ALREADY_EXISTS = 'Permission name already exists',
}

export enum MenuPermissionErrMessage {
  NOT_FOUND = 'Menu permission not found',
  ALREADY_EXISTS = 'Menu permission already exists',
  IS_DISABLED = 'Menu permission is disabled',
}

export enum RoleMenuPermissionErrMessage {
  NOT_FOUND = 'Role menu permission not found',
  ALREADY_EXISTS = 'Role menu permission already exists',
}

export enum OriginErrMessage {
  NOT_FOUND = 'Origin not found',
  ALREADY_EXISTS = 'Origin already exists',
}

export enum CommodityErrMessage {
  NOT_FOUND = 'Commodity not found',
  ALREADY_EXISTS = 'Commodity name already exists',
}

export enum BuyHistoryErrMessage {
  NOT_FOUND = 'Buy history not found',
  ALREADY_EXISTS = 'Buy history already exists',
}
