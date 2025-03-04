import { Sense, Word } from "api/models";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { newSemanticDomain } from "types/semanticDomain";
import { newFlag, newNote, newSense, newWord } from "types/word";
import { Bcp47Code } from "types/writingSystem";

export default function mockWords(): ReviewEntriesWord[] {
  return [
    {
      ...new ReviewEntriesWord(),
      id: "0",
      vernacular: "toad",
      senses: [
        {
          ...new ReviewEntriesSense(),
          guid: "1",
          glosses: [
            { def: "bup", language: Bcp47Code.En },
            { def: "AHHHHHH", language: Bcp47Code.Es },
          ],
          domains: [newSemanticDomain("number", "domain")],
        },
      ],
      noteText: "first word",
    },
    {
      ...new ReviewEntriesWord(),
      id: "1",
      vernacular: "vern",
      senses: [
        {
          ...new ReviewEntriesSense(),
          guid: "2",
          glosses: [{ def: "gloss", language: Bcp47Code.En }],
          domains: [newSemanticDomain("number", "domain")],
        },
      ],
      flag: newFlag("second word"),
    },
  ];
}

export function mockCreateWord(word: ReviewEntriesWord): Word {
  return {
    ...newWord(word.vernacular),
    id: word.id,
    senses: word.senses.map((sense) => createMockSense(sense)),
    note: newNote(word.noteText),
    flag: word.flag,
  };
}

function createMockSense(sense: ReviewEntriesSense): Sense {
  return {
    ...newSense(),
    guid: sense.guid,
    definitions: [...sense.definitions],
    glosses: [...sense.glosses],
    semanticDomains: [...sense.domains],
  };
}
