import {
  convertSenseToMergeTreeSense,
  defaultSidebar,
  Hash,
  MergeTreeReference,
  MergeTreeWord,
  newMergeTreeWord,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import * as Actions from "goals/MergeDupGoal/Redux/MergeDupActions";
import {
  defaultState,
  mergeDupStepReducer,
} from "goals/MergeDupGoal/Redux/MergeDupReducer";
import {
  MergeTreeAction,
  MergeTreeActionTypes,
  MergeTreeState,
} from "goals/MergeDupGoal/Redux/MergeDupReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";
import { newFlag, testWordList } from "types/word";

jest.mock("uuid");
const mockUuid = require("uuid") as { v4: jest.Mock };

var uuidIndex = 0;
// getMockUuid(false) gives the next uuid to be assigned by our mocked v4.
function getMockUuid(increment = true): string {
  const uuid = `mockUuid${uuidIndex}`;
  if (increment) {
    uuidIndex++;
  }
  return uuid;
}

beforeEach(() => {
  mockUuid.v4.mockImplementation(getMockUuid);
});

describe("MergeDupReducer", () => {
  // a state with no duplicate senses
  const initState = mergeDupStepReducer(
    undefined,
    Actions.setWordData(testWordList())
  );

  // helper functions for working with a tree
  const getRefByGuid = (
    guid: string,
    words: Hash<MergeTreeWord>
  ): MergeTreeReference | undefined => {
    for (const wordId of Object.keys(words)) {
      for (const mergeSenseId of Object.keys(words[wordId].sensesGuids)) {
        const guids = words[wordId].sensesGuids[mergeSenseId];
        const order = guids.findIndex((g) => g === guid);
        if (order !== -1) {
          return { wordId, mergeSenseId, order };
        }
      }
    }
    return undefined;
  };

  test("clearTree", () => {
    const newState = mergeDupStepReducer(initState, Actions.clearTree());
    expect(JSON.stringify(newState)).toEqual(JSON.stringify(defaultState));
  });

  function testTreeWords(): Hash<MergeTreeWord> {
    return {
      word1: newMergeTreeWord("senses:A0", {
        word1_senseA: ["word1_senseA_0"],
      }),
      word2: newMergeTreeWord("senses:A01", {
        word2_senseA: ["word2_senseA_0", "word2_senseA_1"],
      }),
      word3: newMergeTreeWord("senses:A0B01", {
        word3_senseA: ["word3_senseA_0"],
        word3_senseB: ["word3_senseB_0", "word3_senseB_1"],
      }),
    };
  }
  const mockState: MergeTreeState = {
    data: {
      words: {},
      senses: {},
    },
    tree: {
      sidebar: defaultSidebar,
      words: testTreeWords(),
    },
  };
  function checkTreeWords(
    action: MergeTreeAction,
    expected: Hash<MergeTreeWord>
  ) {
    const result = mergeDupStepReducer(mockState, action).tree.words;
    // We have to stringify for this test,
    // because the order of the .sensesGuids matters.
    expect(JSON.stringify(result)).toEqual(JSON.stringify(expected));
  }

  describe("combineSense", () => {
    it("combine sense from sidebar into other sense", () => {
      const srcWordId = "word2";
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
        order: 0,
      };

      const destWordId = "word1";
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: `${destWordId}_senseA`,
      };

      const testAction = Actions.combineSense(srcRef, destRef);

      const expectedWords = testTreeWords();
      expectedWords[srcWordId].sensesGuids = {
        word2_senseA: ["word2_senseA_1"],
      };
      expectedWords[destWordId].sensesGuids = {
        word1_senseA: ["word1_senseA_0", "word2_senseA_0"],
      };

      checkTreeWords(testAction, expectedWords);
    });

    it("combine last sense from sidebar into other sense", () => {
      const srcWordId = "word3";
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
        order: 0,
      };

      const destWordId = "word1";
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: `${destWordId}_senseA`,
      };

      const testAction = Actions.combineSense(srcRef, destRef);

      const expectedWords = testTreeWords();
      expectedWords[destWordId].sensesGuids = {
        word1_senseA: ["word1_senseA_0", "word3_senseA_0"],
      };
      expectedWords[srcWordId].sensesGuids = {
        word3_senseB: ["word3_senseB_0", "word3_senseB_1"],
      };

      checkTreeWords(testAction, expectedWords);
    });

    it("combine last sidebar sense from a word's last sense into other word's sense", () => {
      const srcWordId = "word1";
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
        order: 0,
      };

      const destWordId = "word3";
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: `${destWordId}_senseA`,
      };

      const testAction = Actions.combineSense(srcRef, destRef);

      const expectedWords = testTreeWords();
      delete expectedWords[srcWordId];
      expectedWords[destWordId].sensesGuids = {
        word3_senseA: ["word3_senseA_0", "word1_senseA_0"],
        word3_senseB: ["word3_senseB_0", "word3_senseB_1"],
      };

      checkTreeWords(testAction, expectedWords);
    });

    it("combine sense into other sense in same word", () => {
      const wordId = "word3";
      const srcRef: MergeTreeReference = {
        wordId,
        mergeSenseId: `${wordId}_senseB`,
      };
      const destRef: MergeTreeReference = {
        wordId,
        mergeSenseId: `${wordId}_senseA`,
      };

      const testAction = Actions.combineSense(srcRef, destRef);

      const expectedWords = testTreeWords();
      expectedWords[wordId].sensesGuids = {
        word3_senseA: ["word3_senseA_0", "word3_senseB_0", "word3_senseB_1"],
      };

      checkTreeWords(testAction, expectedWords);
    });

    it("combine sense into other sense in different word", () => {
      const srcWordId = "word3";
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
      };

      const destWordId = "word1";
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: `${destWordId}_senseA`,
      };

      const testAction = Actions.combineSense(srcRef, destRef);

      const expectedWords = testTreeWords();
      expectedWords[srcWordId].sensesGuids = {
        word3_senseB: ["word3_senseB_0", "word3_senseB_1"],
      };
      expectedWords[destWordId].sensesGuids = {
        word1_senseA: ["word1_senseA_0", "word3_senseA_0"],
      };

      checkTreeWords(testAction, expectedWords);
    });

    it("combine last sense into other sense in different word", () => {
      const srcWordId = "word1";
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
      };

      const destWordId = "word3";
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: `${destWordId}_senseA`,
      };

      const testAction = Actions.combineSense(srcRef, destRef);

      const expectedWords = testTreeWords();
      delete expectedWords[srcWordId];
      expectedWords[destWordId].sensesGuids = {
        word3_senseA: ["word3_senseA_0", "word1_senseA_0"],
        word3_senseB: ["word3_senseB_0", "word3_senseB_1"],
      };

      checkTreeWords(testAction, expectedWords);
    });
  });

  describe("deleteSense", () => {
    it("deletes one-sense sense from a word with multiple senses", () => {
      const wordId = "word3";
      const testRef: MergeTreeReference = {
        wordId,
        mergeSenseId: `${wordId}_senseA`,
      };

      const testAction = Actions.deleteSense(testRef);

      const expectedWords = testTreeWords();
      delete expectedWords[wordId].sensesGuids[testRef.mergeSenseId];

      checkTreeWords(testAction, expectedWords);
    });

    it("deletes multi-sense sense from a word with multiple senses", () => {
      const wordId = "word3";
      const testRef: MergeTreeReference = {
        wordId,
        mergeSenseId: `${wordId}_senseB`,
      };

      const testAction = Actions.deleteSense(testRef);

      const expectedWords = testTreeWords();
      delete expectedWords[wordId].sensesGuids[testRef.mergeSenseId];

      checkTreeWords(testAction, expectedWords);
    });

    it("deletes word when deleting final sense", () => {
      const wordId = "word2";
      const testRef: MergeTreeReference = {
        wordId,
        mergeSenseId: `${wordId}_senseA`,
      };

      const testAction = Actions.deleteSense(testRef);

      const expectedWords = testTreeWords();
      delete expectedWords[wordId];

      checkTreeWords(testAction, expectedWords);
    });

    it("deletes a sense from the sidebar", () => {
      const wordId = "word2";
      const testRef: MergeTreeReference = {
        wordId,
        mergeSenseId: `${wordId}_senseA`,
        order: 0,
      };

      const testAction = Actions.deleteSense(testRef);

      const expectedWords = testTreeWords();
      expectedWords[wordId].sensesGuids = { word2_senseA: ["word2_senseA_1"] };

      checkTreeWords(testAction, expectedWords);
    });

    it("delete last sidebar sense from a word's last sense", () => {
      const srcWordId = "word1";
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
        order: 0,
      };

      const testAction = Actions.deleteSense(srcRef);

      const expectedWords = testTreeWords();
      delete expectedWords[srcWordId];

      checkTreeWords(testAction, expectedWords);
    });
  });

  describe("flagWord", () => {
    it("adds a flag to a word", () => {
      const wordId = "word1";
      const testFlag = newFlag("flagged");
      const testAction = Actions.flagWord(wordId, testFlag);

      const expectedWords = testTreeWords();
      expectedWords[wordId].flag = testFlag;

      checkTreeWords(testAction, expectedWords);
    });
  });

  describe("moveSense", () => {
    it("moves a sense out from sidebar to same word", () => {
      const wordId = "word2";
      const testRef: MergeTreeReference = {
        wordId,
        mergeSenseId: `${wordId}_senseA`,
        order: 0,
      };
      const srcGuid = `${testRef.mergeSenseId}_${testRef.order}`;

      // Intercept the uuid that will be assigned.
      const nextGuid = getMockUuid(false);
      const testAction = Actions.moveSense(testRef, wordId, 1);

      const expectedWords = testTreeWords();
      expectedWords[wordId].sensesGuids = { word2_senseA: ["word2_senseA_1"] };
      // A new guid is used when a sense is added to a merge word, so use the intercepted
      // nextGuid for the new sense expected from moving a sense out of a sidebar.
      expectedWords[wordId].sensesGuids[nextGuid] = [srcGuid];

      checkTreeWords(testAction, expectedWords);
    });

    it("moves a sense out from sidebar to different word", () => {
      const srcWordId = "word2";
      const testRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
        order: 1,
      };
      const srcGuid = `${testRef.mergeSenseId}_${testRef.order}`;

      const destWordId = "word3";

      // Intercept the uuid that will be assigned.
      const nextGuid = getMockUuid(false);
      const testAction = Actions.moveSense(testRef, destWordId, 2);

      const expectedWords = testTreeWords();
      expectedWords[srcWordId].sensesGuids = {
        word2_senseA: ["word2_senseA_0"],
      };
      // A new guid is used when a sense is added to a merge word, so use the intercepted
      // nextGuid for the new sense expected from moving a sense out of a sidebar.
      expectedWords[destWordId].sensesGuids[nextGuid] = [srcGuid];

      checkTreeWords(testAction, expectedWords);
    });

    it("moves last sense out from sidebar to different word", () => {
      const srcWordId = "word3";
      const testRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
        order: 0,
      };

      const destWordId = "word1";

      const testAction = Actions.moveSense(testRef, destWordId, 1);

      const expectedWords = testTreeWords();
      expectedWords[srcWordId].sensesGuids = {
        word3_senseB: ["word3_senseB_0", "word3_senseB_1"],
      };
      expectedWords[destWordId].sensesGuids = {
        word1_senseA: ["word1_senseA_0"],
        word3_senseA: ["word3_senseA_0"],
      };

      checkTreeWords(testAction, expectedWords);
    });

    it("moves a sense to a different word", () => {
      const srcWordId = "word3";
      const testRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseB`,
      };

      const destWordId = "word1";

      const testAction = Actions.moveSense(testRef, destWordId, 1);

      const expectedWords = testTreeWords();
      expectedWords[srcWordId].sensesGuids = {
        word3_senseA: ["word3_senseA_0"],
      };
      expectedWords[destWordId].sensesGuids = {
        word1_senseA: ["word1_senseA_0"],
        word3_senseB: ["word3_senseB_0", "word3_senseB_1"],
      };

      checkTreeWords(testAction, expectedWords);
    });

    it("moves last sense to a different word", () => {
      const srcWordId = "word1";
      const testRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: `${srcWordId}_senseA`,
      };

      const destWordId = "word2";

      const testAction = Actions.moveSense(testRef, destWordId, 1);
      expect(testAction.type).toEqual(MergeTreeActionTypes.MOVE_SENSE);

      const expectedWords = testTreeWords();
      delete expectedWords[srcWordId];
      expectedWords[destWordId].sensesGuids = {
        word2_senseA: ["word2_senseA_0", "word2_senseA_1"],
        word1_senseA: ["word1_senseA_0"],
      };

      checkTreeWords(testAction, expectedWords);
    });
  });

  describe("orderSense", () => {
    it("order sidebar sense", () => {
      const wordId = "word2";
      const mergeSenseId = `${wordId}_senseA`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId, order: 0 };

      const testAction = Actions.orderSense(testRef, 1);

      const expectedWords = testTreeWords();
      expectedWords[wordId].sensesGuids[mergeSenseId] = [
        "word2_senseA_1",
        "word2_senseA_0",
      ];

      checkTreeWords(testAction, expectedWords);
    });

    it("order word sense", () => {
      const wordId = "word3";
      const mergeSenseId = `${wordId}_senseA`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId };

      const testAction = Actions.orderSense(testRef, 1);

      const expectedWords = testTreeWords();
      expectedWords[wordId].sensesGuids = {
        word3_senseB: ["word3_senseB_0", "word3_senseB_1"],
        word3_senseA: ["word3_senseA_0"],
      };

      checkTreeWords(testAction, expectedWords);
    });
  });

  test("Reset returns default state", () => {
    const action: StoreAction = {
      type: StoreActionTypes.RESET,
    };

    expect(mergeDupStepReducer({} as MergeTreeState, action)).toEqual(
      defaultState
    );
  });

  test("setWordData", () => {
    const wordList = testWordList();
    const treeState = mergeDupStepReducer(
      undefined,
      Actions.setWordData(wordList)
    );
    // check if data has all words present
    for (const word of wordList) {
      const srcWordId = word.id;
      expect(Object.keys(treeState.data.words)).toContain(srcWordId);
      // check each sense of word
      for (const [order, sense] of word.senses.entries()) {
        const treeSense = convertSenseToMergeTreeSense(sense, srcWordId, order);
        const senses = treeState.data.senses;
        expect(Object.values(senses).map((s) => JSON.stringify(s))).toContain(
          JSON.stringify(treeSense)
        );
        // check that this sense is somewhere in the tree
        expect(
          getRefByGuid(treeSense.guid, treeState.tree.words)
        ).toBeDefined();
      }
    }
  });
});
