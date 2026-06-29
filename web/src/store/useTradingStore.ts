import { create } from "zustand";

export interface AccountInfo {
  balance: number;
  equity: number;
  margin_free: number;
  margin_level: number;
  profit: number;
  margin: number;
}

export interface Position {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  price_open: number;
  price_current: number;
  sl: number;
  tp: number;
  profit: number;
  role: string;
  risk_status: "FREE" | "RISK";
  scalper_pnl?: number;
  runner_pnl?: number;
  comment?: string;
  swap?: number;
  commission?: number;
  ai_score?: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  asset: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  profit: number;
  strategy: string;
  session: string;
  winLoss: "WIN" | "LOSS";
  screenshotUrl: string;
  notes: string;
  ai_explanation: string;
  mistake_analysis: string;
  lessons_learned: string;
}

export interface Order {
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  price_open: number;
  sl: number;
  tp: number;
  comment?: string;
}

export interface MarketWatchItem {
  symbol: string;
  category: string;
  price: number;
  e13_dist: number;
  e50_dist: number;
  s200_dist: number;
  signal: string;
  change?: string;
  history?: number[];
  spread: number;
  atr: number;
  trend: string;
  volatility: string;
  ai_bias: number;
  probability: number;
  support: number;
  resistance: number;
  liquidity: string;
  volume: string;
  smart_money_zones: number[];
  fair_value_gaps: boolean;
  order_blocks: number[];
  market_structure: string;
  is_favorite: boolean;
}

export interface GatesState {
  gate_1_risk_slot?: string;
  gate_1_details?: string;
  gate_2_correlation?: string;
  gate_2_details?: string;
  gate_3_fan_alignment?: string;
  gate_3_details?: string;
  gate_4_priority_filter?: string;
  gate_4_details?: string;
  gate_5_hard_sl?: string;
  gate_5_details?: string;
}

export interface RankedSignal {
  priority: number;
  symbol: string;
  direction: string;
  price: number;
  sma200: number;
  distance: number;
  projected_risk: number;
  status: string;
}

export interface PerformanceMetrics {
  total_trades: number;
  win_rate: number;
  total_profit: number;
  profit_factor: number;
  max_drawdown: number;
  sharpe_ratio: number;
  equity_curve: number[];
}

export interface LogItem {
  timestamp: string;
  level: string;
  message: string;
  formatted: string;
}

export interface ChatMessage {
  sender: "user" | "vincent";
  text: string;
  timestamp: string;
}

export interface MahoragaState {
  trend_state: string;
  momentum_state: string;
  filter_strictness: string;
  confidence_score: number;
  adaptation_spins: number;
  fast_ema: number;
  medium_ema: number;
  slow_sma: number;
  lot_multiplier: number;
  sl_multiplier: number;
}


interface TradingStore {
  connected: boolean;
  botRunning: boolean;
  mt5Connected: boolean;
  apiLatency: number;
  wsRetries: number;

  account: AccountInfo;
  positions: Position[];
  orders: Order[];
  marketWatch: MarketWatchItem[];
  gates: GatesState;
  rankedSignals: RankedSignal[];
  journal: JournalEntry[];
  lastCycleTime: string;
  systemStats: { cpu: number; memory: number };
  logs: LogItem[];
  chatMessages: ChatMessage[];
  correlationMatrix: Record<string, Record<string, string>>;
  performanceMetrics: PerformanceMetrics;
  mahoragaState: Record<string, MahoragaState> | null;

  ws: WebSocket | null;

