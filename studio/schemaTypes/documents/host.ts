import {UserIcon} from '@sanity/icons/User'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {list, RESPONSE_TIMES} from '../constants'

export const host = defineType({
  name: 'host',
  title: 'Host',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photo',
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
    defineField({name: 'bio', type: 'text', rows: 4, validation: (rule) => rule.max(400)}),
    defineField({
      name: 'hostingSince',
      type: 'date',
      description: 'The app shows years hosting from this.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'responseTime',
      type: 'string',
      options: {list: list(RESPONSE_TIMES), layout: 'radio'},
    }),
    defineField({
      name: 'languages',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
  ],
  preview: {
    select: {title: 'name', media: 'photo', since: 'hostingSince'},
    prepare: ({title, media, since}) => ({
      title,
      media,
      subtitle: since ? `Hosting since ${String(since).slice(0, 4)}` : undefined,
    }),
  },
})
