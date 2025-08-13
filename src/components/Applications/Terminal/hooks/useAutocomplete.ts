import { useState, useCallback } from 'react';
import { CommandRegistry } from '../commands';
import { CommandParser } from '../utils/parser';
import type { AutocompleteResult, OSType } from '../types';

/**
 * Hook for handling command and path autocomplete
 */
export function useAutocomplete(
  commandRegistry: CommandRegistry,
  currentDirectory: string,
  fileSystem: any,
  osType: OSType
) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  /**
   * Generate autocomplete suggestions for the current input
   */
  const generateSuggestions = useCallback(
    (input: string, cursorPosition: number): AutocompleteResult => {
      const trimmedInput = input.trim();
      if (!trimmedInput) {
        return { completions: [], commonPrefix: '', hasExactMatch: false };
      }

      // Parse the command
      CommandParser.parse(trimmedInput);
      const words = trimmedInput.split(/\s+/);
      const currentWordIndex = Math.max(0, trimmedInput.substring(0, cursorPosition).split(/\s+/).length - 1);
      const currentWord = words[currentWordIndex] || '';

      let completions: string[] = [];
      let commonPrefix = '';

      if (currentWordIndex === 0) {
        // Completing command name
        completions = commandRegistry.getCommandSuggestions(currentWord);
        commonPrefix = findCommonPrefix(completions);
      } else {
        // Completing command arguments
        const commandName = words[0];
        const args = words.slice(1, currentWordIndex);

        try {
          completions = commandRegistry.getArgumentSuggestions(commandName, currentWord, args, {
            currentDirectory,
            fileSystem,
            osType,
            env: {},
            history: [],
            username: 'user',
            hostname: 'desktop',
          });
          commonPrefix = findCommonPrefix(completions);
        } catch (error) {
          console.warn('Error generating argument suggestions:', error);
          completions = [];
        }
      }

      const hasExactMatch = completions.includes(currentWord);

      return {
        completions: completions.slice(0, 20), // Limit to 20 suggestions
        commonPrefix,
        hasExactMatch,
      };
    },
    [commandRegistry, currentDirectory, fileSystem, osType]
  );

  /**
   * Update suggestions based on input
   */
  const updateSuggestions = useCallback(
    (input: string, cursorPosition: number) => {
      const result = generateSuggestions(input, cursorPosition);

      setSuggestions(result.completions);
      setSelectedIndex(-1);
      setIsVisible(result.completions.length > 0);

      return result;
    },
    [generateSuggestions]
  );

  /**
   * Navigate through suggestions
   */
  const navigateSuggestions = useCallback(
    (direction: 'up' | 'down'): string | null => {
      if (suggestions.length === 0) return null;

      let newIndex: number;

      if (direction === 'up') {
        newIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
      } else {
        newIndex = selectedIndex >= suggestions.length - 1 ? 0 : selectedIndex + 1;
      }

      setSelectedIndex(newIndex);
      return suggestions[newIndex];
    },
    [suggestions, selectedIndex]
  );

  /**
   * Select a suggestion by index
   */
  const selectSuggestion = useCallback(
    (index: number): string | null => {
      if (index < 0 || index >= suggestions.length) return null;

      setSelectedIndex(index);
      return suggestions[index];
    },
    [suggestions]
  );

  /**
   * Get the currently selected suggestion
   */
  const getSelectedSuggestion = useCallback((): string | null => {
    if (selectedIndex < 0 || selectedIndex >= suggestions.length) return null;
    return suggestions[selectedIndex];
  }, [suggestions, selectedIndex]);

  /**
   * Complete the current input with the selected suggestion
   */
  const applyCompletion = useCallback(
    (input: string, cursorPosition: number, suggestion?: string): { newInput: string; newCursorPosition: number } => {
      const selectedSuggestion = suggestion || getSelectedSuggestion();
      if (!selectedSuggestion) {
        return { newInput: input, newCursorPosition: cursorPosition };
      }

      const words = input.split(/\s+/);
      const beforeCursor = input.substring(0, cursorPosition);
      const currentWordIndex = Math.max(0, beforeCursor.split(/\s+/).length - 1);

      // Replace the current word with the suggestion
      words[currentWordIndex] = selectedSuggestion;
      const newInput = words.join(' ');

      // Calculate new cursor position
      const wordsBeforeCurrent = words.slice(0, currentWordIndex);
      const newCursorPosition =
        wordsBeforeCurrent.join(' ').length + (wordsBeforeCurrent.length > 0 ? 1 : 0) + selectedSuggestion.length;

      return { newInput, newCursorPosition };
    },
    [getSelectedSuggestion]
  );

  /**
   * Hide suggestions
   */
  const hideSuggestions = useCallback(() => {
    setIsVisible(false);
    setSelectedIndex(-1);
  }, []);

  /**
   * Show suggestions if they exist
   */
  const showSuggestions = useCallback(() => {
    if (suggestions.length > 0) {
      setIsVisible(true);
    }
  }, [suggestions.length]);

  /**
   * Clear all suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsVisible(false);
  }, []);

  /**
   * Get tab completion result
   */
  const getTabCompletion = useCallback(
    (input: string, cursorPosition: number): { newInput: string; newCursorPosition: number } => {
      const result = generateSuggestions(input, cursorPosition);

      if (result.completions.length === 1) {
        // Single completion - apply it
        return applyCompletion(input, cursorPosition, result.completions[0]);
      } if (result.completions.length > 1 && result.commonPrefix) {
        // Multiple completions with common prefix - complete to common prefix
        const words = input.split(/\s+/);
        const beforeCursor = input.substring(0, cursorPosition);
        const currentWordIndex = Math.max(0, beforeCursor.split(/\s+/).length - 1);

        const currentWord = words[currentWordIndex] || '';
        if (result.commonPrefix.length > currentWord.length) {
          return applyCompletion(input, cursorPosition, result.commonPrefix);
        }
      }

      // No completion possible or already at common prefix - show suggestions
      updateSuggestions(input, cursorPosition);
      return { newInput: input, newCursorPosition: cursorPosition };
    },
    [generateSuggestions, applyCompletion, updateSuggestions]
  );

  // Memoized values
  const hasSuggestions = suggestions.length > 0;
  const hasSelection = selectedIndex >= 0 && selectedIndex < suggestions.length;

  return {
    suggestions,
    selectedIndex,
    isVisible,
    hasSuggestions,
    hasSelection,
    updateSuggestions,
    navigateSuggestions,
    selectSuggestion,
    getSelectedSuggestion,
    applyCompletion,
    getTabCompletion,
    hideSuggestions,
    showSuggestions,
    clearSuggestions,
  };
}

/**
 * Find the common prefix of an array of strings
 */
function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  let prefix = '';
  const firstString = strings[0];

  for (let i = 0; i < firstString.length; i++) {
    const char = firstString[i];

    if (strings.every((str) => str[i] === char)) {
      prefix += char;
    } else {
      break;
    }
  }

  return prefix;
}
