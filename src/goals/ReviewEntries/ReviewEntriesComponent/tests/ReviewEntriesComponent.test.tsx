import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import ReviewEntriesComponent from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesComponent";
import mockWords, {
  mockCreateWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

const mockGetFrontierWords = jest.fn();
const mockMaterialTable = jest.fn();
const mockUpdateAllWords = jest.fn();
const mockUuid = jest.fn();
const mockEnqueue = jest.fn();

// To deal with the table not wanting to behave in testing.
jest.mock("@material-table/core", () => ({
  __esModule: true,
  default: () => mockMaterialTable(),
}));
// Standard dialog mock-out.
jest.mock("@mui/material", () => {
  const material = jest.requireActual("@mui/material");
  return {
    ...material,
    Dialog: material.Container,
  };
});

jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));
jest.mock("uuid", () => ({ v4: () => mockUuid() }));
jest.mock("backend", () => ({
  getFrontierWords: () => mockGetFrontierWords(),
}));
// Mock the node module used by AudioRecorder.
jest.mock("components/Pronunciations/Recorder");
jest.mock("components/TreeView/TreeViewComponent", () => "div");

// Mock store + axios
const mockReviewEntryWords = mockWords();
const state = {
  currentProjectState: {
    project: { definitionsEnabled: true },
  },
  reviewEntriesState: { words: mockReviewEntryWords },
  treeViewState: {
    open: false,
    currentDomain: {
      name: "domain",
      id: "number",
      subdomains: [],
    },
  },
};
const mockStore = configureMockStore()(state);

function setMockFunctions() {
  mockGetFrontierWords.mockResolvedValue(
    mockReviewEntryWords.map(mockCreateWord)
  );
  mockMaterialTable.mockReturnValue(React.Fragment);
}

beforeEach(() => {
  // Prep for component creation
  setMockFunctions();
  for (const word of mockReviewEntryWords) {
    for (const sense of word.senses) {
      mockUuid.mockImplementationOnce(() => sense.guid);
    }
  }

  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <ReviewEntriesComponent
          updateAllWords={mockUpdateAllWords}
          updateFrontierWord={jest.fn()}
        />
      </Provider>
    );
  });
});

describe("ReviewEntriesComponent", () => {
  it("Initializes correctly", () => {
    expect(mockUpdateAllWords).toHaveBeenCalledWith(
      mockReviewEntryWords.map((word) => ({
        ...word,
        recorder: expect.any(Object),
      }))
    );
  });
});
