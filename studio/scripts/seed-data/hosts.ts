import type {ValueOf} from '../../schemaTypes/constants'
import {RESPONSE_TIMES} from '../../schemaTypes/constants'
import type {PhotoId} from './photos'

export type SeedHost = {
  slug: string
  name: string
  photo: PhotoId
  bio: string
  hostingSince: string
  responseTime: ValueOf<typeof RESPONSE_TIMES>
  languages: string[]
}

// Fictional hosts.
export const hosts: SeedHost[] = [
  {
    slug: 'maya-chen',
    name: 'Maya Chen',
    photo: '1494790108377-be9c29b29330',
    bio: 'I grew up hiking the San Bernardino Mountains and now look after three cabins there. I keep them stocked with firewood, good coffee and trail maps I have actually walked.',
    hostingSince: '2017-04-12',
    responseTime: 'within-an-hour',
    languages: ['English', 'Mandarin'],
  },
  {
    slug: 'daniel-ortiz',
    name: 'Daniel Ortiz',
    photo: '1500648767791-00dcc994a43e',
    bio: 'Former surf instructor turned full-time host along the Southern California coast. Ask me for the best taco stand near any of my places.',
    hostingSince: '2015-06-03',
    responseTime: 'within-an-hour',
    languages: ['English', 'Spanish'],
  },
  {
    slug: 'priya-nair',
    name: 'Priya Nair',
    photo: '1544005313-94ddf0286df2',
    bio: 'Architect based in the Bay Area. I design calm, light-filled spaces and host a handful of them from the city to wine country and the Sierra.',
    hostingSince: '2019-02-20',
    responseTime: 'within-a-few-hours',
    languages: ['English', 'Hindi', 'Malayalam'],
  },
  {
    slug: 'tom-becker',
    name: 'Tom Becker',
    photo: '1472099645785-5658abf4ff4e',
    bio: 'Pacific Northwest local with a woodshop and too many cabins to maintain. I fix things fast and leave a printed guide to every town in the kitchen.',
    hostingSince: '2012-09-15',
    responseTime: 'within-a-few-hours',
    languages: ['English', 'German'],
  },
  {
    slug: 'leah-goldberg',
    name: 'Leah Goldberg',
    photo: '1438761681033-6461ffad8d80',
    bio: 'I split the year between New York and the Florida coast and host the places I love in both. Fresh linens, honest listings, quick replies.',
    hostingSince: '2018-11-01',
    responseTime: 'within-an-hour',
    languages: ['English', 'Hebrew'],
  },
  {
    slug: 'marcus-hale',
    name: 'Marcus Hale',
    photo: '1507003211169-0a1dd7228f2d',
    bio: 'Musician and host across Tennessee and Texas. My places are set up for groups: big tables, plenty of beds, and a grill that gets used.',
    hostingSince: '2016-03-28',
    responseTime: 'within-a-few-hours',
    languages: ['English'],
  },
  {
    slug: 'sofia-rossi',
    name: 'Sofia Rossi',
    photo: '1517841905240-472988babdf9',
    bio: 'I manage design-led villas in the desert and on the California coast. Every stay includes a welcome call so you know exactly how the house works.',
    hostingSince: '2014-05-09',
    responseTime: 'within-an-hour',
    languages: ['English', 'Italian', 'Spanish'],
  },
  {
    slug: 'jordan-reyes',
    name: 'Jordan Reyes',
    photo: '1539571696357-5a69c17a67c6',
    bio: 'New host with two places near the parks I love most. Expect detailed trail notes and a well-stocked gear closet.',
    hostingSince: '2021-08-14',
    responseTime: 'within-a-day',
    languages: ['English'],
  },
]
