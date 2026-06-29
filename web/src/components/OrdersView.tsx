"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Send, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersView() {
  const { orders, placeOrder, cancelOrder } = useTradingStore();

  const [symbol, setSymbol] = useState("EURUSD");
  const [type, setType] = useState("BUY LIMIT");
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
  const buyOrders = orders.filter(o => o.type.includes("BUY")).length;
  const sellOrders = orders.filter(o => o.type.includes("SELL")).length;

  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
  const paginatedOrders = orders.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300">
      <div className="glass-panel flex flex-col overflow-hidden flex-1 min-h-0 relative">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-xiphos-cyan opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center bg-black/20 shrink-0 z-10">
          <span className="text-2xl font-black text-xiphos-cyan uppercase tracking-widest flex items-center gap-2 glow-cyan">
            <Send className="h-5 w-5" />
            XIPHOS COMMAND DISPATCH & PENDING ORDERS CONSOLE
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden z-10">

          {/* LEFT: Order summary stats */}
          <div className="col-span-3 border-r border-white/5 p-5 flex flex-col gap-6 overflow-hidden">
            <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block border-b border-white/5 pb-2">
              ORDER QUEUE SUMMARY
            </span>

            {/* Stats */}
            <div className="space-y-4">
              {[
                { label: "TOTAL PENDING", value: totalPending, colorClass: "text-xiphos-cyan glow-cyan" },
                { label: "BUY ORDERS", value: buyOrders, colorClass: "text-xiphos-emerald glow-emerald" },
                { label: "SELL ORDERS", value: sellOrders, colorClass: "text-xiphos-crimson glow-crimson" },
              ].map(item => (
                <div key={item.label} className="glass-card p-4 hover:border-xiphos-purple/30 transition-all cursor-default group">
                  <div className="text-xs text-xiphos-muted font-black uppercase tracking-wider mb-2 group-hover:text-xiphos-purple transition-colors">{item.label}</div>
                  <div className={`text-4xl font-black leading-none ${item.colorClass}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Security context */}
            <div className="border-t border-white/5 pt-4 mt-auto">
              <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block mb-3">BROKER PIPELINE LINK</span>
              <div className="space-y-3 text-sm text-xiphos-muted">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-xiphos-emerald animate-pulse" />
                  <span className="text-white tracking-wide">MT5 BRIDGE SYNC ESTABLISHED</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>SLIPPAGE LIMIT</span>
                  <span className="text-white font-bold tracking-wider">20 PTS</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>DEVIATION LOCK</span>
                  <span className="text-xiphos-emerald font-bold tracking-wider glow-emerald">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order entry + Table */}
          <div className="col-span-9 p-5 flex flex-col gap-5 overflow-hidden">
            
            {/* Quick Order Entry Form */}
            <div className="shrink-0 glass-card p-4 border-l-4 border-l-xiphos-purple">
              <form onSubmit={handlePlaceOrder} className="flex gap-4 items-end">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="order-symbol" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">SYMBOL</label>
                  <input id="order-symbol" title="Symbol" type="text" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} className="bg-black/40 border border-white/10 text-white p-2 text-sm outline-none focus:border-xiphos-purple rounded-sm transition-all" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="order-type" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">TYPE</label>
                  <select id="order-type" title="Order type" value={type} onChange={e => setType(e.target.value)} className="bg-black/40 border border-white/10 text-white p-2 text-sm outline-none focus:border-xiphos-purple rounded-sm transition-all appearance-none cursor-pointer">
                    <option value="BUY LIMIT">BUY LIMIT</option>
                    <option value="SELL LIMIT">SELL LIMIT</option>
                    <option value="BUY STOP">BUY STOP</option>
                    <option value="SELL STOP">SELL STOP</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 w-20">
                  <label htmlFor="order-lots" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">LOTS</label>
                  <input id="order-lots" title="Lot size" type="number" step="0.01" value={volume} onChange={e => setVolume(Number.parseFloat(e.target.value))} className="bg-black/40 border border-white/10 text-white p-2 text-sm outline-none focus:border-xiphos-purple rounded-sm transition-all" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="order-price" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">PRICE</label>
                  <input id="order-price" title="Entry price" type="number" step="0.00001" value={price} onChange={e => setPrice(Number.parseFloat(e.target.value))} className="bg-black/40 border border-white/10 text-white p-2 text-sm outline-none focus:border-xiphos-purple rounded-sm transition-all" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="order-sl" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">SL</label>
                  <input id="order-sl" title="Stop loss" type="number" step="0.00001" value={sl} onChange={e => setSl(Number.parseFloat(e.target.value))} className="bg-black/40 border border-white/10 text-white p-2 text-sm outline-none focus:border-xiphos-purple rounded-sm transition-all" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="order-tp" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">TP</label>
                  <input id="order-tp" title="Take profit" type="number" step="0.00001" value={tp} onChange={e => setTp(Number.parseFloat(e.target.value))} className="bg-black/40 border border-white/10 text-white p-2 text-sm outline-none focus:border-xiphos-purple rounded-sm transition-all" />
                </div>
                <button type="submit" className="h-[38px] px-6 bg-xiphos-cyan/20 text-xiphos-cyan border border-xiphos-cyan/50 hover:bg-xiphos-cyan hover:text-black font-black uppercase text-sm tracking-widest rounded-sm transition-all flex items-center gap-2">
                  <Send className="w-4 h-4" /> DISPATCH
                </button>
              </form>
            </div>

            {/* Orders Table */}
            <div className="flex-1 min-h-0 flex flex-col glass-card border border-white/5">
              <div className="flex justify-between items-center p-3 border-b border-white/5 bg-black/20">
                <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider">
                  PENDING ORDER QUEUE
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <button title="Previous page" aria-label="Previous page" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="text-xiphos-muted hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xiphos-muted tracking-widest">PG <span className="text-white">{page + 1}</span> / {totalPages}</span>
                  <button title="Next page" aria-label="Next page" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="text-xiphos-muted hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                  <thead className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
                    <tr className="text-xiphos-muted text-[11px] tracking-widest uppercase">
                      <th className="p-3 pl-4 font-black">TICKET</th>
                      <th className="p-3 font-black">SYMBOL</th>
                      <th className="p-3 font-black">TYPE</th>
                      <th className="p-3 font-black">VOLUME</th>
                      <th className="p-3 font-black">PRICE</th>
                      <th className="p-3 font-black">SL / TP</th>
                      <th className="p-3 font-black">COMMENT</th>
                      <th className="p-3 pr-4 text-right font-black">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {paginatedOrders.length === 0 ? (
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan={8} className="text-center p-8 text-xiphos-muted font-black tracking-widest">
                            NO PENDING ORDERS IN QUEUE
                          </td>
                        </motion.tr>
                      ) : (
                        paginatedOrders.map(order => (
                          <motion.tr 
                            key={order.ticket}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                          >
                            <td className="p-3 pl-4 text-xiphos-muted">#{order.ticket}</td>
                            <td className="p-3 font-bold text-white tracking-wider">{order.symbol}</td>
                            <td className={`p-3 font-black ${order.type.includes("BUY") ? "text-xiphos-emerald" : "text-xiphos-crimson"}`}>
                              {order.type}
                            </td>
                            <td className="p-3 font-mono">{order.volume.toFixed(2)}</td>
                            <td className="p-3 font-mono text-white">{order.price_open.toFixed(5)}</td>
                            <td className="p-3 font-mono text-xiphos-muted">
                              <span className="text-xiphos-crimson">{order.sl.toFixed(5)}</span> / <span className="text-xiphos-emerald">{order.tp.toFixed(5)}</span>
                            </td>
                            <td className="p-3 text-[11px] text-xiphos-purple uppercase tracking-widest">
                              {order.comment || "—"}
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <button title="Cancel order" aria-label="Cancel order" onClick={() => handleCancel(order.ticket)} className="opacity-0 group-hover:opacity-100 p-1.5 text-xiphos-muted hover:text-xiphos-crimson hover:bg-xiphos-crimson/10 rounded transition-all cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mini Console Log */}
            <div className="shrink-0 h-28 glass-card border border-white/5 bg-black/40 flex flex-col overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                <div className="w-2 h-2 rounded-full bg-xiphos-cyan animate-pulse shadow-[0_0_8px_#4CC9F0]" />
              </div>
              <div className="text-[10px] text-xiphos-muted font-black tracking-widest uppercase p-2 border-b border-white/5 bg-black/40">
                DISPATCH SECURE TERMINAL
              </div>
              <div className="flex-1 p-2 overflow-y-auto text-xs text-xiphos-cyan font-mono leading-relaxed opacity-80 flex flex-col justify-end">
                {consoleLog.map((log, i) => (
                  <div key={`${log}-${i}`} className="animate-pulse">{`> ${log}`}</div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
