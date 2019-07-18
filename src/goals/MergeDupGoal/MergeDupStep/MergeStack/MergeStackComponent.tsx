import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { MergeTreeReference, Hash, TreeDataSense } from "../MergeDupsTree";
import Card from "@material-ui/core/Card/Card";
import {
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Select,
  MenuItem
} from "@material-ui/core";
import { uuid } from "../../../../utilities";
import {
  Sort,
  ArrowForwardIos,
  ExpandMore,
  ExpandLess
} from "@material-ui/icons";
import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Gloss } from "../../../../types/word";
import { SideBar } from "../MergeDupStepComponent";

//interface for component props
export interface MergeStackProps {
  dropWord?: () => void;
  dragWord?: (ref: MergeTreeReference) => void;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  draggedWord?: MergeTreeReference;
  wordID: string;
  senseID: string;
  sense: Hash<string>;
  senses: Hash<TreeDataSense>;
  index: number;
  setSidebar: (el: SideBar) => void;
  sideBar: SideBar;
}

//interface for component state
interface MergeStackState {
  anchorEl?: HTMLElement;
  expanded: boolean;
}

// Constants
const WIDTH: string = "16vw"; // Width of each card

function arraysEqual<T>(arr1: T[], arr2: T[]) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

class MergeStack extends React.Component<
  MergeStackProps & LocalizeContextProps,
  MergeStackState
> {
  constructor(props: MergeStackProps & LocalizeContextProps) {
    super(props);
    this.state = { expanded: false };
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (this.props.draggedWord && this.props.moveSense) {
      let ref = {
        word: this.props.wordID,
        sense: this.props.senseID,
        duplicate: uuid()
      };
      this.props.moveSense(this.props.draggedWord, ref);
    }
  }

  expand() {
    let senseEntries = Object.entries(this.props.sense).map(sense => ({
      id: sense[0],
      data: this.props.senses[sense[1]]
    }));

    this.props.setSidebar({
      senses: senseEntries,
      wordID: this.props.wordID,
      senseID: this.props.senseID
    });
  }

  render() {
    let lang = "en";

    let senses = Object.values(this.props.sense).map(
      senseID => this.props.senses[senseID]
    );

    let senseEntries = Object.entries(this.props.sense).map(sense => ({
      id: sense[0],
      data: this.props.senses[sense[1]]
    }));

    let glosses: { def: string; language: string; sense: string }[] = [];
    for (let entry of senseEntries) {
      for (let gloss of entry.data.glosses) {
        glosses.push({
          def: gloss.def,
          language: gloss.language,
          sense: entry.id
        });
      }
    }
    glosses = glosses.filter(
      (v, i, a) => a.findIndex(o => o.def === v.def) === i
    );

    let semDoms = [
      ...new Set(
        senses
          .map(sense =>
            sense.semanticDomains.map(dom => `${dom.name} ${dom.id}`)
          )
          .flat()
      )
    ];

    let showMoreButton = Object.keys(this.props.sense).length > 1;

    if (
      this.props.sideBar.wordID === this.props.wordID &&
      this.props.sideBar.senseID === this.props.senseID &&
      !arraysEqual(
        this.props.sideBar.senses.map(a => a.id),
        senseEntries.map(a => a.id)
      )
    ) {
      this.props.setSidebar({
        senses: senseEntries,
        wordID: this.props.wordID,
        senseID: this.props.senseID
      });
    }
    return (
      <Draggable
        key={this.props.senseID}
        draggableId={JSON.stringify({
          word: this.props.wordID,
          sense: this.props.senseID
        })}
        index={this.props.index}
        type="SENSE"
      >
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              margin: 8,
              userSelect: "none",
              minWidth: 150,
              maxWidth: 300,
              background: snapshot.isDragging ? "lightgreen" : "white"
            }}
          >
            <CardContent style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 0,
                  transform: "translateY(-50%)"
                }}
              >
                {showMoreButton && (
                  <IconButton onClick={() => this.expand()}>
                    <ArrowForwardIos />
                  </IconButton>
                )}
              </div>
              <div style={{ overflow: "hidden" }}>
                <Typography variant={"h5"}>{glosses[0].def}</Typography>
                {/* List semantic domains */}
                <Grid container spacing={2}>
                  {semDoms.map(dom => (
                    <Grid item xs key={dom}>
                      <Chip label={dom} onDelete={() => {}} />
                    </Grid>
                  ))}
                </Grid>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  }
}

//export class as default
export default withLocalize(MergeStack);
