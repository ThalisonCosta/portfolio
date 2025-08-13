import '@testing-library/jest-dom';

// Add DragEvent and DataTransfer polyfills for tests
global.DragEvent = class DragEvent extends Event {
  dataTransfer: DataTransfer | null;
  clientX: number;
  clientY: number;

  constructor(type: string, eventInitDict?: { dataTransfer?: DataTransfer; clientX?: number; clientY?: number }) {
    super(type);
    this.dataTransfer = eventInitDict?.dataTransfer || null;
    this.clientX = eventInitDict?.clientX || 0;
    this.clientY = eventInitDict?.clientY || 0;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

global.DataTransfer = class DataTransfer {
  dropEffect: string = 'none';
  effectAllowed: string = 'all';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files: FileList = [] as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: DataTransferItemList = [] as any;
  types: string[] = [];
  private data: Record<string, string> = {};

  clearData(format?: string): void {
    if (format && format in this.data) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.data[format];
    } else {
      this.data = {};
    }
  }

  getData(format: string): string {
    return this.data[format] || '';
  }

  setData(format: string, data: string): void {
    this.data[format] = data;
  }

  // eslint-disable-next-line class-methods-use-this
  setDragImage(_image: Element, _x: number, _y: number): void {
    // Mock implementation
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