  connectWebSocket: () => void;
  fetchMahoragaState: () => Promise<void>;
  sendCommand: (type: string, data?: unknown) => void;
  sendChatMessage: (text: string) => void;
  modifySL: (ticket: number, symbol: string, newSL: number) => void;
  modifyTP: (ticket: number, symbol: string, newTP: number) => void;
  closePosition: (ticket: number, symbol: string) => void;
  breakeven: (ticket: number, symbol: string) => void;
  partialClose: (ticket: number, symbol: string) => void;
  placeOrder: (symbol: string, type: string, volume: number, price: number, sl: number, tp: number) => void;
  cancelOrder: (ticket: number) => void;
  toggleFavorite: (symbol: string) => void;
  simulateMahoraga: () => void;
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const MOCK_ACCOUNT: AccountInfo = {
  balance: 48_320.00,
  equity: 49_105.42,
  margin_free: 44_210.18,
  margin_level: 1840.5,
  profit: 785.42,
  margin: 4895.24,
};

const MOCK_POSITIONS: Position[] = [
  { ticket: 88301, symbol: "EURUSD", type: "BUY",  volume: 0.10, price_open: 1.08712, price_current: 1.08945, sl: 1.08300, tp: 1.09500, profit:  233.00, role: "RUNNER",  risk_status: "FREE" },
  { ticket: 88302, symbol: "XAUUSD", type: "BUY",  volume: 0.05, price_open: 2391.40, price_current: 2408.20, sl: 2375.00, tp: 2450.00, profit:  840.00, role: "SCALPER", risk_status: "FREE" },
  { ticket: 88303, symbol: "GBPUSD", type: "SELL", volume: 0.05, price_open: 1.27105, price_current: 1.26820, sl: 1.27500, tp: 1.26000, profit:  142.50, role: "SCALPER", risk_status: "FREE" },
  { ticket: 88304, symbol: "USDJPY", type: "BUY",  volume: 0.08, price_open: 157.620, price_current: 157.980, sl: 157.000, tp: 159.000, profit:  192.00, role: "RUNNER",  risk_status: "RISK" },
  { ticket: 88305, symbol: "XAGUSD", type: "BUY",  volume: 0.10, price_open:  29.142, price_current:  28.870, sl:  28.500, tp:  30.500, profit: -272.00, role: "SCALPER", risk_status: "RISK" },
];

const MOCK_ORDERS: Order[] = [
  { ticket: 77401, symbol: "EURUSD", type: "BUY LIMIT",  volume: 0.10, price_open: 1.08400, sl: 1.07980, tp: 1.09200, comment: "KRONOS-L1" },
  { ticket: 77402, symbol: "XAUUSD", type: "BUY STOP",   volume: 0.05, price_open: 2415.00, sl: 2398.00, tp: 2460.00, comment: "KRONOS-L2" },
  { ticket: 77403, symbol: "GBPJPY", type: "SELL LIMIT", volume: 0.03, price_open:  201.200, sl:  201.800, tp:  199.500, comment: "KRONOS-L3" },
];



const MOCK_MARKET_WATCH: MarketWatchItem[] = [
  { symbol: "EURUSD", category: "Forex", price: 1.10402, e13_dist: 0.00121, e50_dist: 0.01827, s200_dist: 0.02861, signal: "BUY", change: "+1.98%", history: [1.10402, 1.10407, 1.10388, 1.10258, 1.10476, 1.10326, 1.10308, 1.10745, 1.10454, 1.10737, 1.10388, 1.09856, 1.10457, 1.09788, 1.10679, 1.09757, 1.11176, 1.10917, 1.10377, 1.10423], spread: 0.8, atr: 0.01, trend: "RANGING", volatility: "HIGH", ai_bias: -59, probability: 60, support: 1.04882, resistance: 1.15922, liquidity: "15M", volume: "502K", smart_money_zones: [1.08194, 1.1261], fair_value_gaps: false, order_blocks: [1.05986], market_structure: "LL", is_favorite: false },
  { symbol: "GBPUSD", category: "Forex", price: 1.1007, e13_dist: 0.00122, e50_dist: 0.01962, s200_dist: 0.01193, signal: "SELL", change: "-1.73%", history: [1.1007, 1.10054, 1.10097, 1.10144, 1.10098, 1.10108, 1.10014, 1.10419, 1.10099, 1.09828, 1.09724, 1.1058, 1.10667, 1.10586, 1.10671, 1.09921, 1.10769, 1.10162, 1.10175, 1.09626], spread: 1.1, atr: 0.01, trend: "BULLISH", volatility: "MED", ai_bias: -52, probability: 77, support: 1.04567, resistance: 1.15573, liquidity: "52M", volume: "390K", smart_money_zones: [1.07869, 1.12271], fair_value_gaps: true, order_blocks: [1.05667], market_structure: "LL", is_favorite: true },
  { symbol: "USDJPY", category: "Forex", price: 1.10089, e13_dist: 0.00054, e50_dist: 0.00396, s200_dist: 0.01962, signal: "BUY", change: "+0.91%", history: [1.10089, 1.10067, 1.10137, 1.10177, 1.09912, 1.09966, 1.09912, 1.10286, 1.09811, 1.10049, 1.09705, 1.10586, 1.09689, 1.09921, 1.09756, 1.09578, 1.10848, 1.1087, 1.09602, 1.09226], spread: 0.2, atr: 0.01, trend: "BEARISH", volatility: "MED", ai_bias: -24, probability: 93, support: 1.04585, resistance: 1.15593, liquidity: "21M", volume: "591K", smart_money_zones: [1.07887, 1.12291], fair_value_gaps: true, order_blocks: [1.05685], market_structure: "LH", is_favorite: false },
  { symbol: "USDCHF", category: "Forex", price: 1.10204, e13_dist: 0.00072, e50_dist: 0.01208, s200_dist: 0.00236, signal: "SELL", change: "-1.17%", history: [1.10204, 1.10195, 1.10209, 1.10323, 1.10088, 1.10311, 1.09986, 1.10161, 1.10492, 1.10464, 1.09912, 1.09662, 1.09907, 1.09826, 1.09755, 1.09793, 1.10823, 1.10347, 1.09989, 1.09374], spread: 0.3, atr: 0.01, trend: "RANGING", volatility: "MED", ai_bias: 66, probability: 79, support: 1.04694, resistance: 1.15714, liquidity: "39M", volume: "923K", smart_money_zones: [1.08, 1.12408], fair_value_gaps: true, order_blocks: [1.05796], market_structure: "CONSOLIDATION", is_favorite: false },
  { symbol: "AUDUSD", category: "Forex", price: 1.10389, e13_dist: 0.00969, e50_dist: 0.01934, s200_dist: 0.01861, signal: "BUY", change: "+0.43%", history: [1.10389, 1.10372, 1.10415, 1.10475, 1.10327, 1.10198, 1.10407, 1.10619, 1.1046, 1.10404, 1.09957, 1.09925, 1.0985, 1.10284, 1.10172, 1.09988, 1.09894, 1.10979, 1.10339, 1.10516], spread: 0.1, atr: 0.01, trend: "BEARISH", volatility: "MED", ai_bias: 87, probability: 87, support: 1.0487, resistance: 1.15908, liquidity: "51M", volume: "340K", smart_money_zones: [1.08181, 1.12597], fair_value_gaps: true, order_blocks: [1.05973], market_structure: "HL", is_favorite: false },
  { symbol: "NZDUSD", category: "Forex", price: 1.10271, e13_dist: 0.00841, e50_dist: 0.01443, s200_dist: 0.03525, signal: "NONE", change: "-0.66%", history: [1.10271, 1.10234, 1.10276, 1.10237, 1.10352, 1.10465, 1.10304, 1.09988, 1.10462, 1.10665, 1.09953, 1.10703, 1.10561, 1.09725, 1.10331, 1.09924, 1.10023, 1.10428, 1.1016, 1.09795], spread: 1.9, atr: 0.01, trend: "RANGING", volatility: "HIGH", ai_bias: 7, probability: 75, support: 1.04757, resistance: 1.15785, liquidity: "12M", volume: "411K", smart_money_zones: [1.08066, 1.12476], fair_value_gaps: true, order_blocks: [1.0586], market_structure: "LL", is_favorite: false },
  { symbol: "USDCAD", category: "Forex", price: 1.1041, e13_dist: 0.00531, e50_dist: 0.01695, s200_dist: 0.04839, signal: "BUY", change: "+0.80%", history: [1.1041, 1.10443, 1.10491, 1.10388, 1.10532, 1.10416, 1.10168, 1.10151, 1.10775, 1.10735, 1.1056, 1.09975, 1.10057, 1.10242, 1.10195, 1.10777, 1.10868, 1.09595, 1.10059, 1.10794], spread: 0.1, atr: 0.01, trend: "RANGING", volatility: "HIGH", ai_bias: -100, probability: 77, support: 1.0489, resistance: 1.15931, liquidity: "24M", volume: "786K", smart_money_zones: [1.08202, 1.12618], fair_value_gaps: true, order_blocks: [1.05994], market_structure: "HH", is_favorite: false },
  { symbol: "EURGBP", category: "Forex", price: 1.09814, e13_dist: 0.00308, e50_dist: 0.00685, s200_dist: 0.02519, signal: "BUY", change: "+0.03%", history: [1.09814, 1.09766, 1.09891, 1.09818, 1.09636, 1.0968, 1.1008, 1.09923, 1.09863, 1.09372, 1.09503, 1.1028, 1.1024, 1.10084, 1.10456, 1.10542, 1.10273, 1.09394, 1.10342, 1.09323], spread: 1.9, atr: 0.01, trend: "BEARISH", volatility: "LOW", ai_bias: 57, probability: 92, support: 1.04323, resistance: 1.15305, liquidity: "40M", volume: "862K", smart_money_zones: [1.07618, 1.1201], fair_value_gaps: false, order_blocks: [1.05421], market_structure: "HH", is_favorite: true },
  { symbol: "EURJPY", category: "Forex", price: 1.0975, e13_dist: 0.00027, e50_dist: 0.01133, s200_dist: 0.04467, signal: "BUY", change: "+0.77%", history: [1.0975, 1.09731, 1.09791, 1.09779, 1.09735, 1.09739, 1.09952, 1.10081, 1.09885, 1.1, 1.09284, 1.0991, 1.09508, 1.09649, 1.09207, 1.09732, 1.10309, 1.10139, 1.09013, 1.09849], spread: 1.1, atr: 0.01, trend: "BEARISH", volatility: "HIGH", ai_bias: 9, probability: 80, support: 1.04262, resistance: 1.15237, liquidity: "26M", volume: "635K", smart_money_zones: [1.07555, 1.11945], fair_value_gaps: true, order_blocks: [1.0536], market_structure: "CONSOLIDATION", is_favorite: false },
  { symbol: "GBPJPY", category: "Forex", price: 1.09608, e13_dist: 0.00084, e50_dist: 0.00401, s200_dist: 0.04078, signal: "NONE", change: "-1.68%", history: [1.09608, 1.0964, 1.09694, 1.09652, 1.09411, 1.09834, 1.09792, 1.09897, 1.09929, 1.09262, 1.09961, 1.09384, 1.10207, 1.10077, 1.096, 1.10013, 1.09316, 1.0974, 1.09635, 1.09597], spread: 1, atr: 0.01, trend: "RANGING", volatility: "HIGH", ai_bias: 77, probability: 88, support: 1.04128, resistance: 1.15088, liquidity: "36M", volume: "998K", smart_money_zones: [1.07416, 1.118], fair_value_gaps: false, order_blocks: [1.05224], market_structure: "HL", is_favorite: false },
  { symbol: "BTCUSD", category: "Crypto", price: 50360.06594, e13_dist: 204.73331, e50_dist: 1159.02912, s200_dist: 4045.67804, signal: "BUY", change: "+0.20%", history: [50360.06594, 50342.80493, 50299.06828, 50450.31318, 50196.52462, 50188.36439, 50423.69821, 50262.02706, 50259.27531, 50716.96002, 50606.30668, 50156.14088, 50375.75328, 50685.16219, 49933.51186, 49856.8363, 51012.43028, 50384.69151, 51123.03672, 50248.31542], spread: 1.4, atr: 500, trend: "BEARISH", volatility: "MED", ai_bias: -22, probability: 62, support: 47842.06264, resistance: 52878.06924, liquidity: "55M", volume: "184K", smart_money_zones: [49352.86462, 51367.26726], fair_value_gaps: false, order_blocks: [48345.6633], market_structure: "HL", is_favorite: false },
  { symbol: "ETHUSD", category: "Crypto", price: 50079.31373, e13_dist: 452.2438, e50_dist: 1145.14743, s200_dist: 4131.84118, signal: "NONE", change: "-1.94%", history: [50079.31373, 50123.75659, 50038.35783, 50116.52917, 50050.75766, 50027.70586, 49969.82105, 49774.76872, 49960.69087, 50387.18998, 49816.61778, 49676.76531, 49589.06, 50141.36559, 50242.96618, 49519.54622, 49567.74901, 49265.16416, 49968.48665, 50820.76525], spread: 0.3, atr: 500, trend: "BEARISH", volatility: "LOW", ai_bias: -54, probability: 77, support: 47575.34804, resistance: 52583.27942, liquidity: "26M", volume: "699K", smart_money_zones: [49077.72746, 51080.9], fair_value_gaps: true, order_blocks: [48076.14118], market_structure: "LH", is_favorite: false },
  { symbol: "SOLUSD", category: "Crypto", price: 49842.88605, e13_dist: 914.26835, e50_dist: 1485.62074, s200_dist: 1805.76386, signal: "SELL", change: "-0.94%", history: [49842.88605, 49846.30237, 49762.61215, 49893.68245, 49904.36719, 49734.31805, 49553.34945, 49722.40759, 49566.50098, 49483.85182, 50078.5866, 49582.76119, 50139.18163, 50096.70572, 49855.64545, 50436.93863, 49441.72034, 49984.71132, 49409.084, 50482.36842], spread: 0.5, atr: 500, trend: "RANGING", volatility: "MED", ai_bias: -25, probability: 68, support: 47350.74175, resistance: 52335.03035, liquidity: "38M", volume: "748K", smart_money_zones: [48846.02833, 50839.74377], fair_value_gaps: false, order_blocks: [47849.17061], market_structure: "HH", is_favorite: false },
  { symbol: "XRPUSD", category: "Crypto", price: 49569.10101, e13_dist: 14.67552, e50_dist: 1083.6648, s200_dist: 3034.12322, signal: "NONE", change: "-0.71%", history: [49569.10101, 49554.05377, 49548.145, 49515.13516, 49697.41216, 49442.03635, 49476.75575, 49267.68419, 49689.64191, 49458.1276, 49826.25202, 49923.25704, 49107.16412, 49045.26949, 48939.41054, 49228.33893, 49824.68017, 49337.63054, 49015.44238, 48978.42399], spread: 1.6, atr: 500, trend: "BEARISH", volatility: "MED", ai_bias: 20, probability: 81, support: 47090.64596, resistance: 52047.55606, liquidity: "58M", volume: "561K", smart_money_zones: [48577.71899, 50560.48303], fair_value_gaps: false, order_blocks: [47586.33697], market_structure: "HH", is_favorite: false },
  { symbol: "ADAUSD", category: "Crypto", price: 50478.68733, e13_dist: 865.30621, e50_dist: 127.09104, s200_dist: 2362.31786, signal: "SELL", change: "-0.97%", history: [50478.68733, 50510.60542, 50448.76686, 50557.0616, 50378.83352, 50319.54714, 50569.28962, 50433.64465, 50720.32094, 50714.29722, 50826.96321, 50156.76503, 50019.86521, 50072.8691, 50423.00788, 50619.32357, 50263.33369, 50685.80304, 50489.51214, 51090.14578], spread: 0.7, atr: 500, trend: "BEARISH", volatility: "MED", ai_bias: 28, probability: 81, support: 47954.75296, resistance: 53002.6217, liquidity: "12M", volume: "998K", smart_money_zones: [49469.11358, 51488.26108], fair_value_gaps: true, order_blocks: [48459.53984], market_structure: "LH", is_favorite: true },
  { symbol: "DOTUSD", category: "Crypto", price: 49579.39919, e13_dist: 446.65059, e50_dist: 382.41585, s200_dist: 1231.34404, signal: "NONE", change: "-1.85%", history: [49579.39919, 49594.40581, 49675.63132, 49695.55042, 49469.99811, 49556.30535, 49299.40112, 49625.27039, 49968.96937, 49442.1789, 49457.41444, 49443.44815, 49875.61016, 49708.53188, 49361.58821, 49164.19573, 49193.28853, 50312.06971, 49174.64954, 49379.68733], spread: 1.6, atr: 500, trend: "BULLISH", volatility: "LOW", ai_bias: -68, probability: 68, support: 47100.42923, resistance: 52058.36915, liquidity: "11M", volume: "616K", smart_money_zones: [48587.81121, 50570.98717], fair_value_gaps: false, order_blocks: [47596.22322], market_structure: "CONSOLIDATION", is_favorite: true },
  { symbol: "AVAXUSD", category: "Crypto", price: 49613.55867, e13_dist: 167.72066, e50_dist: 928.76297, s200_dist: 3851.94874, signal: "SELL", change: "-1.42%", history: [49613.55867, 49591.68848, 49655.22578, 49668.57215, 49617.62617, 49529.83605, 49698.42272, 49393.52075, 49692.89332, 49250.55769, 49870.66417, 50070.74237, 49704.65932, 49018.56003, 49504.45653, 49630.4065, 49005.96875, 49891.32502, 50124.97063, 48734.7703], spread: 0.7, atr: 500, trend: "BEARISH", volatility: "MED", ai_bias: -51, probability: 66, support: 47132.88074, resistance: 52094.2366, liquidity: "53M", volume: "267K", smart_money_zones: [48621.2875, 50605.82984], fair_value_gaps: false, order_blocks: [47629.01632], market_structure: "HH", is_favorite: true },
  { symbol: "LINKUSD", category: "Crypto", price: 49931.60123, e13_dist: 970.04955, e50_dist: 1502.01281, s200_dist: 3709.81426, signal: "SELL", change: "-0.62%", history: [49931.60123, 49972.22968, 49892.0227, 50040.63612, 49781.71289, 50131.67358, 50180.40374, 49838.56133, 49760.20545, 50349.78228, 50162.65804, 50090.66766, 49510.19365, 50193.22791, 49261.03007, 49958.88326, 50219.18843, 49503.76407, 50420.42896, 49503.31087], spread: 0.1, atr: 500, trend: "BULLISH", volatility: "LOW", ai_bias: 100, probability: 97, support: 47435.02117, resistance: 52428.18129, liquidity: "33M", volume: "906K", smart_money_zones: [48932.96921, 50930.23325], fair_value_gaps: false, order_blocks: [47934.33718], market_structure: "HL", is_favorite: true },
  { symbol: "MATICUSD", category: "Crypto", price: 49870.91419, e13_dist: 661.01709, e50_dist: 1394.94092, s200_dist: 3191.38332, signal: "BUY", change: "+1.26%", history: [49870.91419, 49854.28945, 49871.5458, 49859.37642, 49913.78006, 50001.66873, 49825.00866, 50043.05574, 49882.29823, 49706.206, 49455.71393, 49617.26927, 50396.94639, 50183.69496, 50224.70726, 49182.51961, 50406.80022, 50175.11218, 49935.70776, 48994.50603], spread: 1.9, atr: 500, trend: "RANGING", volatility: "MED", ai_bias: 49, probability: 79, support: 47377.36848, resistance: 52364.4599, liquidity: "36M", volume: "656K", smart_money_zones: [48873.49591, 50868.33247], fair_value_gaps: true, order_blocks: [47876.07762], market_structure: "LH", is_favorite: false },
  { symbol: "DOGEUSD", category: "Crypto", price: 49970.20871, e13_dist: 917.05346, e50_dist: 123.85908, s200_dist: 2462.94713, signal: "BUY", change: "+1.27%", history: [49970.20871, 49932.46465, 49940.69438, 50033.5266, 50110.63535, 49902.98017, 49734.96872, 49691.35648, 50219.44356, 49994.71384, 49714.90956, 50426.82673, 50220.43569, 49380.40797, 50345.95587, 49518.45265, 50463.65949, 50139.39638, 50442.4643, 49208.56761], spread: 1.9, atr: 500, trend: "RANGING", volatility: "HIGH", ai_bias: 23, probability: 79, support: 47471.69827, resistance: 52468.71915, liquidity: "34M", volume: "444K", smart_money_zones: [48970.80454, 50969.61288], fair_value_gaps: true, order_blocks: [47971.40036], market_structure: "CONSOLIDATION", is_favorite: false },
  { symbol: "US30", category: "Indices", price: 15023.16023, e13_dist: 34.52909, e50_dist: 5.80821, s200_dist: 75.28713, signal: "NONE", change: "-0.09%", history: [15023.16023, 15023.69688, 15022.47167, 15019.31757, 15025.26189, 15022.74676, 15008.41266, 15028.66083, 15015.03013, 15010.13418, 15047.65871, 15043.59335, 14994.71151, 15054.00842, 15039.49857, 15024.9608, 15062.84542, 15022.12405, 15030.92456, 15053.29044], spread: 1.6, atr: 25, trend: "RANGING", volatility: "MED", ai_bias: -69, probability: 74, support: 14272.00222, resistance: 15774.31824, liquidity: "12M", volume: "510K", smart_money_zones: [14722.69703, 15323.62343], fair_value_gaps: true, order_blocks: [14422.23382], market_structure: "LH", is_favorite: true },
  { symbol: "SPX500", category: "Indices", price: 14976.70813, e13_dist: 32.93351, e50_dist: 72.98718, s200_dist: 190.86876, signal: "BUY", change: "+1.51%", history: [14976.70813, 14977.10642, 14972.46382, 14969.84143, 14968.94791, 14977.57301, 14974.16104, 14991.44811, 14962.33106, 14985.22483, 14993.18877, 14981.91921, 14955.27127, 14960.34903, 14986.6447, 15010.42044, 14941.89452, 14946.33553, 15001.94493, 14975.94623], spread: 0.4, atr: 25, trend: "RANGING", volatility: "MED", ai_bias: -94, probability: 88, support: 14227.87272, resistance: 15725.54354, liquidity: "28M", volume: "582K", smart_money_zones: [14677.17397, 15276.24229], fair_value_gaps: true, order_blocks: [14377.6398], market_structure: "HL", is_favorite: false },
  { symbol: "NAS100", category: "Indices", price: 14995.3898, e13_dist: 42.80799, e50_dist: 96.73194, s200_dist: 247.9909, signal: "SELL", change: "-1.87%", history: [14995.3898, 14993.48822, 14996.95469, 14995.17481, 15000.44995, 14997.94461, 14985.3301, 14981.30744, 15010.85729, 14997.6151, 15006.92923, 15006.32173, 15000.52699, 14965.2003, 14983.22286, 15012.00041, 14984.38748, 14957.66377, 14993.08557, 14981.42558], spread: 0.6, atr: 25, trend: "BULLISH", volatility: "MED", ai_bias: 96, probability: 66, support: 14245.62031, resistance: 15745.15929, liquidity: "39M", volume: "995K", smart_money_zones: [14695.482, 15295.2976], fair_value_gaps: false, order_blocks: [14395.57421], market_structure: "LL", is_favorite: false },
  { symbol: "GER40", category: "Indices", price: 15016.20186, e13_dist: 3.79945, e50_dist: 79.08485, s200_dist: 42.66918, signal: "SELL", change: "-0.41%", history: [15016.20186, 15016.08969, 15015.0205, 15009.96962, 15017.08497, 15014.20486, 15026.18047, 15031.41509, 15011.6719, 15019.83297, 15015.18237, 15005.68757, 15037.55144, 15024.25446, 15042.03496, 14983.45694, 15043.64193, 15057.27761, 15051.09579, 15027.37871], spread: 1.4, atr: 25, trend: "BEARISH", volatility: "LOW", ai_bias: 92, probability: 97, support: 14265.39177, resistance: 15767.01195, liquidity: "49M", volume: "881K", smart_money_zones: [14715.87782, 15316.5259], fair_value_gaps: true, order_blocks: [14415.55379], market_structure: "LL", is_favorite: false },
  { symbol: "UK100", category: "Indices", price: 15005.25618, e13_dist: 40.77357, e50_dist: 25.18665, s200_dist: 48.56708, signal: "BUY", change: "+1.74%", history: [15005.25618, 15006.01315, 15006.95566, 14998.44124, 15005.75449, 15000.80016, 14990.40357, 14990.14716, 15011.35607, 15006.41183, 14993.94189, 15016.8593, 14978.66474, 14995.45966, 14992.28647, 14997.03926, 15020.36634, 14980.84245, 14970.7626, 14984.89445], spread: 1.5, atr: 25, trend: "RANGING", volatility: "HIGH", ai_bias: -5, probability: 73, support: 14254.99337, resistance: 15755.51899, liquidity: "49M", volume: "752K", smart_money_zones: [14705.15106, 15305.3613], fair_value_gaps: true, order_blocks: [14405.04593], market_structure: "HH", is_favorite: false },
  { symbol: "JPN225", category: "Indices", price: 14977.76575, e13_dist: 3.79341, e50_dist: 0.82635, s200_dist: 88.60827, signal: "BUY", change: "+0.89%", history: [14977.76575, 14977.00129, 14976.89228, 14972.18797, 14968.5739, 14986.74042, 14983.20573, 14962.50632, 14974.77158, 14977.26332, 14994.23149, 14974.56726, 14980.76327, 14963.62579, 14958.7833, 14958.51007, 14938.42233, 15002.86735, 14970.82206, 14953.27508], spread: 0.6, atr: 25, trend: "BULLISH", volatility: "MED", ai_bias: 35, probability: 80, support: 14228.87746, resistance: 15726.65404, liquidity: "20M", volume: "254K", smart_money_zones: [14678.21044, 15277.32107], fair_value_gaps: false, order_blocks: [14378.65512], market_structure: "HH", is_favorite: true },
  { symbol: "FRA40", category: "Indices", price: 14977.30343, e13_dist: 35.56747, e50_dist: 9.74115, s200_dist: 204.55085, signal: "BUY", change: "+0.83%", history: [14977.30343, 14975.79493, 14976.34633, 14975.37397, 14980.91386, 14979.09692, 14964.73432, 14961.7684, 14976.79748, 14975.76132, 14967.59611, 14971.10828, 14951.38786, 14973.37565, 14974.72195, 14941.55996, 14969.84142, 15004.09378, 15022.00108, 15006.59597], spread: 0.7, atr: 25, trend: "BULLISH", volatility: "HIGH", ai_bias: -88, probability: 80, support: 14228.43826, resistance: 15726.1686, liquidity: "53M", volume: "119K", smart_money_zones: [14677.75736, 15276.8495], fair_value_gaps: true, order_blocks: [14378.21129], market_structure: "LL", is_favorite: false },
  { symbol: "AUS200", category: "Indices", price: 15020.18426, e13_dist: 10.91243, e50_dist: 11.08598, s200_dist: 43.90952, signal: "BUY", change: "+1.34%", history: [15020.18426, 15019.46486, 15017.96145, 15027.07175, 15019.11259, 15013.79832, 15030.06379, 15034.33976, 15007.35525, 15020.40837, 15003.82021, 15019.5632, 15023.53638, 14993.01144, 15029.37337, 15004.87139, 15046.31993, 15055.82245, 15015.69319, 14974.44788], spread: 1.1, atr: 25, trend: "RANGING", volatility: "MED", ai_bias: 69, probability: 84, support: 14269.17505, resistance: 15771.19347, liquidity: "46M", volume: "660K", smart_money_zones: [14719.78057, 15320.58795], fair_value_gaps: true, order_blocks: [14419.37689], market_structure: "HH", is_favorite: true },
  { symbol: "HK50", category: "Indices", price: 15011.93563, e13_dist: 6.38549, e50_dist: 47.46854, s200_dist: 108.6114, signal: "BUY", change: "+0.98%", history: [15011.93563, 15012.18634, 15010.86576, 15016.20741, 15021.08043, 15013.83794, 15002.51803, 15022.0354, 14997.92086, 15004.20134, 15004.63166, 14990.88009, 15028.13685, 15008.1027, 15023.50581, 14986.0295, 15042.05829, 15000.56302, 15043.24684, 15043.17033], spread: 0.9, atr: 25, trend: "RANGING", volatility: "HIGH", ai_bias: 97, probability: 65, support: 14261.33885, resistance: 15762.53241, liquidity: "37M", volume: "116K", smart_money_zones: [14711.69692, 15312.17434], fair_value_gaps: false, order_blocks: [14411.4582], market_structure: "LL", is_favorite: false },
  { symbol: "EU50", category: "Indices", price: 14988.08517, e13_dist: 9.15229, e50_dist: 70.37905, s200_dist: 106.195, signal: "SELL", change: "-0.05%", history: [14988.08517, 14988.50049, 14991.52921, 14992.61901, 14997.76438, 14976.53792, 14976.10261, 14992.47113, 14979.73115, 14996.99894, 14983.27677, 15002.14932, 15016.48486, 14994.62207, 14988.72445, 14957.66761, 14988.66692, 14951.90554, 15027.12153, 14993.03122], spread: 0.2, atr: 25, trend: "RANGING", volatility: "MED", ai_bias: -94, probability: 71, support: 14238.68091, resistance: 15737.48943, liquidity: "48M", volume: "753K", smart_money_zones: [14688.32347, 15287.84687], fair_value_gaps: false, order_blocks: [14388.56176], market_structure: "CONSOLIDATION", is_favorite: false },
  { symbol: "AAPL", category: "Stocks", price: 200.46511, e13_dist: 2.54894, e50_dist: 2.99248, s200_dist: 12.55173, signal: "BUY", change: "+1.90%", history: [200.46511, 200.34474, 200.21367, 200.96887, 200.5604, 200.74941, 199.47583, 199.25365, 202.3799, 202.05705, 200.50954, 202.5018, 198.94462, 198.70049, 202.83884, 197.53821, 196.51534, 200.76129, 196.98857, 199.80881], spread: 0.1, atr: 2.5, trend: "BEARISH", volatility: "HIGH", ai_bias: -89, probability: 88, support: 190.44185, resistance: 210.48837, liquidity: "16M", volume: "889K", smart_money_zones: [196.45581, 204.47441], fair_value_gaps: true, order_blocks: [192.44651], market_structure: "LH", is_favorite: false },
  { symbol: "MSFT", category: "Stocks", price: 200.87855, e13_dist: 1.90874, e50_dist: 7.605, s200_dist: 13.9843, signal: "NONE", change: "-0.27%", history: [200.87855, 201.01226, 201.3612, 200.77214, 201.2642, 200.81213, 200.91659, 199.31571, 202.82257, 199.98503, 200.13956, 200.27307, 203.67103, 203.36337, 201.33968, 198.24916, 197.39898, 202.48426, 200.84019, 204.82235], spread: 0.4, atr: 2.5, trend: "BEARISH", volatility: "MED", ai_bias: 6, probability: 60, support: 190.83462, resistance: 210.92248, liquidity: "12M", volume: "515K", smart_money_zones: [196.86098, 204.89612], fair_value_gaps: true, order_blocks: [192.84341], market_structure: "LL", is_favorite: false },
  { symbol: "TSLA", category: "Stocks", price: 198.20759, e13_dist: 1.44388, e50_dist: 2.68197, s200_dist: 23.84058, signal: "NONE", change: "-0.04%", history: [198.20759, 197.96177, 197.94867, 198.04606, 197.22781, 198.13591, 199.21147, 198.03932, 198.11992, 196.86085, 196.70646, 197.19089, 196.33353, 197.21492, 200.56157, 200.45194, 195.58328, 195.61152, 194.78751, 195.12201], spread: 2, atr: 2.5, trend: "BEARISH", volatility: "HIGH", ai_bias: -14, probability: 69, support: 188.29721, resistance: 208.11797, liquidity: "38M", volume: "744K", smart_money_zones: [194.24344, 202.17174], fair_value_gaps: true, order_blocks: [190.27929], market_structure: "LL", is_favorite: false },
  { symbol: "NVDA", category: "Stocks", price: 199.77301, e13_dist: 0.30578, e50_dist: 7.83215, s200_dist: 0.46826, signal: "BUY", change: "+0.79%", history: [199.77301, 199.94334, 199.78928, 200.10472, 199.35396, 200.7837, 199.48197, 201.32477, 198.56318, 200.09693, 198.03442, 200.1962, 202.17349, 196.54419, 197.59508, 201.70589, 201.74517, 199.932, 196.65041, 195.89539], spread: 0.5, atr: 2.5, trend: "BEARISH", volatility: "MED", ai_bias: 32, probability: 93, support: 189.78436, resistance: 209.76166, liquidity: "17M", volume: "901K", smart_money_zones: [195.77755, 203.76847], fair_value_gaps: true, order_blocks: [191.78209], market_structure: "HH", is_favorite: false },
  { symbol: "AMZN", category: "Stocks", price: 202.06771, e13_dist: 1.9556, e50_dist: 3.65996, s200_dist: 24.96845, signal: "SELL", change: "-1.22%", history: [202.06771, 202.22868, 202.21908, 202.34474, 201.39515, 203.23694, 202.21585, 201.55611, 203.97652, 202.41264, 202.085, 203.34066, 203.93385, 202.13684, 203.09364, 204.54919, 199.17561, 205.57093, 200.97806, 203.08937], spread: 1.6, atr: 2.5, trend: "BULLISH", volatility: "HIGH", ai_bias: -56, probability: 98, support: 191.96432, resistance: 212.1711, liquidity: "21M", volume: "554K", smart_money_zones: [198.02636, 206.10906], fair_value_gaps: true, order_blocks: [193.985], market_structure: "LH", is_favorite: false },
  { symbol: "GOOGL", category: "Stocks", price: 200.46321, e13_dist: 3.36117, e50_dist: 7.57443, s200_dist: 8.90164, signal: "BUY", change: "+0.84%", history: [200.46321, 200.67996, 200.78443, 200.75944, 200.92121, 201.10882, 201.20412, 201.77128, 199.62993, 202.25323, 202.36669, 201.69728, 199.98893, 202.60426, 203.41759, 199.00873, 197.47832, 198.72831, 198.29867, 202.52046], spread: 0, atr: 2.5, trend: "RANGING", volatility: "LOW", ai_bias: -32, probability: 92, support: 190.44005, resistance: 210.48637, liquidity: "17M", volume: "367K", smart_money_zones: [196.45395, 204.47247], fair_value_gaps: true, order_blocks: [192.44468], market_structure: "LL", is_favorite: false },
  { symbol: "META", category: "Stocks", price: 197.872, e13_dist: 2.78201, e50_dist: 2.49683, s200_dist: 1.10464, signal: "NONE", change: "-0.42%", history: [197.872, 197.67003, 197.67181, 198.51829, 197.982, 198.66449, 197.87327, 196.3106, 198.62904, 200.04063, 196.39023, 195.87607, 196.34183, 198.49553, 198.47346, 194.80523, 197.5037, 201.64829, 200.03395, 198.83557], spread: 0.2, atr: 2.5, trend: "RANGING", volatility: "HIGH", ai_bias: -21, probability: 91, support: 187.9784, resistance: 207.7656, liquidity: "26M", volume: "676K", smart_money_zones: [193.91456, 201.82944], fair_value_gaps: false, order_blocks: [189.95712], market_structure: "LH", is_favorite: true },
  { symbol: "NFLX", category: "Stocks", price: 201.95333, e13_dist: 2.70573, e50_dist: 3.7885, s200_dist: 23.20893, signal: "BUY", change: "+0.09%", history: [201.95333, 202.11578, 201.89988, 201.73699, 201.78946, 202.57737, 202.88705, 202.12285, 201.48618, 202.10107, 199.70909, 200.17551, 202.1587, 204.25796, 202.73877, 204.05187, 202.97464, 202.02305, 204.98169, 199.82025], spread: 0.7, atr: 2.5, trend: "BEARISH", volatility: "MED", ai_bias: -27, probability: 75, support: 191.85566, resistance: 212.051, liquidity: "36M", volume: "193K", smart_money_zones: [197.91426, 205.9924], fair_value_gaps: false, order_blocks: [193.8752], market_structure: "LH", is_favorite: false },
  { symbol: "AMD", category: "Stocks", price: 200.02061, e13_dist: 1.67942, e50_dist: 7.6606, s200_dist: 8.80063, signal: "BUY", change: "+0.52%", history: [200.02061, 200.1307, 199.52752, 200.0833, 200.79648, 200.35589, 200.09034, 199.43472, 201.7886, 199.69763, 201.74098, 200.60518, 202.07884, 199.89917, 202.98389, 201.8976, 196.86341, 197.86349, 198.66426, 196.22888], spread: 0.4, atr: 2.5, trend: "BEARISH", volatility: "MED", ai_bias: -64, probability: 92, support: 190.01958, resistance: 210.02164, liquidity: "56M", volume: "645K", smart_money_zones: [196.0202, 204.02102], fair_value_gaps: true, order_blocks: [192.01979], market_structure: "LL", is_favorite: false },
  { symbol: "COIN", category: "Stocks", price: 201.87589, e13_dist: 4.75862, e50_dist: 5.01857, s200_dist: 7.82652, signal: "NONE", change: "-1.68%", history: [201.87589, 202.03671, 201.72523, 201.86444, 201.11986, 202.99066, 202.18024, 201.34545, 200.16468, 200.03284, 201.33446, 199.89764, 198.90611, 201.73373, 202.95787, 203.5479, 201.51752, 203.59611, 204.01322, 205.24633], spread: 1.3, atr: 2.5, trend: "RANGING", volatility: "LOW", ai_bias: -49, probability: 88, support: 191.7821, resistance: 211.96968, liquidity: "32M", volume: "408K", smart_money_zones: [197.83837, 205.91341], fair_value_gaps: true, order_blocks: [193.80085], market_structure: "HL", is_favorite: true },
  { symbol: "XAUUSD", category: "Commodities", price: 2400.16946, e13_dist: 4.42049, e50_dist: 17.16848, s200_dist: 15.10405, signal: "SELL", change: "-0.44%", history: [2400.16946, 2400.17356, 2399.89964, 2399.9815, 2399.45249, 2401.78182, 2399.93022, 2402.31645, 2402.15029, 2395.9878, 2400.69511, 2399.7209, 2396.92117, 2396.45132, 2405.24826, 2406.41532, 2393.27944, 2392.02288, 2403.07856, 2402.62146], spread: 0.7, atr: 5, trend: "RANGING", volatility: "MED", ai_bias: 91, probability: 79, support: 2280.16099, resistance: 2520.17793, liquidity: "12M", volume: "672K", smart_money_zones: [2352.16607, 2448.17285], fair_value_gaps: true, order_blocks: [2304.16268], market_structure: "CONSOLIDATION", is_favorite: false },
  { symbol: "XAGUSD", category: "Commodities", price: 99.61309, e13_dist: 0.6676, e50_dist: 0.76727, s200_dist: 2.02468, signal: "BUY", change: "+1.57%", history: [99.61309, 99.58311, 99.5199, 99.67797, 99.74568, 99.6785, 99.5463, 99.28244, 99.98662, 99.33158, 99.90412, 99.8293, 99.39995, 99.89102, 99.4143, 99.0159, 100.03069, 99.19784, 99.17758, 100.51248], spread: 1.9, atr: 0.5, trend: "BULLISH", volatility: "LOW", ai_bias: -31, probability: 88, support: 94.63244, resistance: 104.59374, liquidity: "23M", volume: "361K", smart_money_zones: [97.62083, 101.60535], fair_value_gaps: false, order_blocks: [95.62857], market_structure: "LH", is_favorite: false },
  { symbol: "USOIL", category: "Commodities", price: 99.8789, e13_dist: 0.34876, e50_dist: 0.71675, s200_dist: 0.55728, signal: "NONE", change: "-0.65%", history: [99.8789, 99.86695, 99.90338, 99.78168, 99.96783, 99.94255, 100.07841, 99.65755, 99.53078, 99.61073, 100.23791, 99.63278, 99.99673, 100.3992, 99.3133, 99.19113, 99.99408, 99.8071, 100.70383, 100.32709], spread: 1.3, atr: 0.5, trend: "BULLISH", volatility: "MED", ai_bias: -67, probability: 79, support: 94.88495, resistance: 104.87285, liquidity: "51M", volume: "444K", smart_money_zones: [97.88132, 101.87648], fair_value_gaps: false, order_blocks: [95.88374], market_structure: "CONSOLIDATION", is_favorite: true },
  { symbol: "UKOIL", category: "Commodities", price: 100.30848, e13_dist: 0.1188, e50_dist: 1.37673, s200_dist: 1.22339, signal: "NONE", change: "-1.30%", history: [100.30848, 100.29545, 100.3382, 100.45115, 100.35262, 100.46388, 100.08459, 100.12291, 100.19485, 99.93051, 100.41969, 100.32361, 100.69246, 99.96728, 100.66629, 99.74141, 100.89497, 100.77809, 99.81935, 101.02931], spread: 0.9, atr: 0.5, trend: "BEARISH", volatility: "MED", ai_bias: 33, probability: 96, support: 95.29306, resistance: 105.3239, liquidity: "29M", volume: "531K", smart_money_zones: [98.30231, 102.31465], fair_value_gaps: false, order_blocks: [96.29614], market_structure: "HH", is_favorite: false },
  { symbol: "NGAS", category: "Commodities", price: 99.76782, e13_dist: 0.1663, e50_dist: 1.11134, s200_dist: 2.04797, signal: "BUY", change: "+0.06%", history: [99.76782, 99.80871, 99.80141, 99.78875, 99.60057, 99.98618, 99.49258, 100.07621, 100.10951, 99.87363, 99.63127, 99.21807, 100.22972, 99.26175, 99.13295, 100.18776, 99.9975, 99.13069, 99.58744, 99.35273], spread: 1.3, atr: 0.5, trend: "BULLISH", volatility: "MED", ai_bias: -10, probability: 82, support: 94.77943, resistance: 104.75621, liquidity: "20M", volume: "298K", smart_money_zones: [97.77246, 101.76318], fair_value_gaps: false, order_blocks: [95.77711], market_structure: "HH", is_favorite: false },
  { symbol: "COPPER", category: "Commodities", price: 99.72042, e13_dist: 0.33658, e50_dist: 0.19801, s200_dist: 0.19139, signal: "NONE", change: "-0.80%", history: [99.72042, 99.75279, 99.6538, 99.74508, 99.69203, 99.68683, 99.73763, 99.5288, 99.72316, 99.43452, 99.44953, 99.98804, 99.26836, 99.86209, 99.3735, 99.35471, 99.74905, 99.83661, 99.51358, 99.99964], spread: 1.5, atr: 0.5, trend: "RANGING", volatility: "MED", ai_bias: 27, probability: 65, support: 94.7344, resistance: 104.70644, liquidity: "11M", volume: "469K", smart_money_zones: [97.72601, 101.71483], fair_value_gaps: true, order_blocks: [95.7316], market_structure: "HL", is_favorite: false },
  { symbol: "CORN", category: "Commodities", price: 99.89492, e13_dist: 0.67232, e50_dist: 1.54562, s200_dist: 0.66022, signal: "SELL", change: "-1.49%", history: [99.89492, 99.94243, 99.8549, 99.93763, 99.99988, 99.97053, 100.12384, 99.61367, 100.14852, 100.26923, 100.14244, 99.91093, 99.6368, 100.31067, 99.8914, 99.53874, 99.31743, 99.14, 100.70418, 100.76532], spread: 0.1, atr: 0.5, trend: "BULLISH", volatility: "LOW", ai_bias: 49, probability: 79, support: 94.90017, resistance: 104.88967, liquidity: "29M", volume: "750K", smart_money_zones: [97.89702, 101.89282], fair_value_gaps: true, order_blocks: [95.89912], market_structure: "HH", is_favorite: true },
  { symbol: "WHEAT", category: "Commodities", price: 100.19148, e13_dist: 0.49052, e50_dist: 0.37878, s200_dist: 4.99382, signal: "SELL", change: "-0.03%", history: [100.19148, 100.14244, 100.10369, 100.29542, 100.05667, 100.37904, 99.91637, 99.96842, 100.49601, 99.77837, 100.23378, 100.28419, 99.90879, 99.63966, 99.95754, 100.68385, 99.66772, 100.63321, 100.5156, 99.80009], spread: 0.7, atr: 0.5, trend: "BEARISH", volatility: "MED", ai_bias: -5, probability: 99, support: 95.18191, resistance: 105.20105, liquidity: "53M", volume: "825K", smart_money_zones: [98.18765, 102.19531], fair_value_gaps: true, order_blocks: [96.18382], market_structure: "LH", is_favorite: false },
  { symbol: "SOYBEAN", category: "Commodities", price: 99.76034, e13_dist: 0.02603, e50_dist: 0.96622, s200_dist: 4.56929, signal: "BUY", change: "+1.26%", history: [99.76034, 99.80769, 99.66488, 99.89783, 99.7764, 99.67582, 99.62693, 100.00782, 99.91065, 99.32201, 99.72624, 100.17396, 99.77179, 99.37015, 99.52164, 99.58207, 99.7733, 99.08121, 99.29228, 100.03656], spread: 0.7, atr: 0.5, trend: "BULLISH", volatility: "LOW", ai_bias: 95, probability: 97, support: 94.77232, resistance: 104.74836, liquidity: "35M", volume: "218K", smart_money_zones: [97.76513, 101.75555], fair_value_gaps: false, order_blocks: [95.76993], market_structure: "HL", is_favorite: true },
  { symbol: "COFFEE", category: "Commodities", price: 99.71022, e13_dist: 0.83256, e50_dist: 1.02341, s200_dist: 3.66539, signal: "BUY", change: "+0.34%", history: [99.71022, 99.71018, 99.65679, 99.5861, 99.7097, 99.87882, 99.44149, 100.03147, 99.4736, 100.03603, 99.49952, 99.34945, 99.74122, 99.91986, 100.23941, 99.13685, 99.8179, 98.92545, 99.02274, 99.09224], spread: 1.8, atr: 0.5, trend: "BULLISH", volatility: "HIGH", ai_bias: 6, probability: 86, support: 94.72471, resistance: 104.69573, liquidity: "35M", volume: "293K", smart_money_zones: [97.71602, 101.70442], fair_value_gaps: true, order_blocks: [95.72181], market_structure: "HL", is_favorite: false },
  { symbol: "VIX75", category: "Synthetics", price: 4971.21937, e13_dist: 10.44541, e50_dist: 16.94413, s200_dist: 345.15665, signal: "BUY", change: "+0.76%", history: [4971.21937, 4967.52539, 4979.00673, 4971.77311, 4985.03193, 4950.97445, 4965.84702, 5001.45201, 4957.64623, 4995.32907, 4998.70902, 4975.85306, 4948.10127, 4928.58254, 4996.40768, 5043.04371, 4964.08371, 4953.61752, 4951.47637, 4959.80974], spread: 0.4, atr: 50, trend: "BEARISH", volatility: "HIGH", ai_bias: -84, probability: 80, support: 4722.6584, resistance: 5219.78034, liquidity: "26M", volume: "950K", smart_money_zones: [4871.79498, 5070.64376], fair_value_gaps: true, order_blocks: [4772.3706], market_structure: "LH", is_favorite: false },
  { symbol: "VIX100", category: "Synthetics", price: 4967.35903, e13_dist: 12.55492, e50_dist: 40.58993, s200_dist: 260.60853, signal: "BUY", change: "+1.33%", history: [4967.35903, 4966.59636, 4964.46786, 4979.76368, 4954.47774, 4953.05428, 4953.75005, 4958.71043, 4936.51795, 4985.72978, 4938.24898, 4981.36613, 4999.77648, 4992.71089, 4927.9241, 4902.16867, 4898.04602, 5012.25014, 4916.37684, 4967.06056], spread: 1.8, atr: 50, trend: "BEARISH", volatility: "LOW", ai_bias: 61, probability: 66, support: 4718.99108, resistance: 5215.72698, liquidity: "49M", volume: "687K", smart_money_zones: [4868.01185, 5066.70621], fair_value_gaps: true, order_blocks: [4768.66467], market_structure: "HL", is_favorite: false },
  { symbol: "BOOM500", category: "Synthetics", price: 5009.72693, e13_dist: 24.60856, e50_dist: 0.5973, s200_dist: 210.59283, signal: "NONE", change: "-0.30%", history: [5009.72693, 5009.52285, 5005.35073, 5013.81959, 5008.6047, 4989.66557, 5006.65313, 5007.69993, 4993.80714, 4976.11465, 4968.13177, 5034.22745, 4973.2202, 5000.89242, 5017.6734, 4963.41782, 4951.46546, 5038.8835, 5072.9819, 4923.60196], spread: 1.5, atr: 50, trend: "BULLISH", volatility: "MED", ai_bias: -100, probability: 80, support: 4759.24058, resistance: 5260.21328, liquidity: "38M", volume: "749K", smart_money_zones: [4909.53239, 5109.92147], fair_value_gaps: false, order_blocks: [4809.33785], market_structure: "LL", is_favorite: false },
  { symbol: "CRASH500", category: "Synthetics", price: 4970.36228, e13_dist: 59.67309, e50_dist: 61.85105, s200_dist: 372.27275, signal: "BUY", change: "+0.21%", history: [4970.36228, 4974.98894, 4975.04757, 4958.72572, 4970.54474, 4989.80132, 4997.14255, 4991.42977, 4994.40447, 4941.63065, 4934.86456, 5007.49851, 5001.09317, 4959.35262, 4974.51585, 4960.49385, 4917.30426, 4918.47077, 4918.0299, 4877.2045], spread: 1.5, atr: 50, trend: "RANGING", volatility: "MED", ai_bias: 78, probability: 78, support: 4721.84417, resistance: 5218.88039, liquidity: "53M", volume: "186K", smart_money_zones: [4870.95503, 5069.76953], fair_value_gaps: false, order_blocks: [4771.54779], market_structure: "HH", is_favorite: false },
  { symbol: "STEP", category: "Synthetics", price: 4980.66196, e13_dist: 6.38556, e50_dist: 126.40686, s200_dist: 222.99753, signal: "NONE", change: "-0.65%", history: [4980.66196, 4983.84075, 4974.30481, 4990.9307, 4997.5906, 4956.58906, 4979.40677, 5002.87827, 5014.47423, 4989.07894, 4978.19869, 4959.46036, 4933.51372, 5020.18572, 4920.30687, 5006.838, 4920.37152, 4973.65931, 4993.28173, 5045.33986], spread: 0.2, atr: 50, trend: "BULLISH", volatility: "MED", ai_bias: 16, probability: 66, support: 4731.62886, resistance: 5229.69506, liquidity: "12M", volume: "461K", smart_money_zones: [4881.04872, 5080.2752], fair_value_gaps: true, order_blocks: [4781.43548], market_structure: "LH", is_favorite: false },
  { symbol: "JUMP10", category: "Synthetics", price: 5049.12724, e13_dist: 0.27329, e50_dist: 109.7088, s200_dist: 405.9266, signal: "BUY", change: "+1.52%", history: [5049.12724, 5048.23511, 5058.5949, 5061.77661, 5052.23517, 5061.04218, 5049.89253, 5073.02379, 5065.80656, 5045.89107, 5056.85857, 5046.87127, 5015.79136, 5024.97711, 5065.94388, 4978.3431, 5046.7095, 5011.61323, 4990.72836, 4978.89431], spread: 0, atr: 50, trend: "BULLISH", volatility: "HIGH", ai_bias: 2, probability: 84, support: 4796.67088, resistance: 5301.5836, liquidity: "47M", volume: "945K", smart_money_zones: [4948.1447, 5150.10978], fair_value_gaps: false, order_blocks: [4847.16215], market_structure: "HH", is_favorite: false },
  { symbol: "JUMP25", category: "Synthetics", price: 5018.72351, e13_dist: 62.77027, e50_dist: 169.2749, s200_dist: 443.0168, signal: "BUY", change: "+0.76%", history: [5018.72351, 5018.20073, 5020.41603, 5026.05101, 5038.04534, 4998.16838, 5003.72923, 5036.85001, 5019.56827, 5060.915, 4978.91707, 5026.02757, 4968.17652, 4965.94931, 4992.40574, 5031.02331, 5057.84045, 5099.28549, 4948.58231, 4929.42663], spread: 0.9, atr: 50, trend: "RANGING", volatility: "LOW", ai_bias: 77, probability: 86, support: 4767.78733, resistance: 5269.65969, liquidity: "45M", volume: "671K", smart_money_zones: [4918.34904, 5119.09798], fair_value_gaps: false, order_blocks: [4817.97457], market_structure: "HH", is_favorite: false },
  { symbol: "JUMP50", category: "Synthetics", price: 5020.65808, e13_dist: 88.03907, e50_dist: 162.99859, s200_dist: 420.54426, signal: "BUY", change: "+1.57%", history: [5020.65808, 5024.61893, 5019.50909, 5015.92212, 5029.01437, 5026.51775, 5022.52704, 5014.62894, 5038.82577, 5027.20879, 4974.84931, 4988.60707, 5038.60991, 5005.31448, 5070.86744, 5064.82086, 5083.52385, 4959.96089, 5083.59659, 5033.73455], spread: 0.7, atr: 50, trend: "RANGING", volatility: "HIGH", ai_bias: -16, probability: 95, support: 4769.62518, resistance: 5271.69098, liquidity: "41M", volume: "885K", smart_money_zones: [4920.24492, 5121.07124], fair_value_gaps: false, order_blocks: [4819.83176], market_structure: "LL", is_favorite: false },
  { symbol: "JUMP75", category: "Synthetics", price: 5024.0004, e13_dist: 17.05814, e50_dist: 172.09225, s200_dist: 251.24636, signal: "BUY", change: "+0.41%", history: [5024.0004, 5026.14424, 5032.20451, 5009.40989, 5014.67604, 5008.6543, 5006.55351, 5001.82225, 5050.68106, 5059.63092, 5041.51549, 5068.29656, 5041.46242, 5072.19164, 5033.44432, 5041.33462, 4963.90881, 4943.73502, 5100.32605, 4947.79436], spread: 0.5, atr: 50, trend: "BULLISH", volatility: "MED", ai_bias: 21, probability: 68, support: 4772.80038, resistance: 5275.20042, liquidity: "58M", volume: "306K", smart_money_zones: [4923.52039, 5124.48041], fair_value_gaps: true, order_blocks: [4823.04038], market_structure: "HH", is_favorite: true },
  { symbol: "JUMP100", category: "Synthetics", price: 4997.16163, e13_dist: 54.34833, e50_dist: 112.8331, s200_dist: 192.71174, signal: "BUY", change: "+1.01%", history: [4997.16163, 5001.0534, 4989.91993, 4992.07536, 5001.36666, 4997.55492, 4994.74358, 5023.19884, 4974.46767, 4957.03904, 5014.90555, 4976.68454, 5039.19323, 5026.45291, 5044.44867, 4961.39017, 4955.88374, 5053.24037, 4926.80746, 5063.16125], spread: 1, atr: 50, trend: "RANGING", volatility: "HIGH", ai_bias: -94, probability: 81, support: 4747.30355, resistance: 5247.01971, liquidity: "21M", volume: "982K", smart_money_zones: [4897.2184, 5097.10486], fair_value_gaps: false, order_blocks: [4797.27516], market_structure: "CONSOLIDATION", is_favorite: false },
];


const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: "TRD-1029",
    date: "2026-06-28T14:30:00Z",
    asset: "EURUSD",
    direction: "BUY",
    entryPrice: 1.08500,
    exitPrice: 1.08750,
    profit: 250.00,
    strategy: "Trend Following",
    session: "NY",
    winLoss: "WIN",
    screenshotUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop",
    notes: "Saw strong support bounce on the 15M, followed by a break of market structure. EMA fans were perfectly aligned.",
    ai_explanation: "The algorithm identified a high-probability bullish order block at 1.08450. Market structure shifted from bearish to bullish with strong momentum (RSI > 60). Entering on the pullback provided a 1:3 risk-to-reward ratio.",
    mistake_analysis: "Exit was slightly premature. Could have trailed the stop loss to capture the final push to 1.08900 liquidity pool.",
    lessons_learned: "Trust the higher timeframe targets. When momentum is strong in NY session, trail stops rather than using fixed take profits."
  },
  {
    id: "TRD-1028",
    date: "2026-06-27T09:15:00Z",
    asset: "GBPJPY",
    direction: "SELL",
    entryPrice: 188.500,
    exitPrice: 188.800,
    profit: -300.00,
    strategy: "Mean Reversion",
    session: "London",
    winLoss: "LOSS",
    screenshotUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop",
    notes: "Faded the morning breakout. Got stopped out as momentum continued.",
    ai_explanation: "This trade was executed against the primary M30 trend. While RSI showed overbought conditions, the EMA13 and EMA50 spread was expanding, indicating strong underlying momentum. Fading strong trend days is statistically a low-winrate strategy.",
    mistake_analysis: "Fading a strong breakout without waiting for structural breakdown confirmation. Stop loss was placed too tight below the high.",
    lessons_learned: "Do not counter-trend trade during the first hour of London session without clear reversal patterns (e.g., Head & Shoulders or double top with divergence)."
  },
  {
    id: "TRD-1027",
    date: "2026-06-25T19:00:00Z",
    asset: "BTCUSD",
    direction: "BUY",
    entryPrice: 62000.00,
    exitPrice: 64500.00,
    profit: 1250.00,
    strategy: "Breakout",
    session: "Asian",
    winLoss: "WIN",
    screenshotUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop",
    notes: "BTC broke out of a multi-day consolidation wedge. Volume spiked.",
    ai_explanation: "Volume analysis confirmed institutional buying pressure as BTC breached the 61,800 resistance zone. The trade aligned with positive funding rates and growing open interest.",
    mistake_analysis: "Perfect execution. Entry and exit were completely according to the plan.",
    lessons_learned: "Patience pays off. Waiting for the daily close to confirm the breakout resulted in a high-confidence, low-stress trade."
  }
];

