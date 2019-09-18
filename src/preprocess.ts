import fs from "fs";
import path from "path";
import url from "url";
import zlib from "zlib";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import csvParse from "csv-parse";
import iconv from "iconv-lite";
import request from "request";
import progress from "request-progress";
import tar from "tar";
import * as Yomi from "./Yomi";

type ProgressState = {
  time: {
    elapsed: number;
    remaining: number;
  };
  speed: number;
  percent: number;
  size: {
    total: number;
    transferred: number;
  };
};

function bytesToMegaBytes(bytes: number): number {
  return bytes / 1024 / 1024;
}

function progressStateToString({
  time: { elapsed, remaining },
  speed,
  percent,
  size: { total, transferred }
}: ProgressState): string {
  return `elapsed: ${elapsed} s, remaining: ${remaining} s, speed: ${bytesToMegaBytes(
    speed
  ).toFixed(1)} MB/s, total: ${bytesToMegaBytes(total).toFixed(
    1
  )} MB, transferred: ${bytesToMegaBytes(transferred).toFixed(
    1
  )} MB, ${percent * 100} %`;
}

function download(urlString: string, filepath: string): Promise<void> {
  console.log(`downloading: ${urlString}`);
  return new Promise<void>((resolve, reject): void => {
    progress(request(urlString))
      .on("progress", (state: ProgressState) =>
        console.log(progressStateToString(state))
      )
      .on("end", () => {
        console.log(`downloaded:  ${filepath}`);
        resolve();
      })
      .on("error", (error: Error): void => reject(error))
      .pipe(fs.createWriteStream(filepath));
  });
}

function gunzipAndExtractTar(filepath: string, dirpath: string): Promise<void> {
  console.log(`decompressing: ${filepath}`);
  return new Promise((resolve): void => {
    fs.createReadStream(filepath)
      .pipe(zlib.createGunzip())
      .pipe(tar.x({ path: dirpath }))
      .on("close", () => {
        console.log(`decompressed: ${dirpath}`);
        resolve();
      });
  });
}

type Record = string[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRecord(r: any): r is Record {
  if (!r) return false;
  if (!Array.isArray(r)) return false;
  for (const c of r) {
    if (typeof c !== "string") return false;
  }
  return true;
}

function parseDictionaryCSV(filepath: string): Promise<Record[]> {
  console.log(`parsing: ${filepath}`);
  return new Promise((resolve, reject): void => {
    let numberOfSkippedRecords = 0;
    let numberOfInvalidTypeRecords = 0;
    let numberOfParsedRecords = 0;
    const records: Record[] = [];
    const parser = csvParse({
      quote: "",
      ltrim: true,
      rtrim: true,
      delimiter: ",",
      // eslint-disable-next-line @typescript-eslint/camelcase
      skip_lines_with_error: true
    });
    parser.on("error", (err: Error) => reject(err));
    parser.on("skip", (err: Error) => {
      numberOfSkippedRecords++;
      console.log(err);
    });
    parser.on("readable", () => {
      let record;
      while ((record = parser.read())) {
        if (!isRecord(record)) {
          numberOfInvalidTypeRecords++;
          console.log(record);
          continue;
        }
        numberOfParsedRecords++;
        records.push(record);
      }
    });
    parser.on("end", () => {
      console.log(`number of skipped records:  ${numberOfSkippedRecords}`);
      console.log(
        `number of invalid type records: ${numberOfInvalidTypeRecords}`
      );
      console.log(`number of parsed records: ${numberOfParsedRecords}`);
      resolve(records);
    });
    fs.createReadStream(filepath)
      .pipe(iconv.decodeStream("EUC-JP"))
      .pipe(iconv.encodeStream("utf8"))
      .pipe(parser);
  });
}

function recordsToYomiList(records: Record[]): Yomi.Yomi[] {
  console.log(`number of records being processed: ${records.length}`);
  const katakanaToYomiMap = new Map<string, Yomi.Yomi>();
  let numberOfRecordsWithYomiIncludingOtherThanKatakana = 0;
  let nextYomiId = 0;
  let nextHomonymId = 0;
  for (const record of records) {
    const katakana = record[11];
    if (!katakana.match(Yomi.katakanaOnlyRegExp)) {
      numberOfRecordsWithYomiIncludingOtherThanKatakana++;
      continue;
    }
    const word = record[0];
    const partOfSpeech = record[4];
    const yomi = katakanaToYomiMap.get(katakana);
    if (!yomi) {
      katakanaToYomiMap.set(katakana, {
        id: nextYomiId,
        katakana,
        homonyms: [{ id: nextHomonymId, word, partOfSpeech }]
      });
      nextYomiId++;
      nextHomonymId++;
      continue;
    }
    const sameHomonymAlreadyExists = yomi.homonyms.some(
      homonym => homonym.word === word && homonym.partOfSpeech === partOfSpeech
    );
    if (sameHomonymAlreadyExists) continue;
    yomi.homonyms.push({ id: nextHomonymId, word, partOfSpeech });
    nextHomonymId++;
  }
  console.log(
    `number of records with yomi including other than katakana: ${numberOfRecordsWithYomiIncludingOtherThanKatakana}`
  );
  const yomiList = [...katakanaToYomiMap.values()];
  console.log(`number of yomi: ${yomiList.length}`);
  return yomiList;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveAsJSONFile(data: any, filepath: string): Promise<void> {
  console.log(`saving: ${filepath}`);
  const jsonString = JSON.stringify(data);
  return new Promise((resolve, reject): void => {
    fs.writeFile(filepath, jsonString, err => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`saved: ${filepath}`);
      resolve();
    });
  });
}

