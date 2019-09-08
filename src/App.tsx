import React from "react";
import styled from "@emotion/styled";
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

const headerHeight = "48px";
const Header = styled.div`
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  font-size: 16px;
  height: ${headerHeight};
  line-height: ${headerHeight};
  padding: 0 16px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
`;

const Column = styled.div`
  height: calc(100vh - ${headerHeight});
  overflow-y: auto;
`;

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
    <div>
      <Header>シリトリウス - Shiritorius</Header>
      <Content>
        <Column>
          <GyoSelector gyo={state.gyo} createGyoSelector={createGyoSelector} />
        </Column>
        <Column>
          <PrefixSelector
            gyo={state.gyo}
            prefix={state.prefix}
            createPrefixSelector={createPrefixSelector}
          />
        </Column>
        <Column>
          <LengthSelector
            yomis={props.yomis}
            prefix={state.prefix}
            length={state.length}
            createLengthSelector={createLengthSelector}
          />
        </Column>
        <Column>
          <YomiSelector
            yomis={props.yomis}
            prefix={state.prefix}
            length={state.length}
            yomi={state.yomi}
            createYomiSelector={createYomiSelector}
          />
        </Column>
        <Column>
          <YomiDisplay yomi={state.yomi} />
        </Column>
      </Content>
    </div>
  );
};

type SelectorItemProps = {
  bold: boolean;
};

const SelectorItem = styled.div<SelectorItemProps>`
  cursor: pointer;
  font-size: 16px;
  font-weight: ${(props): string => (props.bold ? "bold" : "normal")};
  padding: 8px;
`;

type GyoSelectorProps = {
  gyo: string | null;
  createGyoSelector: (gyo: string) => () => void;
};

const GyoSelector = (props: GyoSelectorProps): JSX.Element => (
  <div>
    {[...Yomi.gyoToKatakanaMap.keys()].map(gyo => (
      <SelectorItem
        key={gyo}
        onClick={props.createGyoSelector(gyo)}
        bold={gyo === props.gyo}
      >
        {gyo}行
      </SelectorItem>
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
        <SelectorItem
          key={prefix}
          onClick={props.createPrefixSelector(prefix)}
          bold={prefix === props.prefix}
        >
          {prefix}～
        </SelectorItem>
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
        <SelectorItem
          key={length}
          onClick={props.createLengthSelector(length)}
          bold={length === props.length}
        >
          {length}字
        </SelectorItem>
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
        <SelectorItem
          key={yomi.id}
          onClick={props.createYomiSelector(yomi)}
          bold={yomi === props.yomi}
        >
          {yomi.katakana}
        </SelectorItem>
      ))}
    </div>
  );
};

type YomiDisplayProps = {
  yomi: Yomi.Yomi | null;
};

const YomiKatakana = styled.div`
  font-size: 16px;
  font-weight: bold;
  padding: 8px;
`;

const YomiHomonyms = styled.div`
  font-size: 16px;
  padding: 8px;
`;

const YomiDisplay = (props: YomiDisplayProps): JSX.Element => {
  if (!props.yomi) return <></>;
  return (
    <div>
      <YomiKatakana>{props.yomi.katakana}</YomiKatakana>
      <YomiHomonyms>
        {props.yomi.homonyms.map(hononym => (
          <React.Fragment key={hononym.id}>
            {`【${hononym.word}】［${hononym.partOfSpeech}］`}
            <br />
          </React.Fragment>
        ))}
      </YomiHomonyms>
    </div>
  );
};

export default App;
