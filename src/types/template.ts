export interface FormFieldDefinition {
  id: number;
  field_name: string;
  field_label: string;
  field_type: string;
  required: boolean;
  default_value: string | null;
}

export interface Template {
  id: number;
  name: string;
  createdAt?: string; // Optional depending on API
  updatedAt?: string; // Optional depending on API
  formKeys?: FormFieldDefinition[]; // Present in detail view
}

export type RenderTemplateRequest = Record<string, string | number | boolean>;
