import React from "react";
import styled from "@emotion/styled";
import * as Yomi from "./Yomi";

type Props = {
  yomis: Yomi.Yomi[];
};

type State = {
  partsOfSpeech: string[];
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
  const partsOfSpeech = Yomi.collectPartsOfSpeech(props.yomis);
  const [state, setState] = React.useState<State>({
    partsOfSpeech,
    gyo: null,
    prefix: null,
    length: null,
    yomi: null
  });
  const createPartsOfSpeechSelector = (partOfSpeech: string) => (): void =>
    setState({
      ...state,
      partsOfSpeech: state.partsOfSpeech.includes(partOfSpeech)
        ? state.partsOfSpeech.filter(part => part !== partOfSpeech)
        : [...state.partsOfSpeech, partOfSpeech]
    });
  const createGyoSelector = (gyo: string) => (): void =>
    setState({ ...state, gyo, prefix: null, length: null, yomi: null });
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
          <PartsOfSpeechSelector
            partsOfSpeech={partsOfSpeech}
            selectedPartsOfSpeech={state.partsOfSpeech}
            createPartsOfSpeechSelector={createPartsOfSpeechSelector}
          />
        </Column>
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
            selectedPartsOfSpeech={state.partsOfSpeech}
            yomis={props.yomis}
            prefix={state.prefix}
            length={state.length}
            createLengthSelector={createLengthSelector}
          />
        </Column>
        <Column>
          <YomiSelector
            yomis={props.yomis}
            selectedPartsOfSpeech={state.partsOfSpeech}
            prefix={state.prefix}
            length={state.length}
            yomi={state.yomi}
            createYomiSelector={createYomiSelector}
          />
        </Column>
        <Column>
          <YomiDisplay
            selectedPartsOfSpeech={state.partsOfSpeech}
            yomi={state.yomi}
          />
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

type PartsOfSpeechSelectorProps = {
  partsOfSpeech: string[];
  selectedPartsOfSpeech: string[];
  createPartsOfSpeechSelector: (partOfSpeech: string) => () => void;
};

const PartsOfSpeechSelector = (
  props: PartsOfSpeechSelectorProps
): JSX.Element => (
  <div>
    {props.partsOfSpeech.map(partOfSpeech => {
      return (
        <SelectorItem
          key={partOfSpeech}
          bold={props.selectedPartsOfSpeech.includes(partOfSpeech)}
          onClick={props.createPartsOfSpeechSelector(partOfSpeech)}
        >
          {partOfSpeech}
        </SelectorItem>
      );
    })}
  </div>
);

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

const NotMet = styled.span`
  text-decoration: line-through;
`;

type LengthSelectorProps = {
  selectedPartsOfSpeech: string[];
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
  const lengthAndYomisPairs = [...lengthToYomisMap.entries()].sort(
    ([lengthA], [lengthB]) => lengthA - lengthB
  );
  return (
    <div>
      {lengthAndYomisPairs.map(([length, yomis]) => (
        <SelectorItem
          key={length}
          onClick={props.createLengthSelector(length)}
          bold={length === props.length}
        >
          {yomis.some(yomi =>
            yomi.homonyms.some(homonym =>
              props.selectedPartsOfSpeech.includes(homonym.partOfSpeech)
            )
          ) ? (
            `${length}字`
          ) : (
            <NotMet>{length}字</NotMet>
          )}
        </SelectorItem>
      ))}
    </div>
  );
};

type YomiSelectorProps = {
  yomis: Yomi.Yomi[];
  selectedPartsOfSpeech: string[];
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
          {yomi.homonyms.some(homonym =>
            props.selectedPartsOfSpeech.includes(homonym.partOfSpeech)
          ) ? (
            yomi.katakana
          ) : (
            <NotMet>{yomi.katakana}</NotMet>
          )}
        </SelectorItem>
      ))}
    </div>
  );
};

type YomiDisplayProps = {
  selectedPartsOfSpeech: string[];
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
        {props.yomi.homonyms.map(homonym => (
          <React.Fragment key={homonym.id}>
            {props.selectedPartsOfSpeech.includes(homonym.partOfSpeech) ? (
              `【${homonym.word}】［${homonym.partOfSpeech}］`
            ) : (
              <NotMet>
                【{homonym.word}】［{homonym.partOfSpeech}］
              </NotMet>
            )}
            <br />
          </React.Fragment>
        ))}
      </YomiHomonyms>
    </div>
  );
};

export default App;
