import '@testing-library/jest-dom/vitest';

// Mock window.Notification
Object.defineProperty(window, 'Notification', {
  value: class MockNotification {
    static permission = 'denied';
    static requestPermission = vi.fn();
    constructor() {}
  },
  writable: true,
});

// Mock Audio
Object.defineProperty(window, 'Audio', {
  value: class MockAudio {
    volume = 1;
    play = vi.fn().mockReturnValue(Promise.resolve());
  },
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});
