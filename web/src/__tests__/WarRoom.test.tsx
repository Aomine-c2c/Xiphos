import React from 'react';
import { render, screen } from '@testing-library/react';
import WarRoom from '../components/WarRoom';
import { useTradingStore } from '../store/useTradingStore';

// Mock the zustand store
jest.mock('../store/useTradingStore');

const mockedUseTradingStore = useTradingStore as jest.MockedFunction<typeof useTradingStore>;

describe('WarRoom Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
  });

  it('renders account equity and balance correctly', () => {
    // Arrange: Mock the store return value
    mockedUseTradingStore.mockReturnValue({
      account: {
        equity: 12500.50,
        balance: 12000.00,
        margin: 500,
        margin_free: 12000,
        margin_level: 2500,
      }
    } as any);

    // Act: Render the component
    render(<WarRoom />);

    // Assert: Check if the equity and balance are displayed
    expect(screen.getByText('EQUITY')).toBeInTheDocument();
    expect(screen.getByText('$12500.50')).toBeInTheDocument();
    
    expect(screen.getByText('BALANCE')).toBeInTheDocument();
    expect(screen.getByText('$12000.00')).toBeInTheDocument();
    
    expect(screen.getByText('NET PROFIT')).toBeInTheDocument();
    // (Note: Net profit is currently hardcoded in the component as +$27.45)
    expect(screen.getByText('+$27.45')).toBeInTheDocument();
  });

  it('renders the mock risk stats correctly', () => {
    mockedUseTradingStore.mockReturnValue({
      account: {
        equity: 1000,
        balance: 1000,
      }
    } as any);

    render(<WarRoom />);

    // Check margin-related cards (which are mock data right now, but we verify they render)
    expect(screen.getByText('NET PROFIT')).toBeInTheDocument();
    expect(screen.getByText('WIN RATE')).toBeInTheDocument();
    expect(screen.getByText('PROFIT FACTOR')).toBeInTheDocument();
    expect(screen.getByText('MAX DRAWDOWN')).toBeInTheDocument();
  });
});
