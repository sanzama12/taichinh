export interface IUserPermissions {
  dashboard: boolean;
  services_bee: boolean;
  services_fuel: boolean;
  services_bonus: boolean;
  debts: boolean;
  income: boolean;
  expenses: boolean;
  bills: boolean;
  savings: boolean;
  reports: boolean;
  tickets: boolean;
}

export const DEFAULT_USER_PERMISSIONS: IUserPermissions = {
  dashboard: true,
  services_bee: true,
  services_fuel: true,
  services_bonus: true,
  debts: true,
  income: true,
  expenses: true,
  bills: true,
  savings: true,
  reports: true,
  tickets: true,
};

