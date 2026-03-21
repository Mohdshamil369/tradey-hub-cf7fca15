import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, User, MapPin, Building2, Camera, FileText, Shield,
  CheckCircle2, ChevronRight, Upload, AlertTriangle, Fingerprint,
  CreditCard, HardHat, Scale, ClipboardCheck, ChevronDown,
  Bell, MapPinned, Mic, PartyPopper, Sparkles, Eye } from
"lucide-react";
import { toast } from "sonner";
import { serviceCategories, catAServices, catBServices, getAllServices } from "@/data/services";
import { categoryServiceTypes } from "@/data/serviceTypes";
import { EmojiIcon, getEmojiIconColors, categoryIconMap, categoryColorMap, iconMap } from "@/lib/icons";

const mainSteps = ["Details", "Services", "Documents", "Permissions", "Done"];

interface DocumentRequirement {
  id: string;
  label: string;
  description: string;
  icon: any;
  mandatory: boolean;
  acceptedFormats: string;
  helpText: string;
  hasFrontBack?: boolean;
}

const govIdTypes = [
  { group: "Netherlands", options: [
    { value: "nl-passport", label: "Dutch Passport (Paspoort)" },
    { value: "nl-id-card", label: "Dutch National ID Card (Identiteitskaart)" },
    { value: "nl-driving-licence", label: "Dutch Driving Licence (Rijbewijs)" },
    { value: "nl-residence-permit", label: "Dutch Residence Permit (Verblijfsvergunning)" },
  ]},
  { group: "New Zealand", options: [
    { value: "nz-passport", label: "New Zealand Passport" },
    { value: "nz-driving-licence", label: "New Zealand Driving Licence" },
    { value: "nz-firearms-licence", label: "NZ Firearms Licence" },
    { value: "nz-kiwi-access", label: "Kiwi Access Card (18+)" },
  ]},
];

const docPreviewExamples: Record<string, string> = {
  "gov-id": "Front & back of your passport or national ID card",
  "proof-address": "Utility bill or bank statement showing your name and address",
  "right-to-work": "Visa, work permit, or passport confirming work eligibility",
  "public-liability": "Insurance certificate showing coverage amount and dates",
  "trade-qualifications": "Certificate or licence showing your trade qualification",
  "police-clearance": "Official police clearance or background check certificate",
  "selfie-verification": "Clear, well-lit photo of your face — no sunglasses or hats",
  "professional-indemnity": "Insurance certificate for professional indemnity cover",
};

const requiredDocuments: DocumentRequirement[] = [
{
  id: "gov-id",
  label: "Government-Issued Photo ID",
  description: "Select your document type below",
  icon: CreditCard,
  mandatory: true,
  acceptedFormats: "JPG, PNG, PDF",
  helpText: "Must be current and not expired. Used to verify your identity.",
  hasFrontBack: true
},
{
  id: "proof-address",
  label: "Proof of Address",
  description: "Utility bill or bank statement (last 3 months)",
  icon: MapPin,
  mandatory: true,
  acceptedFormats: "JPG, PNG, PDF",
  helpText: "Must be dated within the last 3 months showing your name and current address."
},
{
  id: "right-to-work",
  label: "Right to Work",
  description: "Visa, work permit, or passport",
  icon: Scale,
  mandatory: true,
  acceptedFormats: "JPG, PNG, PDF",
  helpText: "We must verify your right to work before you can take on jobs. Upload a valid visa, work permit, or passport page confirming eligibility.",
  hasFrontBack: true
},
{
  id: "public-liability",
  label: "Public Liability Insurance",
  description: "Minimum €1M cover required",
  icon: Shield,
  mandatory: true,
  acceptedFormats: "PDF, JPG, PNG",
  helpText: "Public liability insurance protects you and your customers. Most platforms and clients require a minimum of €1,000,000 cover."
},
{
  id: "trade-qualifications",
  label: "Trade Qualifications / Certifications",
  description: "Relevant trade licences and certificates",
  icon: ClipboardCheck,
  mandatory: true,
  acceptedFormats: "PDF, JPG, PNG",
  helpText: "Upload your relevant trade qualifications and certifications. This includes any trade-specific licences required in your region."
},
{
  id: "police-clearance",
  label: "Police Clearance Certificate",
  description: "Verklaring Omtrent het Gedrag (VOG) or NZ equivalent",
  icon: Fingerprint,
  mandatory: true,
  acceptedFormats: "PDF, JPG, PNG",
  helpText: "A police clearance certificate ensures customer safety. In the Netherlands this is a VOG (Verklaring Omtrent het Gedrag). In New Zealand, request a Ministry of Justice Criminal Record Check."
},
{
  id: "selfie-verification",
  label: "Selfie for Identity Match",
  description: "A clear photo of your face for biometric verification",
  icon: Camera,
  mandatory: true,
  acceptedFormats: "JPG, PNG",
  helpText: "We'll match this photo against your government ID to confirm your identity. Please ensure your face is clearly visible with good lighting."
},
{
  id: "professional-indemnity",
  label: "Professional Indemnity Insurance",
  description: "Recommended for advisory/design trades",
  icon: HardHat,
  mandatory: false,
  acceptedFormats: "PDF, JPG, PNG",
  helpText: "Required if your work involves advice, design, or project management. Protects against claims of negligent advice or design errors."
}];


