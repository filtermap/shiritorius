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
  const onClickReset = (): void => {
    setState({ gyo: null, prefix: null, length: null, yomi: null });
  };
  const onClickGyo = (gyo: string) => (): void => {
    setState({ gyo, prefix: null, length: null, yomi: null });
  };
  const onClickPrefix = (prefix: string) => (): void => {
    setState({ ...state, prefix, length: null, yomi: null });
  };
  const onClickLength = (length: number) => (): void => {
    setState({ ...state, length, yomi: null });
  };
  const onClickYomi = (yomi: Yomi.Yomi) => (): void => {
    setState({ ...state, yomi });
  };
  return (
    <>
      <div>
        <button onClick={onClickReset}>
          シリトリウス - Shiritorius で探す
        </button>
      </div>
      {state.gyo && (
        <div>
          <button onClick={onClickGyo(state.gyo)}>{state.gyo}行の</button>
        </div>
      )}
      {state.prefix && (
        <div>
          <button onClick={onClickPrefix(state.prefix)}>
            「{state.prefix}」から始まる
          </button>
        </div>
      )}
      {state.length && (
        <div>
          <button onClick={onClickLength(state.length)}>
            {state.length}文字のことば
          </button>
        </div>
      )}
      {!state.gyo && <GyoSelector onClickGyo={onClickGyo} />}
      {state.gyo && !state.prefix && (
        <PrefixSelector gyo={state.gyo} onClickPrefix={onClickPrefix} />
      )}
      {state.prefix && !state.length && (
        <LengthSelector
          prefix={state.prefix}
          yomis={props.yomis}
          onClickLength={onClickLength}
        />
      )}
      {state.prefix && state.length && !state.yomi && (
        <YomiSelector
          prefix={state.prefix}
          length={state.length}
          yomis={props.yomis}
          onClickYomi={onClickYomi}
        />
      )}
      {state.yomi && (
        <div>
          <div>{state.yomi.katakana}</div>
          <div>
            {state.yomi.homonyms.map(hononym => (
              <div
                key={hononym.id}
              >{`【${hononym.word}】［${hononym.partOfSpeech}］`}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

type GyoSelectorProps = {
  onClickGyo: (gyo: string) => () => void;
};

const GyoSelector = (props: GyoSelectorProps): JSX.Element => {
  return (
    <div>
      {[...Yomi.gyoToKatakanaMap.keys()].map(gyo => (
        <button key={gyo} onClick={props.onClickGyo(gyo)}>
          {gyo}行の
        </button>
      ))}
    </div>
  );
};

type PrefixSelectorProps = {
  gyo: string;
  onClickPrefix: (prefix: string) => () => void;
};

const PrefixSelector = (props: PrefixSelectorProps): JSX.Element => {
  const katakana = Yomi.gyoToKatakanaMap.get(props.gyo);
  if (!katakana) throw new Error("!katakana");
  return (
    <div>
      {[...katakana].map(prefix => (
        <button key={prefix} onClick={props.onClickPrefix(prefix)}>
          「{prefix}」から始まる
        </button>
      ))}
    </div>
  );
};

type LengthSelectorProps = {
  prefix: string;
  yomis: Yomi.Yomi[];
  onClickLength: (length: number) => () => void;
};

const LengthSelector = (props: LengthSelectorProps): JSX.Element => {
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
        <button key={length} onClick={props.onClickLength(length)}>
          {length}文字のことば
        </button>
      ))}
    </div>
  );
};

type YomiSelectorProps = {
  prefix: string;
  length: number;
  yomis: Yomi.Yomi[];
  onClickYomi: (yomi: Yomi.Yomi) => () => void;
};

const YomiSelector = (props: YomiSelectorProps): JSX.Element => {
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
        <button key={yomi.id} onClick={props.onClickYomi(yomi)}>
          {yomi.katakana}
        </button>
      ))}
    </div>
  );
};

export default App;
