/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/core";
import * as Yomi from "./Yomi";
import copyingUrl from "./COPYING.txt";

const createKatakanaRegExpTester = (
  regExp: RegExp
): ((yomi: Yomi.Yomi) => boolean) => (yomi): boolean =>
  regExp.test(yomi.katakana);

const InputKatakanaList = (props: {
  defaultValue: string[];
  label: string;
  onChange: (katakanaList: string[]) => void;
}): JSX.Element => (
  <div
    css={css`
      padding: 0.5rem 1rem;
    `}
  >
    <input
      type="text"
      defaultValue={props.defaultValue}
      onChange={(event): void =>
        props.onChange(
          Yomi.extractKatakana(Yomi.hiraganaToKatakana(event.target.value))
        )
      }
    />{" "}
    {props.label}
  </div>
);

const lengthComparisonOperators = ["文字以内", "文字", "文字以上"] as const;
type LengthComparisonOperator = typeof lengthComparisonOperators[number];
// https://stackoverflow.com/questions/56565528/typescript-const-assertions-how-to-use-array-prototype-includes/56745484#56745484
declare global {
  interface ReadonlyArray<T> {
    includes<U>(x: U & ((T & U) extends never ? never : unknown)): boolean;
  }
}
const isLengthComparisonOperator = (
  string: string
): string is LengthComparisonOperator =>
  lengthComparisonOperators.includes(string);

const InputLength = (props: {
  defaultLength: number | null;
  defaultLengthComparisonOperator: LengthComparisonOperator;
  onChangeLength: (length: number | null) => void;
  onChangeLengthComparisonOperator: (
    lengthComparisonOperator: LengthComparisonOperator
  ) => void;
}): JSX.Element => (
  <div
    css={css`
      padding: 0.5rem 1rem;
    `}
  >
    <input
      type="number"
      defaultValue={props.defaultLength ? props.defaultLength.toString() : ""}
      min={1}
      onChange={(event): void => {
        const length = parseInt(event.target.value, 10);
        if (!Number.isInteger(length) || length < 1)
          return props.onChangeLength(null);
        props.onChangeLength(length);
      }}
    />{" "}
    <select
      defaultValue={props.defaultLengthComparisonOperator}
      onChange={(event): void => {
        const lengthComparisonOperator = event.target.value;
        if (!isLengthComparisonOperator(lengthComparisonOperator)) return;
        props.onChangeLengthComparisonOperator(lengthComparisonOperator);
      }}
    >
      {lengthComparisonOperators.map(operator => (
        <option key={operator} value={operator}>
          {operator}
        </option>
      ))}
    </select>{" "}
    の
  </div>
);

const PartsOfSpeechSelector = (props: {
  allPartsOfSpeech: string[];
  selectedPartsOfSpeech: string[];
  createPartsOfSpeechSelector: (partOfSpeech: string) => () => void;
}): JSX.Element => {
  const [opened, setOpened] = React.useState(false);
  return (
    <div>
      <div
        onClick={(): void => {
          if (props.selectedPartsOfSpeech.length === 0) return;
          setOpened(!opened);
        }}
        css={css`
          &:hover {
            background: rgba(0, 0, 0, 0.1);
          }
          cursor: pointer;
          padding: 0.5rem 1rem;
        `}
      >
        {props.selectedPartsOfSpeech.length >= 1
          ? props.selectedPartsOfSpeech.join("、")
          : "品詞を選択してください"}
      </div>
      {opened &&
        props.allPartsOfSpeech.map(partOfSpeech => (
          <div
            key={partOfSpeech}
            onClick={props.createPartsOfSpeechSelector(partOfSpeech)}
            css={css`
              &:hover {
                background: rgba(0, 0, 0, 0.1);
              }
              cursor: pointer;
              font-weight: ${props.selectedPartsOfSpeech.includes(partOfSpeech)
                ? "bold"
                : "normal"};
              padding: 0.5rem 1rem 0.5rem 2rem;
            `}
          >
            {partOfSpeech}
          </div>
        ))}
    </div>
  );
};

type Conditions = {
  beginWith: string[];
  notBeginWith: string[];
  endWith: string[];
  notEndWith: string[];
  include: string[];
  exclude: string[];
  length: number | null;
  lengthComparisonOperator: LengthComparisonOperator;
  partsOfSpeech: string[];
};

