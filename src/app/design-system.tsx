import { Image } from "expo-image";
import { Redirect, Stack } from "expo-router";
import {
  ArrowRight,
  ArrowUp,
  Bath,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  CreditCard,
  FileText,
  Heart,
  House,
  List,
  Mail,
  Map,
  MapPin,
  MessageSquareMore,
  PawPrint,
  Search,
  Settings,
  Share,
  SlidersHorizontal,
  TreePalm,
  TreePine,
  User,
  Waves,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { NO_ANSWER } from "@/ask/answers";
import { AnswerCard } from "@/components/ask/answer-card";
import { SearchResultCard, SearchResultSkeleton } from "@/components/search/search-result-card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { GlassTabBar } from "@/components/ui/glass-tab-bar";
import { GoogleMark } from "@/components/ui/google-mark";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ListGroup, ListRow } from "@/components/ui/list-group";
import { ListingCard } from "@/components/ui/listing-card";
import { Logo } from "@/components/ui/logo";
import { PolicyCard } from "@/components/ui/policy-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Stepper } from "@/components/ui/stepper";
import { Text } from "@/components/ui/text";
import { TextField } from "@/components/ui/text-field";
import { Toggle } from "@/components/ui/toggle";

// Dev-only gallery of every design-system component, for comparing against the design sheet.

const SAMPLE_PHOTO = "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=640&q=80";

const swatches = [
  { name: "Primary Sand", token: "primary", className: "bg-primary" },
  { name: "Accent Forest", token: "accent", className: "bg-accent" },
  { name: "Text Primary", token: "ink", className: "bg-ink" },
  { name: "Text Secondary", token: "muted", className: "bg-muted" },
  { name: "Surface White", token: "surface", className: "bg-surface border border-line" },
  { name: "Surface Gray", token: "surface-muted", className: "bg-surface-muted border border-line" },
  { name: "Border Gray", token: "line", className: "bg-line" },
  { name: "Glass Blur", token: "surface-glass", className: "bg-surface-glass border border-line" },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4 rounded-2xl corner-squircle bg-surface p-5">
      <Text variant="headline">{title}</Text>
      {children}
    </View>
  );
}

