import { Cached, Error as ErrorIcon } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import React, { createRef, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getProjectName } from "backend";
import {
  asyncDownloadExport,
  resetExport,
} from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { themeColors } from "types/theme";
import { getNowDateTimeString } from "utilities";

interface DownloadButtonProps {
  colorSecondary?: boolean;
}

/**
 * A button to show export status. This automatically initiates a download
 * when a user's export is done, so there should be exactly one copy of this
 * component rendered at any given time in the logged-in app. */
export default function DownloadButton(props: DownloadButtonProps) {
  const exportState = useAppSelector(
    (state: StoreState) => state.exportProjectState
  );
  const dispatch = useAppDispatch();
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileUrl, setFileUrl] = useState<string | undefined>();
  const { t } = useTranslation();
  const downloadLink = createRef<HTMLAnchorElement>();

  useEffect(() => {
    if (downloadLink.current && fileUrl) {
      downloadLink.current.click();
      URL.revokeObjectURL(fileUrl);
      setFileUrl(undefined);
    }
  }, [downloadLink, fileUrl]);

  useEffect(() => {
    if (exportState.status === ExportStatus.Success) {
      download();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportState.status]);

  function makeExportName(projectName: string) {
    return `${projectName}_${getNowDateTimeString()}.zip`;
  }

  function download() {
    getProjectName(exportState.projectId).then((projectName) => {
      setFileName(makeExportName(projectName));
      asyncDownloadExport(exportState.projectId)(dispatch)
        .then((url) => {
          if (url) {
            setFileUrl(url);
            reset();
          }
        })
        .catch(console.error);
    });
  }

  function reset() {
    resetExport(exportState.projectId)(dispatch);
  }

  function textId(): string {
    switch (exportState.status) {
      case ExportStatus.Exporting:
        return "projectExport.exportInProgress";
      case ExportStatus.Success:
      case ExportStatus.Downloading:
        return "projectExport.downloadInProgress";
      case ExportStatus.Failure:
        return "projectExport.exportFailed";
      default:
        throw new Error("Not implemented");
    }
  }

  function icon(): ReactElement {
    switch (exportState.status) {
      case ExportStatus.Exporting:
      case ExportStatus.Downloading:
      case ExportStatus.Success:
        return <Cached />;
      case ExportStatus.Failure:
        return <ErrorIcon />;
      default:
        return <div />;
    }
  }

  function iconColor() {
    return exportState.status === ExportStatus.Failure
      ? themeColors.error
      : props.colorSecondary
      ? themeColors.secondary
      : themeColors.primary;
  }

  function iconFunction(): () => void {
    switch (exportState.status) {
      case ExportStatus.Failure:
        return reset;
      default:
        return () => {};
    }
  }

  return (
    <React.Fragment>
      {exportState.status !== ExportStatus.Default && (
        <Tooltip title={t(textId())} placement="bottom">
          <IconButton
            tabIndex={-1}
            onClick={iconFunction()}
            style={{ color: iconColor() }}
            size="large"
          >
            {icon()}
          </IconButton>
        </Tooltip>
      )}
      {fileUrl && (
        <a
          ref={downloadLink}
          href={fileUrl}
          download={fileName}
          style={{ display: "none" }}
        >
          (This link should not be visible)
        </a>
      )}
    </React.Fragment>
  );
}
