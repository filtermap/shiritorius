export const katakana =
  "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶヷヸヹヺー";

export const katakanaOnlyRegexp = /^[ァ-ヺー]+$/;

export const gyoToKatakanaMap = new Map<string, string>([
  ["ア", "ァアィイゥウェエォオ"],
  ["カ", "カガキギクグケゲコゴヵヶ"],
  ["サ", "サザシジスズセゼソゾ"],
  ["タ", "タダチヂッツヅテデトド"],
  ["ナ", "ナニヌネノ"],
  ["ハ", "ハバパヒビピフブプヘベペホボポ"],
  ["マ", "マミムメモ"],
  ["ヤ", "ャヤュユョヨ"],
  ["ラ", "ラリルレロ"],
  ["ワー", "ヮワヰヱヲンヴヷヸヹヺー"]
]);

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

export type PrefixToYomisMap = Map<string, Yomi[]>;

export function createPrefixToYomisMap(yomis: Yomi[]): PrefixToYomisMap {
  const map: PrefixToYomisMap = new Map();
  for (const yomi of yomis) {
    const [prefix] = yomi.katakana;
    const yomisByPrefix = map.get(prefix);
    if (!yomisByPrefix) {
      map.set(prefix, [yomi]);
      continue;
    }
    yomisByPrefix.push(yomi);
  }
  return map;
}

export type LengthToYomisMap = Map<number, Yomi[]>;

export function createLengthToYomisMap(yomis: Yomi[]): LengthToYomisMap {
  const map: LengthToYomisMap = new Map();
  for (const yomi of yomis) {
    const { length } = yomi.katakana;
    const yomisByLength = map.get(length);
    if (!yomisByLength) {
      map.set(length, [yomi]);
      continue;
    }
    yomisByLength.push(yomi);
  }
  return map;
}