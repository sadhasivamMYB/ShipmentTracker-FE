import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';

export const templateApi = createApi({
  reducerPath: 'templateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL,  // Match the existing api.ts config
    credentials: "include",
    // prepareHeaders: (headers, { getState }) => {
    //   const token = (getState() as RootState).auth?.token;
    //   if (token) {
    //     headers.set('authorization', `Bearer ${token}`);
    //   }
    //   return headers;
    // },
  }),
  tagTypes: ['Template'],
  endpoints: (builder) => ({
    getTemplates: builder.query<any, void>({
      query: () => '/template',
      providesTags: ['Template'],
    }),
    getTemplate: builder.query<any, string>({
      query: (id) => `/template/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Template', id }],
    }),
    uploadTemplate: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/template/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Template'],
    }),
    updateTemplate: builder.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/template/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Template', id }, 'Template'],
    }),
    renderTemplate: builder.mutation<Blob, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/template/${id}/render`,
        method: 'POST',
        body: data,
        responseHandler: async (response) => response.blob(),
      }),
    }),
    deleteTemplate: builder.mutation<any, number>({
      query: (id) => ({
        url: `/template/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useUploadTemplateMutation,
  useUpdateTemplateMutation,
  useRenderTemplateMutation,
  useDeleteTemplateMutation,
} = templateApi;
