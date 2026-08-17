import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';
import { UserResponseSchema } from '../schemas/user.schema';
import { DocumentTypeResponseSchema } from '../schemas/documentType.schema';

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,  // Match the existing api.ts config
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ['Workspace', 'Summary', 'Dashboard', 'DocumentType', 'User'],

  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    verifyOtp: builder.mutation<any, { email: string; otp: string }>({
      query: (data) => ({
        url: '/auth/verify/otp',
        method: 'POST',
        body: data,
      }),
    }),

    resendOtp: builder.mutation<any, { email: string }>({
      query: (data) => ({
        url: '/auth/resend/otp',
        method: 'POST',
        body: data,
      }),
    }),

    activateAccount: builder.mutation<any, { token: string; password: string }>({
      query: (data) => ({
        url: '/auth/activate-account',
        method: 'POST',
        body: data,
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
      providesTags: (_result, _error, arg) => [{ type: 'Summary', id: arg.search ? 'search' : arg.workspaceId }],
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
      transformResponse: (response: { data: unknown }) => {
        const parsed = DocumentTypeResponseSchema.array().parse(response.data);
        return { ...response, data: parsed };
      },
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
      providesTags: (_result, _error, id) => [{ type: 'Summary', id }],
    }),

    getUsers: builder.query<any, void>({
      query: () => '/users',
      providesTags: ['User'],
      transformResponse: (response: unknown) => UserResponseSchema.array().parse(response),
    }),

    createUser: builder.mutation<any, { name: string; email: string; role: string; isActive: boolean; sendInvitation?: boolean }>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: unknown) => UserResponseSchema.parse(response),
    }),

    updateUser: builder.mutation<any, { id: number; data: { name: string; email: string; role: string; isActive: boolean } }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: unknown) => UserResponseSchema.parse(response),
    }),

    deleteUser: builder.mutation<any, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
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

  useGetProductValuesQuery,

  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,

  useVerifyOtpMutation,
  useResendOtpMutation,
  useActivateAccountMutation,

} = appApi;
