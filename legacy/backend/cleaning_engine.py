import io
import math
import re
from typing import Any

import pandas as pd


DATE_HINTS = ["date", "dispatch", "delivery", "invoice", "trip"]
NAME_HINTS = ["name", "party", "customer", "vendor", "driver"]
ROUTE_HINTS = ["route", "source", "destination", "city", "from", "to"]
TRUCK_HINTS = ["truck", "vehicle", "lorry", "reg", "plate"]
NUMERIC_HINTS = ["freight", "amount", "revenue", "expense", "cost", "tonnage", "weight", "qty"]


def _is_empty(value: Any) -> bool:
    if value is None:
        return True
    return str(value).strip() == "" or str(value).strip().lower() == "nan"


def _normalize_header(value: Any) -> str:
    text = str(value).strip()
    text = re.sub(r"\s+", " ", text)
    return text


def _safe_unique_headers(headers: list[str]) -> list[str]:
    unique = []
    seen = {}
    for idx, header in enumerate(headers):
        base = _normalize_header(header) or f"column_{idx + 1}"
        key = re.sub(r"\W+", "_", base.lower()).strip("_") or f"column_{idx + 1}"
        if key in seen:
            seen[key] += 1
            unique.append(f"{key}_{seen[key]}")
        else:
            seen[key] = 1
            unique.append(key)
    return unique


def _read_raw(file_bytes: bytes, filename: str) -> pd.DataFrame:
    lower = filename.lower()
    if lower.endswith(".csv"):
        return pd.read_csv(io.BytesIO(file_bytes), header=None, dtype=str, on_bad_lines="skip")
    if lower.endswith(".xls") or lower.endswith(".xlsx"):
        return pd.read_excel(io.BytesIO(file_bytes), header=None, dtype=str)
    raise ValueError("Unsupported file type. Use .xls, .xlsx, or .csv")


def _detect_header_row(raw_df: pd.DataFrame) -> int:
    max_score = -1
    best_idx = 0

    sample_limit = min(30, len(raw_df))
    for i in range(sample_limit):
        row = raw_df.iloc[i].tolist()
        values = [str(v).strip() for v in row if not _is_empty(v)]
        if not values:
            continue

        unique_ratio = len(set(values)) / max(len(values), 1)
        alpha_ratio = sum(any(ch.isalpha() for ch in v) for v in values) / len(values)
        score = (len(values) * 2) + unique_ratio + alpha_ratio

        if score > max_score:
            max_score = score
            best_idx = i

    return best_idx


def _is_duplicate_header_row(row_values: list[Any], canonical: list[str]) -> bool:
    cleaned = [_normalize_header(v).lower() for v in row_values[: len(canonical)]]
    base = [c.lower() for c in canonical]
    matches = sum(1 for idx, val in enumerate(cleaned) if idx < len(base) and val == base[idx])
    return len(base) > 0 and matches >= max(2, int(len(base) * 0.6))


def _normalize_text_column(series: pd.Series, mode: str) -> pd.Series:
    series = series.astype(str).str.strip()
    if mode == "upper":
        return series.str.upper()
    if mode == "title":
        return series.str.title()
    return series


def process_file(file_bytes: bytes, filename: str) -> dict:
    raw_df = _read_raw(file_bytes, filename)
    original_rows_count = len(raw_df)

    if raw_df.empty:
        raise ValueError("File is empty")

    header_idx = _detect_header_row(raw_df)
    header_values = [_normalize_header(v) for v in raw_df.iloc[header_idx].tolist()]
    headers = _safe_unique_headers(header_values)

    data_rows = []
    repeated_headers_removed = 0

    for idx in range(header_idx + 1, len(raw_df)):
        row_values = raw_df.iloc[idx].tolist()
        if all(_is_empty(v) for v in row_values):
            continue
        if _is_duplicate_header_row(row_values, header_values):
            repeated_headers_removed += 1
            continue
        data_rows.append(row_values[: len(headers)])

    df = pd.DataFrame(data_rows, columns=headers)
    df = df.replace(r"^\s*$", None, regex=True)
    df = df.dropna(how="all")

    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = df[col].map(lambda x: x.strip() if isinstance(x, str) else x)

    auto_fixes = []

    for col in df.columns:
        key = col.lower()

        if any(h in key for h in DATE_HINTS):
            converted = pd.to_datetime(df[col], errors="coerce", dayfirst=True)
            if converted.notna().sum() > 0:
                df[col] = converted.dt.strftime("%Y-%m-%d")
                auto_fixes.append(f"normalized_dates:{col}")

        if any(h in key for h in NAME_HINTS):
            df[col] = _normalize_text_column(df[col].fillna(""), "title").replace("", None)
            auto_fixes.append(f"normalized_names:{col}")

        if any(h in key for h in ROUTE_HINTS + TRUCK_HINTS):
            df[col] = _normalize_text_column(df[col].fillna(""), "upper").replace("", None)
            auto_fixes.append(f"normalized_routes_or_trucks:{col}")

        if any(h in key for h in NUMERIC_HINTS):
            cleaned = (
                df[col]
                .astype(str)
                .str.replace(r"[^0-9.\-]", "", regex=True)
                .replace({"": None, "nan": None})
            )
            df[col] = pd.to_numeric(cleaned, errors="coerce")
            auto_fixes.append(f"normalized_numeric:{col}")

    before_dedup = len(df)
    duplicates_df = df[df.duplicated(keep="first")].copy()
    df = df.drop_duplicates()

    duplicates_removed = before_dedup - len(df)

    df = df.replace([math.inf, -math.inf], None)
    df = df.where(pd.notnull(df), None)

    preview_df = df.head(100).astype(object).where(pd.notnull(df.head(100)), None)
    duplicates_df = duplicates_df.head(500).astype(object).where(pd.notnull(duplicates_df.head(500)), None)

    stats = {
        "original_rows": original_rows_count,
        "final_rows": len(df),
        "columns_detected": len(df.columns),
        "duplicates_removed": duplicates_removed,
        "repeated_headers_removed": repeated_headers_removed,
        "auto_fixes": len(auto_fixes),
    }

    return {
        "stats": stats,
        "columns": df.columns.tolist(),
        "preview": preview_df.to_dict(orient="records"),
        "duplicates": duplicates_df.to_dict(orient="records"),
        "csv_download": df.to_csv(index=False),
    }
