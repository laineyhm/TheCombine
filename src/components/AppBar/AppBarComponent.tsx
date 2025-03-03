import { AppBar, Grid, Toolbar } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { getProjectId } from "backend/localStorage";
import { getBasePath, Path } from "browserHistory";
import Logo from "components/AppBar/Logo";
import NavigationButtons from "components/AppBar/NavigationButtons";
import ProjectNameButton from "components/AppBar/ProjectNameButton";
import UserMenu from "components/AppBar/UserMenu";
import { topBarHeight } from "components/LandingPage/TopBar";
import DownloadButton from "components/ProjectExport/DownloadButton";
import theme from "types/theme";

/** An app bar shown at the top of all logged in pages */
export default function AppBarComponent(): ReactElement {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState<Path>(Path.ProjScreen);
  useEffect(() => setCurrentTab(getBasePath(location.pathname)), [location]);
  return (
    <div className="NavigationBar" style={{ marginBottom: topBarHeight }}>
      <AppBar position="fixed" style={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Grid
            container
            justifyContent="space-between"
            spacing={2}
            alignItems="center"
          >
            <Grid item xs={7} md={5} lg={4}>
              <Logo />
              {!!getProjectId() && (
                <NavigationButtons currentTab={currentTab} />
              )}
            </Grid>
            <Grid item xs={2} sm={3} md={4}>
              {!!getProjectId() && (
                <ProjectNameButton currentTab={currentTab} />
              )}
              <DownloadButton colorSecondary />
            </Grid>
            <Grid item>
              <UserMenu currentTab={currentTab} />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}