const MOCK_GATES: GatesState = {
  gate_1_risk_slot:       "OPEN",
  gate_1_details:         "2 of 4 risk slots occupied. Capacity available.",
  gate_2_correlation:     "PASS",
  gate_2_details:         "EURUSD correlation coefficient 0.71 — within threshold.",
  gate_3_fan_alignment:   "PASS",
  gate_3_details:         "EMA13 > EMA50 > SMA200. Bullish fan structure confirmed.",
  gate_4_priority_filter: "APPROVED",
  gate_4_details:         "XAUUSD ranks #1 by projected risk score (1.23%).",
  gate_5_hard_sl:         "PASS",
  gate_5_details:         "SL at 2375.00 — 16 pips below SMA200. Within hard floor.",
};

const MOCK_SIGNALS: RankedSignal[] = [
  { priority: 1, symbol: "XAUUSD", direction: "BUY",  price: 2408.20, sma200: 2383.90, distance: 2430, projected_risk: 1.23, status: "APPROVED" },
  { priority: 2, symbol: "EURUSD", direction: "BUY",  price: 1.08945, sma200: 1.08233, distance:  712, projected_risk: 1.45, status: "STANDBY"  },
  { priority: 3, symbol: "USDJPY", direction: "BUY",  price: 157.980, sma200: 156.760, distance: 1220, projected_risk: 1.61, status: "STANDBY"  },
  { priority: 4, symbol: "GBPUSD", direction: "SELL", price: 1.26820, sma200: 1.27350, distance:  530, projected_risk: 1.88, status: "BLOCKED"  },
];

