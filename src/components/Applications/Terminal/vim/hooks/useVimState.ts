import { useState, useCallback, useEffect, useRef } from 'react';
import type { VimState, VimMode, Position, VimEditorContext, OperationResult, VimChange, BufferDiff } from '../types';
import { vimCommands } from '../commands';

/**
 * Initial vim state
 */
const createInitialState = (filename?: string): VimState => ({
  mode: 'normal' as VimMode,
  buffer: [''],
  cursor: { line: 0, column: 0 },
  selection: undefined,
  isModified: false,
  filename,
  commandInput: '',
  undoStack: [],
  redoStack: [],
  register: '',
  searchPattern: '',
  searchResults: [],
  currentSearchIndex: -1,
  message: '',
  messageType: 'info',
  showLineNumbers: true,
  scrollOffset: 0,
  viewportHeight: 25, // Default viewport height in lines
});

/**
 * Custom hook for managing vim editor state
 * 
 * Provides centralized state management for the vim editor with actions
 * for mode switching, buffer manipulation, and command execution.
 */
export function useVimState(filename?: string, context?: VimEditorContext) {
  const [state, setState] = useState<VimState>(() => createInitialState(filename));

  // Load file content on initialization
  useEffect(() => {
    if (filename && context?.loadFile) {
      const loadFileContent = async () => {
        try {
          const content = await context.loadFile(filename);
          const lines = content.split('\n');
          setState(prev => ({
            ...prev,
            buffer: lines.length > 0 ? lines : [''],
            isModified: false,
            message: `"${filename}" ${lines.length}L, ${content.length}C`,
            messageType: 'info',
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            buffer: [''],
            message: `"${filename}" [New File]`,
            messageType: 'info',
          }));
        }
      };
      loadFileContent();
    }
  }, [filename, context]);

  /**
   * Calculate buffer diffs for memory-efficient undo/redo
   */
  const calculateBufferDiffs = useCallback((oldBuffer: string[], newBuffer: string[]): BufferDiff[] => {
    const diffs: BufferDiff[] = [];
    const maxLen = Math.max(oldBuffer.length, newBuffer.length);
    
    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldBuffer[i] || '';
      const newLine = newBuffer[i] || '';
      
      if (oldLine !== newLine) {
        if (oldLine === '' && newLine !== '') {
          diffs.push({ line: i, oldContent: '', newContent: newLine, operation: 'insert' });
        } else if (oldLine !== '' && newLine === '') {
          diffs.push({ line: i, oldContent: oldLine, newContent: '', operation: 'delete' });
        } else {
          diffs.push({ line: i, oldContent: oldLine, newContent: newLine, operation: 'replace' });
        }
      }
    }
    
    return diffs;
  }, []);

  /**
   * Create undo change for given state (memory-efficient with diffs)
   */
  const createUndoChange = useCallback((changeType: 'buffer' | 'cursor' | 'selection' | 'mode', oldState: VimState, newBuffer?: string[]): VimChange | null => {
    const change: VimChange = {
      type: changeType,
      data: {},
      timestamp: Date.now(),
    };

    // Only store what actually changed
    if (changeType === 'buffer' && newBuffer) {
      // Use diffs instead of full buffer for memory efficiency
      const diffs = calculateBufferDiffs(oldState.buffer, newBuffer);
      if (diffs.length > 0) {
        change.data.bufferDiffs = diffs;
        change.data.cursor = { ...oldState.cursor };
        change.data.isModified = oldState.isModified;
      } else {
        return null; // No changes, don't create change
      }
    } else if (changeType === 'selection') {
      change.data.cursor = { ...oldState.cursor };
      change.data.selection = oldState.selection ? { ...oldState.selection } : undefined;
    } else if (changeType === 'cursor') {
      change.data.cursor = { ...oldState.cursor };
    } else if (changeType === 'mode') {
      change.data.mode = oldState.mode;
      change.data.selection = oldState.selection ? { ...oldState.selection } : undefined;
    }

    return change;
  }, [calculateBufferDiffs]);

  // Timeout refs for cleanup
  const messageTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  /**
   * Set a message to display in the status bar
   */
  const setMessage = useCallback((message: string, type: 'info' | 'error' | 'warning' = 'info') => {
    setState(prev => ({ ...prev, message, messageType: type }));
    
    // Clear previous timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    // Clear message after 3 seconds for info messages
    if (type === 'info') {
      messageTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, message: '' }));
      }, 3000);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Enter normal mode
   */
  const enterNormalMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: 'normal',
      commandInput: '',
      selection: undefined,
    }));
  }, []);

  /**
   * Enter insert mode
   */
  const enterInsertMode = useCallback((position?: Position) => {
    setState(prev => ({
      ...prev,
      mode: 'insert',
      cursor: position || prev.cursor,
    }));
  }, []);

  /**
   * Enter visual mode
   */
  const enterVisualMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: 'visual',
      selection: {
        start: prev.cursor,
        end: prev.cursor,
      },
    }));
  }, []);

  /**
   * Enter command mode
   */
  const enterCommandMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: 'command',
      commandInput: '',
    }));
  }, []);

  /**
   * Update buffer content with memory-efficient diff tracking
   */
  const updateBuffer = useCallback((newBuffer: string[]) => {
    setState(prev => {
      // Only update if buffer actually changed
      const hasChanges = prev.buffer.length !== newBuffer.length || 
        prev.buffer.some((line, index) => line !== newBuffer[index]);
      
      if (!hasChanges) {
        return prev; // No changes, prevent unnecessary render
      }

      // Save current state to undo stack before making changes
      const change: VimChange = {
        type: 'buffer',
        data: {
          bufferDiffs: calculateBufferDiffs(prev.buffer, newBuffer),
          cursor: { ...prev.cursor },
          isModified: prev.isModified,
        },
        timestamp: Date.now(),
      };

      return {
        ...prev,
        buffer: newBuffer,
        isModified: true,
        undoStack: [...prev.undoStack.slice(-19), change], // Keep last 20 changes only
        redoStack: [], // Clear redo stack on new action
      };
    });
  }, [calculateBufferDiffs]);

  /**
   * Move cursor to a new position
   */
  const moveCursor = useCallback((newPosition: Position) => {
    setState(prev => {
      // Validate position bounds
      const maxLine = Math.max(0, prev.buffer.length - 1);
      const line = Math.max(0, Math.min(newPosition.line, maxLine));
      const maxColumn = prev.buffer[line]?.length || 0;
      const column = Math.max(0, Math.min(newPosition.column, maxColumn));

      const validPosition = { line, column };

      // Check if cursor actually moved to prevent unnecessary renders
      if (prev.cursor.line === validPosition.line && prev.cursor.column === validPosition.column) {
        // Check if selection also needs to be updated
        if (prev.mode === 'visual' && prev.selection && 
            prev.selection.end.line === validPosition.line && 
            prev.selection.end.column === validPosition.column) {
          return prev; // No changes
        }
      }

      // Update selection end if in visual mode
      if (prev.mode === 'visual' && prev.selection) {
        return {
          ...prev,
          cursor: validPosition,
          selection: {
            ...prev.selection,
            end: validPosition,
          },
        };
      }

      return {
        ...prev,
        cursor: validPosition,
      };
    });
  }, []);

  /**
   * Execute a vim command (from command mode)
   */
  const executeCommand = useCallback(async (commandText: string): Promise<OperationResult> => {
    if (!commandText.trim()) {
      return { success: false, message: 'Empty command', messageType: 'error' };
    }

    // Parse command and arguments
    const parts = commandText.trim().split(/\s+/);
    const commandName = parts[0];
    const args = parts.slice(1);

    // Find command
    const command = vimCommands.find(cmd => 
      cmd.name === commandName || cmd.aliases.includes(commandName)
    );

    if (!command) {
      return { 
        success: false, 
        message: `E492: Not an editor command: ${commandName}`,
        messageType: 'error' 
      };
    }

    try {
      const result = await command.execute(args, state, context || {} as VimEditorContext);
      
      if (result.state) {
        setState(result.state);
      }
      
      if (result.message) {
        setMessage(result.message, result.messageType || 'info');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Command error: ${errorMessage}`,
        messageType: 'error'
      };
    }
  }, [state, context, setMessage]);

  /**
   * Apply buffer diffs to reconstruct buffer state
   */
  const applyBufferDiffs = useCallback((currentBuffer: string[], diffs: BufferDiff[], reverse = false): string[] => {
    const newBuffer = [...currentBuffer];
    
    for (const diff of diffs) {
      const { line, oldContent, newContent } = diff;
      
      if (reverse) {
        // For undo, use oldContent
        if (line < newBuffer.length) {
          newBuffer[line] = oldContent;
        }
      } else {
        // For redo, use newContent
        if (line < newBuffer.length) {
          newBuffer[line] = newContent;
        } else {
          // Extend buffer if needed
          while (newBuffer.length <= line) {
            newBuffer.push('');
          }
          newBuffer[line] = newContent;
        }
      }
    }
    
    return newBuffer;
  }, []);

  /**
   * Undo last action (memory-efficient with diffs)
   */
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) {
        setMessage('Already at oldest change', 'warning');
        return prev;
      }

      const lastChange = prev.undoStack[prev.undoStack.length - 1];
      const newUndoStack = prev.undoStack.slice(0, -1);
      
      // Create redo change from current state
      const redoChange: VimChange = {
        type: lastChange.type,
        data: {},
        timestamp: Date.now(),
      };
      
      let newBuffer = prev.buffer;
      
      if (lastChange.type === 'buffer') {
        if (lastChange.data.bufferDiffs) {
          // Use diffs to reconstruct previous state
          newBuffer = applyBufferDiffs(prev.buffer, lastChange.data.bufferDiffs, true);
          // Store current state for redo using diffs
          const currentDiffs = calculateBufferDiffs(newBuffer, prev.buffer);
          redoChange.data.bufferDiffs = currentDiffs;
        } else if (lastChange.data.buffer) {
          // Legacy fallback
          newBuffer = lastChange.data.buffer;
          redoChange.data.buffer = [...prev.buffer];
        }
        redoChange.data.cursor = { ...prev.cursor };
        redoChange.data.isModified = prev.isModified;
      } else if (lastChange.type === 'cursor') {
        redoChange.data.cursor = { ...prev.cursor };
      } else if (lastChange.type === 'mode') {
        redoChange.data.mode = prev.mode;
        redoChange.data.selection = prev.selection ? { ...prev.selection } : undefined;
      }

      const newRedoStack = [...prev.redoStack, redoChange];

      // Apply the change
      let newState = { ...prev, buffer: newBuffer };
      if (lastChange.data.cursor) newState.cursor = lastChange.data.cursor;
      if (lastChange.data.selection !== undefined) newState.selection = lastChange.data.selection;
      if (lastChange.data.mode) newState.mode = lastChange.data.mode;
      if (lastChange.data.isModified !== undefined) newState.isModified = lastChange.data.isModified;

      return {
        ...newState,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
        message: '',
        messageType: 'info' as const,
      };
    });
  }, [setMessage, applyBufferDiffs, calculateBufferDiffs]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.redoStack.length === 0) {
        setMessage('Already at newest change', 'warning');
        return prev;
      }

      const nextChange = prev.redoStack[prev.redoStack.length - 1];
      const newRedoStack = prev.redoStack.slice(0, -1);
      
      // Create undo change from current state
      const undoChange: VimChange = {
        type: nextChange.type,
        data: {},
        timestamp: Date.now(),
      };
      
      if (nextChange.type === 'buffer') {
        undoChange.data.buffer = [...prev.buffer];
        undoChange.data.cursor = { ...prev.cursor };
        undoChange.data.isModified = prev.isModified;
      } else if (nextChange.type === 'cursor') {
        undoChange.data.cursor = { ...prev.cursor };
      } else if (nextChange.type === 'mode') {
        undoChange.data.mode = prev.mode;
        undoChange.data.selection = prev.selection ? { ...prev.selection } : undefined;
      }

      const newUndoStack = [...prev.undoStack, undoChange];

      // Apply the change
      let newState = { ...prev };
      if (nextChange.data.buffer) newState.buffer = nextChange.data.buffer;
      if (nextChange.data.cursor) newState.cursor = nextChange.data.cursor;
      if (nextChange.data.selection !== undefined) newState.selection = nextChange.data.selection;
      if (nextChange.data.mode) newState.mode = nextChange.data.mode;
      if (nextChange.data.isModified !== undefined) newState.isModified = nextChange.data.isModified;

      return {
        ...newState,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
        message: '',
        messageType: 'info' as const,
      };
    });
  }, [setMessage]);

  /**
   * Update command input (for command mode)
   */
  const updateCommandInput = useCallback((input: string) => {
    setState(prev => ({
      ...prev,
      commandInput: input,
    }));
  }, []);

  /**
   * Handle command input character changes
   */
  const handleCommandInputChange = useCallback((char: string, action: 'add' | 'delete') => {
    setState(prev => {
      if (action === 'add') {
        return {
          ...prev,
          commandInput: prev.commandInput + char,
        };
      } else {
        return {
          ...prev,
          commandInput: prev.commandInput.slice(0, -1),
        };
      }
    });
  }, []);

  return {
    state,
    enterNormalMode,
    enterInsertMode,
    enterVisualMode,
    enterCommandMode,
    updateBuffer,
    moveCursor,
    executeCommand,
    undo,
    redo,
    setMessage,
    updateCommandInput,
    handleCommandInputChange,
  };
}