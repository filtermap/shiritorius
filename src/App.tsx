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
  const headerHeight = "48px";
  const columnHeight = `calc(100vh - ${headerHeight})`;
  return (
    <div>
      <div
        style={{
          background: "rgb(0,0,0)",
          color: "rgb(255,255,255)",
          fontSize: "16px",
          height: headerHeight,
          lineHeight: headerHeight,
          padding: "0 16px"
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

const selectorItemStyle = {
  cursor: "pointer",
  fontSize: "16px",
  padding: "8px"
};

type GyoSelectorProps = {
  gyo: string | null;
  createGyoSelector: (gyo: string) => () => void;
};

const GyoSelector = (props: GyoSelectorProps): JSX.Element => (
  <div>
    {[...Yomi.gyoToKatakanaMap.keys()].map(gyo => (
      <div
        key={gyo}
        onClick={props.createGyoSelector(gyo)}
        style={{
          ...selectorItemStyle,
          fontWeight: gyo === props.gyo ? "bold" : "normal"
        }}
      >
        {gyo}行
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
        <div
          key={prefix}
          onClick={props.createPrefixSelector(prefix)}
          style={{
            ...selectorItemStyle,
            fontWeight: prefix === props.prefix ? "bold" : "normal"
          }}
        >
          {prefix}～
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
        <div
          key={length}
          onClick={props.createLengthSelector(length)}
          style={{
            ...selectorItemStyle,
            fontWeight: length === props.length ? "bold" : "normal"
          }}
        >
          {length}字
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
        <div
          key={yomi.id}
          onClick={props.createYomiSelector(yomi)}
          style={{
            ...selectorItemStyle,
            fontWeight: yomi === props.yomi ? "bold" : "normal"
          }}
        >
          {yomi.katakana}
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
      <div
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          padding: "8px"
        }}
      >
        {props.yomi.katakana}
      </div>
      <div
        style={{
          fontSize: "16px",
          padding: "8px"
        }}
      >
        {props.yomi.homonyms.map(hononym => (
          <React.Fragment key={hononym.id}>
            {`【${hononym.word}】［${hononym.partOfSpeech}］`}
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default App;