const MOCK_LOGS: LogItem[] = [
  { timestamp: "08:15:22", level: "INFO",     message: "M30 alignments show EURUSD and XAUUSD holding strong bullish momentum.", formatted: "" },
  { timestamp: "08:17:05", level: "WARN",     message: "Correlation coefficient for XAU/XAG group exceeds 89% safety threshold. Limiting new exposure.", formatted: "" },
  { timestamp: "08:21:40", level: "INFO",     message: "Global risk allocation at 50% (2 of 4 slots). Capacity available for high-conviction signals.", formatted: "" },
  { timestamp: "08:25:11", level: "WARN",     message: "GBPUSD execution blocked. EURUSD holds major risk allocation. Correlation limit breached.", formatted: "" },
  { timestamp: "08:30:00", level: "CRITICAL", message: "Market volatility spike detected across USD crosses. Widening dynamic trailing stops by 15%.", formatted: "" },
  { timestamp: "08:35:14", level: "INFO",     message: "XAUUSD Ticket #88302 moved to breakeven. SL adjusted to 2391.40.", formatted: "" },
  { timestamp: "08:40:02", level: "INFO",     message: "Cycle complete. 4 signals evaluated, 1 approved, 3 in standby.", formatted: "" },
];

const MOCK_PERFORMANCE: PerformanceMetrics = {
  total_trades:  142,
  win_rate:      68.3,
  total_profit:  8320.00,
  profit_factor: 2.14,
  max_drawdown:  4.2,
  sharpe_ratio:  1.87,
  equity_curve: [
    100.0, 100.8, 101.2, 100.9, 101.7, 102.5, 102.1, 103.0, 103.8, 104.2,
    103.6, 104.9, 105.3, 104.7, 105.8, 106.4, 106.1, 107.2, 107.9, 108.4,
  ],
};

