import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { MergeWords, Sense, Status, Word } from "api/models";
import {
  defaultTree,
  MergeData,
  MergeTree,
  MergeTreeReference,
  MergeTreeSense,
  newMergeTreeSense,
  newMergeTreeWord,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { MergeDups } from "goals/MergeDupGoal/MergeDups";
import { newMergeWords } from "goals/MergeDupGoal/MergeDupsTypes";
import {
  dispatchMergeStepData,
  mergeAll,
  mergeDefinitionIntoSense,
  moveSense,
  orderSense,
} from "goals/MergeDupGoal/Redux/MergeDupActions";
import {
  MergeTreeAction,
  MergeTreeActionTypes,
  MergeTreeState,
} from "goals/MergeDupGoal/Redux/MergeDupReduxTypes";
import { goalDataMock } from "goals/MergeDupGoal/Redux/tests/MockMergeDupData";
import { GoalsState, GoalType } from "types/goals";
import {
  multiSenseWord,
  newDefinition,
  newFlag,
  newSense,
  newWord,
} from "types/word";
import { Bcp47Code } from "types/writingSystem";

// Used when the guids don't matter.
function wordAnyGuids(vern: string, senses: Sense[], id: string): Word {
  return {
    ...newWord(vern),
    senses: senses.map((s) => ({ ...s, guid: expect.any(String) })),
    id,
    guid: expect.any(String),
  };
}

const mockMergeWords = jest.fn();

jest.mock("backend", () => ({
  blacklistAdd: jest.fn(),
  getWord: jest.fn(),
  mergeWords: (mergeWordsArray: MergeWords[]) =>
    mockMergeWords(mergeWordsArray),
}));

const mockGoal = new MergeDups();
mockGoal.data = goalDataMock;
mockGoal.steps = [{ words: [] }, { words: [] }];
const createMockStore = configureMockStore([thunk]);

const mockStoreState: {
  goalsState: GoalsState;
  mergeDuplicateGoal: MergeTreeState;
} = {
  goalsState: {
    allGoalTypes: [],
    currentGoal: new MergeDups(),
    goalTypeSuggestions: [],
    history: [mockGoal],
    previousGoalType: GoalType.Default,
  },
  mergeDuplicateGoal: { data: {} as MergeData, tree: {} as MergeTree },
};

const vernA = "AAA";
const vernB = "BBB";
const idA = "WA";
const idB = "WB";
const wordA: Word = { ...multiSenseWord(vernA, ["S1", "S2"]), id: idA };
const wordB: Word = { ...multiSenseWord(vernB, ["S3", "S4"]), id: idB };
const senses = {
  S1: wordA.senses[0],
  S2: wordA.senses[1],
  S3: wordB.senses[0],
  S4: wordB.senses[1],
};
senses["S1"].accessibility = Status.Protected;
const S1 = senses["S1"].guid;
const S2 = senses["S2"].guid;
const S3 = senses["S3"].guid;
const S4 = senses["S4"].guid;
const data: MergeData = { words: { WA: wordA, WB: wordB }, senses: {} };
data.senses[S1] = {
  ...newMergeTreeSense("S1", idA, 0),
  guid: S1,
  protected: true,
};
data.senses[S2] = { ...newMergeTreeSense("S2", idA, 1), guid: S2 };
data.senses[S3] = { ...newMergeTreeSense("S3", idB, 0), guid: S3 };
data.senses[S4] = { ...newMergeTreeSense("S4", idB, 1), guid: S4 };

beforeEach(jest.clearAllMocks);

describe("MergeDupActions", () => {
  describe("mergeAll", () => {
    // Don't move or merge anything
    it("handles no merge", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const mockStore = createMockStore({
        ...mockStoreState,
        mergeDuplicateGoal: { data, tree },
      });
      await mockStore.dispatch<any>(mergeAll());

      expect(mockMergeWords).not.toHaveBeenCalled();
    });

    // Merge sense 3 from B as duplicate into sense 1 from A
    it("merges senses from different words", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1, S3], ID2: [S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const mockStore = createMockStore({
        ...mockStoreState,
        mergeDuplicateGoal: { data, tree },
      });
      await mockStore.dispatch<any>(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const parentA = wordAnyGuids(vernA, [senses["S1"], senses["S2"]], idA);
      const parentB = wordAnyGuids(vernB, [senses["S4"]], idB);
      const childA = { srcWordId: idA, getAudio: true };
      const childB = { srcWordId: idB, getAudio: false };
      const mockMerges = [
        newMergeWords(parentA, [childA, childB]),
        newMergeWords(parentB, [childB]),
      ];
      for (const mergeWords of mockMerges) {
        expect(mockMergeWords.mock.calls[0][0]).toContainEqual(mergeWords);
      }
    });

    // Move sense 3 from B to A
    it("moves sense between words", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2], ID3: [S3] });
      const WB = newMergeTreeWord(vernB, { ID1: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const mockStore = createMockStore({
        ...mockStoreState,
        mergeDuplicateGoal: { data, tree },
      });
      await mockStore.dispatch<any>(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const parentA = wordAnyGuids(
        vernA,
        [senses["S1"], senses["S2"], senses["S3"]],
        idA
      );
      const parentB = wordAnyGuids(vernB, [senses["S4"]], idB);
      const childA = { srcWordId: idA, getAudio: true };
      const childB = { srcWordId: idB, getAudio: false };
      const mockMerges = [
        newMergeWords(parentA, [childA, childB]),
        newMergeWords(parentB, [childB]),
      ];
      for (const mergeWords of mockMerges) {
        expect(mockMergeWords.mock.calls[0][0]).toContainEqual(mergeWords);
      }
    });

    // Merge sense 1 and 2 in A as duplicates
    it("merges senses within a word", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1, S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const mockStore = createMockStore({
        ...mockStoreState,
        mergeDuplicateGoal: { data, tree },
      });
      await mockStore.dispatch<any>(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);

      const parent = wordAnyGuids(vernA, [senses["S1"]], idA);
      const child = { srcWordId: idA, getAudio: true };
      const mockMerge = newMergeWords(parent, [child]);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);
    });

    // Delete sense 2 from A
    it("delete one sense from word with multiple senses", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1] });
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const mockStore = createMockStore({
        ...mockStoreState,
        mergeDuplicateGoal: { data, tree },
      });
      await mockStore.dispatch<any>(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const parent = wordAnyGuids(vernA, [senses["S1"]], idA);
      const child = { srcWordId: idA, getAudio: true };
      const mockMerge = newMergeWords(parent, [child]);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);
    });

    // Delete both senses from B
    it("delete all senses from a word", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      const tree: MergeTree = { ...defaultTree, words: { WA } };
      const mockStore = createMockStore({
        ...mockStoreState,
        mergeDuplicateGoal: { data, tree },
      });
      await mockStore.dispatch<any>(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const child = { srcWordId: idB, getAudio: false };
      const mockMerge = newMergeWords(wordB, [child], true);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);
    });

    // Performs a merge when a word is flagged
    it("adds a flag to a word", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      WA.flag = newFlag("New flag");
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const mockStore = createMockStore({
        ...mockStoreState,
        mergeDuplicateGoal: { data, tree },
      });
      await mockStore.dispatch<any>(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);

      const parent = wordAnyGuids(vernA, [senses["S1"], senses["S2"]], idA);
      parent.flag = WA.flag;
      const child = { srcWordId: idA, getAudio: true };
      const mockMerge = newMergeWords(parent, [child]);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);
    });
  });

  describe("dispatchMergeStepData", () => {
    it("creates an action to add MergeDups data", async () => {
      const goal = new MergeDups();
      goal.steps = [{ words: [...goalDataMock.plannedWords[0]] }];

      const mockStore = createMockStore();
      await mockStore.dispatch<any>(dispatchMergeStepData(goal));
      const setWordData: MergeTreeAction = {
        type: MergeTreeActionTypes.SET_DATA,
        payload: [...goalDataMock.plannedWords[0]],
      };
      expect(mockStore.getActions()).toEqual([setWordData]);
    });
  });

  describe("moveSense", () => {
    const wordId = "mockWordId";
    const mergeSenseId = "mockSenseId";

    it("creates a MOVE_SENSE action when going from word to word.", () => {
      const mockRef: MergeTreeReference = { wordId, mergeSenseId };
      const resultAction = moveSense(mockRef, wordId, -1);
      expect(resultAction.type).toEqual(MergeTreeActionTypes.MOVE_SENSE);
    });

    it("creates a MOVE_DUPLICATE action when going from sidebar to word.", () => {
      const mockRef: MergeTreeReference = { wordId, mergeSenseId, order: 0 };
      const resultAction = moveSense(mockRef, wordId, -1);
      expect(resultAction.type).toEqual(MergeTreeActionTypes.MOVE_DUPLICATE);
    });
  });

  describe("orderSense", () => {
    const wordId = "mockWordId";
    const mergeSenseId = "mockSenseId";
    const mockOrder = 0;

    it("creates an ORDER_SENSE action when moving within a word.", () => {
      const mockRef: MergeTreeReference = { wordId, mergeSenseId };
      const resultAction = orderSense(mockRef, mockOrder);
      expect(resultAction.type).toEqual(MergeTreeActionTypes.ORDER_SENSE);
    });

    it("creates an ORDER_DUPLICATE action when moving within the sidebar.", () => {
      const mockRef: MergeTreeReference = { wordId, mergeSenseId, order: 0 };
      const resultAction = orderSense(mockRef, mockOrder);
      expect(resultAction.type).toEqual(MergeTreeActionTypes.ORDER_DUPLICATE);
    });
  });

  describe("mergeDefinitionIntoSense", () => {
    const defAEn = newDefinition("a", Bcp47Code.En);
    const defAFr = newDefinition("a", Bcp47Code.Fr);
    const defBEn = newDefinition("b", Bcp47Code.En);
    let sense: MergeTreeSense;

    beforeEach(() => {
      sense = newSense() as MergeTreeSense;
    });

    it("ignores definitions with empty text.", () => {
      mergeDefinitionIntoSense(sense, newDefinition());
      expect(sense.definitions).toHaveLength(0);
      mergeDefinitionIntoSense(sense, newDefinition("", Bcp47Code.En));
      expect(sense.definitions).toHaveLength(0);
    });

    it("adds definitions with new languages", () => {
      mergeDefinitionIntoSense(sense, defAEn);
      expect(sense.definitions).toHaveLength(1);
      mergeDefinitionIntoSense(sense, defAFr);
      expect(sense.definitions).toHaveLength(2);
    });

    it("only adds definitions with new text", () => {
      sense.definitions.push({ ...defAEn }, { ...defAFr });

      mergeDefinitionIntoSense(sense, defAFr);
      expect(sense.definitions).toHaveLength(2);
      expect(
        sense.definitions.find((d) => d.language === Bcp47Code.Fr)!.text
      ).toEqual(defAFr.text);

      const twoEnTexts = `${defAEn.text};${defBEn.text}`;
      mergeDefinitionIntoSense(sense, defBEn);
      expect(sense.definitions).toHaveLength(2);
      expect(
        sense.definitions.find((d) => d.language === Bcp47Code.En)!.text
      ).toEqual(twoEnTexts);
      mergeDefinitionIntoSense(sense, defAEn);
      expect(sense.definitions).toHaveLength(2);
      expect(
        sense.definitions.find((d) => d.language === Bcp47Code.En)!.text
      ).toEqual(twoEnTexts);
    });
  });
});