async function main(): Promise<void> {
  const optionDefinitions = [
    {
      name: "force",
      alias: "f",
      type: Boolean,
      description: "Force a download."
    },
    {
      name: "help",
      alias: "h",
      type: Boolean,
      description: "Print this list and exit."
    }
  ];
  const options = commandLineArgs(optionDefinitions);
  if (options.help) {
    const sections = [
      { header: "Usage:", content: "yarn preprocess [options]" },
      { header: "Available Options:", optionList: optionDefinitions }
    ];
    const usage = commandLineUsage(sections);
    console.log(usage);
    return;
  }
  const urlString =
    "https://jaist.dl.osdn.jp/naist-jdic/53500/mecab-naist-jdic-0.6.3b-20111013.tar.gz";
  const parsedUrl = new url.URL(urlString);
  const downloadedFilePath = path.basename(parsedUrl.pathname);
  if (!fs.existsSync(downloadedFilePath) || options.force) {
    await download(urlString, downloadedFilePath);
  } else {
    console.log(`already exists: ${downloadedFilePath}`);
  }
  const decompressedDirpath = downloadedFilePath.replace(/.tar.gz$/, "");
  await gunzipAndExtractTar(downloadedFilePath, decompressedDirpath);
  const aboutDictionaryFilepath = path.join("src", "aboutDictionary.txt");
  console.log(`creating file: ${aboutDictionaryFilepath}`);
  fs.writeFileSync(aboutDictionaryFilepath, "mecab-naist-jdic-0.6.3b-20111013");
  console.log(`created file: ${aboutDictionaryFilepath}`);
  const copyingFilepath = path.join(decompressedDirpath, "COPYING");
  console.log(`copying: ${copyingFilepath} to ${aboutDictionaryFilepath}`);
  fs.appendFileSync(
    aboutDictionaryFilepath,
    `\n\n${fs.readFileSync(copyingFilepath)}`
  );
  console.log(`copied: ${copyingFilepath} to ${aboutDictionaryFilepath}`);
  const csvFilepath = path.join(decompressedDirpath, "naist-jdic.csv");
  const records = await parseDictionaryCSV(csvFilepath);
  const yomiList = recordsToYomiList(records);
  const jsonFilepath = path.join("src", "yomiList.json");
  await saveAsJSONFile(yomiList, jsonFilepath);
}

main();
