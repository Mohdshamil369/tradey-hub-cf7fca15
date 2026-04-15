import MobileLayout from "@/components/layout/MobileLayout";
import { ArrowLeft, CreditCard, Plus, Building2, Smartphone, CheckCircle2, Lock, ChevronDown, Trash2, X, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

interface SavedCard {
  id: string;
  type: "card" | "ideal" | "applepay";
  label: string;
  detail: string;
  brand?: string;
  isDefault: boolean;
}

const dutchBanks = [
  { id: "abn", name: "ABN AMRO", color: "bg-[#004C2F]" },
  { id: "ing", name: "ING", color: "bg-[#FF6200]" },
  { id: "rabo", name: "Rabobank", color: "bg-[#0068B4]" },
  { id: "sns", name: "SNS Bank", color: "bg-[#E4003A]" },
  { id: "asn", name: "ASN Bank", color: "bg-[#00A84F]" },
  { id: "triodos", name: "Triodos Bank", color: "bg-[#2E3640]" },
  { id: "knab", name: "Knab", color: "bg-[#FF5F00]" },
  { id: "bunq", name: "bunq", color: "bg-[#30C381]" },
];

const initialCards: SavedCard[] = [
  { id: "1", type: "card", label: "Visa", detail: "•••• 4821", brand: "Visa", isDefault: true },
  { id: "2", type: "ideal", label: "iDEAL", detail: "ING Bank", isDefault: false },
];

type AddStep = null | "select" | "card-form" | "ideal-form";

const Payments = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SavedCard[]>(initialCards);
  const [addStep, setAddStep] = useState<AddStep>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // iDEAL form state
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const detectCardBrand = (num: string) => {
    const d = num.replace(/\s/g, "");
    if (d.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "Mastercard";
    if (/^3[47]/.test(d)) return "Amex";
    return null;
  };

  const cardBrand = detectCardBrand(cardNumber);
  const cleanCard = cardNumber.replace(/\s/g, "");
  const isCardValid = cardName.trim().length >= 2 && cleanCard.length >= 15 && expiry.length === 5 && cvv.length >= 3;

  const resetForms = () => {
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    setSelectedBank(null);
    setBankDropdownOpen(false);
  };

  const handleAddCard = () => {
    const last4 = cleanCard.slice(-4);
    const newCard: SavedCard = {
      id: Date.now().toString(),
      type: "card",
      label: cardBrand || "Card",
      detail: `•••• ${last4}`,
      brand: cardBrand || "Card",
      isDefault: cards.length === 0,
    };
    setCards((prev) => [...prev, newCard]);
    resetForms();
    setAddStep(null);
    toast.success("Card added successfully");
  };

  const handleAddIdeal = () => {
    const bank = dutchBanks.find((b) => b.id === selectedBank);
    if (!bank) return;
    const newCard: SavedCard = {
      id: Date.now().toString(),
      type: "ideal",
      label: "iDEAL",
      detail: bank.name,
      isDefault: cards.length === 0,
    };
    setCards((prev) => [...prev, newCard]);
    resetForms();
    setAddStep(null);
    toast.success("iDEAL bank added successfully");
  };

  const handleAddApplePay = () => {
    const newCard: SavedCard = {
      id: Date.now().toString(),
      type: "applepay",
      label: "Apple Pay",
      detail: "Connected",
      isDefault: cards.length === 0,
    };
    setCards((prev) => [...prev, newCard]);
    setAddStep(null);
    toast.success("Apple Pay connected");
  };

  const handleDelete = (id: string) => {
    setCards((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (updated.length > 0 && !updated.some((c) => c.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
    setDeleteId(null);
    toast.success("Payment method removed");
  };

  const handleSetDefault = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === id }))
    );
    toast.success("Default payment method updated");
  };

  const getIcon = (type: string) => {
    if (type === "ideal") return <Building2 className="h-5 w-5 text-primary" />;
    if (type === "applepay") return <Smartphone className="h-5 w-5 text-primary" />;
    return <CreditCard className="h-5 w-5 text-primary" />;
  };

  return (
    <MobileLayout>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground font-heading">Payment Methods</h1>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Saved methods */}
        {cards.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`flex items-center gap-3 rounded-2xl p-4 transition-all ${
                  card.isDefault
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card card-shadow border-2 border-transparent"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                  {getIcon(card.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{card.label}</h4>
                    {card.isDefault && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{card.detail}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                      title="Set as default"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteId(card.id)}
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
        {cards.length === 0 && addStep === null && (
          <div className="flex flex-col items-center text-center gap-3 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">No payment methods added yet.</p>
          </div>
        )}

        {/* Add button */}
        {addStep === null && (
          <button
            onClick={() => setAddStep("select")}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 py-4 text-sm font-bold text-primary transition-transform active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Payment Method
          </button>
        )}

        {/* Step: Select type */}
        {addStep === "select" && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Choose type</h3>
              <button onClick={() => { setAddStep(null); resetForms(); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <button
              onClick={() => setAddStep("card-form")}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow active:scale-[0.98] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold text-foreground">Credit / Debit Card</h4>
                <p className="text-[11px] text-muted-foreground">Visa, Mastercard, Amex</p>
              </div>
            </button>

            <button
              onClick={() => setAddStep("ideal-form")}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow active:scale-[0.98] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold text-foreground">iDEAL</h4>
                <p className="text-[11px] text-muted-foreground">Link your Dutch bank account</p>
              </div>
            </button>

            <button
              onClick={handleAddApplePay}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow active:scale-[0.98] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                <Smartphone className="h-5 w-5 text-background" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold text-foreground">Apple Pay</h4>
                <p className="text-[11px] text-muted-foreground">Quick mobile payment</p>
              </div>
            </button>
          </div>
        )}

        {/* Step: Card form */}
        {addStep === "card-form" && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Add Card</h3>
              <button onClick={() => { setAddStep("select"); resetForms(); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 card-shadow">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Card number</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 pr-20 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {cardBrand && (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                        {cardBrand}
                      </span>
                    )}
                    {cleanCard.length >= 15 && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Cardholder name</label>
                <input
                  type="text"
                  placeholder="J. van der Berg"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Expiry date</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">CVV</label>
                  <div className="relative">
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-accent/40 px-4 py-2.5">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">256-bit SSL encrypted</span> — Your details are secure.
              </p>
            </div>

            <button
              onClick={handleAddCard}
              disabled={!isCardValid}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Add Card
            </button>
          </div>
        )}

        {/* Step: iDEAL form */}
        {addStep === "ideal-form" && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Link iDEAL Bank</h3>
              <button onClick={() => { setAddStep("select"); resetForms(); }}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 card-shadow">
              <label className="text-xs font-semibold text-muted-foreground">Select your bank</label>
              <button
                onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3.5 text-sm"
              >
                {selectedBank ? (
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${dutchBanks.find((b) => b.id === selectedBank)?.color}`} />
                    <span className="font-medium text-foreground">{dutchBanks.find((b) => b.id === selectedBank)?.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Choose your bank...</span>
                )}
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${bankDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {bankDropdownOpen && (
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-2 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                  {dutchBanks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => { setSelectedBank(bank.id); setBankDropdownOpen(false); }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                        selectedBank === bank.id ? "bg-primary/10" : "hover:bg-accent"
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full ${bank.color}`} />
                      <span className="text-sm font-medium text-foreground">{bank.name}</span>
                      {selectedBank === bank.id && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Your bank will be linked for future iDEAL payments
              </p>
            </div>

            <button
              onClick={handleAddIdeal}
              disabled={!selectedBank}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Link Bank
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom duration-200">
            <h3 className="text-base font-bold text-foreground mb-2">Remove payment method?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              This payment method will be removed from your account. You can always add it back later.
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

export default Payments;
