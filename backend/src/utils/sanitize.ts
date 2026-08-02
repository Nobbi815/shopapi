export const sanitizeUser = (user: Record<string, unknown>) => {
  const { password, ...rest } = user;
  return rest;
};
