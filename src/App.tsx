import React from "react";
import * as Yomi from "./Yomi";

type Props = {
  yomis: Yomi.Yomi[];
};

type State = {
  gyo: string | null;
  prefix: string | null;
  length: number | null;
  yomi: Yomi.Yomi | null;
};

const App = (props: Props): JSX.Element => {
  const [state, setState] = React.useState<State>({
    gyo: null,
    prefix: null,
    length: null,
    yomi: null
  });
  const createGyoSelector = (gyo: string) => (): void =>
    setState({ gyo, prefix: null, length: null, yomi: null });
  const createPrefixSelector = (prefix: string) => (): void =>
    setState({ ...state, prefix, length: null, yomi: null });
  const createLengthSelector = (length: number) => (): void =>
    setState({ ...state, length, yomi: null });
  const createYomiSelector = (yomi: Yomi.Yomi) => (): void =>
    setState({ ...state, yomi });
  return (
    <>
      <h1>シリトリウス - Shiritorius</h1>
      <GyoSelector gyo={state.gyo} createGyoSelector={createGyoSelector} />
      <PrefixSelector
        gyo={state.gyo}
        prefix={state.prefix}
        createPrefixSelector={createPrefixSelector}
      />
      <LengthSelector
        yomis={props.yomis}
        prefix={state.prefix}
        length={state.length}
        createLengthSelector={createLengthSelector}
      />
      <YomiSelector
        yomis={props.yomis}
        prefix={state.prefix}
        length={state.length}
        yomi={state.yomi}
        createYomiSelector={createYomiSelector}
      />
      <YomiDisplay yomi={state.yomi} />
    </>
  );
};

type GyoSelectorProps = {
  gyo: string | null;
  createGyoSelector: (gyo: string) => () => void;
};

const GyoSelector = (props: GyoSelectorProps): JSX.Element => (
  <div>
    {[...Yomi.gyoToKatakanaMap.keys()].map(gyo => (
      <button
        key={gyo}
        onClick={props.createGyoSelector(gyo)}
        style={{ fontWeight: gyo === props.gyo ? "bold" : "normal" }}
      >
        {gyo}行の
      </button>
    ))}
  </div>
);

type PrefixSelectorProps = {
  gyo: string | null;
  prefix: string | null;
  createPrefixSelector: (prefix: string) => () => void;
};

const PrefixSelector = (props: PrefixSelectorProps): JSX.Element => {
  if (!props.gyo) return <></>;
  const katakana = Yomi.gyoToKatakanaMap.get(props.gyo);
  if (!katakana) throw new Error("!katakana");
  return (
    <div>
      {[...katakana].map(prefix => (
        <button
          key={prefix}
          onClick={props.createPrefixSelector(prefix)}
          style={{ fontWeight: prefix === props.prefix ? "bold" : "normal" }}
        >
          「{prefix}」から始まる
        </button>
      ))}
    </div>
  );
};

type LengthSelectorProps = {
  yomis: Yomi.Yomi[];
  prefix: string | null;
  length: number | null;
  createLengthSelector: (length: number) => () => void;
};

const LengthSelector = (props: LengthSelectorProps): JSX.Element => {
  if (!props.prefix) return <></>;
  const yomisByPrefix = Yomi.createPrefixToYomisMap(props.yomis).get(
    props.prefix
  );
  if (!yomisByPrefix || yomisByPrefix.length === 0)
    return <div>ことばが見つかりません</div>;
  const lengthToYomisMap = Yomi.createLengthToYomisMap(yomisByPrefix);
  const lengths = [...lengthToYomisMap.keys()].sort((a, b) => a - b);
  return (
    <div>
      {lengths.map(length => (
        <button
          key={length}
          onClick={props.createLengthSelector(length)}
          style={{ fontWeight: length === props.length ? "bold" : "normal" }}
        >
          {length}文字のことば
        </button>
      ))}
    </div>
  );
};

type YomiSelectorProps = {
  yomis: Yomi.Yomi[];
  prefix: string | null;
  length: number | null;
  yomi: Yomi.Yomi | null;
  createYomiSelector: (yomi: Yomi.Yomi) => () => void;
};

const YomiSelector = (props: YomiSelectorProps): JSX.Element => {
  if (!props.prefix || !props.length) return <></>;

  const yomisByPrefix = Yomi.createPrefixToYomisMap(props.yomis).get(
    props.prefix
  );
  if (!yomisByPrefix || yomisByPrefix.length === 0)
    return <div>ことばが見つかりません</div>;
  const yomisByPrefixAndLength = Yomi.createLengthToYomisMap(yomisByPrefix).get(
    props.length
  );
  if (!yomisByPrefixAndLength || yomisByPrefixAndLength.length === 0)
    throw new Error(
      "!yomisByPrefixAndLength || yomisByPrefixAndLength.length === 0"
    );
  yomisByPrefixAndLength.sort((a, b) => a.id - b.id);
  return (
    <div>
      {yomisByPrefixAndLength.map(yomi => (
        <button
          key={yomi.id}
          onClick={props.createYomiSelector(yomi)}
          style={{ fontWeight: yomi === props.yomi ? "bold" : "normal" }}
        >
          {yomi.katakana}
        </button>
      ))}
    </div>
  );
};

type YomiDisplayProps = {
  yomi: Yomi.Yomi | null;
};

const YomiDisplay = (props: YomiDisplayProps): JSX.Element => {
  if (!props.yomi) return <></>;
  return (
    <div>
      <div>{props.yomi.katakana}</div>
      <div>
        {props.yomi.homonyms.map(hononym => (
          <div
            key={hononym.id}
          >{`【${hononym.word}】［${hononym.partOfSpeech}］`}</div>
        ))}
      </div>
    </div>
  );
};

export default App;
