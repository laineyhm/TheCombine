import React from "react";
import { Translate } from "react-localize-redux";
import {
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import {
  CloudUpload,
  Edit,
  GetApp,
  List,
  People,
  PersonAdd,
  Sms,
  Language,
} from "@material-ui/icons";

import { AutocompleteSetting, Permission, Project } from "api/models";
import * as backend from "backend";
import BaseSettingsComponent from "components/BaseSettings/BaseSettingsComponent";
import ExportProjectButton from "components/ProjectExport";
import ProjectImport from "components/ProjectSettings/ProjectImport";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages";
import ProjectName from "components/ProjectSettings/ProjectName";
import ProjectSwitch from "components/ProjectSettings/ProjectSwitch";
import ProjectUsers, {
  ActiveUsers,
} from "components/ProjectSettings/ProjectUsers";

interface ProjectSettingsProps {
  project: Project;
}

interface ProjectSettingsState {
  projectName?: string;
  imports?: boolean;
  editUsers?: boolean;
  autocompleteSetting?: AutocompleteSetting;
  loading: boolean;
}

export default class ProjectSettingsComponent extends React.Component<
  ProjectSettingsProps,
  ProjectSettingsState
> {
  constructor(props: ProjectSettingsProps) {
    super(props);
    this.state = { loading: true };
  }

  async componentDidMount() {
    await this.getSettings();
  }

  private async getSettings() {
    const allPermissions = await backend.getUserRoles();
    const currentRole = allPermissions.find(
      (value) => value.projectId === this.props.project.id
    );
    const settings: ProjectSettingsState = { ...this.state };

    if (currentRole !== undefined)
      for (const role of currentRole.permissions) {
        if (role === Permission.ImportExport) {
          settings.projectName = this.props.project.name;
          settings.autocompleteSetting = this.props.project.autocompleteSetting;
          settings.imports = await backend.canUploadLift();
        }
        if (role === Permission.DeleteEditSettingsAndUsers) {
          settings.editUsers = true;
        }
      }
    settings.loading = false;
    this.setState(settings);
  }

  async componentDidUpdate(prevProps: ProjectSettingsProps) {
    if (prevProps.project.id !== this.props.project.id) {
      await this.getSettings();
    }
  }

  render() {
    return (
      <React.Fragment>
        {!this.state.loading && (
          <Grid container justify="center" spacing={6}>
            {/* Project List */}
            <BaseSettingsComponent
              icon={<List />}
              title={<Translate id="projectSettings.projectList" />}
              body={<ProjectSwitch />}
            />

            {/* Project name */}
            {this.props.project.name && (
              <BaseSettingsComponent
                icon={<Edit />}
                title={<Translate id="projectSettings.name" />}
                body={<ProjectName />}
              />
            )}

            {/*Project Vernacular and Analysis Languages*/}
            {this.props.project.name && (
              <BaseSettingsComponent
                icon={<Language />}
                title={
                  <Translate id="projectSettings.language.interfaceLanguage" />
                }
                body={<ProjectLanguages />}
              />
            )}

            {/* Import Lift file */}
            <BaseSettingsComponent
              icon={<CloudUpload />}
              title={<Translate id="projectSettings.import.header" />}
              body={
                this.state.imports ? (
                  <ProjectImport />
                ) : (
                  <Typography variant="caption">
                    <Translate id="projectSettings.import.notAllowed" />
                  </Typography>
                )
              }
            />

            {/* Export Lift file */}
            <BaseSettingsComponent
              icon={<GetApp />}
              title={<Translate id="projectSettings.exportProject.label" />}
              body={<ExportProjectButton projectId={this.props.project.id} />}
            />

            {/* Autocomplete setting */}
            <BaseSettingsComponent
              icon={<Sms />}
              title={<Translate id="projectSettings.autocomplete.label" />}
              body={
                <FormControl>
                  <Select
                    value={this.props.project.autocompleteSetting}
                    onChange={(
                      event: React.ChangeEvent<{
                        name?: string;
                        value: unknown;
                      }>
                    ) => {
                      this.props.project.autocompleteSetting = event.target
                        .value as AutocompleteSetting;
                      this.setState({
                        autocompleteSetting: event.target
                          .value as AutocompleteSetting,
                      });
                      backend
                        .updateProject(this.props.project)
                        .catch(() =>
                          console.log(
                            "failed: " + this.props.project.autocompleteSetting
                          )
                        );
                    }}
                  >
                    <MenuItem value="Off">
                      <Translate id="projectSettings.autocomplete.off" />
                    </MenuItem>
                    <MenuItem value="On">
                      <Translate id="projectSettings.autocomplete.on" />
                    </MenuItem>
                  </Select>
                </FormControl>
              }
            />

            {/* See current users in project */}
            {this.state.projectName && (
              <BaseSettingsComponent
                icon={<People />}
                title={<Translate id="projectSettings.user.currentUsers" />}
                body={<ActiveUsers />}
              />
            )}

            {/* Add users to project */}
            {this.state.projectName && (
              <BaseSettingsComponent
                icon={<PersonAdd />}
                title={<Translate id="projectSettings.user.addUser" />}
                body={<ProjectUsers />}
              />
            )}
          </Grid>
        )}
      </React.Fragment>
    );
  }
}
