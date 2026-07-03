import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../components/Sidebar";
import { useTradingStore } from "../store/useTradingStore";

// Mock the zustand store
jest.mock("../store/useTradingStore");

describe("Sidebar (Global Correlation Matrix)", () => {
  const mockCorrelationMatrix = {
    EURUSD: {
      GBPUSD: "85",
      USDJPY: "-55",
      AUDUSD: "40",
    },
    GBPUSD: {
      EURUSD: "85",
    },
  };

  beforeEach(() => {
    (useTradingStore as unknown as jest.Mock).mockReturnValue({
      correlationMatrix: mockCorrelationMatrix,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component title and legend", () => {
    render(<Sidebar />);
    expect(screen.getByText("GLOBAL CORRELATION MATRIX")).toBeInTheDocument();
    expect(screen.getByText(/< 50% \(SAFE\)/)).toBeInTheDocument();
    expect(screen.getByText(/50-79% \(WARN\)/)).toBeInTheDocument();
    expect(screen.getByText(/> 80% \(DANGER\)/)).toBeInTheDocument();
  });

  it("renders correlation values from the store", () => {
    render(<Sidebar />);
    // EURUSD x GBPUSD is 85
    expect(screen.getAllByText("85").length).toBeGreaterThan(0);
    // EURUSD x USDJPY is -55
    expect(screen.getAllByText("-55").length).toBeGreaterThan(0);
    // EURUSD x AUDUSD is 40
    expect(screen.getAllByText("40").length).toBeGreaterThan(0);
  });

  it("displays '-' for missing correlation values", () => {
    render(<Sidebar />);
    expect(screen.getAllByText("·").length).toBeGreaterThan(0);
  });

  it("shows telemetry overlay on hover", () => {
    render(<Sidebar />);
    
    // Find the cell containing "85"
    const cell = screen.getAllByText("85")[0];
    
    // Telemetry text is initially not present or hidden
    expect(screen.queryByText("CORRELATION FACTOR")).not.toBeInTheDocument();
    
    // Hover over the cell
    fireEvent.mouseEnter(cell);
    
    // Telemetry should now be visible
    expect(screen.getByText("CORRELATION FACTOR")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    
    // Unhover
    fireEvent.mouseLeave(cell);
    
    // Telemetry text should be hidden again
    expect(screen.queryByText("CORRELATION FACTOR")).not.toBeInTheDocument();
  });
});
