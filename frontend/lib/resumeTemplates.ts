/** Original PassATS layout presets — typography/spacing only, no third-party artwork. */

export type TemplatePresetId = "atlas" | "ledger" | "signal";

export type TemplatePreset = {
  id: TemplatePresetId;
  name: string;
  description: string;
  /** CSS preview variant for our programmatic mockups */
  previewVariant: "classic" | "compact" | "skills-first";
  settings: {
    preset_id: string;
    display_name: string;
    font_name: "Calibri" | "Arial" | "Helvetica";
    font_size_body: number;
    font_size_name: number;
    font_size_section: number;
    margin_inches: number;
    line_spacing: number;
    date_format: "MM/YYYY" | "Mon YYYY" | "YYYY";
    bullet_style: "-" | "•" | "●";
    section_order: string[];
    include_section_headers: boolean;
    single_column: boolean;
    max_pages: number;
    header_fields: string[];
  };
};

export const PASSATS_TEMPLATES: TemplatePreset[] = [
  {
    id: "atlas",
    name: "Atlas",
    description: "Balanced single-column layout with clear section headers. Best general-purpose ATS export.",
    previewVariant: "classic",
    settings: {
      preset_id: "atlas",
      display_name: "Atlas",
      font_name: "Calibri",
      font_size_body: 11,
      font_size_name: 16,
      font_size_section: 12,
      margin_inches: 1.0,
      line_spacing: 1.15,
      date_format: "Mon YYYY",
      bullet_style: "-",
      section_order: ["summary", "experience", "education", "skills", "certifications"],
      include_section_headers: true,
      single_column: true,
      max_pages: 2,
      header_fields: ["name", "email", "phone", "location", "linkedin_url"],
    },
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Tighter margins and Arial body text for dense technical resumes under two pages.",
    previewVariant: "compact",
    settings: {
      preset_id: "ledger",
      display_name: "Ledger",
      font_name: "Arial",
      font_size_body: 10,
      font_size_name: 15,
      font_size_section: 11,
      margin_inches: 0.75,
      line_spacing: 1.08,
      date_format: "MM/YYYY",
      bullet_style: "•",
      section_order: ["summary", "skills", "experience", "education", "certifications"],
      include_section_headers: true,
      single_column: true,
      max_pages: 2,
      header_fields: ["name", "email", "phone", "linkedin_url"],
    },
  },
  {
    id: "signal",
    name: "Signal",
    description: "Skills-forward section order with Helvetica styling for keyword-heavy roles.",
    previewVariant: "skills-first",
    settings: {
      preset_id: "signal",
      display_name: "Signal",
      font_name: "Helvetica",
      font_size_body: 11,
      font_size_name: 17,
      font_size_section: 12,
      margin_inches: 1.0,
      line_spacing: 1.2,
      date_format: "YYYY",
      bullet_style: "-",
      section_order: ["summary", "skills", "experience", "education", "certifications"],
      include_section_headers: true,
      single_column: true,
      max_pages: 2,
      header_fields: ["name", "email", "phone", "location", "linkedin_url", "github_url"],
    },
  },
];

export function getTemplateById(id: string): TemplatePreset | undefined {
  return PASSATS_TEMPLATES.find((t) => t.id === id);
}
