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
  const onClickReset = (): void =>
    setState({ gyo: null, prefix: null, length: null, yomi: null });
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
      <div>
        <button onClick={onClickReset}>
          シリトリウス - Shiritorius で探す
        </button>
      </div>
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
    </>
  );
};

type GyoSelectorProps = {
  gyo: string | null;
  createGyoSelector: (gyo: string) => () => void;
};

const GyoSelector = (props: GyoSelectorProps): JSX.Element => {
  if (props.gyo)
    return (
      <div>
        <button onClick={props.createGyoSelector(props.gyo)}>
          {props.gyo}行の
        </button>
      </div>
    );
  return (
    <div>
      {[...Yomi.gyoToKatakanaMap.keys()].map(gyo => (
        <button key={gyo} onClick={props.createGyoSelector(gyo)}>
          {gyo}行の
        </button>
      ))}
    </div>
  );
};

type PrefixSelectorProps = {
  gyo: string | null;
  prefix: string | null;
  createPrefixSelector: (prefix: string) => () => void;
};

const PrefixSelector = (props: PrefixSelectorProps): JSX.Element => {
  if (!props.gyo) return <></>;
  if (props.prefix)
    return (
      <div>
        <button onClick={props.createPrefixSelector(props.prefix)}>
          「{props.prefix}」から始まる
        </button>
      </div>
    );
  const katakana = Yomi.gyoToKatakanaMap.get(props.gyo);
  if (!katakana) throw new Error("!katakana");
  return (
    <div>
      {[...katakana].map(prefix => (
        <button key={prefix} onClick={props.createPrefixSelector(prefix)}>
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
  if (props.length)
    return (
      <div>
        <button onClick={props.createLengthSelector(length)}>
          {props.length}文字のことば
        </button>
      </div>
    );
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
        <button key={length} onClick={props.createLengthSelector(length)}>
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
  if (props.yomi)
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
        <button key={yomi.id} onClick={props.createYomiSelector(yomi)}>
          {yomi.katakana}
        </button>
      ))}
    </div>
  );
};

export default App;
