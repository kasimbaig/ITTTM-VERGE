export interface CardOption {
  label: string;
  value: any;
}

export interface Card {
  label: string;
  selectedOption: any;
  options: CardOption[];
}

export interface HeaderItem {
  original_date: string;
  amendment_date: string;
  issue_date: string;
  [key: string]: any;
}
