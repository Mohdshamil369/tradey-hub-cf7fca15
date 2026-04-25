export type FieldType = "text" | "textarea" | "select" | "rating" | "file" | "email";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // For select type
  description?: string; // High-fidelity description text
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  isCustom?: boolean;
  status?: "published" | "draft";
  tags?: string[];
  responsesCount?: number;
  stepsCount?: number;
  category?: string;
  usageCount?: number;
  lastUsedAt?: string;
}

export interface JobNote {
  id: string;
  jobId: string;
  templateId: string;
  templateTitle: string;
  createdAt: string;
  data: Record<string, any>;
}

export const adminTemplates: FormTemplate[] = [
  {
    id: "site-audit",
    title: "Site Safety Audit",
    description: "Standard safety check before commencing work on site.",
    status: "published",
    responsesCount: 1205,
    stepsCount: 4,
    category: "Business",
    tags: ["Safety", "Audit"],
    fields: [
      { id: "sa-1", type: "text", label: "Inspector Name", required: true },
      { id: "sa-2", type: "select", label: "Weather Conditions", required: true, options: ["Clear", "Rainy", "Windy", "Snowing"] },
      { id: "sa-3", type: "rating", label: "Overall Site Condition", required: true },
      { id: "sa-4", type: "file", label: "Risk Assessment Doc", required: false },
    ],
  },
  {
    id: "material-req",
    title: "Material Request",
    description: "Request additional materials for the current job.",
    status: "published",
    responsesCount: 843,
    stepsCount: 2,
    category: "HR",
    tags: ["Materials", "Internal"],
    fields: [
      { id: "mr-1", type: "textarea", label: "List of Materials", required: true },
      { id: "mr-2", type: "text", label: "Supplier Name", required: false },
    ],
  },
  {
    id: "customer-feedback",
    title: "Project Handover",
    description: "Final checklist and customer feedback form.",
    status: "published",
    responsesCount: 231,
    stepsCount: 5,
    category: "Business",
    tags: ["Feedback", "Handover"],
    fields: [
      { id: "cf-1", type: "rating", label: "Workmanship Quality", required: true },
      { id: "cf-2", type: "textarea", label: "Customer Comments", required: false },
      { id: "cf-3", type: "file", label: "After Photo", required: true },
    ],
  },
];

export const initialNotes: JobNote[] = [
  {
    id: "n-1",
    jobId: "job-1",
    templateId: "site-audit",
    templateTitle: "Site Safety Audit",
    createdAt: "2024-03-24T10:00:00Z",
    data: {
      "sa-1": "John Doe",
      "sa-2": "Clear",
      "sa-3": 5,
    },
  },
];
