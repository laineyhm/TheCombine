import { Drawer, Grid, List } from "@mui/material";
import React from "react";

import { SemanticDomain } from "api/models";
import { ImmutableExistingData } from "components/DataEntry/ExistingDataTable/ImmutableExistingData";
import theme from "types/theme";
import { DomainWord } from "types/word";

interface ExistingDataTableProps {
  domain: SemanticDomain;
  typeDrawer?: boolean;
  domainWords: DomainWord[];
  drawerOpen?: boolean;
  toggleDrawer: (openClosed: boolean) => void;
}

/*Displays previously entered data in a panel to the right of the DataEntryTable */
export class ExistingDataTable extends React.Component<ExistingDataTableProps> {
  closeDrawer = () => {
    this.props.toggleDrawer(false);
  };

  list() {
    const domainWords = this.props.domainWords;
    return (
      <List style={{ minWidth: "300px" }}>
        {domainWords.map((domainWord) => (
          <ImmutableExistingData
            key={`${domainWord.wordGuid}-${domainWord.senseGuid}`}
            vernacular={domainWord.vernacular}
            gloss={domainWord.gloss}
          />
        ))}
      </List>
    );
  }

  renderDrawer() {
    return (
      <React.Fragment>
        <div onClick={this.closeDrawer} onKeyDown={this.closeDrawer}>
          <Drawer
            role="presentation"
            anchor={"left"}
            open={this.props.drawerOpen}
            onClose={this.closeDrawer}
            style={{ zIndex: theme.zIndex.drawer + 1 }}
          >
            {this.list()}
          </Drawer>
        </div>
      </React.Fragment>
    );
  }

  renderSidePanel() {
    return (
      <React.Fragment>
        <Grid item md={5} lg={4}>
          {this.list()}
        </Grid>
      </React.Fragment>
    );
  }

  /*Make an interface that has the Word and an array of numbers to reference the senses desired to be displayed*/
  render() {
    if (this.props.domainWords.length > 0) {
      return (
        <React.Fragment>
          {this.props.typeDrawer ? this.renderDrawer() : this.renderSidePanel()}
        </React.Fragment>
      );
    }
    return null;
  }
}
