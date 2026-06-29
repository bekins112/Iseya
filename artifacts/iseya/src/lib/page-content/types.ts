export type FieldType = "text" | "textarea" | "list";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  itemLabel?: string;
  itemFields?: FieldDef[];
  itemDefaults?: Record<string, any>;
}

export type SectionKind = "fields" | "banners";

export interface SectionDef {
  key: string;
  label: string;
  description?: string;
  kind?: SectionKind;
  fields?: FieldDef[];
}

export interface PageDef {
  key: string;
  label: string;
  description?: string;
  sections: SectionDef[];
  defaults: Record<string, any>;
}
