import loadable from "@loadable/component";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCurrentGoal } from "components/GoalTimeline/GoalsActions";
import PageNotFound from "components/PageNotFound/component";
import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import Loading from "goals/DefaultGoal/Loading";
import { clearTree } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import { clearReviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import { StoreState } from "types";
import { Goal, GoalStatus, GoalType } from "types/goals";

const CharInv = loadable(
  () => import("goals/CreateCharInv/CharInvComponent/CharInv")
);
const MergeDupStep = loadable(() => import("goals/MergeDupGoal/MergeDupStep"));
const ReviewEntriesComponent = loadable(
  () => import("goals/ReviewEntries/ReviewEntriesComponent")
);

function displayComponent(goal: Goal) {
  switch (goal.goalType) {
    case GoalType.CreateCharInv:
      return <CharInv completed={goal.status === GoalStatus.Completed} />;
    case GoalType.MergeDups:
      return <MergeDupStep />;
    case GoalType.ReviewEntries:
      return <ReviewEntriesComponent />;
    default:
      return <PageNotFound />;
  }
}

export default function LoadingGoalScreen() {
  const goalStatus = useSelector(
    (state: StoreState) => state.goalsState.currentGoal.status
  );
  return goalStatus === GoalStatus.Loading ? <Loading /> : <BaseGoalScreen />;
}

/**
 * Decides which component should be rendered for a goal.
 */
export function BaseGoalScreen() {
  const goal = useSelector((state: StoreState) => state.goalsState.currentGoal);
  const dispatch = useDispatch();
  useEffect(() => {
    return function cleanup() {
      dispatch(setCurrentGoal());
      dispatch(clearReviewEntriesState());
      dispatch(clearTree());
    };
  }, [dispatch]);

  return (
    <React.Fragment>
      <DisplayProgress />
      {displayComponent(goal)}
    </React.Fragment>
  );
}
