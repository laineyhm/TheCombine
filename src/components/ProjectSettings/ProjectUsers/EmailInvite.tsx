import { Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import validator from "validator";

import { User } from "api/models";
import * as backend from "backend";
import { getProjectId } from "backend/localStorage";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";

interface InviteProps extends WithTranslation {
  addToProject: (user: User) => void;
  close: () => void;
}

interface InviteState {
  emailAddress: string;
  message: string;
  isValid: boolean;
  loading: boolean;
  done: boolean;
}

class EmailInvite extends React.Component<InviteProps, InviteState> {
  constructor(props: InviteProps) {
    super(props);
    this.state = {
      emailAddress: "",
      message: "",
      isValid: false,
      loading: false,
      done: false,
    };
  }

  async onSubmit() {
    this.setState({ loading: true });
    const email = this.state.emailAddress;
    if (await backend.isEmailTaken(email)) {
      await backend.getUserByEmail(email).then((u) => {
        this.props.addToProject(u);
        toast.error(this.props.t("projectSettings.invite.userExists"));
      });
    } else {
      await backend.emailInviteToProject(
        getProjectId(),
        email,
        this.state.message
      );
    }
    this.setState({ loading: false, done: true });
    this.props.close();
  }

  /** Updates the state to match the value in a textbox */
  updateEmailField(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const emailAddress = e.target.value;
    const isValid =
      validator.isEmail(emailAddress) && emailAddress !== "example@gmail.com";
    this.setState({ emailAddress, isValid });
  }

  updateMessageField(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    this.setState({ message: e.target.value });
  }

  render() {
    return (
      <React.Fragment>
        <Grid container justifyContent="center">
          <Card style={{ width: 450 }}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                {this.props.t("projectSettings.invite.inviteByEmailLabel")}
              </Typography>
              <TextField
                id="project-user-invite-email"
                required
                label={this.props.t("projectSettings.invite.emailLabel")}
                onChange={(e) => this.updateEmailField(e)}
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                autoFocus
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                id="project-user-invite-message"
                label="Message"
                onChange={(e) => this.updateMessageField(e)}
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
              />
              <Grid container justifyContent="flex-end" spacing={2}>
                <Grid item>
                  <LoadingDoneButton
                    disabled={!this.state.isValid}
                    loading={this.state.loading}
                    done={this.state.done}
                    buttonProps={{
                      id: "project-user-invite-submit",
                      onClick: () => this.onSubmit(),
                      variant: "contained",
                      color: "primary",
                    }}
                  >
                    {this.props.t("buttons.invite")}
                  </LoadingDoneButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withTranslation()(EmailInvite);
