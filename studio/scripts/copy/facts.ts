import {AMENITIES, BED_TYPES, CHECK_IN_METHODS} from '../../schemaTypes/constants'

// Everything copy is allowed to say about a stay, read from its typed fields.
// Price, fees, rating, reviews and host are deliberately left out.
export const FACTS_QUERY = /* groq */ `*[_type == "property" && !(_id in path("drafts.**")) && (!defined($slug) || slug.current == $slug)] | order(title asc){
  _id,
  "slug": slug.current,
  title,
  propertyType,
  "city": location.city,
  "region": location.region,
  maxGuests,
  bedrooms,
  bathrooms,
  rooms[]{name, beds[]{type, count}},
  amenities,
  houseRules
}`

export type StayRow = {
  _id: string
  slug: string
  title: string
  propertyType: string
  city: string
  region: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  rooms: {name: string; beds: {type: string; count: number}[]}[]
  amenities: string[]
  houseRules: {
    petsAllowed: boolean
    smokingAllowed: boolean
    partiesAllowed: boolean
    quietHours?: {start?: string; end?: string}
    checkInTime: string
    checkOutTime: string
    checkInMethod: string
    additionalRules?: string[]
  }
}

const label = (list: readonly {title: string; value: string}[], value: string) =>
  list.find((item) => item.value === value)?.title ?? value

// The facts object the generator and the fact-checker both see.
export function toFacts(stay: StayRow) {
  const rules = stay.houseRules
  return {
    name: stay.title,
    nameNote: 'The name is a label only. Features it suggests are not facts.',
    stayType: stay.propertyType,
    city: stay.city,
    region: stay.region,
    maxGuests: stay.maxGuests,
    bedrooms: stay.bedrooms,
    bathrooms: stay.bathrooms,
    totalBeds: stay.rooms.reduce(
      (sum, room) => sum + room.beds.reduce((n, bed) => n + bed.count, 0),
      0,
    ),
    rooms: stay.rooms.map((room) => ({
      name: room.name,
      beds: room.beds.map((bed) => `${bed.count} ${label(BED_TYPES, bed.type).toLowerCase()}`),
    })),
    amenities: stay.amenities.map((amenity) => label(AMENITIES, amenity)),
    houseRules: {
      petsAllowed: rules.petsAllowed,
      smokingAllowed: rules.smokingAllowed,
      partiesAllowed: rules.partiesAllowed,
      quietHours: rules.quietHours?.start
        ? `${rules.quietHours.start}–${rules.quietHours.end}`
        : null,
      checkIn: `from ${rules.checkInTime}`,
      checkOut: `by ${rules.checkOutTime}`,
      checkInMethod: label(CHECK_IN_METHODS, rules.checkInMethod),
      otherRules: rules.additionalRules ?? [],
    },
  }
}

export type Facts = ReturnType<typeof toFacts>
