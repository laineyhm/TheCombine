import { Autocomplete, TextField } from "@mui/material";
import React from "react";
import { Key } from "ts-key-enum";

import { WritingSystem } from "api";
import SpellChecker from "components/DataEntry/spellChecker";

interface GlossWithSuggestionsProps {
  isNew?: boolean;
  isDisabled?: boolean;
  gloss: string;
  glossInput?: React.RefObject<HTMLDivElement>;
  updateGlossField: (newValue: string) => void;
  handleEnterAndTab: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
  analysisLang: WritingSystem;
  textFieldId: string;
  onComponentDidUpdate?: () => void;
}

/**
 * An editable gloss field that suggests spellings when current word isn't recognized.
 */
export default class GlossWithSuggestions extends React.Component<GlossWithSuggestionsProps> {
  readonly maxSuggestions = 5;
  spellChecker = new SpellChecker(this.props.analysisLang.bcp47);

  componentDidUpdate(prevProps: GlossWithSuggestionsProps) {
    if (this.props.onComponentDidUpdate) {
      this.props.onComponentDidUpdate();
    }
    if (prevProps.analysisLang.bcp47 !== this.props.analysisLang.bcp47) {
      this.spellChecker = new SpellChecker(this.props.analysisLang.bcp47);
    }
  }

  render() {
    return (
      <Autocomplete
        id={this.props.textFieldId}
        disabled={this.props.isDisabled}
        filterOptions={(options: unknown[]) =>
          options.length <= this.maxSuggestions
            ? options
            : options.slice(0, this.maxSuggestions)
        }
        // freeSolo allows use of a typed entry not available as a drop-down option
        freeSolo
        options={this.spellChecker.getSpellingSuggestions(this.props.gloss)}
        value={this.props.gloss}
        onBlur={() => {
          if (this.props.onBlur) this.props.onBlur();
        }}
        onChange={(e, newValue) => {
          const newText = newValue ? (newValue as string) : "";
          this.props.updateGlossField(newText);
        }}
        inputValue={this.props.gloss}
        onInputChange={(e, newInputValue) => {
          this.props.updateGlossField(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            inputRef={this.props.glossInput}
            label={this.props.isNew ? this.props.analysisLang.name : ""}
            variant={this.props.isNew ? "outlined" : "standard"}
          />
        )}
        onKeyPress={(e: React.KeyboardEvent) => {
          if (e.key === Key.Enter || e.key === Key.Tab) {
            e.preventDefault();
            this.props.handleEnterAndTab(e);
          }
        }}
      />
    );
  }
}
