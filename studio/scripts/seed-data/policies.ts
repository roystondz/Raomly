import type {ValueOf} from '../../schemaTypes/constants'
import {POLICY_CATEGORIES} from '../../schemaTypes/constants'

export type SeedPolicy = {
  slug: string
  title: string
  category: ValueOf<typeof POLICY_CATEGORIES>
  summary: string
  body: string
}

// Sample Roam policies for development. They need a real review before launch.
export const policies: SeedPolicy[] = [
  {
    slug: 'flexible-cancellation',
    title: 'Flexible cancellation',
    category: 'cancellation',
    summary: 'Full refund if you cancel at least 24 hours before check-in.',
    body: `Cancel at least 24 hours before the listed check-in time and you get a full refund of the nightly rate, cleaning fee and service fee.

If you cancel less than 24 hours before check-in, the first night and the service fee are non-refundable. The remaining nights and the cleaning fee are refunded.

If you cancel after check-in, nights not yet stayed are refunded 24 hours after you cancel. The cleaning fee and service fee are non-refundable.

Refunds go back to the original payment method within 5 to 10 business days.`,
  },
  {
    slug: 'moderate-cancellation',
    title: 'Moderate cancellation',
    category: 'cancellation',
    summary: 'Full refund up to 5 days before check-in, then 50% back.',
    body: `Cancel at least 5 full days before the listed check-in time and you get a full refund of the nightly rate, cleaning fee and service fee.

If you cancel less than 5 days before check-in, 50% of the nightly rate for all nights is refunded. The cleaning fee is refunded in full. The service fee is non-refundable.

If you cancel after check-in, 50% of the nightly rate for nights not yet stayed is refunded. The service fee is non-refundable.

Refunds go back to the original payment method within 5 to 10 business days.`,
  },
  {
    slug: 'strict-cancellation',
    title: 'Strict cancellation',
    category: 'cancellation',
    summary: 'Full refund within 48 hours of booking, then 50% back up to 14 days out.',
    body: `You get a full refund if you cancel within 48 hours of booking, as long as check-in is at least 14 days away.

If you cancel at least 7 days before check-in, 50% of the nightly rate and the full cleaning fee are refunded. The service fee is non-refundable.

If you cancel less than 7 days before check-in, the nightly rate and service fee are non-refundable. The cleaning fee is refunded.

Refunds go back to the original payment method within 5 to 10 business days.`,
  },
  {
    slug: 'booking-and-payment',
    title: 'Booking and payment',
    category: 'booking-payment',
    summary: 'You pay in full when you book. Prices are in US dollars and include all fees.',
    body: `You pay the full amount when your booking is confirmed. The total shown before you book includes the nightly rate, the cleaning fee, Roam's service fee and any local taxes. Nothing is added later.

All prices are in US dollars. Your card issuer may charge a fee for payments in a foreign currency.

Bookings must meet the stay's minimum number of nights. The person who books must be at least 18 years old and must be one of the guests.

If a payment fails, the booking is not confirmed and the dates stay open to other guests.`,
  },
  {
    slug: 'guest-conduct-and-parties',
    title: 'Guest conduct and parties',
    category: 'guest-conduct',
    summary: 'Respect the house rules, the guest limit and the neighbors.',
    body: `Only the guests listed on the booking may stay overnight. The number of guests may never exceed the stay's maximum.

Parties and events are not allowed unless the stay's house rules say otherwise. Gatherings that disturb neighbors may end the booking without a refund.

Follow the stay's house rules, including quiet hours, smoking rules and pet rules. Hosts may ask you to leave if the rules are seriously or repeatedly broken.

Treat the home and the neighborhood with respect, and report any problem to your host or to Roam support as soon as you notice it.`,
  },
  {
    slug: 'damage-and-security',
    title: 'Damage and security',
    category: 'damage',
    summary: 'Report damage right away. You may be charged for damage you cause.',
    body: `Roam does not take a security deposit at booking.

If something is damaged during your stay, tell your host through the app as soon as possible. Accidents happen, and reporting them early makes them easier to resolve.

A host can request payment for damage caused by you, your guests or your pets within 14 days of check-out, with photos and receipts. Roam reviews every request before any charge is made, and you can respond before a decision is reached.

Normal wear and tear is never charged.`,
  },
  {
    slug: 'rebooking-and-refunds',
    title: 'Rebooking and refunds',
    category: 'rebooking',
    summary: 'If a stay is not as described, Roam helps you rebook or refunds you.',
    body: `If your host cancels, you cannot get in, or the stay is significantly different from its listing, contact Roam support within 72 hours of discovering the problem.

Roam will help you find a comparable stay for the remaining nights. If no comparable stay is available, or you prefer not to rebook, you get a refund for the nights affected.

Problems you report are first shared with your host, who has a chance to fix them. If they cannot be fixed quickly, Roam steps in.

This does not apply to problems caused by you or your guests.`,
  },
]
