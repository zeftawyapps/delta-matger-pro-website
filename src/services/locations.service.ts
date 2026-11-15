import { getResponseData, requestJson } from "./client";

export const locationsService = {
  getCountries: async (): Promise<any[]> => {
    const payload = await requestJson("/locations/countries", { method: "GET" });
    return getResponseData(payload) || [];
  },

  getGovernorates: async (countryId: string): Promise<any[]> => {
    const payload = await requestJson(
      `/locations/countries/${countryId}/governorates`,
      { method: "GET" }
    );
    return getResponseData(payload) || [];
  },

  getCities: async (governorateId: string): Promise<any[]> => {
    const payload = await requestJson(
      `/locations/governorates/${governorateId}/cities`,
      { method: "GET" }
    );
    return getResponseData(payload) || [];
  },
};

