export interface SpellBase {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  classes: string[];
  source: string;
}

export interface Spell extends SpellBase {
  index: string;
  desc: string;
  higherLevel?: string;
  page?: string;
  components: string[];
  material?: string;
  canBeCastAsRitual: boolean;
  duration: string;
  requiresConcentration: boolean;
  levelLabel: string;
  archetype?: string;
  circles?: string;
  url: string;
}
