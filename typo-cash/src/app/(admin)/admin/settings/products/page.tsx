"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  ArrowLeft,
  Package,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  code: string;
  rate: number;
  minAmount: bigint;
  maxAmount: bigint;
  active: boolean;
}

const initialProducts: Product[] = [
  { id: "quick-cash", name: "Quick Cash", code: "QC", rate: 12, minAmount: 50_000n, maxAmount: 300_000n, active: true },
  { id: "emergency", name: "Emergency Loan", code: "EM", rate: 15, minAmount: 50_000n, maxAmount: 500_000n, active: true },
  { id: "instalment", name: "Instalment Loan", code: "IN", rate: 18, minAmount: 100_000n, maxAmount: 700_000n, active: true },
  { id: "salary-backed", name: "Salary-Backed Loan", code: "SB", rate: 15, minAmount: 200_000n, maxAmount: 700_000n, active: true },
];

export default function ProductsSettingsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showPanel, setShowPanel] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newMin, setNewMin] = useState("");
  const [newMax, setNewMax] = useState("");

  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleAddProduct = () => {
    if (!newName || !newCode || !newRate || !newMin || !newMax) return;
    const product: Product = {
      id: newCode.toLowerCase() + "-" + Date.now(),
      name: newName,
      code: newCode.toUpperCase(),
      rate: parseFloat(newRate),
      minAmount: BigInt(Math.round(parseFloat(newMin) * 100)),
      maxAmount: BigInt(Math.round(parseFloat(newMax) * 100)),
      active: true,
    };
    setProducts((prev) => [...prev, product]);
    setNewName("");
    setNewCode("");
    setNewRate("");
    setNewMin("");
    setNewMax("");
    setShowPanel(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </a>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Loan Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage loan product configuration</p>
        </div>
        <button
          onClick={() => setShowPanel(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Code</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Rate</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Min Amount</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Max Amount</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-mono text-slate-600">{p.code}</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">{p.rate}%</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">{formatMoney(p.minAmount)}</td>
                  <td className="px-6 py-3.5 text-sm font-mono text-right text-slate-900">{formatMoney(p.maxAmount)}</td>
                  <td className="px-6 py-3.5 text-center">
                    <button
                      onClick={() => toggleActive(p.id)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        p.active ? "bg-sky-500" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          p.active ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out panel */}
      {showPanel && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowPanel(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Add Product</h2>
                <button onClick={() => setShowPanel(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Micro Loan"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Product Code</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. ML"
                    maxLength={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Min Amount (Pula)</label>
                  <input
                    type="number"
                    value={newMin}
                    onChange={(e) => setNewMin(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Max Amount (Pula)</label>
                  <input
                    type="number"
                    value={newMax}
                    onChange={(e) => setNewMax(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleAddProduct}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Save Product
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
