import { useCallback } from "react";
import axios from "axios";
import api from "@/api/axiosInstance";

export interface ApiResult<Api = any> {
  status: boolean;
  message: string;
  data: Api | null;
  totalRows?: number;
  statusCode?: number;
}

const toResult = <Api>(body: any): ApiResult<Api> => {
  if (body?.status) {
    return {
      status: true,
      message: body.message ?? "Success",
      data: body.data ?? null,
      totalRows: body.totalRows,
    };
  }
  return {
    status: false,
    message: body?.message ?? "Request gagal",
    data: null,
  };
};

const toErrorResult = <Api>(error: unknown): ApiResult<Api> => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        status: false,
        message: "Tidak dapat terhubung ke server.",
        data: null,
      };
    }

    const body = error.response.data as
      { error?: string; message?: string } | undefined;

    return {
      status: false,
      message: body?.error ?? body?.message ?? "Terjadi kesalahan pada server.",
      data: null,
      statusCode: error.response.status,
    };
  }

  return {
    status: false,
    message: "Terjadi kesalahan tak terduga.",
    data: null,
  };
};

export const useCallApi = () => {
  const Getdata = useCallback(
    async <Api = any>(
      url: string,
      params?: Record<string, unknown>,
    ): Promise<ApiResult<Api>> => {
      try {
        const response = await api.get(url, { params });
        return toResult<Api>(response.data);
      } catch (error) {
        return toErrorResult<Api>(error);
      }
    },
    [],
  );

  const Postdata = useCallback(
    async <Api = any>(url: string, body?: unknown): Promise<ApiResult<Api>> => {
      try {
        const response = await api.post(url, body);
        return toResult<Api>(response.data);
      } catch (error) {
        return toErrorResult<Api>(error);
      }
    },
    [],
  );

  const Putdata = useCallback(
    async <Api = any>(url: string, body?: unknown): Promise<ApiResult<Api>> => {
      try {
        const response = await api.put(url, body);
        return toResult<Api>(response.data);
      } catch (error) {
        return toErrorResult<Api>(error);
      }
    },
    [],
  );

  const Deletedata = useCallback(
    async <Api = any>(url: string, body?: unknown): Promise<ApiResult<Api>> => {
      try {
        const response = await api.delete(url, { data: body });
        return toResult<Api>(response.data);
      } catch (error) {
        return toErrorResult<Api>(error);
      }
    },
    [],
  );
  return { Getdata, Postdata, Putdata, Deletedata };
};
