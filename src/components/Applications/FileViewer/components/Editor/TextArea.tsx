import React, { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Position, TextRange, EditorSettings } from '../../types/textEditor.types';

/**
 * Props for TextArea component
 */
interface TextAreaProps {
  content: string;
  cursorPosition: Position;
  settings: EditorSettings;
  onContentChange: (content: string) => void;
  onCursorPositionChange: (position: Position) => void;
  onSelectionChange: (selection: TextRange | null) => void;
  className?: string;
}

/**
 * Ref interface for TextArea component
 */
export interface TextAreaRef {
  focus: () => void;
  scrollToLine: (lineNumber: number) => void;
  insertText: (text: string) => void;
  setCursorPosition: (position: Position) => void;
}

/**
 * Main text editing area component
 */
export const TextArea = forwardRef<TextAreaRef, TextAreaProps>(({
  content,
  cursorPosition,
  settings,
  onContentChange,
  onCursorPositionChange,
  onSelectionChange,
  className = '',
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Handles content changes
   */
  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    onContentChange(newContent);
    
    // Update cursor position after content change
    const { selectionStart } = event.target;
    const lines = newContent.substring(0, selectionStart).split('\n');
    const line = lines.length - 1;
    const column = lines[lines.length - 1].length;
    
    onCursorPositionChange({ line, column });
  }, [onContentChange, onCursorPositionChange]);

  /**
   * Handles cursor position changes
   */
  const handleSelectionChange = useCallback(() => {
    if (!textareaRef.current) return;

    const { selectionStart, selectionEnd, value } = textareaRef.current;
    
    // Calculate cursor position
    const lines = value.substring(0, selectionStart).split('\n');
    const line = lines.length - 1;
    const column = lines[lines.length - 1].length;
    
    onCursorPositionChange({ line, column });

    // Calculate selection if any
    if (selectionStart !== selectionEnd) {
      const endLines = value.substring(0, selectionEnd).split('\n');
      const endLine = endLines.length - 1;
      const endColumn = endLines[endLines.length - 1].length;
      
      onSelectionChange({
        start: { line, column },
        end: { line: endLine, column: endColumn },
      });
    } else {
      onSelectionChange(null);
    }
  }, [onCursorPositionChange, onSelectionChange]);

  /**
   * Handles keyboard shortcuts
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { ctrlKey, shiftKey, key } = event;

    // Tab handling
    if (key === 'Tab') {
      event.preventDefault();
      const { selectionStart, selectionEnd, value } = event.currentTarget;
      const tabString = ' '.repeat(settings.tabSize);

      if (shiftKey) {
        // Shift+Tab: Unindent
        const beforeCursor = value.substring(0, selectionStart);
        const afterCursor = value.substring(selectionEnd);
        const currentLine = beforeCursor.split('\n').pop() || '';
        
        if (currentLine.startsWith(tabString)) {
          const newContent = beforeCursor.slice(0, -currentLine.length) + 
                             currentLine.substring(tabString.length) + 
                             afterCursor;
          onContentChange(newContent);
        }
      } else {
        // Tab: Indent
        const newContent = value.substring(0, selectionStart) + 
                          tabString + 
                          value.substring(selectionEnd);
        onContentChange(newContent);
        
        // Update cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = selectionStart + tabString.length;
            textareaRef.current.selectionEnd = selectionStart + tabString.length;
            handleSelectionChange();
          }
        }, 0);
      }
      return;
    }

    // Ctrl+A: Select all
    if (ctrlKey && key === 'a') {
      event.preventDefault();
      if (textareaRef.current) {
        textareaRef.current.select();
        handleSelectionChange();
      }
      return;
    }

    // Other shortcuts will be handled by parent component
  }, [settings.tabSize, onContentChange, handleSelectionChange]);

  /**
   * Handles mouse down for selection
   */
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  /**
   * Handles mouse move for selection
   */
  const handleMouseMove = useCallback(() => {
    if (isDragging) {
      handleSelectionChange();
    }
  }, [isDragging, handleSelectionChange]);

  /**
   * Handles mouse up for selection
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    handleSelectionChange();
  }, [handleSelectionChange]);

  /**
   * Focuses the textarea
   */
  const focus = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  /**
   * Gets the character position from line/column
   */
  const getCharacterPosition = useCallback((pos: Position): number => {
    const lines = content.split('\n');
    let position = 0;
    
    for (let i = 0; i < Math.min(pos.line, lines.length - 1); i++) {
      position += lines[i].length + 1; // +1 for newline
    }
    
    position += Math.min(pos.column, lines[pos.line]?.length || 0);
    return position;
  }, [content]);

  /**
   * Sets cursor position programmatically
   */
  const setCursorPosition = useCallback((position: Position) => {
    if (!textareaRef.current) return;
    
    const charPos = getCharacterPosition(position);
    textareaRef.current.selectionStart = charPos;
    textareaRef.current.selectionEnd = charPos;
    handleSelectionChange();
  }, [getCharacterPosition, handleSelectionChange]);

  /**
   * Scrolls to a specific line
   */
  const scrollToLine = useCallback((lineNumber: number) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 20;
    const scrollTop = lineNumber * lineHeight;
    
    textarea.scrollTop = scrollTop;
    
    // Also move cursor to that line
    setCursorPosition({ line: lineNumber, column: 0 });
    focus();
  }, [setCursorPosition, focus]);

  /**
   * Inserts text at current cursor position
   */
  const insertText = useCallback((text: string) => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const newContent = value.substring(0, selectionStart) + 
                      text + 
                      value.substring(selectionEnd);
    
    onContentChange(newContent);
    
    // Update cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = selectionStart + text.length;
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
        handleSelectionChange();
      }
    }, 0);
  }, [onContentChange, handleSelectionChange]);

  /**
   * Effect to update textarea when cursor position changes externally
   */
  useEffect(() => {
    if (textareaRef.current && document.activeElement === textareaRef.current) {
      const charPos = getCharacterPosition(cursorPosition);
      if (textareaRef.current.selectionStart !== charPos) {
        textareaRef.current.selectionStart = charPos;
        textareaRef.current.selectionEnd = charPos;
      }
    }
  }, [cursorPosition, getCharacterPosition]);

  /**
   * Expose methods via ref
   */
  useImperativeHandle(ref, () => ({
    focus,
    scrollToLine,
    insertText,
    setCursorPosition,
  }));

  const textareaStyle: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
    lineHeight: '1.5',
    padding: '8px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    color: settings.theme === 'dark' ? '#f8f8f2' : '#2f3337',
    whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
    overflowWrap: settings.wordWrap ? 'break-word' : 'normal',
    tabSize: settings.tabSize,
  };

  return (
    <div className={`text-editor-textarea-container ${className}`}>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        onSelect={handleSelectionChange}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={textareaStyle}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder={content === '' ? 'Start typing...' : undefined}
      />
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;