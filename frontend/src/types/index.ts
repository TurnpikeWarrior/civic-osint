export interface MemberTerm {
  chamber: string;
  congress: number;
  district?: number;
  startYear: number;
  endYear?: number;
}

export interface MemberParty {
  partyName: string;
  partyAbbreviation: string;
}

export interface MemberDetails {
  bioguideId: string;
  directOrderName: string;
  firstName: string;
  lastName: string;
  state: string;
  partyHistory: MemberParty[];
  terms: MemberTerm[];
  depiction?: {
    imageUrl: string;
  };
  officialWebsiteUrl?: string;
  addressInformation?: {
    officeAddress?: string;
    phoneNumber?: string;
  };
}

export interface BillSummary {
  type: string;
  number: string;
  title: string;
  introducedDate: string;
  congress?: number;
  latestAction?: {
    text: string;
  };
}

export interface MemberVote {
  legislation: string;
  legislationUrl?: string;
  legislationTitle: string;
  congress: number;
  type: string;
  number: string;
  question: string;
  vote: string;
  result: string;
  date: string;
}

export interface MemberData {
  details: MemberDetails;
  bills: BillSummary[];
  votes: MemberVote[];
}

export interface BillAction {
  actionDate: string;
  text: string;
}

export interface BillSponsor {
  fullName: string;
  bioguideId: string;
  party: string;
  state: string;
  lastName?: string;
}

export interface BillData {
  details: {
    title: string;
    introducedDate: string;
    sponsors: BillSponsor[];
    latestAction?: {
      text: string;
    };
    summary?: {
      text: string;
    };
  };
  actions: BillAction[];
  cosponsors: BillSponsor[];
  text: any[];
  ai_summary?: string;
}

export interface RegistryConversation {
  id: string;
  title: string;
  created_at: string;
  bioguide_id?: string;
  position: number;
  type: 'conversation';
}

export interface RegistryTrackedBill {
  id: string; // The bill_id used as a unified key
  bill_id: string;
  bill_type: string;
  bill_number: string;
  congress: number;
  title: string;
  created_at: string;
  position: number;
  type: 'bill';
}

export type RegistryItem = RegistryConversation | RegistryTrackedBill;
