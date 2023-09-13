const mapping: Record<string, string> = {
  bots: 'bot',
  links: 'link',
  organizations: 'organization',
  searches: 'search',
  users: 'user',
};

export function convertRouteToEntityUtil(route: string) {
  return mapping[route] || route;
}
