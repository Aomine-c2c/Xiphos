"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Send, Trash2, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";

export default function OrdersView() {
  const { orders, placeOrder, cancelOrder } = useTradingStore();

  const [symbol, setSymbol] = useState("EURUSD");
  const [type, setType] = useState("BUY_LIMIT");
  const [volume, setVolume] = useState(0.01);
  const [price, setPrice] = useState(1.082);
  const [sl, setSl] = useState(1.078);
  const [tp, setTp] = useState(1.09);

  const [consoleLog, setConsoleLog] = useState<string[]>(["CONSOLE STATUS: ACTIVE READY FOR TRANSMISSION"]);

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setConsoleLog(prev => [...prev, `[${ts}] ${msg}`].slice(-5));
  };

  const handlePlaceOrder = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!symbol || !type || volume <= 0 || price <= 0) {
      addLog("ERROR: INVALID PARAMETERS DETECTED");
      return;
    }
    placeOrder(symbol, type, volume, price, sl, tp);
    addLog(`DISPATCHED: ${type} ${volume} LOTS ${symbol} @ ${price}`);
  };

  const handleCancel = (ticket: number) => {
    if (globalThis.confirm(`Cancel Pending Order #${ticket}?`)) {
      cancelOrder(ticket);
      addLog(`CANCEL SENT: PENDING ORDER #${ticket}`);
    }
  };

  const totalPending = orders.length;
  const buyOrders = orders.filter(o => o.type.startsWith("BUY")).length;
  const sellOrders = orders.filter(o => o.type.startsWith("SELL")).length;

  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
  const paginatedOrders = orders.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2 transition-all duration-300 hover:border-xiphos-blue/40">
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center bg-[#0a101b]/40 shrink-0">
          <span className="text-3xl font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
            <Send className="h-4 w-4" />
            XIPHOS COMMAND DESPATCH & PENDING ORDERS CONSOLE
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT: Order summary stats */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-4 overflow-hidden">
            <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              ORDER QUEUE SUMMARY
            </span>

            {/* Stats */}
            <div className="space-y-3">
              {[
                { label: "TOTAL PENDING", value: totalPending, colorClass: "text-xiphos-blue" },
                { label: "BUY ORDERS", value: buyOrders, colorClass: "text-xiphos-green" },
                { label: "SELL ORDERS", value: sellOrders, colorClass: "text-xiphos-red" },
              ].map(item => (
                <div key={item.label} className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-3">
                  <div className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider mb-1">{item.label}</div>
                  <div className={`text-[30px] font-black leading-none ${item.colorClass}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Security context */}
            <div className="border-t border-slate-950 pt-3 mt-auto">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">BROKER PIPELINE LINK</span>
              <div className="space-y-2 text-[15px] text-[#8e9aa8]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-xiphos-green animate-pulse" />
                  <span>MT5 BRIDGE SYNC ESTABLISHED</span>
                </div>
                <div className="flex justify-between border-b border-slate-950/40 pb-1.5">
                  <span>SLIPPAGE LIMIT</span>
                  <span className="text-white font-bold">20 PTS</span>
                </div>
                <div className="flex justify-between border-b border-slate-950/40 pb-1.5">
                  <span>DEVIATION LOCK</span>
                  <span className="text-xiphos-green font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>EXECUTION MODE</span>
                  <span className="text-xiphos-blue font-bold">DIRECT</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order form + pending table */}
          <div className="col-span-9 p-4 flex flex-col gap-4 overflow-hidden">

            {/* Order form */}
            <div className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-4 shrink-0">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-3 border-b border-slate-950 pb-1.5">
                DISPATCH NEW ORDER COMMAND
              </span>
              <form onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-6 gap-3 text-[16px] text-[#8e9aa8] mb-3">
                  {/* Symbol */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="symbol" className="font-bold text-[15px]">SYMBOL</label>
                    <select id="symbol" title="Symbol" aria-label="Symbol" value={symbol} onChange={e => setSymbol(e.target.value)}
                      className="bg-slate-950 border border-slate-900 p-1.5 rounded-sm text-white font-bold text-[16px] focus:outline-none focus:border-xiphos-blue cursor-pointer">
                      <option value="EURUSD">EURUSD</option>
                      <option value="GBPUSD">GBPUSD</option>
                      <option value="XAUUSD">XAUUSD</option>
                      <option value="XAGUSD">XAGUSD</option>
                    </select>
                  </div>
                  {/* Type */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="type" className="font-bold text-[15px]">TYPE</label>
                    <select id="type" title="Type" aria-label="Type" value={type} onChange={e => setType(e.target.value)}
                      className="bg-slate-950 border border-slate-900 p-1.5 rounded-sm text-white font-bold text-[16px] focus:outline-none focus:border-xiphos-blue cursor-pointer">
                      <option value="BUY_LIMIT">BUY LIMIT</option>
                      <option value="SELL_LIMIT">SELL LIMIT</option>
                      <option value="BUY_STOP">BUY STOP</option>
                      <option value="SELL_STOP">SELL STOP</option>
                    </select>
                  </div>
                  {/* Volume */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="volume" className="font-bold text-[15px]">VOLUME</label>
                    <input id="volume" title="Volume" aria-label="Volume" type="number" step="0.01" min="0.01" value={volume}
                      onChange={e => setVolume(Number.parseFloat(e.target.value))}
                      className="bg-slate-950 border border-slate-900 p-1.5 rounded-sm text-white font-bold text-[16px] focus:outline-none focus:border-xiphos-blue" />
                  </div>
                  {/* Price */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="price" className="font-bold text-[15px]">TRIGGER PRICE</label>
                    <input id="price" title="Trigger Price" aria-label="Trigger Price" type="number" step="0.00001" value={price}
                      onChange={e => setPrice(Number.parseFloat(e.target.value))}
                      className="bg-slate-950 border border-slate-900 p-1.5 rounded-sm text-white font-bold text-[16px] focus:outline-none focus:border-xiphos-blue" />
                  </div>
                  {/* SL */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="sl" className="font-bold text-[15px]">STOP LOSS</label>
                    <input id="sl" title="Stop Loss" aria-label="Stop Loss" type="number" step="0.00001" value={sl}
                      onChange={e => setSl(Number.parseFloat(e.target.value))}
                      className="bg-slate-950 border border-slate-900 p-1.5 rounded-sm text-white font-bold text-[16px] focus:outline-none focus:border-xiphos-blue" />
                  </div>
                  {/* TP */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="tp" className="font-bold text-[15px]">TAKE PROFIT</label>
                    <input id="tp" title="Take Profit" aria-label="Take Profit" type="number" step="0.00001" value={tp}
                      onChange={e => setTp(Number.parseFloat(e.target.value))}
                      className="bg-slate-950 border border-slate-900 p-1.5 rounded-sm text-white font-bold text-[16px] focus:outline-none focus:border-xiphos-blue" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit"
                    className="flex items-center gap-1.5 px-6 py-2 bg-xiphos-blue hover:bg-sky-400 text-black text-[16px] font-black tracking-widest uppercase rounded-sm cursor-pointer transition-all">
                    <Send className="h-3.5 w-3.5 fill-current" /> DISPATCH ORDER
                  </button>
                  <div className="flex-1 bg-slate-950/80 border border-slate-900 rounded-sm px-3 py-2 text-[14px] text-[#6f7e90] overflow-hidden">
                    {consoleLog.at(-1)}
                  </div>
                </div>
              </form>
            </div>

            {/* Pending orders table */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-950 pb-1.5 shrink-0">
                <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block">
                  ACTIVE PENDING REGISTRY ({orders.length})
                </span>
                <div className="flex items-center gap-2">
                  <button title="Previous Page" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="text-[#6f7e90] hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[15px] text-[#8e9aa8] font-black uppercase">PAGE {page + 1} / {totalPages}</span>
                  <button title="Next Page" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="text-[#6f7e90] hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <table className="w-full text-left text-[17px] border-collapse font-bold">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-[#6f7e90] uppercase text-[15px]">
                      <th className="p-2.5 font-black">TICKET</th>
                      <th className="p-2.5 font-black">SYMBOL</th>
                      <th className="p-2.5 font-black">TYPE</th>
                      <th className="p-2.5 font-black text-right">LOTS</th>
                      <th className="p-2.5 font-black text-right">PRICE</th>
                      <th className="p-2.5 font-black text-right">SL / TP</th>
                      <th className="p-2.5 text-center font-black">CANCEL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-[#425062] font-black uppercase text-[17px]">
                          [NO PENDING ORDERS IN METATRADER 5]
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map(ord => (
                        <tr key={ord.ticket} className="border-b border-slate-950/60 hover:bg-xiphos-bg/60 transition-colors">
                          <td className="p-2.5 text-[#6f7e90]">{ord.ticket}</td>
                          <td className="p-2.5 text-white font-black">{ord.symbol}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded-sm text-[14px] font-black border uppercase ${
                              ord.type.startsWith("BUY")
                                ? "bg-xiphos-green/5 border-xiphos-green/45 text-xiphos-green"
                                : "bg-xiphos-red/5 border-xiphos-red/45 text-xiphos-red"
                            }`}>
                              {ord.type.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-2.5 text-right text-white">{ord.volume.toFixed(2)}</td>
                          <td className="p-2.5 text-right text-[#ccd6e0]">
                            {ord.price_open.toFixed(ord.symbol.includes("USD") && !ord.symbol.startsWith("X") ? 5 : 2)}
                          </td>
                          <td className="p-2.5 text-right text-[#8e9aa8]">
                            SL: {ord.sl > 0 ? ord.sl.toFixed(2) : "—"} / TP: {ord.tp > 0 ? ord.tp.toFixed(2) : "—"}
                          </td>
                          <td className="p-2.5 flex justify-center items-center">
                            <button title="Cancel Order" onClick={() => handleCancel(ord.ticket)}
                              className="p-1.5 bg-xiphos-red/15 hover:bg-xiphos-red text-xiphos-red hover:text-black border border-xiphos-red/40 rounded-sm cursor-pointer transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm p-3 shrink-0">
        <div className="flex items-center justify-between text-[16px] font-black">
          <div className="flex items-center gap-2 text-xiphos-blue">
            <ShieldAlert className="h-4 w-4" />
            <span>ORDER DISPATCH SECURITY PROFILE</span>
          </div>
          <span className="text-[#8e9aa8] text-[15px]">
            SLIPPAGE LIMIT: <span className="text-xiphos-green font-black">20 POINTS (DEFAULT DEVIATION LOCK)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