const MOCK_CORRELATION: Record<string, Record<string, string>> = {
  EURUSD: { GBPUSD: "0.82", USDJPY: "-0.41", XAUUSD: "0.31" },
  GBPUSD: { EURUSD: "0.82", USDJPY: "-0.38", XAUUSD: "0.27" },
  USDJPY: { EURUSD: "-0.41", GBPUSD: "-0.38", XAUUSD: "-0.22" },
  XAUUSD: { EURUSD: "0.31",  GBPUSD: "0.27",  USDJPY: "-0.22" },
};

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

export const useTradingStore = create<TradingStore>((set) => ({
  connected:    true,
  botRunning:   true,
  mt5Connected: true,
  apiLatency:   18,
  wsRetries:    0,

  account:            MOCK_ACCOUNT,
  positions:          MOCK_POSITIONS,
  orders:             MOCK_ORDERS,
  marketWatch:        MOCK_MARKET_WATCH,
  gates:              MOCK_GATES,
  rankedSignals:      MOCK_SIGNALS,
  journal:            MOCK_JOURNAL,
  lastCycleTime:      "08:40:02",
  systemStats:        { cpu: 12.4, memory: 38.7 },
  logs:               MOCK_LOGS,
  correlationMatrix:  MOCK_CORRELATION,
  performanceMetrics: MOCK_PERFORMANCE,
  mahoragaState:      null,

  chatMessages: [
    { sender: "vincent", text: "Welcome to the XIPHOS Command Core. I am Vincent, the system reasoning agent. Ask me about active setups, risk exposures, or skipped signals.", timestamp: "14:28" },
    { sender: "user",    text: "Why did you skip GBPUSD?", timestamp: "14:30" },
    { sender: "vincent", text: "GBPUSD is in the same correlation bucket as EURUSD. Opening another trade would violate the correlation guard rule and increase concentration risk beyond the 70% ceiling.", timestamp: "14:30" },
    { sender: "user",    text: "Why did you choose XAUUSD?", timestamp: "14:31" },
    { sender: "vincent", text: "XAUUSD ranked #1 by lowest projected risk (1.23%). Strong bullish fan alignment confirmed on M30. EMA13 > EMA50 > SMA200. High-probability institutional structure with low correlation load.", timestamp: "14:31" },
  ],

  ws: null,

  // No-op in mock mode
  connectWebSocket: () => {
    console.info("XIPHOS: Running in mock/demo mode. WebSocket disabled.");
  },

  fetchMahoragaState: async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/mahoraga/state");
      if (res.ok) {
        const data = await res.json();
        set({ mahoragaState: data });
      }
    } catch (e) {
      console.error("Failed to fetch Mahoraga state", e);
    }
  },

  simulateMahoraga: () => {
    const trends = ["TRENDING", "RANGING", "SQUEEZE", "UNKNOWN"];
    const momentums = ["OVERBOUGHT", "OVERSOLD", "NEUTRAL"];
    set((state) => {
      const currentSpins = state.mahoragaState?.["XAUUSD"]?.adaptation_spins || 0;
      return {
        mahoragaState: {
          "XAUUSD": {
            adaptation_spins: currentSpins + 1,
            trend_state: trends[Math.floor(Math.random() * trends.length)],
            momentum_state: momentums[Math.floor(Math.random() * momentums.length)],
            confidence_score: Math.random() * 60 + 30,
            sl_multiplier: Number((Math.random() * 0.7 + 0.8).toFixed(2)),
            lot_multiplier: [0.5, 1.0, 1.5][Math.floor(Math.random() * 3)],
            fast_ema: 13,
            slow_ema: 50,
            volatility_state: "HIGH",
            filter_strictness: "NORMAL",
            risk_scaling: 1.0
          }
        }
      };
    });
  },

  sendCommand: (type, data = {}) => {
    console.info(`[MOCK] Command: ${type}`, data);
  },

  sendChatMessage: (text) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    set((state) => ({
      chatMessages: [...state.chatMessages, { sender: "user", text, timestamp: ts }],
    }));
    setTimeout(() => {
      const reply = "Vincent AI (Demo Mode): I'm running on mock data. Connect the XIPHOS api_server.py to enable live reasoning and real-time analysis.";
      set((state) => ({
        chatMessages: [...state.chatMessages, { sender: "vincent", text: reply, timestamp: ts }],
      }));
    }, 900);
  },

  modifySL: (ticket, symbol, newSL) => console.info("[MOCK] modifySL", { ticket, symbol, newSL }),
  modifyTP: (ticket, symbol, newTP) => console.info("[MOCK] modifyTP", { ticket, symbol, newTP }),

  closePosition: (ticket) => {
    set((state) => ({ positions: state.positions.filter((p) => p.ticket !== ticket) }));
  },

  breakeven: (ticket) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.ticket === ticket ? { ...p, sl: p.price_open, risk_status: "FREE" } : p
      ),
    }));
  },

  partialClose: (ticket) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.ticket === ticket ? { ...p, volume: parseFloat((p.volume / 2).toFixed(2)) } : p
      ),
    }));
  },

  placeOrder: (symbol, type, volume, price, sl, tp) => {
    const ticket = Date.now();
    set((state) => ({
      orders: [...state.orders, { ticket, symbol, type, volume, price_open: price, sl, tp, comment: "MANUAL" }],
    }));
  },

  cancelOrder: (ticket) => {
    set((state) => ({ orders: state.orders.filter((o) => o.ticket !== ticket) }));
  },

  toggleFavorite: (symbol) => {
    set((state) => ({
      marketWatch: state.marketWatch.map((m) =>
        m.symbol === symbol ? { ...m, is_favorite: !m.is_favorite } : m
      ),
    }));
  },
}));
