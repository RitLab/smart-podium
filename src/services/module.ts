import { slmsHandler } from "./slms";
import { ReferensiItem, BahanAjarItem, BahanAjarDetail } from "@/types/module";

export const moduleApi = {
  getReferensi: () =>
    slmsHandler.get<{ success: boolean; data: ReferensiItem[] }>(
      "/portal/bahan-ajar/referensi",
    ),

  getList: (body: {
    page: number;
    limit: number;
    search?: string;
    category: string;
    sub_category?: string;
  }) =>
    slmsHandler.post<{
      success: boolean;
      data: { rows: BahanAjarItem[]; total: number };
    }>("/portal/bahan-ajar/list", body),

  getDetail: (id: number) =>
    slmsHandler.get<{
      success: boolean;
      data: BahanAjarDetail;
    }>(`/portal/bahan-ajar/${id}`),
};
