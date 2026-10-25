// US state names to the region codes stored on `location.region`.
export const STATES: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

export const HOME_COUNTRY = "United States";

const titleCase = (text: string) => text.replace(/\b[a-z]/g, (c) => c.toUpperCase());

// Country names as guests type them, to the name stored on `location.country`.
// Embeddings can't tell an unrelated place from a related word, so places are
// always exact filters: a country with no stays returns nothing.
// "us" is left out: it's far more often the pronoun.
const COUNTRY_ALIASES: Record<string, string> = {
  "united states": HOME_COUNTRY,
  "united states of america": HOME_COUNTRY,
  usa: HOME_COUNTRY,
  "u.s.": HOME_COUNTRY,
  "u.s.a.": HOME_COUNTRY,
  america: HOME_COUNTRY,
  uk: "United Kingdom",
  britain: "United Kingdom",
  "great britain": "United Kingdom",
  england: "United Kingdom",
  scotland: "United Kingdom",
  wales: "United Kingdom",
  holland: "Netherlands",
  uae: "United Arab Emirates",
  "south korea": "South Korea",
  korea: "South Korea",
  "czech republic": "Czechia",
};

const COUNTRY_NAMES = `afghanistan albania algeria andorra angola argentina armenia australia austria azerbaijan
bahamas bahrain bangladesh barbados belarus belgium belize benin bhutan bolivia bosnia botswana brazil brunei
bulgaria burundi cambodia cameroon canada chile china colombia comoros congo croatia cuba cyprus czechia denmark
djibouti dominica ecuador egypt eritrea estonia eswatini ethiopia fiji finland france gabon gambia ghana greece
grenada guatemala guinea guyana haiti honduras hungary iceland india indonesia iran iraq ireland israel italy
jamaica japan kazakhstan kenya kiribati kosovo kuwait kyrgyzstan laos latvia lebanon lesotho liberia libya
liechtenstein lithuania luxembourg madagascar malawi malaysia maldives mali malta mauritania mauritius mexico
micronesia moldova monaco mongolia montenegro morocco mozambique myanmar namibia nauru nepal netherlands
nicaragua niger nigeria norway oman pakistan palau panama paraguay peru philippines poland portugal qatar romania
russia rwanda samoa senegal serbia seychelles singapore slovakia slovenia somalia spain sudan suriname sweden
switzerland syria taiwan tajikistan tanzania thailand togo tonga tunisia turkey turkmenistan tuvalu uganda ukraine
uruguay uzbekistan vanuatu vietnam yemen zambia zimbabwe`;

const MULTI_WORD_COUNTRIES = [
  "antigua and barbuda", "burkina faso", "cabo verde", "cape verde", "central african republic", "costa rica",
  "dominican republic", "el salvador", "equatorial guinea", "ivory coast", "marshall islands", "new zealand",
  "north korea", "north macedonia", "papua new guinea", "puerto rico", "saint lucia", "san marino",
  "saudi arabia", "sierra leone", "solomon islands", "south africa", "south sudan", "sri lanka",
  "timor-leste", "trinidad and tobago", "united arab emirates", "united kingdom",
];

export const COUNTRIES: Record<string, string> = {
  ...Object.fromEntries(
    [...COUNTRY_NAMES.split(/\s+/), ...MULTI_WORD_COUNTRIES].map((name) => [name, titleCase(name)]),
  ),
  ...COUNTRY_ALIASES,
};

// Major cities outside the United States, to their country. A city that also
// exists in the data is matched as that city first, so these never hide a stay.
const WORLD_CITIES: Record<string, string> = {
  tokyo: "Japan", kyoto: "Japan", osaka: "Japan", sapporo: "Japan", okinawa: "Japan",
  paris: "France", lyon: "France", marseille: "France", bordeaux: "France",
  london: "United Kingdom", edinburgh: "United Kingdom", liverpool: "United Kingdom",
  rome: "Italy", milan: "Italy", "amalfi coast": "Italy", tuscany: "Italy",
  barcelona: "Spain", madrid: "Spain", seville: "Spain", ibiza: "Spain", mallorca: "Spain",
  lisbon: "Portugal", porto: "Portugal", berlin: "Germany", munich: "Germany", hamburg: "Germany",
  amsterdam: "Netherlands", brussels: "Belgium", vienna: "Austria", zurich: "Switzerland", geneva: "Switzerland",
  prague: "Czechia", budapest: "Hungary", warsaw: "Poland", krakow: "Poland", copenhagen: "Denmark",
  stockholm: "Sweden", oslo: "Norway", helsinki: "Finland", reykjavik: "Iceland", dublin: "Ireland",
  santorini: "Greece", mykonos: "Greece", istanbul: "Turkey", dubrovnik: "Croatia",
  moscow: "Russia", "st petersburg": "Russia", dubai: "United Arab Emirates", "abu dhabi": "United Arab Emirates",
  doha: "Qatar", "tel aviv": "Israel", jerusalem: "Israel", cairo: "Egypt", marrakech: "Morocco",
  "cape town": "South Africa", johannesburg: "South Africa", nairobi: "Kenya", zanzibar: "Tanzania",
  mumbai: "India", delhi: "India", "new delhi": "India", goa: "India", bangalore: "India", jaipur: "India",
  bangkok: "Thailand", phuket: "Thailand", "chiang mai": "Thailand", bali: "Indonesia", jakarta: "Indonesia",
  singapore: "Singapore", "kuala lumpur": "Malaysia", hanoi: "Vietnam", "ho chi minh city": "Vietnam",
  manila: "Philippines", seoul: "South Korea", busan: "South Korea", beijing: "China", shanghai: "China",
  "hong kong": "China", taipei: "Taiwan", sydney: "Australia", melbourne: "Australia", brisbane: "Australia",
  perth: "Australia", auckland: "New Zealand", queenstown: "New Zealand", toronto: "Canada",
  vancouver: "Canada", montreal: "Canada", "quebec city": "Canada", banff: "Canada", whistler: "Canada",
  "mexico city": "Mexico", cancun: "Mexico", tulum: "Mexico", "cabo san lucas": "Mexico", "puerto vallarta": "Mexico",
  havana: "Cuba", "rio de janeiro": "Brazil", "sao paulo": "Brazil", "buenos aires": "Argentina",
  lima: "Peru", cusco: "Peru", santiago: "Chile", bogota: "Colombia", cartagena: "Colombia", medellin: "Colombia",
};

// Every place name to { label shown on the chip, country to filter on }.
export const WORLD_PLACES: Record<string, { label: string; country: string }> = {
  ...Object.fromEntries(
    Object.entries(COUNTRIES).map(([name, country]) => [
      name,
      { label: country === HOME_COUNTRY ? HOME_COUNTRY : titleCase(name.length <= 4 ? country : name), country },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(WORLD_CITIES).map(([name, country]) => [name, { label: titleCase(name), country }]),
  ),
};

export const STATE_NAMES = Object.fromEntries(
  Object.entries(STATES).map(([name, code]) => [code, titleCase(name)]),
);
