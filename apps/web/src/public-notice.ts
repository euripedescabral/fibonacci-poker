// Public release facts only. Never put credentials or private contact data here.
export const publicNotice = {
  operator: "Eurípedes Cabral",
  contact: "https://www.linkedin.com/in/euripedescabral",
  region: import.meta.env.VITE_HOSTING_REGION?.trim() || null,
  published: import.meta.env.VITE_RELEASE_READY === "true",
};
