interface IOrganization {
  logUrl?: string;
  name?: string;
  phone?: string;
  domain?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  website?: string;
  description?: string;
  foundedYear?: string;
  size?: string;
  industry?: string;
  technology?: string[];
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}
