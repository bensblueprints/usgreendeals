export type LegalStatus =
  | 'legal'
  | 'legal-mmj'
  | 'legal-gray'
  | 'legal-restricted'
  | 'gray-area'
  | 'illegal';

export interface StateData {
  name: string;
  abbreviation: string;
  status: LegalStatus;
  description: string;
}

export const statusColors: Record<LegalStatus, string> = {
  'legal': '#22c55e',           // Green
  'legal-mmj': '#eab308',       // Yellow
  'legal-gray': '#f97316',      // Orange
  'legal-restricted': '#a3e635', // Lime
  'gray-area': '#9ca3af',       // Gray
  'illegal': '#ef4444',         // Red
};

export const statusLabels: Record<LegalStatus, string> = {
  'legal': 'Legal',
  'legal-mmj': 'Legal (MMJ Card Required)',
  'legal-gray': 'Legal (Gray Area)',
  'legal-restricted': 'Legal (Restricted)',
  'gray-area': 'Gray Area',
  'illegal': 'Illegal',
};

export const stateData: Record<string, StateData> = {
  AL: {
    name: 'Alabama',
    abbreviation: 'AL',
    status: 'legal-gray',
    description: 'The legality of THCa in Alabama is uncertain due to vague or inconsistent enforcement practices. Some retailers may sell it openly, but possession could still result in legal scrutiny. Consumers should proceed with caution and seek legal advice if unsure.',
  },
  AK: {
    name: 'Alaska',
    abbreviation: 'AK',
    status: 'legal',
    description: 'THCa is legal if derived from hemp and stays below the 0.3% Delta 9 THC threshold. It\'s widely available in licensed retail stores. However, heating it into THC could bring different legal implications.',
  },
  AZ: {
    name: 'Arizona',
    abbreviation: 'AZ',
    status: 'legal',
    description: 'Arizona permits hemp-derived cannabinoids including THCa. Products must stay under the federal THC limit to remain legal. Use that results in psychoactive THC could be regulated under marijuana laws.',
  },
  AR: {
    name: 'Arkansas',
    abbreviation: 'AR',
    status: 'legal',
    description: 'Arkansas allows hemp-derived THCa under federal guidelines. Dispensaries may offer THCa products within the THC limit. Consumers should monitor potency if planning to smoke or heat the compound.',
  },
  CA: {
    name: 'California',
    abbreviation: 'CA',
    status: 'legal',
    description: 'California has fully legalized cannabis, including THCa. Both recreational and medical consumers have access to THCa flower and concentrates. No restriction applies to decarboxylated (heated) use.',
  },
  CO: {
    name: 'Colorado',
    abbreviation: 'CO',
    status: 'legal',
    description: 'Colorado permits all forms of cannabis, including THCa. Products can be sold, possessed, and consumed both recreationally and medically. THCa diamonds and vapes are widely available.',
  },
  CT: {
    name: 'Connecticut',
    abbreviation: 'CT',
    status: 'legal',
    description: 'THCa is treated as legal under Connecticut\'s hemp laws and cannabis reforms. Recreational and medical users can purchase and use THCa. Converting it to THC by heat does not impact legality due to full legalization.',
  },
  DE: {
    name: 'Delaware',
    abbreviation: 'DE',
    status: 'legal',
    description: 'Delaware recognizes hemp-derived cannabinoids including THCa. Consumers can use THCa legally under the state\'s broader cannabis program. Heating the compound is not an issue for adult users.',
  },
  FL: {
    name: 'Florida',
    abbreviation: 'FL',
    status: 'legal-mmj',
    description: 'Only registered medical marijuana patients can legally access THCa in Florida. It\'s available through dispensaries in flower and concentrate form. Recreational possession or use remains illegal.',
  },
  GA: {
    name: 'Georgia',
    abbreviation: 'GA',
    status: 'gray-area',
    description: 'Retailers in Georgia often sell THCa, but its legality is unclear. The state allows low-THC products under a limited medical program. Enforcement varies by jurisdiction.',
  },
  HI: {
    name: 'Hawaii',
    abbreviation: 'HI',
    status: 'legal',
    description: 'Hemp-derived THCa is allowed in Hawaii if it meets federal requirements. Recreational cannabis remains illegal, but THCa is not explicitly banned. Caution is advised for products intended for heating.',
  },
  ID: {
    name: 'Idaho',
    abbreviation: 'ID',
    status: 'illegal',
    description: 'Idaho bans all THC-related cannabinoids, including THCa, even if derived from hemp. Possession may lead to criminal penalties. The state has one of the strictest cannabis policies in the U.S.',
  },
  IL: {
    name: 'Illinois',
    abbreviation: 'IL',
    status: 'legal',
    description: 'Illinois permits both medical and recreational cannabis use. THCa products are legal regardless of form or use method. Dispensaries stock a range of THCa options including diamonds and concentrates.',
  },
  IN: {
    name: 'Indiana',
    abbreviation: 'IN',
    status: 'legal-gray',
    description: 'Indiana allows hemp-derived cannabinoids, including THCa under the Farm Bill. However, converting THCa to THC could be seen as illegal use. Buyers should verify compliance and lab test results.',
  },
  IA: {
    name: 'Iowa',
    abbreviation: 'IA',
    status: 'legal-restricted',
    description: 'Iowa permits only low-THC cannabis for medical use under strict regulation. THCa exists in a legal gray area and may be treated as marijuana if heated. Risk of enforcement is higher outside of medical channels.',
  },
  KS: {
    name: 'Kansas',
    abbreviation: 'KS',
    status: 'illegal',
    description: 'Kansas does not allow any THC analogs, including THCa. Even hemp-derived THCa is considered a controlled substance. Possession may result in arrest.',
  },
  KY: {
    name: 'Kentucky',
    abbreviation: 'KY',
    status: 'legal-gray',
    description: 'Hemp products are allowed in Kentucky, but local interpretation of THCa varies. It may be legal to possess but risky to use. Law enforcement may prosecute based on intent or heating potential.',
  },
  LA: {
    name: 'Louisiana',
    abbreviation: 'LA',
    status: 'legal-mmj',
    description: 'Medical patients can access THCa through the state\'s cannabis program. Recreational use remains prohibited. THCa products are typically dispensed in regulated pharmacies.',
  },
  ME: {
    name: 'Maine',
    abbreviation: 'ME',
    status: 'legal',
    description: 'Maine allows full adult-use cannabis, including THCa in any form. You can legally buy, possess, and heat THCa. Products are sold in both adult-use and medical dispensaries.',
  },
  MD: {
    name: 'Maryland',
    abbreviation: 'MD',
    status: 'legal',
    description: 'Following adult-use legalization, Maryland permits THCa without restriction. All forms of cannabis are legal for adults 21 and over. THCa is available in flower and extract form.',
  },
  MA: {
    name: 'Massachusetts',
    abbreviation: 'MA',
    status: 'legal',
    description: 'Massachusetts has legalized cannabis broadly, including THCa. Recreational users can possess and use THCa without limitation. Products are tested and regulated for safety.',
  },
  MI: {
    name: 'Michigan',
    abbreviation: 'MI',
    status: 'legal',
    description: 'Michigan permits THCa for both recreational and medical users. The compound is available as flower, vapes, and concentrates. No legal distinction is made between THCa and THC in this context.',
  },
  MN: {
    name: 'Minnesota',
    abbreviation: 'MN',
    status: 'legal',
    description: 'THCa is legal under Minnesota\'s new recreational cannabis law. It is treated similarly to THC, and users have access through dispensaries. Hemp-derived versions are also common.',
  },
  MS: {
    name: 'Mississippi',
    abbreviation: 'MS',
    status: 'legal-mmj',
    description: 'Only medical marijuana patients may legally purchase THCa. It is available through licensed dispensaries under the state\'s program. Possession outside the program could result in penalties.',
  },
  MO: {
    name: 'Missouri',
    abbreviation: 'MO',
    status: 'legal',
    description: 'Missouri legalized adult cannabis use, including THCa. Users can purchase and consume THCa in any form. Heating THCa is not an issue under state law.',
  },
  MT: {
    name: 'Montana',
    abbreviation: 'MT',
    status: 'legal',
    description: 'THCa is permitted as part of Montana\'s adult-use cannabis framework. Consumers can legally purchase and use it in any form. No special restrictions apply.',
  },
  NE: {
    name: 'Nebraska',
    abbreviation: 'NE',
    status: 'gray-area',
    description: 'Nebraska has not legalized cannabis, but hemp is permitted. THCa may be sold under hemp laws but remains risky to heat or smoke. Legal interpretation is inconsistent.',
  },
  NV: {
    name: 'Nevada',
    abbreviation: 'NV',
    status: 'legal',
    description: 'Nevada permits both recreational and medical cannabis. THCa is widely sold in dispensaries. Use, even when heated, is fully legal for adults 21+.',
  },
  NH: {
    name: 'New Hampshire',
    abbreviation: 'NH',
    status: 'illegal',
    description: 'New Hampshire restricts cannabis to a limited medical program. THCa is not explicitly allowed and may be treated as THC. Possession without a medical card is risky.',
  },
  NJ: {
    name: 'New Jersey',
    abbreviation: 'NJ',
    status: 'legal',
    description: 'New Jersey\'s cannabis laws allow THCa for all adults. Products are tested and labeled for compliance. Legal whether smoked, vaped, or used raw.',
  },
  NM: {
    name: 'New Mexico',
    abbreviation: 'NM',
    status: 'legal',
    description: 'All forms of cannabis, including THCa, are permitted for adults. State law treats THCa like any other cannabinoid. Available at both medical and adult-use retailers.',
  },
  NY: {
    name: 'New York',
    abbreviation: 'NY',
    status: 'legal',
    description: 'THCa is legal under New York\'s broad cannabis reform laws. Dispensaries offer high-potency THCa products. Consumers may possess and use freely.',
  },
  NC: {
    name: 'North Carolina',
    abbreviation: 'NC',
    status: 'gray-area',
    description: 'Hemp is legal, but cannabis is not in North Carolina. THCa may be sold under hemp rules but remains unprotected legally if heated. Consumers should proceed cautiously.',
  },
  ND: {
    name: 'North Dakota',
    abbreviation: 'ND',
    status: 'legal',
    description: 'Hemp-derived THCa is legal, and medical cannabis is permitted. While adult use is not fully legal, THCa in raw form is generally tolerated. Heating may blur legality lines.',
  },
  OH: {
    name: 'Ohio',
    abbreviation: 'OH',
    status: 'legal-mmj',
    description: 'THCa is accessible through Ohio\'s medical marijuana program. Registered patients may use it in raw or concentrate form. Recreational use remains illegal.',
  },
  OK: {
    name: 'Oklahoma',
    abbreviation: 'OK',
    status: 'legal',
    description: 'Oklahoma has a robust medical marijuana program allowing THCa use. The compound is available in dispensaries statewide. Possession without a medical card can still lead to legal trouble.',
  },
  OR: {
    name: 'Oregon',
    abbreviation: 'OR',
    status: 'legal',
    description: 'Oregon fully legalized cannabis, making THCa legal in all forms. Retailers offer THCa flower and concentrates for recreational use. No penalties for heating or transforming it into THC.',
  },
  PA: {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    status: 'legal-mmj',
    description: 'Only medical patients can purchase THCa in Pennsylvania. It\'s considered part of the medical cannabis system. Recreational use is not permitted.',
  },
  RI: {
    name: 'Rhode Island',
    abbreviation: 'RI',
    status: 'legal',
    description: 'THCa is legal in Rhode Island under adult-use legalization. It\'s available in dispensaries and legal to possess. Use by adults 21+ is unrestricted.',
  },
  SC: {
    name: 'South Carolina',
    abbreviation: 'SC',
    status: 'gray-area',
    description: 'THCa may be sold under hemp law but faces enforcement uncertainty. South Carolina does not have a medical cannabis program. Legal interpretation varies by county.',
  },
  SD: {
    name: 'South Dakota',
    abbreviation: 'SD',
    status: 'illegal',
    description: 'South Dakota bans most THC products including THCa. Enforcement is strict regardless of hemp origin. Possession may result in criminal charges.',
  },
  TN: {
    name: 'Tennessee',
    abbreviation: 'TN',
    status: 'gray-area',
    description: 'Tennessee allows hemp-derived products under specific limits. THCa may be sold, but heating it creates a legal risk. Best to avoid public or obvious use.',
  },
  TX: {
    name: 'Texas',
    abbreviation: 'TX',
    status: 'gray-area',
    description: 'THCa is commonly sold but not clearly legal. Enforcement varies widely by city and county. Users may face prosecution if caught with heated THCa.',
  },
  UT: {
    name: 'Utah',
    abbreviation: 'UT',
    status: 'legal-mmj',
    description: 'Only registered patients can legally use THCa in Utah. It must be purchased from a licensed medical cannabis pharmacy. Recreational use is illegal.',
  },
  VT: {
    name: 'Vermont',
    abbreviation: 'VT',
    status: 'legal',
    description: 'THCa is fully legal under Vermont\'s adult-use cannabis law. Consumers may buy, possess, and use it freely. No penalties for heating it into THC.',
  },
  VA: {
    name: 'Virginia',
    abbreviation: 'VA',
    status: 'legal',
    description: 'THCa is legal in Virginia with the same rules as cannabis. Adults may purchase and use it in any form. Both medical and recreational users have access.',
  },
  WA: {
    name: 'Washington',
    abbreviation: 'WA',
    status: 'legal',
    description: 'Washington has legalized all cannabis, including THCa. No distinction is made between THCa and THC. Available in licensed dispensaries.',
  },
  WV: {
    name: 'West Virginia',
    abbreviation: 'WV',
    status: 'illegal',
    description: 'THCa is not permitted under West Virginia law. The state has a limited medical marijuana program but does not cover THCa. Possession may lead to legal action.',
  },
  WI: {
    name: 'Wisconsin',
    abbreviation: 'WI',
    status: 'gray-area',
    description: 'Hemp-derived THCa is sold under state law, but legality is questionable. Authorities may prosecute based on use method. Buyers should exercise caution.',
  },
  WY: {
    name: 'Wyoming',
    abbreviation: 'WY',
    status: 'gray-area',
    description: 'THCa exists in a legal gray zone in Wyoming. Hemp products are allowed, but THCa\'s intoxicating potential makes it risky. Best to avoid unless clearly compliant with local rules.',
  },
};
