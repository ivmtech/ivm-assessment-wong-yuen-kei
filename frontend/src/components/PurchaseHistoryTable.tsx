import React from 'react';
import type { Purchase } from '../api/types';

interface PurchaseHistoryTableProps {
    purchases: Purchase[];
    formatDate: (dateString: string) => string;
}

export default function PurchaseHistoryTable({ purchases, formatDate }: PurchaseHistoryTableProps) {
    if (purchases.length === 0) {
        return (
            <div className="glass-card rounded-3xl shadow-2xl p-16 text-center border-2 border-dashed border-gray-300">
                <div className="text-8xl mb-6">🔎</div>
                <h3 className="text-2xl font-black gradient-text mb-3">No Matching Purchases</h3>
                <p className="text-gray-600 text-lg">Try adjusting your filters to see more results.</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
                        <tr>
                            {/* [TODO 4]: add table headers for product, amount, time */}
                            <th className="text-left px-6 py-4 text-white font-semibold">Product</th>
                            <th className="text-left px-6 py-4 text-white font-semibold">Amount</th>
                            <th className="text-left px-6 py-4 text-white font-semibold">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100 bg-white">
                        {/* [TODO 4]: add table rows for product, amount, time */}
                        {purchases.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 align-top">
                                    <div className="font-bold text-gray-800">{p.productName}</div>
                                    <div className="text-xs text-gray-500 mt-1">Qty: {p.quantity}</div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="font-black text-gray-900">${p.amount.toFixed(2)}</div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="text-sm text-gray-700">{formatDate(p.purchaseTime)}</div>
                                    <div className="text-xs text-gray-400 mt-1">Machine: {p.machineId}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}