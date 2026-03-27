import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft, Plus, MapPin, Trash2, CheckCircle2, Pencil, X, Save, Home, Building2, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAddressStore, SavedAddress } from "@/stores/addressStore";

const labelOptions = [
  { id: "Home", icon: Home },
  { id: "Office", icon: Building2 },
  { id: "Other", icon: MapPin },
];

type FormMode = null | "add" | "edit";

const Address = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addresses, addAddress, updateAddress, removeAddress, setDefault } = useAddressStore();
  const [formMode, setFormMode] = useState<FormMode>(searchParams.get("mode") === "add" ? "add" : null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "Home", street: "", city: "", postcode: "" });

  const openAdd = () => {
    setForm({ label: "Home", street: "", city: "", postcode: "" });
    setFormMode("add");
    setEditId(null);
  };

  const openEdit = (addr: SavedAddress) => {
    setForm({ label: addr.label, street: addr.street, city: addr.city, postcode: addr.postcode });
    setEditId(addr.id);
    setFormMode("edit");
  };

  const handleSave = () => {
    if (formMode === "add") {
      addAddress({ ...form, isDefault: addresses.length === 0 });
      toast.success("Address added");
    } else if (formMode === "edit" && editId) {
      updateAddress(editId, form);
      toast.success("Address updated");
    }
    setFormMode(null);
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    removeAddress(id);
    setDeleteId(null);
    toast.success("Address removed");
  };

  const handleSetDefault = (id: string) => {
    setDefault(id);
    toast.success("Default address updated");
  };

  const isFormValid = form.street.trim() && form.city.trim() && form.postcode.trim();

  return (
    <MobileLayout>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground font-heading">Addresses</h1>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Saved addresses */}
        {addresses.length > 0 && formMode === null && (
          <div className="flex flex-col gap-2.5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`flex items-start gap-3 rounded-2xl p-4 transition-all ${
                  addr.isDefault
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card card-shadow border-2 border-transparent"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{addr.label}</h4>
                    {addr.isDefault && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{addr.street}</p>
                  <p className="text-[11px] text-muted-foreground">{addr.postcode} {addr.city}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(addr.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {addresses.length === 0 && formMode === null && (
          <div className="flex flex-col items-center text-center gap-3 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
          </div>
        )}

        {/* Add button */}
        {formMode === null && (
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 py-4 text-sm font-bold text-primary transition-transform active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        )}

        {/* Add / Edit form */}
        {formMode !== null && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {formMode === "add" ? "New Address" : "Edit Address"}
              </h3>
              <button onClick={() => { setFormMode(null); setEditId(null); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Label selector */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Label</label>
              <div className="flex gap-2">
                {labelOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = form.label === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setForm({ ...form, label: opt.id })}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-card card-shadow text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {opt.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 card-shadow">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Street + house number *</label>
                <input
                  type="text"
                  placeholder="Keizersgracht 123"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Postcode *</label>
                  <input
                    type="text"
                    placeholder="1015 CJ"
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">City *</label>
                  <input
                    type="text"
                    placeholder="Amsterdam"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {formMode === "add" ? "Save Address" : "Update Address"}
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="w-full max-w-[390px] rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom duration-200">
            <h3 className="text-base font-bold text-foreground mb-2">Remove address?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              This address will be removed. You can always add it back later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl bg-muted py-3 text-sm font-semibold text-foreground transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground transition-transform active:scale-95"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Address;
