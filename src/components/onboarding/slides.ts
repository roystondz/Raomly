// Onboarding slides. Photos are free under the Unsplash License.
// `tone` is how light the top of the photo is, so the logo and status bar stay readable.
export type OnboardingSlide = {
  id: string;
  imageUrl: string;
  location: string;
  tone: "light" | "dark";
  title: string;
  body: string;
};

const unsplash = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80&fm=jpg&fit=crop`;

export const slides: OnboardingSlide[] = [
  {
    id: "story",
    imageUrl: unsplash("photo-1750768685537-56e8bb8713aa"), // Gilley Aguilar, Oia
    location: "Oia, Greece",
    tone: "light",
    title: "Find a stay that fits your story",
    body: "From mountain cabins to oceanfront villas, roamly helps you find unforgettable stays for every kind of trip.",
  },
  {
    id: "describe",
    imageUrl: unsplash("photo-1637253161360-8eacf6fb6437"), // Lukas Mann, Lake Louise
    location: "Lake Louise, AB",
    tone: "dark",
    title: "Just say what you're looking for",
    body: "Describe your trip in one sentence, like “quiet cabin with a hot tub under $300”, and get stays ranked for you.",
  },
  {
    id: "answers",
    imageUrl: unsplash("photo-1636886519725-6a048800b5b4"), // Andrew Svk, Emerald Lake
    location: "Emerald Lake, BC",
    tone: "dark",
    title: "Answers from the source",
    body: "Ask about cancellation, pets or check-in and get the stay's exact policy text, never a guess.",
  },
];
