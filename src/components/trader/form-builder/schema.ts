export type FieldType = "text" | "textarea" | "select" | "rating" | "file";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // For dropdowns
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  isCustom: boolean; // false for admin templates, true for personal library
  fields: FormField[];
}

export interface JobNote {
  id: string;
  jobId: string;
  templateId: string;
  templateTitle: string;
  createdAt: string;
  data: Record<string, any>; // FieldID -> Value
}

export const adminTemplates: FormTemplate[] = [
  {
    id: "admin-1",
    title: "Initial Inspection",
    description: "Standard checklist for accessing initial property condition.",
    isCustom: false,
    fields: [
      { id: "f1", type: "text", label: "Property Type", required: true },
      { id: "f2", type: "select", label: "Access Status", required: true, options: ["Clear", "Restricted", "Blocked"] },
      { id: "f3", type: "textarea", label: "Initial Observations", required: false },
      { id: "f4", type: "file", label: "Site Photos", required: true },
    ]
  },
  {
    id: "admin-2",
    title: "Material Request",
    description: "List of materials required for the upcoming work.",
    isCustom: false,
    fields: [
      { id: "f1", type: "text", label: "Material Name", required: true },
      { id: "f2", type: "text", label: "Quantity", required: true },
      { id: "f3", type: "select", label: "Urgency", required: true, options: ["Low", "Medium", "High", "Critical"] },
    ]
  },
  {
    id: "admin-3",
    title: "Job Completion Sign-off",
    description: "Final checklist before leaving the site.",
    isCustom: false,
    fields: [
      { id: "f1", type: "select", label: "Work Completed?", required: true, options: ["Yes", "No", "Partially"] },
      { id: "f2", type: "rating", label: "Customer Satisfaction", required: false },
      { id: "f3", type: "textarea", label: "Pending Follow-ups", required: false },
      { id: "f4", type: "file", label: "Completed Work Photos", required: true },
    ]
  }
];

export const initialNotes: JobNote[] = [
  {
    id: "note-1",
    jobId: "j3", // e.g. Full Bathroom Renovation
    templateId: "admin-1",
    templateTitle: "Initial Inspection",
    createdAt: new Date().toISOString(),
    data: {
      "f1": "Terraced House",
      "f2": "Clear",
      "f3": "Significant water damage near the sink area. Will need extra sealant.",
      "f4": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300&h=300"
    }
  }
];
