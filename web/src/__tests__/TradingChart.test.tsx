import React from "react";
import { render } from "@testing-library/react";
import TradingChart from "../components/TradingChart";
import { createChart } from "lightweight-charts";

// Mock lightweight-charts to avoid canvas/JSDOM issues
jest.mock("lightweight-charts", () => {
  const mockSeries = {
    setData: jest.fn(),
  };
  const mockChart = {
    addSeries: jest.fn(() => mockSeries),
    applyOptions: jest.fn(),
    remove: jest.fn(),
  };
  return {
    createChart: jest.fn(() => mockChart),
    ColorType: { Solid: "Solid" },
    LineSeries: "LineSeries",
  };
}, { virtual: true });

describe("TradingChart", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing and initializes chart", () => {
    const { container } = render(<TradingChart symbol="EURUSD" timeframe="1M" />);
    
    // The container div should be present
    expect(container.firstChild).toBeInTheDocument();
    
    // createChart should have been called
    expect(createChart).toHaveBeenCalledTimes(1);
  });
  
  it("cleans up chart on unmount", () => {
    const { unmount } = render(<TradingChart symbol="EURUSD" timeframe="1M" />);
    
    // Unmount the component
    unmount();
    
    // The mocked remove method on the chart should be called
    const mockChartInstance = (createChart as jest.Mock).mock.results[0].value;
    expect(mockChartInstance.remove).toHaveBeenCalled();
  });
});
