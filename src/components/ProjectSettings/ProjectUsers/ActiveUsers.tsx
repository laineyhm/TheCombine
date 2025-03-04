import { MoreVert, SortByAlpha } from "@mui/icons-material";
import {
  Avatar,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Permission, User, UserRole } from "api/models";
import { avatarSrc, getUserRoles } from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import CancelConfirmDialogCollection from "components/ProjectSettings/ProjectUsers/CancelConfirmDialogCollection";
import { StoreState } from "types";
import theme from "types/theme";

enum UserOrder {
  Username,
  Name,
  Email,
}

export default function ActiveUsers() {
  const projectUsers = useSelector(
    (state: StoreState) => state.currentProjectState.users
  );
  const [projUserRoles, setProjUserRoles] = useState<UserRole[]>([]);
  const [userAvatar, setUserAvatar] = useState<{ [key: string]: string }>({});
  const [userOrder, setUserOrder] = useState<UserOrder>(UserOrder.Username);
  const [reverseSorting, setReverseSorting] = useState<boolean>(false);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    getUserRoles().then(setProjUserRoles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectUsers, setProjUserRoles]);

  useEffect(() => {
    const tempUserAvatar = { ...userAvatar };
    const promises = projectUsers.map(async (u) => {
      if (u.hasAvatar) {
        tempUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(tempUserAvatar));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectUsers, setUserAvatar]);

  useEffect(() => {
    setSortedUsers(getSortedUsers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectUsers, userOrder, reverseSorting, setSortedUsers]);

  function getSortedUsers() {
    // Copy the "projectUsers" array because reverse(), sort() mutate.
    const users = [...projectUsers].sort((a: User, b: User) => {
      switch (userOrder) {
        case UserOrder.Name:
          return a.name.localeCompare(b.name);
        case UserOrder.Username:
          return a.username.localeCompare(b.username);
        case UserOrder.Email:
          return a.email.localeCompare(b.email);
        default:
          throw new Error();
      }
    });
    return reverseSorting ? users.reverse() : users;
  }

  function hasProjectPermission(
    userRoleId: string,
    permission: Permission
  ): boolean {
    const userRole = projUserRoles.find((role) => role.id === userRoleId);
    if (userRole) {
      return userRole.permissions.includes(permission);
    }
    return false;
  }

  const currentUser = getCurrentUser();
  const currentProjectId = getProjectId();
  if (!currentUser || !currentProjectId) {
    return <div />;
  }
  const currentUserIsProjectAdmin = hasProjectPermission(
    currentUser.projectRoles[currentProjectId],
    Permission.DeleteEditSettingsAndUsers
  );
  const currentUserIsProjectOwner = hasProjectPermission(
    currentUser.projectRoles[currentProjectId],
    Permission.Owner
  );

  const userList = sortedUsers.map((user) => {
    const userIsProjectAdmin = hasProjectPermission(
      user.projectRoles[currentProjectId],
      Permission.DeleteEditSettingsAndUsers
    );
    const userIsProjectOwner = hasProjectPermission(
      user.projectRoles[currentProjectId],
      Permission.Owner
    );

    const manageUser =
      currentUserIsProjectAdmin &&
      user.id !== currentUser.id &&
      !userIsProjectOwner &&
      (!userIsProjectAdmin || currentUserIsProjectOwner) ? (
        <CancelConfirmDialogCollection
          userId={user.id}
          currentUserId={currentUser.id}
          isProjectOwner={currentUserIsProjectOwner}
          userIsProjectAdmin={userIsProjectAdmin}
        />
      ) : (
        <IconButton disabled size="large">
          <MoreVert />
        </IconButton>
      );

    const displayString =
      currentUserIsProjectOwner || currentUser.isAdmin
        ? `${user.name} (${user.username} | ${user.email})`
        : `${user.name} (${user.username})`;

    return (
      <ListItem key={user.id}>
        <Avatar
          alt="User Avatar"
          src={userAvatar[user.id]}
          style={{ marginRight: theme.spacing(1) }}
        />
        <ListItemText primary={displayString} />
        {manageUser}
      </ListItem>
    );
  });

  const sortOptions = [
    <MenuItem key="sortByName" value={UserOrder.Name}>
      {t("projectSettings.language.name")}
    </MenuItem>,
    <MenuItem key="sortByUsername" value={UserOrder.Username}>
      {t("login.username")}
    </MenuItem>,
  ];
  if (currentUserIsProjectOwner || currentUser.isAdmin) {
    sortOptions.push(
      <MenuItem key="sortByEmail" value={UserOrder.Email}>
        {t("login.email")}
      </MenuItem>
    );
  }

  return (
    <React.Fragment>
      <FormControl variant="standard" style={{ minWidth: 100 }}>
        <InputLabel id="sorting-order-select">
          {t("charInventory.sortBy")}
        </InputLabel>
        <Select
          variant="standard"
          labelId="sorting-order-select"
          defaultValue={UserOrder.Username}
          onChange={(event: SelectChangeEvent<UserOrder>) => {
            setUserOrder(event.target.value as UserOrder);
            setReverseSorting(false);
          }}
        >
          {sortOptions}
        </Select>
      </FormControl>
      <Tooltip
        title={t("projectSettings.userManagement.reverseOrder")}
        placement="right"
      >
        <IconButton
          onClick={() => setReverseSorting(!reverseSorting)}
          id="sorting-order-reverse"
          size="large"
        >
          <SortByAlpha />
        </IconButton>
      </Tooltip>
      <List>{userList}</List>
    </React.Fragment>
  );
}
