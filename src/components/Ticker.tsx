"use client";

const TICKER_ITEMS = [
    { symbol: "S&P 500", ticker: "^GSPC", price: "$6,849.50", change: "+52.87", pct: "+0.78%", up: true },
    { symbol: "iShares MSCI EM", ticker: "EEM", price: "$5,905", change: "+0.63", pct: "+1.08%", up: true },
    { symbol: "Bitcoin", ticker: "BTC-USD", price: "$73,072.03", change: "+4,075.64", pct: "+7.31%", up: true },
    { symbol: "Gold Apr 26", ticker: "GC=F", price: "$5,184.60", change: "+5,000", pct: "+1.17%", up: true },
    { symbol: "NASDAQ-100", ticker: "^NDX", price: "$25,003.68", change: "-373.50", pct: "-1.51%", up: false },
    { symbol: "ETF ACWI", ticker: "ACWI", price: "$112.35", change: "+0.84", pct: "+0.75%", up: true },
    { symbol: "Tesla", ticker: "TSLA", price: "$348.60", change: "+12.40", pct: "+3.69%", up: true },
    { symbol: "Apple", ticker: "AAPL", price: "$227.48", change: "-1.22", pct: "-0.53%", up: false },
];

export default function Ticker() {
    const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

    return (
        <div
            className="overflow-hidden border-b"
            role="marquee"
            aria-label="Mercados financieros en tiempo real"
            aria-live="off"
            style={{
                background: "rgba(11, 17, 32, 0.95)",
                borderColor: "rgba(255,255,255,0.06)",
                height: "36px",
            }}
        >
            <div className="ticker-track" style={{ gap: "2.5rem", paddingTop: "7px" }}>
                {items.map((item, i) => (
                    <div
                        key={`${item.ticker}-${i}`}
                        className="flex items-center gap-2 whitespace-nowrap"
                        style={{ fontSize: "0.8rem" }}
                    >
                        <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ background: item.up ? "#10B981" : "#EF4444" }}
                        />
                        <span style={{ color: "#9CA3AF" }}>{item.symbol}</span>
                        <span style={{ color: "#9CA3AF" }}>({item.ticker})</span>
                        <span style={{ color: "#FFFFFF" }}>{item.price}</span>
                        <span style={{ color: item.up ? "#10B981" : "#EF4444" }}>
                            {item.up ? "▲" : "▼"} {item.change} {item.pct}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
