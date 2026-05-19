export interface ItemBase {
  id: string;
  name: string;
  type: string;
  rarity: string;
  requiresAttunement?: string;
  source: string;
}

export interface Item extends ItemBase {
  index: string;
  desc: string;
  documentUrl?: string;
  url: string;
}
