import {defineArrayMember, defineField, defineType} from 'sanity'

import {CHECK_IN_METHODS, list, TIME_PATTERN} from '../constants'

const time = (name: string, title: string, required: boolean) =>
  defineField({
    name,
    title,
    type: 'string',
    description: '24-hour time, for example 15:00.',
    validation: (rule) => {
      const base = rule.regex(TIME_PATTERN, {name: 'HH:mm'})
      return required ? base.required() : base
    },
  })

// Rules for one stay. Pets is a typed filter; the rest is shown on the details screen.
export const houseRules = defineType({
  name: 'houseRules',
  title: 'House rules',
  type: 'object',
  fields: [
    defineField({
      name: 'petsAllowed',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'smokingAllowed',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'partiesAllowed',
      title: 'Parties and events allowed',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quietHours',
      type: 'object',
      options: {columns: 2},
      fields: [time('start', 'Start', false), time('end', 'End', false)],
    }),
    time('checkInTime', 'Check-in time', true),
    time('checkOutTime', 'Check-out time', true),
    defineField({
      name: 'checkInMethod',
      title: 'Check-in method',
      type: 'string',
      options: {list: list(CHECK_IN_METHODS)},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'additionalRules',
      type: 'array',
      description: 'Shown to guests word for word.',
      of: [defineArrayMember({type: 'string'})],
    }),
  ],
})
