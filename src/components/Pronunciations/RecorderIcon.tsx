import { FiberManualRecord } from "@mui/icons-material";
import { IconButton, Theme, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";

import {
  recording,
  reset,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { themeColors } from "types/theme";

interface RecorderIconProps {
  wordId: string;
  startRecording: () => void;
  stopRecording: () => void;
}

export default function RecorderIcon(props: RecorderIconProps) {
  const pronunciationsState = useAppSelector(
    (state: StoreState) => state.pronunciationsState
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const useStyles = makeStyles((theme: Theme) => ({
    button: {
      marginRight: theme.spacing(1),
    },
    iconPress: {
      color: themeColors.recordActive,
    },
    iconRelease: {
      color: themeColors.recordIdle,
    },
  }));

  const classes = useStyles();

  function toggleIsRecordingToTrue() {
    dispatch(recording(props.wordId));
    props.startRecording();
  }
  function toggleIsRecordingToFalse() {
    props.stopRecording();
    dispatch(reset());
  }

  function handleTouchStart() {
    // Temporarily disable context menu since some browsers
    // interpret a long-press touch as a right-click.
    document.addEventListener("contextmenu", disableContextMenu, false);
    toggleIsRecordingToTrue();
  }
  function handleTouchEnd() {
    enableContextMenu();
    toggleIsRecordingToFalse();
  }

  function disableContextMenu(event: any) {
    event.preventDefault();
    enableContextMenu();
  }
  function enableContextMenu() {
    document.removeEventListener("contextmenu", disableContextMenu, false);
  }

  return (
    <Tooltip title={t("pronunciations.recordTooltip")} placement="top">
      <IconButton
        tabIndex={-1}
        onMouseDown={toggleIsRecordingToTrue}
        onTouchStart={handleTouchStart}
        onMouseUp={toggleIsRecordingToFalse}
        onTouchEnd={handleTouchEnd}
        className={classes.button}
        aria-label="record"
        id="recordingButton"
        size="large"
      >
        <FiberManualRecord
          className={
            pronunciationsState.type === PronunciationsStatus.Recording &&
            pronunciationsState.payload === props.wordId
              ? classes.iconPress
              : classes.iconRelease
          }
          id="icon"
        />
      </IconButton>
    </Tooltip>
  );
}
