export const setSession = ({ token, access, sidemenus, adminID }) => {
  if (token) sessionStorage.setItem("token", token);
  if (access) sessionStorage.setItem("access", access);
  if (sidemenus) sessionStorage.setItem("sidemenus", sidemenus);
  if (adminID) sessionStorage.setItem("adminID",adminID);

  sessionStorage.setItem("isLoggedIn", "true");
};

export const clearSession = () => {
  sessionStorage.clear();
};