const ConditionsDisplay = (props: Conditions): JSX.Element => (
  <div
    css={css`
      padding: 0.5rem 1rem;
    `}
  >
    {props.beginWith.length >= 1 && (
      <div>{props.beginWith.join("、")}から始まる</div>
    )}
    {props.notBeginWith.length >= 1 && (
      <div>{props.notBeginWith.join("、")}から始まらない</div>
    )}
    {props.endWith.length >= 1 && <div>{props.endWith.join("、")}で終わる</div>}
    {props.notEndWith.length >= 1 && (
      <div>{props.notEndWith.join("、")}で終わらない</div>
    )}
    {props.include.length >= 1 && <div>{props.include.join("、")}を含む</div>}
    {props.exclude.length >= 1 && (
      <div>{props.exclude.join("、")}を含まない</div>
    )}
    {props.length !== null && props.length >= 1 && (
      <div>
        {props.length}
        {props.lengthComparisonOperator}の
      </div>
    )}
    {props.partsOfSpeech.length === 0 ? (
      <div>品詞が選択されていません</div>
    ) : (
      <div>{props.partsOfSpeech.join("、")}</div>
    )}
  </div>
);
type OnChangeKatakanaList = (katakanaList: string[]) => void;

const ConditionsInput = (
  props: Conditions & {
    onChangeBeginWith: OnChangeKatakanaList;
    onChangeNotBeginWith: OnChangeKatakanaList;
    onChangeEndWidth: OnChangeKatakanaList;
    onChangeNotEndWith: OnChangeKatakanaList;
    onChangeInclude: OnChangeKatakanaList;
    onChangeExclude: OnChangeKatakanaList;
    onChangeLength: (length: number | null) => void;
    onChangeLengthComparisonOperator: (
      lengthComparisonOperator: LengthComparisonOperator
    ) => void;
    allPartsOfSpeech: string[];
    createPartsOfSpeechSelector: (partOfSpeech: string) => () => void;
  }
): JSX.Element => (
  <div>
    <InputKatakanaList
      defaultValue={props.beginWith}
      label="から始まる"
      onChange={props.onChangeBeginWith}
    />
    <InputKatakanaList
      defaultValue={props.notBeginWith}
      label="から始まらない"
      onChange={props.onChangeNotBeginWith}
    />
    <InputKatakanaList
      defaultValue={props.endWith}
      label="で終わる"
      onChange={props.onChangeEndWidth}
    />
    <InputKatakanaList
      defaultValue={props.notEndWith}
      label="で終わらない"
      onChange={props.onChangeNotEndWith}
    />
    <InputKatakanaList
      defaultValue={props.include}
      label="を含む"
      onChange={props.onChangeInclude}
    />
    <InputKatakanaList
      defaultValue={props.exclude}
      label="を含まない"
      onChange={props.onChangeExclude}
    />
    <InputLength
      defaultLength={props.length}
      defaultLengthComparisonOperator={props.lengthComparisonOperator}
      onChangeLength={props.onChangeLength}
      onChangeLengthComparisonOperator={props.onChangeLengthComparisonOperator}
    />
    <PartsOfSpeechSelector
      allPartsOfSpeech={props.allPartsOfSpeech}
      selectedPartsOfSpeech={props.partsOfSpeech}
      createPartsOfSpeechSelector={props.createPartsOfSpeechSelector}
    />
  </div>
);

