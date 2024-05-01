interface IContact {
  id?: number;
  photoUrl?: string;
  salutation?: string;
  firstName?: string;
  fullName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: Date;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  website?: string;
  jobTitle?: string;
  organizationName?: string;
  organization?: {
    logoUrl?: string;
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
    size?: string;
    industry?: string;
    foundedYear?: string;
    socialMedia?: {
      linkedin?: string;
      facebook?: string;
      twitter?: string;
      instagram?: string;
      [key: string]: string;
    };
  };
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    [key: string]: string;
  };
  notes?: string;
  tags?: string[];
}
