from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd


REVENUE_KEYS = ["freight", "amount", "revenue", "income", "bill", "total", "payment"]
EXPENSE_KEYS = ["expense", "cost", "diesel", "fuel", "toll", "maintenance", "advance"]
ROUTE_KEYS = ["route", "lane", "from", "to", "origin", "destination", "source"]
TRUCK_KEYS = ["truck", "vehicle", "lorry", "reg", "plate"]
DATE_KEYS = ["date", "dispatch", "delivery", "invoice", "trip"]
STATUS_KEYS = ["status", "delivery_status", "state"]
TONNAGE_KEYS = ["tonnage", "weight", "qty", "quantity", "load"]


CURRENCY_RE = re.compile(r"[^0-9.\-]")


def normalize_key(key: str) -> str:
    return re.sub(r"\s+", "_", str(key).strip().lower())


def parse_number(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = CURRENCY_RE.sub("", str(value))
    if cleaned in {"", "-", ".", "-."}:
        return 0.0
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def parse_date(value: Any) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    dt = pd.to_datetime(value, errors="coerce", dayfirst=True)
    if pd.isna(dt):
        return None
    return dt.to_pydatetime()


def find_column(columns: list[str], hints: list[str]) -> str | None:
    normalized = [(c, normalize_key(c)) for c in columns]
    for original, key in normalized:
        if any(h in key for h in hints):
            return original
    return None


def records_to_dataframe(records: list[dict]) -> pd.DataFrame:
    if not records:
        return pd.DataFrame()
    return pd.DataFrame(records)


def calculate_metrics(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            "total_revenue": 0.0,
            "total_expense": 0.0,
            "profit_loss": 0.0,
            "total_trips": 0,
            "pending_deliveries": 0,
            "route_stats": [],
            "truck_stats": [],
            "monthly_trend": [],
            "schema": [],
        }

    cols = df.columns.tolist()
    revenue_col = find_column(cols, REVENUE_KEYS)
    expense_col = find_column(cols, EXPENSE_KEYS)
    route_col = find_column(cols, ROUTE_KEYS)
    truck_col = find_column(cols, TRUCK_KEYS)
    date_col = find_column(cols, DATE_KEYS)
    status_col = find_column(cols, STATUS_KEYS)

    revenue_series = df[revenue_col].map(parse_number) if revenue_col else pd.Series(0.0, index=df.index)
    expense_series = df[expense_col].map(parse_number) if expense_col else pd.Series(0.0, index=df.index)

    total_revenue = float(revenue_series.sum())
    total_expense = float(expense_series.sum())
    profit_loss = total_revenue - total_expense

    pending_deliveries = 0
    if status_col:
        pending_deliveries = int(
            df[status_col]
            .astype(str)
            .str.lower()
            .str.contains("pending|delay|open|in transit|in-transit")
            .sum()
        )

    route_agg = defaultdict(lambda: {"revenue": 0.0, "expense": 0.0, "trips": 0})
    truck_agg = defaultdict(lambda: {"revenue": 0.0, "expense": 0.0, "trips": 0})

    for idx, row in df.iterrows():
        route_val = str(row.get(route_col, "Unknown")).strip() if route_col else "Unknown"
        truck_val = str(row.get(truck_col, "Unknown")).strip() if truck_col else "Unknown"
        rev = float(revenue_series.iloc[idx])
        exp = float(expense_series.iloc[idx])

        route_agg[route_val]["revenue"] += rev
        route_agg[route_val]["expense"] += exp
        route_agg[route_val]["trips"] += 1

        truck_agg[truck_val]["revenue"] += rev
        truck_agg[truck_val]["expense"] += exp
        truck_agg[truck_val]["trips"] += 1

    route_stats = []
    for route, agg in route_agg.items():
        route_stats.append(
            {
                "route": route,
                "revenue": round(agg["revenue"], 2),
                "expense": round(agg["expense"], 2),
                "profit": round(agg["revenue"] - agg["expense"], 2),
                "trips": agg["trips"],
            }
        )
    route_stats.sort(key=lambda x: x["revenue"], reverse=True)

    truck_stats = []
    for truck, agg in truck_agg.items():
        truck_stats.append(
            {
                "truck": truck,
                "revenue": round(agg["revenue"], 2),
                "expense": round(agg["expense"], 2),
                "profit": round(agg["revenue"] - agg["expense"], 2),
                "trips": agg["trips"],
            }
        )
    truck_stats.sort(key=lambda x: x["revenue"], reverse=True)

    monthly_agg = defaultdict(lambda: {"revenue": 0.0, "expense": 0.0})
    if date_col:
        parsed_dates = df[date_col].map(parse_date)
        for idx, parsed in parsed_dates.items():
            if not parsed:
                continue
            key = parsed.strftime("%Y-%m")
            monthly_agg[key]["revenue"] += float(revenue_series.iloc[idx])
            monthly_agg[key]["expense"] += float(expense_series.iloc[idx])

    monthly_trend = []
    for month, agg in monthly_agg.items():
        monthly_trend.append(
            {
                "month": month,
                "revenue": round(agg["revenue"], 2),
                "expense": round(agg["expense"], 2),
                "profit": round(agg["revenue"] - agg["expense"], 2),
            }
        )
    monthly_trend.sort(key=lambda x: x["month"])

    return {
        "total_revenue": round(total_revenue, 2),
        "total_expense": round(total_expense, 2),
        "profit_loss": round(profit_loss, 2),
        "total_trips": int(len(df)),
        "pending_deliveries": pending_deliveries,
        "route_stats": route_stats[:20],
        "truck_stats": truck_stats[:20],
        "monthly_trend": monthly_trend,
        "schema": cols,
    }


def generate_alerts(metrics: dict) -> list[dict]:
    alerts = []

    loss_routes = [r for r in metrics.get("route_stats", []) if r["profit"] < 0]
    if loss_routes:
        top = loss_routes[0]
        alerts.append(
            {
                "severity": "high",
                "type": "loss_route",
                "message": f"Route {top['route']} is loss-making with profit {top['profit']:.2f}.",
            }
        )

    if metrics.get("pending_deliveries", 0) > 0:
        alerts.append(
            {
                "severity": "medium",
                "type": "pending_deliveries",
                "message": f"{metrics['pending_deliveries']} deliveries are pending or delayed.",
            }
        )

    trucks = metrics.get("truck_stats", [])
    if trucks:
        low = sorted(trucks, key=lambda x: x["revenue"])[0]
        alerts.append(
            {
                "severity": "low",
                "type": "low_truck_performance",
                "message": f"Truck {low['truck']} has the lowest revenue ({low['revenue']:.2f}).",
            }
        )

    return alerts


def generate_prediction(metrics: dict) -> dict:
    monthly = metrics.get("monthly_trend", [])
    if len(monthly) < 2:
        return {
            "next_month_revenue": metrics.get("total_revenue", 0.0),
            "trend": "insufficient_data",
            "advice": "Upload at least 2 months of data for reliable forecasting.",
        }

    y = np.array([m["revenue"] for m in monthly], dtype=float)
    x = np.arange(len(y), dtype=float)
    coeff = np.polyfit(x, y, 1)
    next_rev = float(np.polyval(coeff, len(y)))
    trend = "upward" if coeff[0] >= 0 else "downward"

    return {
        "next_month_revenue": round(max(next_rev, 0.0), 2),
        "trend": trend,
        "slope": round(float(coeff[0]), 2),
        "advice": "Increase allocation on top-profit routes and review cost-heavy trips.",
    }


def filter_records(
    df: pd.DataFrame,
    truck: str | None = None,
    route: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    query: str | None = None,
) -> pd.DataFrame:
    if df.empty:
        return df

    filtered = df.copy()
    cols = filtered.columns.tolist()
    truck_col = find_column(cols, TRUCK_KEYS)
    route_col = find_column(cols, ROUTE_KEYS)
    date_col = find_column(cols, DATE_KEYS)

    if truck and truck_col:
        filtered = filtered[
            filtered[truck_col].astype(str).str.lower().str.contains(truck.lower(), na=False)
        ]

    if route and route_col:
        filtered = filtered[
            filtered[route_col].astype(str).str.lower().str.contains(route.lower(), na=False)
        ]

    if query:
        mask = filtered.apply(
            lambda row: row.astype(str).str.lower().str.contains(query.lower(), na=False).any(),
            axis=1,
        )
        filtered = filtered[mask]

    if date_col and (start_date or end_date):
        dates = pd.to_datetime(filtered[date_col], errors="coerce", dayfirst=True)
        if start_date:
            start = pd.to_datetime(start_date, errors="coerce")
            if pd.notna(start):
                filtered = filtered[dates >= start]
                dates = pd.to_datetime(filtered[date_col], errors="coerce", dayfirst=True)
        if end_date:
            end = pd.to_datetime(end_date, errors="coerce")
            if pd.notna(end):
                filtered = filtered[dates <= end]

    return filtered


def build_report(metrics: dict, period: str) -> dict:
    monthly = metrics.get("monthly_trend", [])
    top_route = metrics.get("route_stats", [{}])[0] if metrics.get("route_stats") else {}
    top_truck = metrics.get("truck_stats", [{}])[0] if metrics.get("truck_stats") else {}

    return {
        "period": period,
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "total_revenue": metrics.get("total_revenue", 0.0),
            "total_expense": metrics.get("total_expense", 0.0),
            "profit_loss": metrics.get("profit_loss", 0.0),
            "pending_deliveries": metrics.get("pending_deliveries", 0),
        },
        "top_route": top_route,
        "top_truck": top_truck,
        "monthly_trend": monthly,
        "narrative": (
            "Revenue and profitability are automatically tracked from uploaded trip data. "
            "Use alerts to focus on delayed deliveries and loss-making lanes."
        ),
    }
