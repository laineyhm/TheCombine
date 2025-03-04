import { ListItem } from "@mui/material";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import "tests/mockReactI18next";

import { SemanticDomainUserCount } from "api";
import DomainUserStatistics from "components/Statistics/UserStatistics/DomainUserStatistics";
import { newSemanticDomainUserCount } from "types/semanticDomain";

let testRenderer: ReactTestRenderer;

const mockProjectId = "mockProjectId";
const mockSemanticDomainUserCount = newSemanticDomainUserCount();
const mockSemanticDomainUserCountArray: Array<SemanticDomainUserCount> = [
  mockSemanticDomainUserCount,
];

const mockGetDomainSenseUserStatistics = jest.fn();
const mockGetProjectId = jest.fn();

jest.mock("backend", () => ({
  getSemanticDomainUserCount: (projectId: string, lang?: string) =>
    mockGetDomainSenseUserStatistics(projectId, lang),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: () => mockGetProjectId(),
}));

function setMockFunctions() {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetDomainSenseUserStatistics.mockResolvedValue(
    mockSemanticDomainUserCountArray
  );
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMockFunctions();
  await renderer.act(async () => {
    testRenderer = renderer.create(<DomainUserStatistics lang={""} />);
  });
});

describe("SemanticDomainStatistics", () => {
  it("renders without crashing, UI does not change unexpectedly", async () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it("useEffect hook was called", async () => {
    //Verify the mock function called
    expect(mockGetProjectId).toBeCalled();

    //Verify ListItem for the DomainSenseUserCount object is present
    const newSenDomCountList = testRenderer.root.findAllByType(ListItem);
    expect(newSenDomCountList.length).toEqual(
      mockSemanticDomainUserCountArray.length
    );
  });
});
