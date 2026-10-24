// Fixed value lists shared by the schema and the seed. Values are the keys the
// app filters on, so rename them only together with the app's search code.

export const PROPERTY_TYPES = [
  {title: 'Cabin', value: 'cabin'},
  {title: 'Beach', value: 'beach'},
  {title: 'City', value: 'city'},
  {title: 'Villa', value: 'villa'},
] as const

export const AMENITIES = [
  {title: 'Hot tub', value: 'hot-tub'},
  {title: 'Pool', value: 'pool'},
  {title: 'Wifi', value: 'wifi'},
  {title: 'Fireplace', value: 'fireplace'},
  {title: 'Kitchen', value: 'kitchen'},
  {title: 'Parking', value: 'parking'},
  {title: 'Beach access', value: 'beach-access'},
  {title: 'Workspace', value: 'workspace'},
  {title: 'Air conditioning', value: 'air-conditioning'},
  {title: 'Washer', value: 'washer'},
  {title: 'EV charger', value: 'ev-charger'},
  {title: 'BBQ grill', value: 'bbq-grill'},
] as const

export const BED_TYPES = [
  {title: 'King', value: 'king'},
  {title: 'Queen', value: 'queen'},
  {title: 'Double', value: 'double'},
  {title: 'Twin', value: 'twin'},
  {title: 'Bunk', value: 'bunk'},
  {title: 'Sofa bed', value: 'sofa-bed'},
] as const

export const CHECK_IN_METHODS = [
  {title: 'Keypad', value: 'keypad'},
  {title: 'Lockbox', value: 'lockbox'},
  {title: 'Smart lock', value: 'smart-lock'},
  {title: 'Host greets you', value: 'host-greets'},
  {title: 'Front desk', value: 'front-desk'},
] as const

export const RESPONSE_TIMES = [
  {title: 'Within an hour', value: 'within-an-hour'},
  {title: 'Within a few hours', value: 'within-a-few-hours'},
  {title: 'Within a day', value: 'within-a-day'},
] as const

export const POLICY_CATEGORIES = [
  {title: 'Cancellation', value: 'cancellation'},
  {title: 'Booking & payment', value: 'booking-payment'},
  {title: 'Guest conduct', value: 'guest-conduct'},
  {title: 'Damage', value: 'damage'},
  {title: 'Rebooking & refunds', value: 'rebooking'},
] as const

export type ValueOf<T extends readonly {value: string}[]> = T[number]['value']

// "HH:mm", 24-hour.
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

// Sanity's options.list wants a mutable array.
export const list = <T extends readonly {title: string; value: string}[]>(items: T) =>
  items.map((item) => ({...item}))
