import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PositionsView from "../components/PositionsView";
import { useTradingStore } from "../store/useTradingStore";

// Mock the zustand store
jest.mock("../store/useTradingStore");

describe("PositionsView", () => {
  const mockClosePosition = jest.fn();
  const mockBreakeven = jest.fn();
  const mockPartialClose = jest.fn();

  const mockPositions = [
    {
      ticket: 1001,
      symbol: "EURUSD",
      type: "BUY",
      volume: 1.5,
      price_open: 1.1,
      price_current: 1.105,
      profit: 750,
      risk_status: "FREE",
      swap: "0.00",
      commission: -3,
      ai_score: 95,
    },
    {
      ticket: 1002,
      symbol: "XAUUSD",
      type: "SELL",
      volume: 0.5,
      price_open: 2000,
      price_current: 2010,
      profit: -500,
      risk_status: "RISK",
      swap: "-1.50",
      commission: -1,
      ai_score: 82,
    },
  ];

  beforeEach(() => {
    (useTradingStore as unknown as jest.Mock).mockReturnValue({
      positions: mockPositions,
      closePosition: mockClosePosition,
      breakeven: mockBreakeven,
      partialClose: mockPartialClose,
    });
    
    // Mock globalThis.confirm to always return true so we can test the callbacks
    globalThis.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component title and exposure metrics", () => {
    render(<PositionsView />);
    expect(screen.getByText("POSITIONS HUB")).toBeInTheDocument();
    
    // Total exposure is 1.5 + 0.5 = 2.0 LOTS
    expect(screen.getAllByText(/2\.00/)[0]).toBeInTheDocument();
    
    // Total P/L is 750 - 500 = 250
    expect(screen.getByText("+$250.00")).toBeInTheDocument();
  });

  it("calculates bucket allocation correctly", () => {
    render(<PositionsView />);
    // EURUSD is currency (1.5 lots). XAUUSD is metal (0.5 lots). Total 2.0 lots.
    // Currency = 1.5 / 2.0 = 75%
    // Metals = 0.5 / 2.0 = 25%
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("renders positions in the table", () => {
    render(<PositionsView />);
    
    // Tickets
    expect(screen.getByText("#1001")).toBeInTheDocument();
    expect(screen.getByText("#1002")).toBeInTheDocument();
    
    // Symbols
    expect(screen.getByText("EURUSD")).toBeInTheDocument();
    expect(screen.getByText("XAUUSD")).toBeInTheDocument();
    
    // Profits
    expect(screen.getByText("+$750.00")).toBeInTheDocument();
    expect(screen.getByText("$-500.00")).toBeInTheDocument();
    
    // Risk Status badges
    expect(screen.getByText("RISK FREE")).toBeInTheDocument();
    expect(screen.getByText("BEARING")).toBeInTheDocument();
  });

  it("calls closePosition when close button is clicked and confirmed", () => {
    render(<PositionsView />);
    
    // There are 2 close buttons (one for each position)
    const closeButtons = screen.getAllByTitle("Close");
    expect(closeButtons).toHaveLength(2);
    
    // Click the first one (ticket 1001)
    fireEvent.click(closeButtons[0]);
    
    expect(globalThis.confirm).toHaveBeenCalledWith("Force Close Ticket #1001?");
    expect(mockClosePosition).toHaveBeenCalledWith(1001, "EURUSD");
  });

  it("calls partialClose when partial close button is clicked and confirmed", () => {
    render(<PositionsView />);
    
    const partialCloseButtons = screen.getAllByTitle("Partial Close");
    fireEvent.click(partialCloseButtons[1]); // Click second one (ticket 1002)
    
    expect(globalThis.confirm).toHaveBeenCalledWith("Partial Close (50%) Ticket #1002?");
    expect(mockPartialClose).toHaveBeenCalledWith(1002, "XAUUSD");
  });

  it("calls breakeven when breakeven button is clicked and confirmed", () => {
    render(<PositionsView />);
    
    const breakevenButtons = screen.getAllByTitle("Breakeven");
    fireEvent.click(breakevenButtons[0]);
    
    expect(globalThis.confirm).toHaveBeenCalledWith("Breakeven Ticket #1001?");
    expect(mockBreakeven).toHaveBeenCalledWith(1001, "EURUSD");
  });

  it("displays [NO ACTIVE POSITIONS] when positions array is empty", () => {
    (useTradingStore as unknown as jest.Mock).mockReturnValue({
      positions: [],
      closePosition: mockClosePosition,
      breakeven: mockBreakeven,
      partialClose: mockPartialClose,
    });
    
    render(<PositionsView />);
    expect(screen.getByText("[NO ACTIVE POSITIONS]")).toBeInTheDocument();
  });
});
