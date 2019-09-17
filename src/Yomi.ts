export const katakanaOnlyRegExp = /^[ァ-ヺー]+$/;

export const hiraganaToKatakana = (string: string): string =>
  string.replace(/[ぁ-ゖ]/g, match =>
    String.fromCharCode(match.charCodeAt(0) + 96)
  );

export const extractKatakana = (string: string): string[] =>
  string.split(/[^ァ-ヺー]/).filter(string => string.length > 0);

export type Yomi = {
  id: number;
  katakana: string;
  homonyms: Homonym[];
};

export type Homonym = {
  id: number;
  word: string;
  partOfSpeech: string;
};

export const sortByKatakana = (yomiList: Yomi[]): Yomi[] =>
  [...yomiList].sort((a, b) => (a.katakana < b.katakana ? -1 : 1));

export function collectPartsOfSpeech(yomiList: Yomi[]): string[] {
  const partOfSpeechSet = new Set<string>();
  for (const yomi of yomiList) {
    for (const { partOfSpeech } of yomi.homonyms) {
      partOfSpeechSet.add(partOfSpeech);
    }
  }
  return [...partOfSpeechSet.values()];
}
