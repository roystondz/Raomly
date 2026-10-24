import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

import {list, POLICY_CATEGORIES} from '../constants'

// Roam's own policies. Cancellation policies are referenced by stays; every
// other category applies to all stays. The body is shown word for word.
export const policy = defineType({
  name: 'policy',
  title: 'Policy',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: list(POLICY_CATEGORIES), layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'string',
      description: 'One line for the policy card.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      type: 'text',
      rows: 12,
      description:
        'Exact policy wording, shown to guests verbatim. Separate paragraphs with a blank line.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category'},
  },
})