export default function DesignSystemScreen() {
  const [chip, setChip] = useState("Cabins");
  const [category, setCategory] = useState("All Stays");
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"home" | "search" | "trips" | "profile">("home");
  const [view, setView] = useState<"list" | "map">("list");
  const [toggle, setToggle] = useState(true);
  const [guests, setGuests] = useState(1);
  const [alerts, setAlerts] = useState({ success: true, error: true });

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <>
      <Stack.Screen options={{ title: "Design system", headerShown: true }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-surface-muted"
        contentContainerClassName="gap-4 px-5 py-6"
      >
        <Section title="01. Brand">
          <Logo />
          <Text variant="body" tone="subtle">
            Find unforgettable stays for every kind of trip.
          </Text>
        </Section>

        <Section title="02. Color palette">
          <View className="flex-row flex-wrap gap-3">
            {swatches.map((s) => (
              <View key={s.token} className="w-24 gap-1">
                <View className={`h-14 rounded-md corner-squircle ${s.className}`} />
                <Text variant="footnote-medium">{s.name}</Text>
                <Text variant="footnote" tone="muted">
                  {s.token}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="03. Typography">
          <Text variant="eyebrow" tone="muted">Eyebrow · section label</Text>
          <SectionLabel label="What's here" />
          <Text variant="display">Find your next stay</Text>
          <Text variant="title">Modern Cabin with Hot Tub</Text>
          <Text variant="title-xs">Modern Cabin with Hot Tub</Text>
          <Text variant="body" tone="muted">
            From mountain cabins to oceanfront villas, roam helps you find unforgettable stays for every kind of trip.
          </Text>
          <Text variant="caption">Lake Arrowhead, CA</Text>
          <Button size="sm" title="Book this stay" className="self-start" />
        </Section>

        <Section title="04. Buttons">
          <Button title="Book this stay" trailing={<Icon icon={ArrowRight} />} />
          <Button variant="secondary" title="Continue with Google" leading={<GoogleMark />} />
          <Button title="Loading" loading />
          <Button title="Disabled" disabled />
          <Button size="lg" title="Book this stay" />
          <View className="flex-row gap-3 rounded-lg bg-ink p-3">
            <IconButton variant="overlay-lg" icon={ChevronLeft} accessibilityLabel="Back" />
            <IconButton variant="overlay-lg" icon={Share} accessibilityLabel="Share" />
            <IconButton variant="overlay-lg" icon={Heart} accessibilityLabel="Save" />
          </View>
          <View className="flex-row gap-4">
            <IconButton icon={Heart} accessibilityLabel="Save" />
            <IconButton icon={Share} accessibilityLabel="Share" />
            <IconButton icon={Search} accessibilityLabel="Search" />
            <IconButton icon={Bookmark} accessibilityLabel="Bookmark" />
            <IconButton variant="outline" icon={ChevronLeft} accessibilityLabel="Back" />
          </View>
          <View className="flex-row items-center gap-4">
            <IconButton variant="filled-sm" icon={ChevronLeft} accessibilityLabel="Back" />
            <IconButton variant="muted" icon={Heart} accessibilityLabel="Save" />
          </View>
        </Section>

        <Section title="05. Input fields">
          <TextField variant="search" defaultValue="Cabins in California" onFilterPress={() => {}} />
          <TextField icon={User} placeholder="Enter your name" />
          <TextField icon={User} defaultValue="Joanna Smith" />
          <TextField variant="password" defaultValue="password1" />
          <TextField icon={Mail} label="Email address" placeholder="you@example.com" />
          <TextField icon={Mail} label="Email address" defaultValue="taken@example.com" error="That email is already in use." />
        </Section>

        <Section title="06. Filter chips">
          <View className="flex-row flex-wrap gap-3">
            {["Cabins", "Under $300", "Pet Friendly", "Quiet"].map((label) => (
              <Chip key={label} label={label} selected={chip === label} onPress={() => setChip(label)} />
            ))}
          </View>
          <View className="flex-row flex-wrap gap-2.5">
            {["Cabins", "Under $300", "Pet Friendly", "Quiet"].map((label) => (
              <Chip
                key={label}
                size="xs"
                label={label}
                selected={chip === label}
                onPress={() => setChip(label)}
              />
            ))}
          </View>
          <View className="flex-row flex-wrap gap-2">
            {[
              { label: "All Stays", icon: House },
              { label: "Cabins", icon: TreePine },
              { label: "Beach", icon: Waves },
              { label: "City", icon: Building2 },
              { label: "Villas", icon: TreePalm },
            ].map((c) => (
              <Chip
                key={c.label}
                size="sm"
                icon={c.icon}
                label={c.label}
                selected={category === c.label}
                onPress={() => setCategory(c.label)}
              />
            ))}
          </View>
          <View className="flex-row flex-wrap gap-2.5">
            {[
              { label: "All Stays", icon: House },
              { label: "Cabins", icon: TreePine },
              { label: "Beach", icon: Waves },
            ].map((c) => (
              <Chip
                key={c.label}
                icon={c.icon}
                label={c.label}
                selected={category === c.label}
                onPress={() => setCategory(c.label)}
              />
            ))}
          </View>
        </Section>

        <Section title="07. Listing card">
          <ListingCard
            saved={saved}
            onToggleSave={() => setSaved((s) => !s)}
            stay={{
              title: "Modern Cabin with Hot Tub",
              location: "Lake Arrowhead, CA",
              imageUrl: SAMPLE_PHOTO,
              rating: 4.9,
              reviewCount: 342,
              pricePerNight: 280,
              amenities: [
                { label: "Hot Tub", icon: Bath },
                { label: "Pet Friendly", icon: PawPrint },
              ],
            }}
          />
        </Section>

        <Section title="07b. Search result card">
          <SearchResultCard
            saved={saved}
            onToggleSave={() => setSaved((s) => !s)}
            highlight={["hot-tub"]}
            stay={{
              id: "sample",
              slug: "sample",
              title: "Modern Cabin with Hot Tub",
              type: "cabin",
              location: "Lake Arrowhead, CA",
              imageUrl: SAMPLE_PHOTO,
              imageAlt: "Cabin at dusk",
              rating: 4.9,
              reviewCount: 342,
              pricePerNight: 289,
              petsAllowed: true,
              amenities: ["hot-tub", "fireplace"],
            }}
          />
          <SearchResultSkeleton />
        </Section>

        <Section title="07c. Answer card">
          <AnswerCard
            answer={{
              topic: "pets",
              title: "Pets",
              rules: [{ label: "Pets", value: "Allowed" }],
              paragraphs: ["Up to two dogs, with a $50 pet fee per stay."],
              source: "House rules",
            }}
          />
          <AnswerCard answer={NO_ANSWER} />
          <IconButton variant="primary-sm" icon={ArrowUp} accessibilityLabel="Send" />
        </Section>

        <Section title="08. Policy card">
          <PolicyCard
            icon={MessageSquareMore}
            title="Ask about policies"
            description="Cancellation, house rules, pets, check-in and more."
          />
          <PolicyCard
            icon={FileText}
            title="Free cancellation"
            description="Full refund up to 7 days before check-in."
          />
          <PolicyCard
            size="lg"
            icon={MessageSquareMore}
            title="Ask about policies"
            description="Cancellation, house rules, pets, check-in and more."
          />
          <PolicyCard
            size="lg"
            icon={FileText}
            title="Free cancellation"
            description="Full refund up to 7 days before check-in."
          />
        </Section>

        <Section title="09. Profile row">
          <ListGroup className="border border-line">
            <ListRow icon={User} label="Personal info" />
            <ListRow icon={CreditCard} label="Payment methods" />
            <ListRow icon={Briefcase} label="Trips" />
          </ListGroup>
          <ListGroup className="border border-line">
            <ListRow variant="lg" icon={User} label="Personal info" />
            <ListRow variant="lg" icon={CreditCard} label="Payment methods" />
            <ListRow variant="lg" icon={Briefcase} label="Trips" />
          </ListGroup>
        </Section>

        <Section title="10. Bottom navigation">
          <View className="overflow-hidden rounded-xl corner-squircle p-3">
            <Image source={{ uri: SAMPLE_PHOTO }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <GlassTabBar
              activeKey={tab}
              onSelect={setTab}
              items={[
                { key: "home", label: "Home", icon: House },
                { key: "search", label: "Search", icon: Search },
                { key: "trips", label: "Trips", icon: Calendar },
                { key: "profile", label: "Profile", icon: User },
              ]}
            />
          </View>
        </Section>

        <Section title="11. Iconography">
          <View className="flex-row flex-wrap gap-3">
            {[House, Search, Heart, Calendar, User, Settings, MapPin, SlidersHorizontal].map((icon, i) => (
              <View key={i} className="size-12 items-center justify-center rounded-full border border-line">
                <Icon icon={icon} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="12. Segmented control">
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: "List", icon: List },
              { value: "map", label: "Map", icon: Map },
            ]}
          />
        </Section>

        <Section title="13. Toggles / Steppers">
          <View className="flex-row items-center gap-6">
            <Toggle value={toggle} onValueChange={setToggle} accessibilityLabel="Example toggle" />
            <Stepper value={guests} onChange={setGuests} min={1} max={16} accessibilityLabel="Guests" />
          </View>
        </Section>

        <Section title="14. Status / Alerts">
          {alerts.success ? (
            <Alert
              tone="success"
              message="Account created successfully"
              onDismiss={() => setAlerts((a) => ({ ...a, success: false }))}
            />
          ) : null}
          {alerts.error ? (
            <Alert
              tone="error"
              message="Something went wrong. Please try again."
              onDismiss={() => setAlerts((a) => ({ ...a, error: false }))}
            />
          ) : null}
        </Section>

        <Section title="15. Tags / Badges">
          <View className="flex-row flex-wrap gap-3">
            <Badge tone="favorite" label="Guest favorite" />
            <Badge tone="success" label="New" />
            <Badge tone="danger" label="20% off" />
            <Badge tone="info" label="Superhost" />
          </View>
        </Section>
      </ScrollView>
    </>
  );
}
