export interface Word {
  word: string;
  pos: string;
  level: string | null;
  ox3000: boolean;
  ox5000: boolean;
  slug: string;
  definition_url: string;
  ipa_uk: string | null;
  ipa_us: string | null;
  audio_uk_mp3: string | null;
  audio_uk_ogg: string | null;
  audio_us_mp3: string | null;
  audio_us_ogg: string | null;
}
