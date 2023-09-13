interface AppConfigInterface {
  ownerRoles: string[];
  customerRoles: string[];
  tenantRoles: string[];
  tenantName: string;
  applicationName: string;
  addOns: string[];
  ownerAbilities: string[];
  customerAbilities: string[];
  getQuoteUrl: string;
}
export const appConfig: AppConfigInterface = {
  ownerRoles: ['Owner'],
  customerRoles: [],
  tenantRoles: ['Owner', 'Administrator'],
  tenantName: 'Organization',
  applicationName: 'SearchAI',
  addOns: ['file upload', 'chat', 'notifications', 'file'],
  customerAbilities: [],
  ownerAbilities: [
    'Register Organization',
    'Manage Organization account',
    'Manage bots for Organization',
    'Manage Administrators in Organization',
  ],
  getQuoteUrl: 'https://app.roq.ai/proposal/050d87a8-6bd4-4778-bada-ab5d30fef27c',
};
