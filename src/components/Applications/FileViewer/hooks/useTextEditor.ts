import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  EditorState, 
  EditorSettings, 
  DocumentInfo, 
  DocumentFormat, 
  Position, 
  TextRange,
  FindReplaceOptions
} from '../types/textEditor.types';
import { 
  createNewDocument, 
  countWords,
  countCharacters,
  countLines
} from '../utils/fileUtils';
import { autoDetectFormat } from '../utils/formatDetection';

/**
 * Main hook for text editor state management
 */
export const useTextEditor = () => {
  const [editorState, setEditorState] = useState<EditorState>({
    currentDocument: null,
    openDocuments: [],
    activeDocumentIndex: -1,
    cursorPosition: { line: 0, column: 0 },
    selection: null,
    isPreviewVisible: false,
    findText: '',
    replaceText: '',
    isFindReplaceVisible: false,
    undoHistory: [],
    redoHistory: [],
    maxHistorySize: 50,
  });

  const [settings, setSettings] = useState<EditorSettings>({
    theme: 'light',
    fontSize: 14,
    lineNumbers: true,
    wordWrap: true,
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    tabSize: 2,
  });

  const [findReplaceOptions, setFindReplaceOptions] = useState<FindReplaceOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });

  const autoSaveTimeoutRef = useRef<number | null>(null);

  /**
   * Creates a new document
   */
  const addToHistory = useCallback((content: string) => {
    setEditorState(prev => {
      const newHistory = [...prev.undoHistory, content];
      if (newHistory.length > prev.maxHistorySize) {
        newHistory.shift();
      }

      return {
        ...prev,
        undoHistory: newHistory,
        redoHistory: [], // Clear redo history when new content is added
      };
    });
  }, []);

  const createDocument = useCallback((filename?: string, format?: DocumentFormat) => {
    const newDoc = createNewDocument(filename);
    if (format) {
      newDoc.format = format;
    }

    setEditorState(prev => ({
      ...prev,
      openDocuments: [...prev.openDocuments, newDoc],
      activeDocumentIndex: prev.openDocuments.length,
      currentDocument: newDoc,
      cursorPosition: { line: 0, column: 0 },
      selection: null,
    }));

    addToHistory(newDoc.content);
  }, [addToHistory]);

  /**
   * Schedules auto-save
   */
  const scheduleAutoSave = useCallback(() => {
    if (!settings.autoSave) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = window.setTimeout(() => {
      // Here you would implement actual file saving
      console.log('Auto-saving document...');
    }, settings.autoSaveInterval);
  }, [settings.autoSave, settings.autoSaveInterval]);

  /**
   * Updates the current document content
   */
  const updateContent = useCallback((content: string) => {
    if (!editorState.currentDocument) return;

    const updatedDoc: DocumentInfo = {
      ...editorState.currentDocument,
      content,
      isDirty: true,
      lastModified: new Date(),
      format: autoDetectFormat(content) || editorState.currentDocument.format,
    };

    setEditorState(prev => {
      const newDocs = [...prev.openDocuments];
      newDocs[prev.activeDocumentIndex] = updatedDoc;

      return {
        ...prev,
        currentDocument: updatedDoc,
        openDocuments: newDocs,
      };
    });

    addToHistory(content);
    scheduleAutoSave();
  }, [editorState.currentDocument, addToHistory, scheduleAutoSave]);

  /**
   * Undo last change
   */
  const undo = useCallback(() => {
    if (editorState.undoHistory.length <= 1 || !editorState.currentDocument) return;

    const currentContent = editorState.currentDocument.content;
    const previousContent = editorState.undoHistory[editorState.undoHistory.length - 2];

    setEditorState(prev => ({
      ...prev,
      undoHistory: prev.undoHistory.slice(0, -1),
      redoHistory: [...prev.redoHistory, currentContent],
    }));

    updateContent(previousContent);
  }, [editorState.undoHistory, editorState.currentDocument, updateContent]);

  /**
   * Redo last undone change
   */
  const redo = useCallback(() => {
    if (editorState.redoHistory.length === 0) return;

    const redoContent = editorState.redoHistory[editorState.redoHistory.length - 1];

    setEditorState(prev => ({
      ...prev,
      redoHistory: prev.redoHistory.slice(0, -1),
    }));

    updateContent(redoContent);
  }, [editorState.redoHistory, updateContent]);

  /**
   * Switches to a different open document
   */
  const switchDocument = useCallback((index: number) => {
    if (index < 0 || index >= editorState.openDocuments.length) return;

    setEditorState(prev => ({
      ...prev,
      activeDocumentIndex: index,
      currentDocument: prev.openDocuments[index],
      cursorPosition: { line: 0, column: 0 },
      selection: null,
    }));
  }, [editorState.openDocuments]);

  /**
   * Closes a document
   */
  const closeDocument = useCallback((index: number) => {
    if (index < 0 || index >= editorState.openDocuments.length) return;

    const newDocs = editorState.openDocuments.filter((_, i) => i !== index);
    let newActiveIndex = editorState.activeDocumentIndex;

    if (index === editorState.activeDocumentIndex) {
      newActiveIndex = Math.max(0, index - 1);
    } else if (index < editorState.activeDocumentIndex) {
      newActiveIndex = editorState.activeDocumentIndex - 1;
    }

    setEditorState(prev => ({
      ...prev,
      openDocuments: newDocs,
      activeDocumentIndex: newDocs.length > 0 ? newActiveIndex : -1,
      currentDocument: newDocs.length > 0 ? newDocs[newActiveIndex] : null,
    }));
  }, [editorState.openDocuments, editorState.activeDocumentIndex]);

  /**
   * Updates cursor position
   */
  const updateCursorPosition = useCallback((position: Position) => {
    setEditorState(prev => ({
      ...prev,
      cursorPosition: position,
    }));
  }, []);

  /**
   * Updates text selection
   */
  const updateSelection = useCallback((selection: TextRange | null) => {
    setEditorState(prev => ({
      ...prev,
      selection,
    }));
  }, []);

  /**
   * Toggles preview visibility
   */
  const togglePreview = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      isPreviewVisible: !prev.isPreviewVisible,
    }));
  }, []);

  /**
   * Shows/hides find and replace dialog
   */
  const toggleFindReplace = useCallback((visible?: boolean) => {
    setEditorState(prev => ({
      ...prev,
      isFindReplaceVisible: visible !== undefined ? visible : !prev.isFindReplaceVisible,
    }));
  }, []);

  /**
   * Updates find text
   */
  const updateFindText = useCallback((text: string) => {
    setEditorState(prev => ({
      ...prev,
      findText: text,
    }));
  }, []);

  /**
   * Updates replace text
   */
  const updateReplaceText = useCallback((text: string) => {
    setEditorState(prev => ({
      ...prev,
      replaceText: text,
    }));
  }, []);

  /**
   * Updates editor settings
   */
  const updateSettings = useCallback((newSettings: Partial<EditorSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);


  /**
   * Gets document statistics
   */
  const getDocumentStats = useCallback(() => {
    if (!editorState.currentDocument) {
      return {
        wordCount: 0,
        characterCount: 0,
        lineCount: 0,
        filename: '',
        format: DocumentFormat.PLAIN_TEXT,
        isDirty: false,
      };
    }

    const { content, filename, format, isDirty } = editorState.currentDocument;

    return {
      wordCount: countWords(content),
      characterCount: countCharacters(content),
      lineCount: countLines(content),
      filename,
      format,
      isDirty,
    };
  }, [editorState.currentDocument]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, []);

  // Initialize with a new document if none exists
  useEffect(() => {
    if (editorState.openDocuments.length === 0) {
      createDocument();
    }
  }, [editorState.openDocuments.length, createDocument]);

  return {
    // State
    editorState,
    settings,
    findReplaceOptions,
    
    // Actions
    createDocument,
    updateContent,
    undo,
    redo,
    switchDocument,
    closeDocument,
    updateCursorPosition,
    updateSelection,
    togglePreview,
    toggleFindReplace,
    updateFindText,
    updateReplaceText,
    updateSettings,
    setFindReplaceOptions,
    
    // Computed values
    getDocumentStats,
    
    // Getters
    canUndo: editorState.undoHistory.length > 1,
    canRedo: editorState.redoHistory.length > 0,
    hasUnsavedChanges: editorState.currentDocument?.isDirty || false,
  };
};