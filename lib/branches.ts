export const BRANCHES = [
  { slug: "accra", name: "Grace Temple", city: "Accra", country: "Ghana" },
  { slug: "koforidua", name: "Koforidua", city: "Koforidua", country: "Ghana" },
  { slug: "asamankese", name: "Asamankese", city: "Asamankese", country: "Ghana" },
  { slug: "utah", name: "Utah", city: "Utah", country: "USA" },
] as const;
export const findBranch = (slug: string) => BRANCHES.find((b) => b.slug === slug);