const YomiList = (props: {
  allYomiList: Yomi.Yomi[];
  selectedYomiList: Yomi.Yomi[];
}): JSX.Element => {
  const [state, setState] = React.useState<{
    pageSize: number;
    pageNumber: number;
    yomi: Yomi.Yomi | null;
  }>({
    pageSize: 100,
    pageNumber: 0,
    yomi: null
  });
  React.useEffect(
    () =>
      setState(state => ({
        ...state,
        pageNumber: 0,
        yomi: null
      })),
    [props.selectedYomiList]
  );
  const beginIndex = state.pageNumber * state.pageSize;
  const endIndex = beginIndex + state.pageSize;
  const pageYomiList = props.selectedYomiList.slice(beginIndex, endIndex);
  const numberOfPages = Math.floor(
    props.selectedYomiList.length / state.pageSize
  );
  return (
    <div>
      <div
        css={css`
          padding: 0.5rem 1rem;
        `}
      >
        {props.selectedYomiList.length} 件
        {state.pageNumber >= 1 && `中 ${state.pageNumber + 1} ページ目`}
      </div>
      {numberOfPages >= 1 && (
        <div
          css={css`
            display: flex;
            & > div {
              flex: 1;
              padding: 0.5rem 1rem;
            }
          `}
        >
          {state.pageNumber > 0 ? (
            <div
              onClick={(): void =>
                setState({ ...state, pageNumber: state.pageNumber - 1 })
              }
              css={css`
                &:hover {
                  background: rgba(0, 0, 0, 0.1);
                }
                cursor: pointer;
              `}
            >
              前のページ
            </div>
          ) : (
            <div></div>
          )}
          {state.pageNumber < numberOfPages ? (
            <div
              onClick={(): void =>
                setState({ ...state, pageNumber: state.pageNumber + 1 })
              }
              css={css`
                &:hover {
                  background: rgba(0, 0, 0, 0.1);
                }
                cursor: pointer;
              `}
            >
              次のページ
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}
      <ol
        css={css`
          list-style: none;
          margin: 0;
          padding: 0;
          & > li > div {
            &:hover {
              background: rgba(0, 0, 0, 0.1);
            }
            cursor: pointer;
            padding: 0.5rem 1rem;
          }
        `}
      >
        {pageYomiList.map(yomi => (
          <li key={yomi.id}>
            <div
              onClick={(): void =>
                setState({ ...state, yomi: yomi === state.yomi ? null : yomi })
              }
            >
              {yomi.katakana}
            </div>
            {yomi === state.yomi && (
              <ul
                css={css`
                  list-style: none;
                  padding: 0.5rem 1rem 1rem;
                `}
              >
                {yomi.homonyms.map(hononym => (
                  <li key={hononym.id}>
                    【{hononym.word}】［{hononym.partOfSpeech}］
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

const headerHeight = "48px";
const wideWidth = "640px";

const App = (props: { allYomiList: Yomi.Yomi[] }): JSX.Element => {
  const [state, setState] = React.useState<
    {
      sortedAllYomiList: Yomi.Yomi[];
      allPartsOfSpeech: string[];
    } & Conditions
  >({
    sortedAllYomiList: [],
    allPartsOfSpeech: [],
    beginWith: [],
    notBeginWith: [],
    endWith: [],
    notEndWith: ["ン"],
    include: [],
    exclude: [],
    length: null,
    lengthComparisonOperator: "文字",
    partsOfSpeech: []
  });
  React.useEffect(() => {
    const allPartsOfSpeech = Yomi.collectPartsOfSpeech(props.allYomiList);
    setState(state => ({
      ...state,
      sortedAllYomiList: Yomi.sortByKatakana(props.allYomiList),
      allPartsOfSpeech,
      partsOfSpeech: allPartsOfSpeech.includes("名詞")
        ? ["名詞"]
        : allPartsOfSpeech
    }));
  }, [props.allYomiList]);
  const beginsWith =
    state.beginWith.length === 0
      ? (): boolean => true
      : createKatakanaRegExpTester(
          new RegExp(`^(${state.beginWith.join("|")})`)
        );
  const doesNotBeginWith =
    state.notBeginWith.length === 0
      ? (): boolean => true
      : createKatakanaRegExpTester(
          new RegExp(`^(?!(${state.notBeginWith.join("|")}))`)
        );
  const endsWith =
    state.endWith.length === 0
      ? (): boolean => true
      : createKatakanaRegExpTester(new RegExp(`(${state.endWith.join("|")})$`));
  const doesNotEndWith =
    state.notEndWith.length === 0
      ? (): boolean => true
      : createKatakanaRegExpTester(
          new RegExp(`(?<!(${state.notEndWith.join("|")}))$`)
        );
  const includes =
    state.include.length === 0
      ? (): boolean => true
      : createKatakanaRegExpTester(new RegExp(`(${state.include.join("|")})`));
  const excludes =
    state.exclude.length === 0
      ? (): boolean => true
      : createKatakanaRegExpTester(
          new RegExp(`^(?!.*(${state.exclude.join("|")})).*$`)
        );
  const hasLength = ((): ((yomi: Yomi.Yomi) => boolean) => {
    if (state.length === null) return (): boolean => true;
    if (state.length < 1) return (): boolean => true;
    const length = state.length;
    switch (state.lengthComparisonOperator) {
      case "文字以内":
        return (yomi): boolean => yomi.katakana.length <= length;
      case "文字":
        return (yomi): boolean => yomi.katakana.length === length;
      case "文字以上":
        return (yomi): boolean => yomi.katakana.length >= length;
    }
  })();
  const includesPartsOfSpeech = (yomi: Yomi.Yomi): boolean =>
    yomi.homonyms.some(homonym =>
      state.partsOfSpeech.includes(homonym.partOfSpeech)
    );
  const createPartsOfSpeechSelector = (partOfSpeech: string) => (): void =>
    setState({
      ...state,
      partsOfSpeech: state.partsOfSpeech.includes(partOfSpeech)
        ? state.partsOfSpeech.filter((part: string) => part !== partOfSpeech)
        : [...state.partsOfSpeech, partOfSpeech]
    });
  const sortedSelectedYomiList = [];
  for (const yomi of state.sortedAllYomiList) {
    if (!includesPartsOfSpeech(yomi)) continue;
    if (!beginsWith(yomi)) continue;
    if (!doesNotBeginWith(yomi)) continue;
    if (!endsWith(yomi)) continue;
    if (!doesNotEndWith(yomi)) continue;
    if (!includes(yomi)) continue;
    if (!excludes(yomi)) continue;
    if (!hasLength(yomi)) continue;
    sortedSelectedYomiList.push(yomi);
  }
  return (
    <div>
      <div
        css={css`
          background: rgb(0, 0, 0);
          color: rgb(255, 255, 255);
          display: flex;
          height: ${headerHeight};
          line-height: ${headerHeight};
          padding: 0 0.5rem;
          position: sticky;
          top: 0;
          & > div {
            padding: 0 0.5rem;
          }
          & a {
            color: rgb(255, 255, 255);
          }
        `}
      >
        <div>シリトリウス - Shiritorius</div>
        <div
          css={css`
            margin-left: auto;
          `}
        >
          <a href={copyingUrl}>辞書</a>
        </div>
        <div>
          <a href="https://github.com/filtermap/shiritorius">GitHub</a>
        </div>
      </div>
      <div
        css={css`
          @media all and (min-width: ${wideWidth}) {
            display: flex;
          }
        `}
      >
        <div
          css={css`
            @media all and (min-width: ${wideWidth}) {
              flex: 1;
              height: calc(100vh - ${headerHeight});
              order: 1;
              overflow-y: auto;
            }
          `}
        >
          <div
            css={css`
              border-bottom: 1px solid rgba(0, 0, 0, 0.5);
              padding: 0.5rem 0;
            `}
          >
            <ConditionsInput
              {...state}
              onChangeBeginWith={(beginWith): void =>
                setState({ ...state, beginWith })
              }
              onChangeNotBeginWith={(notBeginWith): void =>
                setState({ ...state, notBeginWith })
              }
              onChangeEndWidth={(endWith): void =>
                setState({ ...state, endWith })
              }
              onChangeNotEndWith={(notEndWith): void =>
                setState({ ...state, notEndWith })
              }
              onChangeInclude={(include): void =>
                setState({ ...state, include })
              }
              onChangeExclude={(exclude): void =>
                setState({ ...state, exclude })
              }
              onChangeLength={(length): void => setState({ ...state, length })}
              onChangeLengthComparisonOperator={(
                lengthComparisonOperator
              ): void => setState({ ...state, lengthComparisonOperator })}
              allPartsOfSpeech={state.allPartsOfSpeech}
              createPartsOfSpeechSelector={createPartsOfSpeechSelector}
            />
          </div>
          <div
            css={css`
              @media all and (min-width: ${wideWidth}) {
                border-bottom: 0;
              }
              border-bottom: 1px solid rgba(0, 0, 0, 0.5);
              padding: 0.5rem 0;
            `}
          >
            <ConditionsDisplay {...state} />
          </div>
        </div>
        <div
          css={css`
            @media all and (min-width: ${wideWidth}) {
              border-right: 1px solid rgba(0, 0, 0, 0.5);
              flex: 1;
              height: calc(100vh - ${headerHeight});
              overflow-y: auto;
            }
          `}
        >
          <YomiList
            allYomiList={state.sortedAllYomiList}
            selectedYomiList={sortedSelectedYomiList}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
