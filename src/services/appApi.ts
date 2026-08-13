import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api', // Match the existing api.ts config
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Workspace', 'Summary', 'Dashboard', 'DocumentType'],

  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    getDashboard: builder.query<any, number>({
      query: (year) => `/workspace/dashboard?year=${year}`,
      providesTags: ['Dashboard'],
    }),

    getWorkspace: builder.query<any, { year: number; month: string }>({
      query: ({ year, month }) => `/workspace?year=${year}&month=${month}`,
      providesTags: (result) => result?.data ? [{ type: 'Workspace', id: result.data.id }] : ['Workspace'],
    }),

    createWorkspace: builder.mutation<any, { year: number; month: string }>({
      query: (data) => ({
        url: '/workspace',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Workspace', 'Dashboard'],
    }),

    getSummary: builder.query<any, { workspaceId?: number; search?: string }>({
      query: ({ workspaceId, search }) => {
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        } else if (workspaceId) {
          params.append('workspaceId', workspaceId.toString());
        }
        return `/summary?${params.toString()}`;
      },
      providesTags: (result, _error, arg) => [{ type: 'Summary', id: arg.search ? 'search' : arg.workspaceId }],
    }),

    exportSummary: builder.query<Blob, number>({
      query: (workspaceId) => ({
        url: `/summary/export?workspaceId=${workspaceId}`,
        responseHandler: async (response) => response.blob(),
      }),
    }),

    uploadDocument: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, arg) => {
        const workspaceId = arg.get('workspaceId') as string;
        return [{ type: 'Summary', id: Number(workspaceId) }, 'Dashboard'];
      }
    }),

    getDocumentTypes: builder.query<any, void>({
      query: () => '/document-types',
      providesTags: ['DocumentType'],
    }),

    createDocumentType: builder.mutation<any, { name: string; documentCode: string; description?: string; status?: string }>({
      query: (data) => ({
        url: '/document-types',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DocumentType'],
    }),

    updateDocumentType: builder.mutation<any, { id: number; data: { name: string; documentCode: string; description?: string; status?: string } }>({
      query: ({ id, data }) => ({
        url: `/document-types/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['DocumentType'],
    }),

    deleteDocumentType: builder.mutation<any, number>({
      query: (id) => ({
        url: `/document-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DocumentType'],
    }),

    // fetch product Values QTY, NAME, PRICE

    getProductValues: builder.query<any, string>({
      query: (rowId) => `/summary/row/${rowId}`,
      providesTags: (result, _error, id) => [{ type: 'Summary', id }],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDashboardQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useGetSummaryQuery,
  useLazyExportSummaryQuery,
  useUploadDocumentMutation,
  useGetDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,

  useGetProductValuesQuery
} = appApi;
