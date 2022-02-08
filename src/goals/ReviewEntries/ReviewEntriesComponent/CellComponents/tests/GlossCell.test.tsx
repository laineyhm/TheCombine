import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import GlossCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/GlossCell";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

// The multiline Input, TextField cause problems in the mock environment.
jest.mock("@material-ui/core/Input", () => "div");
jest.mock("@material-ui/core/TextField", () => "div");

const mockStore = configureMockStore()({
  currentProjectState: {
    project: { analysisWritingSystems: [{ bcp47: "en" }] },
  },
});
const mockWord = mockWords()[0];

describe("GlossCell", () => {
  it("renders sort-stylized without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <GlossCell rowData={mockWord} value={mockWord.senses} sortingByThis />
        </Provider>
      );
    });
  });

  it("renders editable without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <GlossCell rowData={mockWord} value={mockWord.senses} editable />
        </Provider>
      );
    });
  });
});
