import { ArrowForwardIos, WarningOutlined } from "@mui/icons-material";
import {
  CardContent,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React, { ReactElement } from "react";
import { useSelector } from "react-redux";

import { Sense, Status } from "api/models";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { StoreState } from "types";
import theme from "types/theme";

interface SenseInLanguage {
  language: string; // bcp-47 code
  glossText: string;
  definitionText?: string;
}

function getSenseInLanguage(
  sense: Sense,
  includeDefinitions: boolean,
  language: string,
  displaySep = "; "
): SenseInLanguage {
  return {
    language,
    glossText: sense.glosses
      .filter((g) => g.language === language)
      .map((g) => g.def)
      .join(displaySep),
    definitionText: includeDefinitions
      ? sense.definitions
          .filter((d) => d.language === language)
          .map((d) => d.text)
          .join(displaySep)
      : undefined,
  };
}

function getSenseInLanguages(
  sense: Sense,
  includeDefinitions: boolean,
  languages?: string[]
): SenseInLanguage[] {
  if (!languages) {
    languages = sense.glosses.map((g) => g.language);
    if (includeDefinitions) {
      languages.push(...sense.definitions.map((d) => d.language));
    }
    languages = [...new Set(languages)];
  }
  return languages.map((l) => getSenseInLanguage(sense, includeDefinitions, l));
}

function senseText(senseInLangs: SenseInLanguage[]): ReactElement {
  return (
    <Table padding="none">
      <TableBody>
        {senseInLangs.map((sInLang, index) => (
          <React.Fragment key={index}>
            <TableRow key={sInLang.language}>
              <TableCell style={{ borderBottom: "none" }}>
                <Typography variant="caption">{`${sInLang.language}: `}</Typography>
              </TableCell>
              <TableCell style={{ borderBottom: "none" }}>
                <Typography
                  variant="h5"
                  style={{ marginBottom: theme.spacing(1) }}
                >
                  {sInLang.glossText}
                </Typography>
              </TableCell>
            </TableRow>
            {!!sInLang.definitionText && (
              <TableRow key={sInLang.language + "def"}>
                <TableCell style={{ borderBottom: "none" }} />
                <TableCell style={{ borderBottom: "none" }}>
                  <div
                    style={{
                      marginBottom: theme.spacing(1),
                      paddingLeft: theme.spacing(1),
                      borderLeft: "1px solid black",
                    }}
                  >
                    <Typography variant="h6" color="textSecondary">
                      {sInLang.definitionText}
                    </Typography>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

interface SenseCardContentProps {
  senses: Sense[];
  languages?: string[];
  sidebar?: boolean;
  toggleFunction?: () => void;
}

// Only show first sense's glosses/definitions; in merging, others deleted as duplicates.
// Show semantic domains from all senses.
// In merging, user can select a different one by reordering in the sidebar.
export default function SenseCardContent(
  props: SenseCardContentProps
): ReactElement {
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const senseTextInLangs = getSenseInLanguages(
    props.senses[0],
    showDefinitions,
    props.languages
  );
  const semDoms = [
    ...new Set(
      props.senses.flatMap((s) =>
        s.semanticDomains.map((dom) => `${dom.id}: ${dom.name}`)
      )
    ),
  ];
  const protectedWarning =
    !props.sidebar && props.senses[0].accessibility === Status.Protected;

  return (
    <CardContent style={{ position: "relative", paddingRight: 40 }}>
      {/* Warning for protected senses. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        {protectedWarning && (
          <IconButtonWithTooltip
            icon={<WarningOutlined />}
            textId={"mergeDups.helpText.protectedSense"}
            side={"top"}
            small
          />
        )}
      </div>
      {/* Button for showing the sidebar, when sense card has multiple senses. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
        }}
      >
        {props.senses.length > 1 && (
          <IconButton
            onClick={props.toggleFunction}
            id={`sidebar-open-sense-${props.senses[0].guid}`}
            size="large"
          >
            <ArrowForwardIos />
          </IconButton>
        )}
      </div>
      {/* List glosses and (if enabled) definitions. */}
      {senseText(senseTextInLangs)}
      {/* List semantic domains */}
      <Grid container spacing={2}>
        {semDoms.map((dom) => (
          <Grid item key={dom}>
            <Chip label={dom} />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
}
