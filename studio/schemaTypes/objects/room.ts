import {defineArrayMember, defineField, defineType} from 'sanity'

import {BED_TYPES, list} from '../constants'

// One sleeping space. Total beds are counted from these in GROQ, never stored.
export const room = defineType({
  name: 'room',
  title: 'Room',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      description: 'For example "Bedroom 1", "Loft" or "Living room".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'beds',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'bed',
          type: 'object',
          fields: [
            defineField({
              name: 'type',
              type: 'string',
              options: {list: list(BED_TYPES)},
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'count',
              type: 'number',
              initialValue: 1,
              validation: (rule) => rule.required().integer().min(1).max(6),
            }),
          ],
          preview: {
            select: {type: 'type', count: 'count'},
            prepare: ({type, count}) => ({title: `${count ?? 1} × ${type ?? 'bed'}`}),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {title: 'name', beds: 'beds'},
    prepare: ({title, beds}) => ({
      title,
      subtitle: (beds as {type?: string; count?: number}[] | undefined)
        ?.map((bed) => `${bed.count ?? 1} ${bed.type ?? 'bed'}`)
        .join(', '),
    }),
  },
})
