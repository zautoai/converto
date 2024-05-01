export interface IEnrichment {
  api_key: string;
  getPeople(matchRequest: { [key: string]: string }): Promise<IContact>;
  getOrganization(matchRequest: {
    [key: string]: string;
  }): Promise<IOrganization>;
  handlePersonResponse(response: any): IContact;
  handleOrganizationResponse(response: any): IOrganization;
}
