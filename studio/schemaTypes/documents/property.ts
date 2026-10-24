import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {AMENITIES, list, PROPERTY_TYPES} from '../constants'

const int = (
  name: string,
  min: number,
  max: number,
  extra: Partial<{initialValue: number; title: string}> = {},
) =>
  defineField({
    name,
    type: 'number',
    group: 'space',
    ...extra,
    validation: (rule) => rule.required().integer().min(min).max(max),
  })

// A stay. Fields guests filter on are typed (GROQ filters); summary, description
// and highlights are the text embeddings rank on, so they live here, not on references.
export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'copy', title: 'Photos & copy'},
    {name: 'space', title: 'Pricing & space'},
    {name: 'rules', title: 'Rules & policy'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'details',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'details',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'propertyType',
      title: 'Type',
      type: 'string',
      group: 'details',
      options: {list: list(PROPERTY_TYPES), layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      group: 'details',
      description: 'Shown in the featured row on Home.',
      initialValue: false,
    }),
    defineField({
      name: 'host',
      type: 'reference',
      group: 'details',
      to: [{type: 'host'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'object',
      group: 'details',
      options: {columns: 3},
      fields: [
        defineField({name: 'city', type: 'string', validation: (rule) => rule.required()}),
        defineField({
          name: 'region',
          type: 'string',
          description: 'State or region, for example CA.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'country',
          type: 'string',
          initialValue: 'United States',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      group: 'details',
      validation: (rule) => rule.min(0).max(5).precision(1),
    }),
    defineField({
      name: 'reviewCount',
      type: 'number',
      group: 'details',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),

    defineField({
      name: 'photos',
      type: 'array',
      group: 'copy',
      description: 'The first photo is the cover.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(3).max(12),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 2,
      group: 'copy',
      description: 'One-line pitch. Used for search ranking.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 8,
      group: 'copy',
      description: 'What the stay is like: setting, feel, what is nearby. Used for search ranking.',
      validation: (rule) =>
        rule.required().custom((value) => {
          const words = value?.trim().split(/\s+/).length ?? 0
          return words >= 40 && words <= 200 ? true : `Aim for 40–200 words (now ${words}).`
        }),
    }),
    defineField({
      name: 'highlights',
      type: 'array',
      group: 'copy',
      description: 'Short lines, for example "Cedar hot tub on the deck".',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(3).max(6),
    }),

    int('pricePerNight', 50, 5000, {title: 'Price per night (USD)'}),
    defineField({
      name: 'cleaningFee',
      title: 'Cleaning fee (USD)',
      type: 'number',
      group: 'space',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0).max(1000),
    }),
    defineField({
      name: 'minNights',
      title: 'Minimum nights',
      type: 'number',
      group: 'space',
      initialValue: 1,
      validation: (rule) => rule.integer().min(1).max(30),
    }),
    int('maxGuests', 1, 20, {title: 'Max guests'}),
    defineField({
      name: 'bedrooms',
      type: 'number',
      group: 'space',
      description: '0 for a studio.',
      validation: (rule) => rule.required().integer().min(0).max(12),
    }),
    defineField({
      name: 'bathrooms',
      type: 'number',
      group: 'space',
      validation: (rule) =>
        rule
          .required()
          .min(0.5)
          .max(12)
          .custom((value) =>
            value === undefined || Number.isInteger(value * 2) ? true : 'Use steps of 0.5.',
          ),
    }),
    defineField({
      name: 'rooms',
      title: 'Rooms & beds',
      type: 'array',
      group: 'space',
      of: [defineArrayMember({type: 'room'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'amenities',
      type: 'array',
      group: 'space',
      of: [defineArrayMember({type: 'string'})],
      options: {list: list(AMENITIES), layout: 'grid'},
      validation: (rule) => rule.unique(),
    }),

    defineField({
      name: 'houseRules',
      type: 'houseRules',
      group: 'rules',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cancellationPolicy',
      type: 'reference',
      group: 'rules',
      to: [{type: 'policy'}],
      options: {filter: 'category == "cancellation"'},
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', city: 'location.city', region: 'location.region', media: 'photos.0'},
    prepare: ({title, city, region, media}) => ({
      title,
      media,
      subtitle: [city, region].filter(Boolean).join(', '),
    }),
  },
})
