"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Database } from "lucide-react";

interface ResultsTableProps {
  data: any[];
  stats: { imported: number; skipped: number };
  isComplete: boolean;
}

export default function ResultsTable({ data, stats, isComplete }: ResultsTableProps) {
  if (data.length === 0 && !isComplete) return null;

  return (
    <div className="w-full mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl flex items-center space-x-5 shadow-md border-l-4 border-[#296554]">
          <div className="p-3 bg-[#296554]/10 rounded-lg">
            <CheckCircle2 className="w-8 h-8 text-[#296554]" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Imported</p>
            <h4 className="text-3xl font-black text-gray-900 flex items-baseline">
              {stats.imported} <span className="text-sm text-gray-500 ml-2 font-medium">records</span>
            </h4>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl flex items-center space-x-5 shadow-md border-l-4 border-[#f16e44]">
          <div className="p-3 bg-[#f16e44]/10 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-[#f16e44]" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Skipped</p>
            <h4 className="text-3xl font-black text-gray-900 flex items-baseline">
              {stats.skipped} <span className="text-sm text-gray-500 ml-2 font-medium">invalid records</span>
            </h4>
          </div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-[#296554]" />
              <h3 className="text-sm font-bold text-gray-900">Processed Data</h3>
            </div>
            {isComplete && (
              <span className="text-xs font-bold px-3 py-1 bg-[#296554]/10 text-[#296554] rounded-full">
                Complete
              </span>
            )}
          </div>
          
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 whitespace-nowrap">Name</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 whitespace-nowrap">Email</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 whitespace-nowrap">Mobile</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 whitespace-nowrap">Source</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-100 whitespace-nowrap">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">{row.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{row.email || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                      {row.country_code} {row.mobile_without_country_code || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-full">
                        {row.crm_status || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{row.data_source || "-"}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate" title={row.crm_note}>
                      {row.crm_note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
