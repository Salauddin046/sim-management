'use client'
        <div className="mb-4">
          <textarea
            rows={8}
            placeholder="Paste MSISDN or SIM numbers here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 outline-none"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={searchBulk}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={downloadCSV}
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Download CSV
          </button>
        </div>

        {loading && (
          <p className="mb-4">Loading...</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3">Month</th>
                <th className="border p-3">MSISDN</th>
                <th className="border p-3">SIM Number</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Plan</th>
                <th className="border p-3">Used Data (MB)</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((row: any, index: number) => (
                  <tr key={index}>
                    <td className="border p-3">{row.usage_month}</td>
                    <td className="border p-3">{row.msisdn}</td>
                    <td className="border p-3">{row.sim_no}</td>
                    <td className="border p-3">{row.sim_status}</td>
                    <td className="border p-3">{row.plan}</td>
                    <td className="border p-3">{row.used_data_mb}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-4 text-center"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}