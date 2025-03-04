import { List, ListItem, Typography } from "@mui/material";
import React from "react";

import { Project } from "api/models";
import { getAllActiveProjectsByUser } from "backend";
import { getUserId } from "backend/localStorage";
import { randomIntString } from "utilities";

interface SwitchProps {
  project: Project;
  setCurrentProject: (project: Project) => void;
}

interface SwitchState {
  projectList: Project[];
}

export class ProjectSwitch extends React.Component<SwitchProps, SwitchState> {
  constructor(props: SwitchProps) {
    super(props);
    this.state = { projectList: [] };
  }

  async componentDidMount() {
    await this.updateProjectList();
  }

  async componentDidUpdate(prevProps: SwitchProps) {
    if (prevProps.project.name !== this.props.project.name) {
      await this.updateProjectList();
    }
  }

  private async updateProjectList() {
    const userId = getUserId();
    if (userId) {
      const projectList = await getAllActiveProjectsByUser(userId);
      this.setState({ projectList });
    }
  }

  private selectProject(project: Project) {
    this.props.setCurrentProject(project);
  }

  getListItems() {
    return this.state.projectList.map((project) => {
      return (
        <ListItem
          key={project.id + randomIntString()}
          button
          onClick={() => this.selectProject(project)}
        >
          <Typography
            variant="h6"
            color={
              project.id !== this.props.project.id ? "textSecondary" : "inherit"
            }
          >
            {project.name}
          </Typography>
        </ListItem>
      );
    });
  }

  render() {
    return <List>{this.getListItems()}</List>;
  }
}

export default ProjectSwitch;
