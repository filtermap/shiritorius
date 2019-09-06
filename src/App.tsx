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
  const headerHeight = "24px";
  const columnHeight = `calc(100vh - ${headerHeight})`;
  return (
    <div>
      <div
        style={{
          background: "rgb(0,0,0)",
          color: "rgb(255,255,255)",
          fontSize: "12px",
          height: headerHeight,
          lineHeight: headerHeight,
          textAlign: "center"
        }}
      >
        シリトリウス - Shiritorius
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ height: columnHeight, overflowY: "auto" }}>
          <GyoSelector gyo={state.gyo} createGyoSelector={createGyoSelector} />
        </div>
        <div style={{ height: columnHeight, overflowY: "auto" }}>
          <PrefixSelector
            gyo={state.gyo}
            prefix={state.prefix}
            createPrefixSelector={createPrefixSelector}
          />
        </div>
        <div style={{ height: columnHeight, overflowY: "auto" }}>
          <LengthSelector
            yomis={props.yomis}
            prefix={state.prefix}
            length={state.length}
            createLengthSelector={createLengthSelector}
          />
        </div>
        <div style={{ height: columnHeight, overflowY: "auto" }}>
          <YomiSelector
            yomis={props.yomis}
            prefix={state.prefix}
            length={state.length}
            yomi={state.yomi}
            createYomiSelector={createYomiSelector}
          />
        </div>
        <div style={{ height: columnHeight, overflowY: "auto" }}>
          <YomiDisplay yomi={state.yomi} />
        </div>
      </div>
    </div>
  );
};

type GyoSelectorProps = {
  gyo: string | null;
  createGyoSelector: (gyo: string) => () => void;
};

const GyoSelector = (props: GyoSelectorProps): JSX.Element => (
  <div>
    {[...Yomi.gyoToKatakanaMap.keys()].map(gyo => (
      <div key={gyo}>
        <button
          onClick={props.createGyoSelector(gyo)}
          style={{ fontWeight: gyo === props.gyo ? "bold" : "normal" }}
        >
          {gyo}行
        </button>
      </div>
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
        <div key={prefix}>
          <button
            onClick={props.createPrefixSelector(prefix)}
            style={{ fontWeight: prefix === props.prefix ? "bold" : "normal" }}
          >
            {prefix}～
          </button>
        </div>
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
        <div key={length}>
          <button
            onClick={props.createLengthSelector(length)}
            style={{ fontWeight: length === props.length ? "bold" : "normal" }}
          >
            {length}字
          </button>
        </div>
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
  yomisByPrefixAndLength.sort((a, b) => (a.katakana < b.katakana ? -1 : 1));
  return (
    <div>
      {yomisByPrefixAndLength.map(yomi => (
        <div key={yomi.id}>
          <button
            onClick={props.createYomiSelector(yomi)}
            style={{ fontWeight: yomi === props.yomi ? "bold" : "normal" }}
          >
            {yomi.katakana}
          </button>
        </div>
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
      <div style={{ fontWeight: "bold" }}>{props.yomi.katakana}</div>
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
