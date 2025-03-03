import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer, { ReactTestInstance } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import { Word } from "api/models";
import {
  StyledMenuItem,
  VernList,
} from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import theme from "types/theme";
import { simpleWord, testWordList } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";

jest.mock(
  "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/GlossCell",
  () => "div"
);

const mockState = {
  currentProjectState: {
    project: { analysisWritingSystems: [defaultWritingSystem] },
  },
};
const mockStore = configureMockStore()(mockState);

describe("VernList ", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={mockStore}>
              <VernList
                vernacularWords={[simpleWord("", "")]}
                closeDialog={jest.fn()}
                analysisLang={defaultWritingSystem.bcp47}
              />
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      );
    });
  });

  it("closes dialog when selecting a menu item", () => {
    const closeDialogMockCallback = jest.fn();
    const words = testWordList();
    const instance = createVernListInstance(words, closeDialogMockCallback);
    const menuItem = instance.findByProps({ id: words[0].id });
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(0);
    menuItem.props.onClick();
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(1);
  });

  it("has the correct number of menu items", () => {
    const words = testWordList();
    const instance = createVernListInstance(words, jest.fn());
    const menuItemsCount = instance.findAllByType(StyledMenuItem).length;
    expect(words.length + 1).toBe(menuItemsCount);
  });
});

function createVernListInstance(
  _vernacularWords: Word[],
  _mockCallback: jest.Mock
): ReactTestInstance {
  return renderer.create(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Provider store={mockStore}>
          <VernList
            vernacularWords={_vernacularWords}
            closeDialog={_mockCallback}
            analysisLang={defaultWritingSystem.bcp47}
          />
        </Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  ).root;
}