const TraderProfileSetup = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  // trader_type removed — no longer selecting individual vs agency

  // Step 0 - Business
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [street, setStreet] = useState(profile?.street || "");
  const [city, setCity] = useState(profile?.city || "");
  const [postcode, setPostcode] = useState(profile?.postcode || "");
  const [yearsExperience, setYearsExperience] = useState("");

  // Step 1 - Services (category list → subpage with expandable service types)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [expandedServiceType, setExpandedServiceType] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
    prev.includes(serviceId) ? prev.filter((s) => s !== serviceId) : [...prev, serviceId]
    );
  };

  const getSelectedCountForCategory = (categoryId: string) => {
    const cat = categoryServiceTypes.find((c) => c.categoryId === categoryId);
    if (!cat) return 0;
    return cat.serviceTypes.flatMap((st) => st.options).filter((o) => selectedServices.includes(o.id)).length;
  };

  const getTotalCountForCategory = (categoryId: string) => {
    const cat = categoryServiceTypes.find((c) => c.categoryId === categoryId);
    if (!cat) return 0;
    return cat.serviceTypes.flatMap((st) => st.options).length;
  };

  const getSelectedCountForServiceType = (serviceType: {options: {id: string;}[];}) => {
    return serviceType.options.filter((o) => selectedServices.includes(o.id)).length;
  };

  const toggleAllInServiceType = (serviceType: {options: {id: string;}[];}) => {
    const optionIds = serviceType.options.map((o) => o.id);
    const allSelected = optionIds.every((id) => selectedServices.includes(id));

    if (allSelected) {
      // Deselect all
      setSelectedServices((prev) => prev.filter((id) => !optionIds.includes(id)));
    } else {
      // Select all
      setSelectedServices((prev) => {
        const newSelected = [...prev];
        optionIds.forEach((id) => {
          if (!newSelected.includes(id)) newSelected.push(id);
        });
        return newSelected;
      });
    }
  };

  // Step 3 - Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    notifications: false,
    location: false,
    camera: false,
    microphone: false,
    biometrics: false
  });
  const [biometricSetupDone, setBiometricSetupDone] = useState(false);
  const [biometricSetupLoading, setBiometricSetupLoading] = useState(false);

  // Government ID type
  const [selectedGovIdType, setSelectedGovIdType] = useState("");
  const [govIdDropdownOpen, setGovIdDropdownOpen] = useState(false);

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Step 2 - Documents
  const [docSubStep, setDocSubStep] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, {fileName: string;uploadedAt: string;}>>({});

  const mandatoryDocs = requiredDocuments.filter((d) => d.mandatory);
  const optionalDocs = requiredDocuments.filter((d) => !d.mandatory);
  const isDocFullyUploaded = (doc: DocumentRequirement) => {
    if (doc.hasFrontBack) {
      return !!uploadedDocs[`${doc.id}-front`] && !!uploadedDocs[`${doc.id}-back`];
    }
    return !!uploadedDocs[doc.id];
  };
  const allMandatoryUploaded = mandatoryDocs.every(isDocFullyUploaded);
  const currentDoc = step === 2 ? requiredDocuments[docSubStep] : null;

  const canContinue = () => {
    if (step === 0) return fullName.trim() && city.trim() && postcode.trim();
    if (step === 1) return selectedServices.length > 0;
    if (step === 2) return true; // temporarily allow skipping docs
    if (step === 3) return true; // permissions are optional
    return false;
  };

  const fileInputRef = useState<HTMLInputElement | null>(null);
  const cameraInputRef = useState<HTMLInputElement | null>(null);

  const handleDocUpload = (docId: string, method: "file" | "camera" = "file") => {
    // Create a temporary file input to trigger native file/camera picker
    const input = document.createElement("input");
    input.type = "file";
    if (method === "camera") {
      input.accept = "image/*";
      // Use front camera for selfie, back camera for documents
      input.setAttribute("capture", docId === "selfie-verification" ? "user" : "environment");
    } else {
      input.accept = "image/*,.pdf";
    }
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadedDocs((prev) => ({
          ...prev,
          [docId]: {
            fileName: file.name,
            uploadedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          }
        }));
        toast.success(method === "camera" ? "Photo captured!" : "Document uploaded!");

        // Auto-advance to next un-uploaded mandatory doc
        setTimeout(() => {
          const nextUnuploaded = requiredDocuments.findIndex(
            (d, i) => i > docSubStep && d.mandatory && !uploadedDocs[d.id]
          );
          if (nextUnuploaded !== -1) {
            setDocSubStep(nextUnuploaded);
          }
        }, 600);
      }
    };
    input.click();
  };

  const handleContinue = async () => {
    // On services subpage, go back to category list first
    if (step === 1 && activeCategoryId) {
      setActiveCategoryId(null);
      setExpandedServiceType(null);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (step === 3) {
      // Save profile then go to done screen
      setLoading(true);
      const { error } = await updateProfile({
        full_name: fullName.trim(),
        street: street.trim(),
        city: city.trim(),
        postcode: postcode.trim(),
        role: "trader",
        trader_type: "individual",
        onboarding_status: "completed"
      });
      setLoading(false);
      if (error) {
        toast.error("Something went wrong");
      } else {
        await refreshProfile();
        setStep(4);
      }
      return;
    }

    // Step 4 — done, go to home
    navigate("/", { replace: true });
  };

  const handleBack = () => {
    if (step === 1 && activeCategoryId) {
      setActiveCategoryId(null);
      setExpandedServiceType(null);
      setSearchQuery("");
    } else if (step === 2 && docSubStep > 0) {
      setDocSubStep(docSubStep - 1);
    } else if (step > 0 && step < 4) {
      setStep(step - 1);
    } else if (step === 0) {
      navigate("/auth/signup");
    }
  };

  const uploadedMandatoryCount = mandatoryDocs.filter(isDocFullyUploaded).length;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="relative mx-auto w-full max-w-[390px] h-[844px] rounded-[3rem] border-[6px] border-foreground/90 bg-background shadow-2xl overflow-hidden">
        <div className="absolute left-1/2 top-0 z-50 -translate-x-1/2">
          <div className="h-[34px] w-[126px] rounded-b-[1.2rem] bg-foreground/90" />
        </div>

        <div className="flex h-full flex-col px-6 pt-14">
          {step < 4 &&
          <button onClick={handleBack} className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          }

          {step < 4 &&
          <>
              <h1 className="mb-1 text-2xl font-bold text-foreground font-heading">
                {step === 0 ? "Basic Details" : step === 1 ? "Your Services" : step === 2 ? "Document Upload" : "App Permissions"}
              </h1>
              <p className="mb-2 text-sm text-muted-foreground">
                {step === 0 ?
              "Tell us about yourself" :
              step === 1 ?
              "Select the services you offer" :
              step === 2 ?
              `Upload required documents (${uploadedMandatoryCount}/${mandatoryDocs.length})` :
              "Allow permissions for the best experience"}
              </p>

              {/* Main step progress */}
              <div className="mb-4 flex gap-2">
                {mainSteps.map((_, i) =>
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? "bg-primary" : "bg-muted"}`
                } />

              )}
              </div>
            </>
          }

          {/* Step 0: Business details */}
          {step === 0 &&
          <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto pb-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Full name *</label>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-primary/40 bg-primary/5 px-4 py-3.5 ring-1 ring-primary/20">
                  <User className="h-5 w-5 text-primary" />
                  <input
                  type="text" placeholder="Enter your legal full name" value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground font-medium" />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                  <Shield className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <p className="text-[11px] font-semibold text-amber-700">
                    Required for legal verification — please ensure this matches your official ID
                  </p>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Business name</label>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <input
                  type="text" placeholder="Smith Plumbing Ltd" value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Years of experience</label>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <input
                  type="number" placeholder="e.g. 5" value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Street + house number</label>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <input
                  type="text" placeholder="123 Main Street" value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Postcode *</label>
                  <div className="flex items-center rounded-2xl border border-border bg-card px-4 py-3.5">
                    <input
                    type="text" placeholder="SW1A 1AA" value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                  
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">City *</label>
                  <div className="flex items-center rounded-2xl border border-border bg-card px-4 py-3.5">
                    <input
                    type="text" placeholder="London" value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                  
                  </div>
                </div>
              </div>
            </div>
          }

          {/* Step 1: Services — category list or category subpage */}
          {step === 1 && !activeCategoryId &&
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
              <p className="text-xs text-muted-foreground">
                Tap a category to select the services you offer · {selectedServices.length} selected
              </p>

              <div className="flex flex-col gap-2.5">
                {categoryServiceTypes.map((cat) => {
                const selectedCount = getSelectedCountForCategory(cat.categoryId);
                const totalCount = getTotalCountForCategory(cat.categoryId);
                const someSelected = selectedCount > 0;

                return (
                  <button
                    key={cat.categoryId}
                    onClick={() => setActiveCategoryId(cat.categoryId)}
                    className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all active:scale-[0.98]">
                    
                      {(() => {const n = categoryIconMap[cat.categoryId] || "wrench";const I = iconMap[n];const c = categoryColorMap[cat.categoryId];return I ? <I size={24} weight="regular" className={c?.color || "text-muted-foreground"} /> : null;})()}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{cat.label}</h4>
                          {someSelected &&
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {selectedCount}/{totalCount}
                            </span>
                        }
                        </div>
                        <p className="text-[10px] text-muted-foreground">{totalCount} services available</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>);

              })}
              </div>
            </div>
          }

          {/* Step 1 subpage: service types with expandable options */}
          {step === 1 && activeCategoryId && (() => {
            const cat = categoryServiceTypes.find((c) => c.categoryId === activeCategoryId);
            if (!cat) return null;
            return (
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{cat.emoji}</span>
                  <h2 className="text-base font-bold text-foreground">{cat.label}</h2>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {getSelectedCountForCategory(cat.categoryId)}/{getTotalCountForCategory(cat.categoryId)} selected
                  </span>
                </div>

                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                    <Sparkles className="h-4 w-4 text-muted-foreground/60" />
                  </div>
                  <input
                    type="text"
                    placeholder={`Search in ${cat.label}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 transition-colors" />
                  
                  {searchQuery &&
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-3 flex items-center text-[10px] font-bold text-muted-foreground hover:text-foreground">
                    
                      Clear
                    </button>
                  }
                </div>

                <div className="flex flex-col gap-2">
                  {cat.serviceTypes.
                  filter((st) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return st.label.toLowerCase().includes(q) ||
                    st.options.some((o) => o.label.toLowerCase().includes(q));
                  }).
                  map((st) => {
                    const isExpanded = expandedServiceType === st.id || searchQuery.length > 0;
                    const stSelectedCount = getSelectedCountForServiceType(st);
                    const allSelected = st.options.every((o) => selectedServices.includes(o.id));
                    const someSelected = stSelectedCount > 0;

                    const filteredOptions = st.options.filter((o) =>
                    !searchQuery || o.label.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (searchQuery && filteredOptions.length === 0) return null;

                    return (
                      <div key={st.id} className="rounded-2xl border-2 border-border bg-card overflow-hidden transition-all">
                        <div className="flex w-full items-center gap-3 p-3.5 border-b border-transparent group">
                          <button
                            onClick={() => setExpandedServiceType(isExpanded && !searchQuery ? null : st.id)}
                            className="flex-1 min-w-0 text-left">
                            
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{st.label}</h4>
                              {someSelected &&
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                  {stSelectedCount}/{st.options.length}
                                </span>
                              }
                            </div>
                            <p className="text-[10px] text-muted-foreground">{st.options.length} options</p>
                          </button>

                          <ChevronDown
                            onClick={() => setExpandedServiceType(isExpanded && !searchQuery ? null : st.id)}
                            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""} cursor-pointer`} />
                          
                        </div>

                        {isExpanded &&
                        <div className="bg-muted/30 border-t border-border">
                            {/* Select All Row */}
                            {!searchQuery &&
                          <button
                            onClick={() => toggleAllInServiceType(st)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left border-b border-border bg-primary/5 active:bg-primary/10 transition-colors">
                            
                                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            allSelected ? "border-primary bg-primary" : "border-border"}`
                            }>
                                  {allSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                                </div>
                                <p className="text-xs font-bold text-primary">
                                  {allSelected ? "Deselect all services" : `Select all ${st.label.toLowerCase()} services`}
                                </p>
                              </button>
                          }

                            {filteredOptions.map((option) => {
                            const isSelected = selectedServices.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                onClick={() => toggleService(option.id)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left border-b border-border last:border-b-0 active:bg-muted/50 transition-colors">
                                
                                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                                isSelected ? "border-primary bg-primary" : "border-border"}`
                                }>
                                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
                                  </div>
                                  <p className="text-xs font-semibold text-foreground">{option.label}</p>
                                </button>);

                          })}
                          </div>
                        }
                      </div>);

                  })}
                </div>
              </div>);

          })()}

          {/* Step 2: Document upload — one at a time */}
          {step === 2 && currentDoc &&
          <div className="flex flex-1 flex-col overflow-y-auto pb-4">
              {/* Document sub-step progress */}
              <div className="mb-4 flex gap-1">
                {requiredDocuments.map((doc, i) =>
              <button
                key={doc.id}
                onClick={() => setDocSubStep(i)}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                isDocFullyUploaded(doc) ?
                "bg-primary" :
                i === docSubStep ?
                "bg-primary/40" :
                "bg-muted"}`
                } />

              )}
              </div>

              {/* Current document card */}
              <div className="flex flex-col gap-4">
                <div className={`flex items-center gap-3 rounded-2xl p-4 ${
              isDocFullyUploaded(currentDoc) ? "bg-primary/5" : "bg-accent/50"}`
              }>
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                isDocFullyUploaded(currentDoc) ? "bg-primary" : "bg-muted"}`
                }>
                    <currentDoc.icon className={`h-7 w-7 ${
                  isDocFullyUploaded(currentDoc) ? "text-primary-foreground" : "text-muted-foreground"}`
                  } />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{currentDoc.label}</h3>
                      {currentDoc.mandatory && !isDocFullyUploaded(currentDoc) &&
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-bold text-destructive">
                          Required
                        </span>
                    }
                      {currentDoc.hasFrontBack



                    }
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{currentDoc.description}</p>
                  </div>
                  {isDocFullyUploaded(currentDoc) &&
                <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
                }
                </div>

                {/* Government ID type dropdown */}
                {currentDoc.id === "gov-id" && (
                  <div className="relative">
                    <button
                      onClick={() => setGovIdDropdownOpen(!govIdDropdownOpen)}
                      className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3.5 text-left transition-all active:scale-[0.99]"
                    >
                      <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className={`flex-1 text-sm ${selectedGovIdType ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {selectedGovIdType
                          ? govIdTypes.flatMap(g => g.options).find(o => o.value === selectedGovIdType)?.label
                          : "Select document type"}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${govIdDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {govIdDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
                        {govIdTypes.map((group) => (
                          <div key={group.group}>
                            <div className="px-4 py-2 bg-muted/50">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{group.group}</p>
                            </div>
                            {group.options.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  setSelectedGovIdType(opt.value);
                                  setGovIdDropdownOpen(false);
                                }}
                                className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-xs font-medium border-b border-border last:border-b-0 transition-colors ${
                                  selectedGovIdType === opt.value ? "bg-primary/5 text-primary font-bold" : "text-foreground active:bg-muted/50"
                                }`}
                              >
                                {selectedGovIdType === opt.value && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Document preview example */}
                {docPreviewExamples[currentDoc.id] && (
                  <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Example Preview</p>
                        <p className="mt-0.5 text-xs text-foreground/70">{docPreviewExamples[currentDoc.id]}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info box */}
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-foreground leading-relaxed">{currentDoc.helpText}</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        Accepted formats: {currentDoc.acceptedFormats}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload area */}
                {currentDoc.hasFrontBack ? (
              /* Front & Back upload for ID-type documents */
              <div className="flex flex-col gap-3">
                    {(["front", "back"] as const).map((side) => {
                  const key = `${currentDoc.id}-${side}`;
                  const uploaded = uploadedDocs[key];
                  return (
                    <div key={side}>
                          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {side === "front" ? "📄 Front Side" : "📄 Back Side"}
                          </p>
                          {uploaded ?
                      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-8 w-8 text-primary shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-foreground truncate">{uploaded.fileName}</p>
                                  <p className="text-[10px] text-muted-foreground">{uploaded.uploadedAt}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => handleDocUpload(key, "camera")} className="text-[10px] font-semibold text-primary">Retake</button>
                                  <button onClick={() => handleDocUpload(key, "file")} className="text-[10px] font-semibold text-primary">Replace</button>
                                </div>
                              </div>
                            </div> :

                      <div className="flex gap-2.5">
                              <button
                          onClick={() => handleDocUpload(key, "camera")}
                          className="flex-1 rounded-xl border-2 border-dashed border-border bg-card p-4 transition-all active:scale-[0.98] active:border-primary">
                          
                                <div className="flex flex-col items-center gap-2 text-center">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Camera className="h-5 w-5 text-primary" />
                                  </div>
                                  <p className="text-[10px] font-bold text-foreground">Take Photo</p>
                                </div>
                              </button>
                              <button
                          onClick={() => handleDocUpload(key, "file")}
                          className="flex-1 rounded-xl border-2 border-dashed border-border bg-card p-4 transition-all active:scale-[0.98] active:border-primary">
                          
                                <div className="flex flex-col items-center gap-2 text-center">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                                    <Upload className="h-5 w-5 text-primary" />
                                  </div>
                                  <p className="text-[10px] font-bold text-foreground">Upload File</p>
                                </div>
                              </button>
                            </div>
                      }
                        </div>);

                })}
                  </div>) :
              uploadedDocs[currentDoc.id] ?
              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                      <p className="text-sm font-bold text-foreground">Uploaded</p>
                      <p className="text-xs text-muted-foreground">{uploadedDocs[currentDoc.id].fileName}</p>
                      <p className="text-[10px] text-muted-foreground">{uploadedDocs[currentDoc.id].uploadedAt}</p>
                      <div className="mt-2 flex gap-3">
                        <button onClick={() => handleDocUpload(currentDoc.id, "camera")} className="text-xs font-semibold text-primary">Retake photo</button>
                        <span className="text-xs text-border">|</span>
                        <button onClick={() => handleDocUpload(currentDoc.id, "file")} className="text-xs font-semibold text-primary">Replace file</button>
                      </div>
                    </div>
                  </div> :

              <div className="flex gap-3">
                    <button
                  onClick={() => handleDocUpload(currentDoc.id, "camera")}
                  className="flex-1 rounded-2xl border-2 border-dashed border-border bg-card p-6 transition-all active:scale-[0.98] active:border-primary">
                  
                      <div className="flex flex-col items-center gap-2.5 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Camera className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Take Photo</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {currentDoc.id === "selfie-verification" ? "Open camera for selfie" : "Snap a photo"}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                  onClick={() => handleDocUpload(currentDoc.id, "file")}
                  className="flex-1 rounded-2xl border-2 border-dashed border-border bg-card p-6 transition-all active:scale-[0.98] active:border-primary">
                  
                      <div className="flex flex-col items-center gap-2.5 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Upload File</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">Select from device</p>
                        </div>
                      </div>
                    </button>
                  </div>
              }

                {/* Navigation between docs */}
                <div className="flex items-center gap-2">
                  {docSubStep > 0 &&
                <button
                  onClick={() => setDocSubStep(docSubStep - 1)}
                  className="flex-1 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition-all active:scale-[0.98]">
                  
                      Previous
                    </button>
                }
                  {docSubStep < requiredDocuments.length - 1 &&
                <button
                  onClick={() => setDocSubStep(docSubStep + 1)}
                  className={`flex-1 rounded-2xl py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
                  isDocFullyUploaded(currentDoc) ?
                  "bg-primary text-primary-foreground" :
                  "border border-border bg-card text-muted-foreground"}`
                  }>
                  
                      {isDocFullyUploaded(currentDoc) ? "Next Document" : "Skip for now"}
                    </button>
                }
                </div>

                {/* Document checklist */}
                <div>
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    All Documents ({requiredDocuments.filter(isDocFullyUploaded).length}/{requiredDocuments.length})
                  </h4>
                  <div className="rounded-2xl bg-card card-shadow overflow-hidden">
                    {requiredDocuments.map((doc, i) => {
                    const isUploaded = isDocFullyUploaded(doc);
                    const isPartial = doc.hasFrontBack && !isUploaded && (!!uploadedDocs[`${doc.id}-front`] || !!uploadedDocs[`${doc.id}-back`]);
                    const isCurrent = i === docSubStep;
                    const DocIcon = doc.icon;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setDocSubStep(i)}
                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                        isCurrent ? "bg-accent/60" : "active:bg-muted/60"} ${
                        i < requiredDocuments.length - 1 ? "border-b border-border" : ""}`}>
                        
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isUploaded ? "bg-primary" : isPartial ? "bg-primary/50" : "bg-muted"}`
                        }>
                            {isUploaded ?
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" /> :

                          <DocIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-semibold truncate ${isUploaded ? "text-foreground" : "text-muted-foreground"}`}>
                              {doc.label}
                            </p>
                          </div>
                          {doc.mandatory && !isUploaded &&
                        <span className="shrink-0 text-[8px] font-bold text-destructive">REQ</span>
                        }
                          {!doc.mandatory && !isUploaded &&
                        <span className="shrink-0 text-[8px] font-bold text-muted-foreground">OPT</span>
                        }
                        </button>);

                  })}
                  </div>
                </div>
              </div>
            </div>
          }

          {/* Step 3: App Permissions */}
          {step === 3 &&
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
              <p className="text-xs text-muted-foreground">
                These permissions help us provide you with the best experience. You can change them later in settings.
              </p>

              {[
            { key: "notifications", icon: Bell, label: "Push Notifications", desc: "Get notified about new job requests, messages, and updates" },
            { key: "location", icon: MapPinned, label: "Location Access", desc: "Find jobs near you and show your service area to customers" },
            { key: "camera", icon: Camera, label: "Camera Access", desc: "Take photos for documents, job evidence, and profile picture" },
            { key: "microphone", icon: Mic, label: "Microphone Access", desc: "Record voice notes for job descriptions and communication" },
            { key: "biometrics", icon: Fingerprint, label: "Fingerprint / Biometric Access", desc: "Enable fingerprint authentication for quick and secure sign-in" }].
            map((perm) => {
              const isEnabled = permissions[perm.key];
              return (
                <div key={perm.key}>
                  <button
                    onClick={() => {
                      togglePermission(perm.key);
                      if (perm.key === "biometrics" && !isEnabled) {
                        setBiometricSetupDone(false);
                        setBiometricSetupLoading(true);
                        setTimeout(() => {
                          setBiometricSetupLoading(false);
                          setBiometricSetupDone(true);
                          toast.success("Fingerprint registered successfully!");
                        }, 2000);
                      }
                      if (perm.key === "biometrics" && isEnabled) {
                        setBiometricSetupDone(false);
                        setBiometricSetupLoading(false);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
                    isEnabled ? "border-primary bg-primary/5" : "border-border bg-card"}`
                    }>
                    
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isEnabled ? "bg-primary" : "bg-muted"}`
                    }>
                        <perm.icon className={`h-6 w-6 ${isEnabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground">{perm.label}</h4>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{perm.desc}</p>
                      </div>
                      <div className={`flex h-6 w-10 shrink-0 items-center rounded-full px-0.5 transition-all ${
                    isEnabled ? "bg-primary justify-end" : "bg-muted justify-start"}`
                    }>
                        <div className="h-5 w-5 rounded-full bg-white shadow-sm" />
                      </div>
                    </button>

                  {/* Biometric setup prompt */}
                  {perm.key === "biometrics" && isEnabled && (
                    <div className={`mt-2 rounded-2xl border-2 p-4 text-center transition-all ${
                      biometricSetupDone ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                      {biometricSetupLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 animate-pulse">
                            <Fingerprint className="h-7 w-7 text-primary" />
                          </div>
                          <p className="text-xs font-semibold text-foreground">Place your finger on the sensor…</p>
                          <p className="text-[10px] text-muted-foreground">Registering your fingerprint</p>
                        </div>
                      ) : biometricSetupDone ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                            <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
                          </div>
                          <p className="text-xs font-bold text-foreground">Fingerprint Registered ✓</p>
                          <p className="text-[10px] text-muted-foreground">You can now sign in with your fingerprint</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>);

            })}

              <button
              onClick={() => {
                setPermissions({ notifications: true, location: true, camera: true, microphone: true, biometrics: true });
                setBiometricSetupLoading(true);
                setTimeout(() => {
                  setBiometricSetupLoading(false);
                  setBiometricSetupDone(true);
                  toast.success("Fingerprint registered successfully!");
                }, 2000);
              }}
              className="text-center text-xs font-bold text-primary">
              
                Allow all permissions
              </button>
            </div>
          }

          {/* Step 4: Done / Celebration */}
          {step === 4 &&
          <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <PartyPopper className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-foreground font-heading">Woohoo! 🎉</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your account is all set up. You're ready to start receiving jobs and growing your business.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-primary/5 px-4 py-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-xs font-semibold text-foreground">
                  Pro tip: Complete your profile photo to get 3x more bookings
                </p>
              </div>
            </div>
          }

          {/* Continue button */}
          <div className="pb-12">
            {step === 2 && !allMandatoryUploaded &&
            <p className="mb-2 text-center text-[11px] text-destructive font-semibold">
                All mandatory documents must be uploaded to continue
              </p>
            }
            <button
              onClick={handleContinue}
              disabled={step < 4 && (!canContinue() || loading)}
              className="w-full rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-50">
              
              {loading ?
              "Setting up your account..." :
              step === 4 ?
              "Let's Go! 🚀" :
              step === 3 ?
              "Set Up Account" :
              "Continue"}
            </button>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-foreground/30" />
      </div>
    </div>);

};

export default TraderProfileSetup;