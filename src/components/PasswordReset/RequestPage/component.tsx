import * as React from "react";
import { Translate, LocalizeContextProps } from "react-localize-redux";
import { Typography, Card, Button, Grid, TextField } from "@material-ui/core";
import { isEmailTaken } from "../../../backend";

export interface ResetRequestProps {}

export interface ResetRequestDispatchProps {
  passwordResetRequest: (email: string) => void;
}

export interface ResetRequestState {
  email: string;
  emailExists: boolean;
}

export default class ResetRequest extends React.Component<
  ResetRequestProps & ResetRequestDispatchProps & LocalizeContextProps,
  ResetRequestState
> {
  constructor(
    props: ResetRequestProps & ResetRequestDispatchProps & LocalizeContextProps
  ) {
    super(props);
    this.state = { emailExists: true, email: "" };
  }

  onSubmit = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    isEmailTaken(this.state.email).then((emailExists: boolean) => {
      if (emailExists) {
        this.props.passwordResetRequest(this.state.email);
      } else {
        this.setState({ emailExists });
      }
    });
  };

  async setEmail(email: string) {
    this.setState((prevState) => ({
      ...prevState,
      email: email,
      emailExists: true,
    }));
  }

  render() {
    return (
      <div>
        <Grid container justify="center">
          <Card style={{ padding: 10, width: 450 }}>
            <Typography variant="h5" align="center">
              <Translate id="passwordReset.resetRequestTitle" />
            </Typography>
            <Typography variant="subtitle1" align="center">
              <Translate id="passwordReset.resetRequestInstructions" />
            </Typography>
            <form onSubmit={this.onSubmit}>
              <Grid item>
                <TextField
                  required
                  type="email"
                  autoComplete="email"
                  variant="outlined"
                  label={<Translate id="login.email" />}
                  value={this.state.email}
                  style={{ width: "100%" }}
                  error={!this.state.emailExists}
                  helperText={
                    !this.state.emailExists && (
                      <Translate id="passwordReset.emailError" />
                    )
                  }
                  margin="normal"
                  onChange={(e) => this.setEmail(e.target.value)}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!this.state.email}
                  onClick={this.onSubmit}
                >
                  <Translate id="passwordReset.submit" />
                </Button>
              </Grid>
            </form>
          </Card>
        </Grid>
      </div>
    );
  }
}
