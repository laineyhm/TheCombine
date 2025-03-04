import {
  CharacterInventoryAction,
  CharacterInventoryType,
  CharacterInventoryState,
  CharacterSetEntry,
  getCharacterStatus,
} from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

export const defaultState: CharacterInventoryState = {
  validCharacters: [],
  rejectedCharacters: [],
  allWords: [],
  selectedCharacter: "",
  characterSet: [],
};

export const characterInventoryReducer = (
  state: CharacterInventoryState = defaultState,
  action: StoreAction | CharacterInventoryAction
): CharacterInventoryState => {
  let validCharacters: string[];
  let rejectedCharacters: string[];
  let characterSet: CharacterSetEntry[];
  switch (action.type) {
    case CharacterInventoryType.SET_VALID_CHARACTERS:
      // Set prevents duplicate characters
      validCharacters = [...new Set(action.payload)];
      rejectedCharacters = state.rejectedCharacters.filter(
        (char) => !validCharacters.includes(char)
      );

      // Set status of characters in character set
      characterSet = state.characterSet.map((entry) => {
        entry.status = getCharacterStatus(
          entry.character,
          validCharacters,
          rejectedCharacters
        );
        return entry;
      });
      return { ...state, validCharacters, rejectedCharacters, characterSet };

    case CharacterInventoryType.SET_REJECTED_CHARACTERS:
      rejectedCharacters = [...new Set(action.payload)];
      validCharacters = state.validCharacters.filter(
        (char) => !rejectedCharacters.includes(char)
      );

      // Set status of characters in character set
      characterSet = state.characterSet.map((entry) => {
        entry.status = getCharacterStatus(
          entry.character,
          validCharacters,
          rejectedCharacters
        );
        return entry;
      });
      return { ...state, validCharacters, rejectedCharacters, characterSet };

    case CharacterInventoryType.ADD_TO_VALID_CHARACTERS:
      validCharacters = [
        ...new Set(state.validCharacters.concat(action.payload)),
      ];
      rejectedCharacters = state.rejectedCharacters.filter(
        (char) => !validCharacters.includes(char)
      );

      // Set status of characters in character set
      characterSet = state.characterSet.map((entry) => {
        entry.status = getCharacterStatus(
          entry.character,
          validCharacters,
          rejectedCharacters
        );
        return entry;
      });
      return { ...state, validCharacters, rejectedCharacters, characterSet };

    case CharacterInventoryType.ADD_TO_REJECTED_CHARACTERS:
      rejectedCharacters = [
        ...new Set(state.rejectedCharacters.concat(action.payload)),
      ];
      validCharacters = state.validCharacters.filter(
        (char) => !rejectedCharacters.includes(char)
      );

      // Set status of characters in character set
      characterSet = state.characterSet.map((entry) => {
        entry.status = getCharacterStatus(
          entry.character,
          validCharacters,
          rejectedCharacters
        );
        return entry;
      });
      return { ...state, validCharacters, rejectedCharacters, characterSet };

    case CharacterInventoryType.SET_SELECTED_CHARACTER:
      return { ...state, selectedCharacter: action.payload[0] };

    case CharacterInventoryType.SET_ALL_WORDS:
      return { ...state, allWords: action.payload };

    case CharacterInventoryType.SET_CHARACTER_SET:
      return action.characterSet
        ? { ...state, characterSet: action.characterSet }
        : state;

    case CharacterInventoryType.RESET:
      return defaultState;

    case StoreActionTypes.RESET:
      return defaultState;

    default:
      return state;
  }
};
