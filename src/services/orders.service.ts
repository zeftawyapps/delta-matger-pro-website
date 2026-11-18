import { OrderItemData } from "@/types";
import { getCampaignAttribution } from "@/utils/campaignTracker";
import { getResponseData, requestJson } from "./client";

export const ordersService = {
  createOrder: async (args: {
    organizationId: string;
    token: string;
    items: OrderItemData[];
    totalOrderPrice: number;
    senderDetails?: Record<string, any> | null;
    recipientDetails?: Record<string, any> | null;
    additionalCalculation: Record<string, number>;
    workflowSlug?: string;
    senderOrganizationId?: string;
    allowDefaultWorkflow?: boolean;
    calculationMode?: number;
    orderMode?: string;
  }) => {
    const params = new URLSearchParams();
    if (args.workflowSlug) params.set("workflowSlug", args.workflowSlug);
    if (args.senderOrganizationId) {
      params.set("senderOrganizationId", args.senderOrganizationId);
    }
    params.set(
      "allowDefaultWorkflow",
      String(args.allowDefaultWorkflow ?? true)
    );
    params.set("calculationMode", String(args.calculationMode ?? 2));
    if (args.orderMode) params.set("orderMode", args.orderMode);

    const campaignAttribution = getCampaignAttribution();
    if (campaignAttribution?.campaignId) {
      params.set("cid", campaignAttribution.campaignId);
      params.set("campaignId", campaignAttribution.campaignId);
    }
    if (campaignAttribution?.platform) {
      params.set("platform", campaignAttribution.platform);
    }
    if (campaignAttribution?.utmCampaign) {
      params.set("utm_campaign", campaignAttribution.utmCampaign);
    }
    if (campaignAttribution?.utmSource) {
      params.set("utm_source", campaignAttribution.utmSource);
    }

    const path = `/orders/${args.organizationId}?${params.toString()}`;
    const payload = await requestJson(path, {
      method: "POST",
      token: args.token,
      body: JSON.stringify({
        senderDetails:
          args.senderDetails !== undefined ? args.senderDetails : null,
        recipientDetails:
          args.recipientDetails !== undefined ? args.recipientDetails : null,
        totalOrderPrice: args.totalOrderPrice,
        items: args.items,
        additionalCalculation: args.additionalCalculation,
        channel: "website",
        campaignAttribution: campaignAttribution
          ? { ...campaignAttribution, channel: "website" }
          : undefined,
      }),
    });
    return getResponseData(payload);
  },

  getPublicOrders: async (token: string): Promise<any[]> => {
    const payload = await requestJson("/orders/public", {
      method: "GET",
      token,
    });
    return getResponseData(payload) || [];
  },
};

