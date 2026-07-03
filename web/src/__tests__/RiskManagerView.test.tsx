import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RiskManagerView from '../components/RiskManagerView';
import { useTradingStore } from '../store/useTradingStore';

// Mock the zustand store
jest.mock('../store/useTradingStore');
const mockedUseTradingStore = useTradingStore as jest.MockedFunction<typeof useTradingStore>;

// Mock Recharts ResponsiveContainer to prevent 0x0 size issues in JSDOM
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

describe('RiskManagerView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders risk parameters and AI suggestions correctly', () => {
    // Arrange
    mockedUseTradingStore.mockReturnValue({
      account: {
        balance: 50000,
        equity: 52000,
        margin: 1000,
      }
    } as any);

    // Act
    render(<RiskManagerView />);

    // Assert headers exist
    expect(screen.getByText('INSTITUTIONAL RISK CENTER')).toBeInTheDocument();
    expect(screen.getByText(/AI Risk Suggestions/i)).toBeInTheDocument();

    // Assert AI suggestions render
    expect(screen.getByText(/High GBP correlation detected/i)).toBeInTheDocument();
  });

  it('handles hold-to-trigger buttons', async () => {
    jest.useFakeTimers();
    mockedUseTradingStore.mockReturnValue({
      account: { balance: 50000 }
    } as any);

    render(<RiskManagerView />);

    // The component has "EMERGENCY STOP" button
    const haltButton = screen.getByText(/EMERGENCY STOP/i).closest('button');
    expect(haltButton).toBeInTheDocument();

    // We can simulate a mousedown, but the hold-button uses setInterval. 
    // Testing the exact timing in JSDOM requires fake timers.
    if (haltButton) {
      fireEvent.mouseDown(haltButton);
      // Fast-forward time so the interval completes (20ms * 25 ticks = 500ms)
      const { act } = require('@testing-library/react');
      act(() => {
        jest.advanceTimersByTime(600);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Flattened all positions!/i)).toBeInTheDocument();
      });
    }

    jest.useRealTimers();
  });
});
