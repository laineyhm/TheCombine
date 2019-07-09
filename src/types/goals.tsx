import { User } from "./user";
import { MergeStepData, MergeDupData } from "../goals/MergeDupGoal/MergeDups";
import { MergeDupProps } from "../goals/MergeDupGoal/MergeDups";

export enum GoalOption {
  Complete,
  Abandon,
  Current
}

export enum Tools {
  TempTool, // To be removed once testing is finished
  FixDups,
  CharInv,
  CharCreate
}

export type GoalProps = MergeDupProps;

export type GoalData = MergeDupData | {}; // | OtherTypes

export type MockGoalStepType = {};

export type GoalStep = MergeStepData; // | OtherTypes

export interface GoalViewState {
  state: GoalsState;
}

// The representation of goals in the redux store
export interface GoalsState {
  historyState: GoalHistoryState;
  allPossibleGoals: Goal[];
  suggestionsState: GoalSuggestionsState;
}

export interface GoalHistoryState {
  history: Goal[];
}

export interface GoalSuggestionsState {
  suggestions: Goal[];
}

export interface GoalSwitcherState {
  allPossibleGoals: Goal[];
}

export interface GoalSelectorState {
  selectedIndex: number;
  allPossibleGoals: Goal[];
  mouseX: number;
  lastIndex: number;
}

export interface Goal {
  goalType: GoalType;
  name: string;
  user: User;

  steps: GoalStep[];
  numSteps: number;
  currentStep: number;
  data: GoalData; // The data required to load/reload this exact goal

  tool: Tools;
  completed: boolean;
  result: GoalOption;
}

export enum GoalType {
  CreateCharInv,
  ValidateChars,
  CreateStrWordInv,
  ValidateStrWords,
  MergeDups,
  SpellcheckGloss,
  ViewFind,
  HandleFlags
}
