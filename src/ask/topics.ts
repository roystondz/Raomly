import {
  BedDouble,
  CreditCard,
  FileText,
  KeyRound,
  Moon,
  PartyPopper,
  PawPrint,
  Receipt,
  RotateCcw,
  ScrollText,
  SearchX,
  ShieldAlert,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";

import type { TopicKey } from "./match-topics";

export const TOPIC_ICONS: Record<TopicKey | "none", LucideIcon> = {
  cancellation: FileText,
  refunds: RotateCcw,
  "check-in": KeyRound,
  pets: PawPrint,
  "quiet-hours": Moon,
  "smoking-parties": PartyPopper,
  "house-rules": ScrollText,
  guests: BedDouble,
  price: Receipt,
  amenities: Sparkles,
  payment: CreditCard,
  damage: ShieldAlert,
  host: UserRound,
  none: SearchX,
};

// Chips above the input. Tapping one sends its question as if typed.
export const TOPIC_CHIPS: { label: string; question: string }[] = [
  { label: "Cancellation", question: "What's the cancellation policy?" },
  { label: "Check-in", question: "How do check-in and check-out work?" },
  { label: "Pets", question: "Are pets allowed?" },
  { label: "House rules", question: "What are the house rules?" },
  { label: "Guests & beds", question: "How many people does it sleep?" },
  { label: "Price & fees", question: "What does it cost?" },
  { label: "Quiet hours", question: "Are there quiet hours?" },
  { label: "Smoking & parties", question: "Can we smoke or have a party?" },
  { label: "Payment", question: "When do I pay?" },
  { label: "Host", question: "Who is the host?" },
];
