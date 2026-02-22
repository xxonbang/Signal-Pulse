#!/usr/bin/env python3
"""
KIS Gemini 분석 로컬 테스트 스크립트

사용법:
    # 빠른 테스트 (기존 kis_gemini.json에서 3종목만 분석)
    python scripts/run_kis_analysis.py --stocks 3

    # 전체 Gemini 분석 (기존 kis_gemini.json, 전체 종목, 배치 처리)
    python scripts/run_kis_analysis.py

    # 풀 파이프라인 (KIS API 수집 → 변환 → 분석)
    python scripts/run_kis_analysis.py --collect

환경변수 필요:
    GEMINI_API_KEY_01 ~ 05  - Gemini API 키 (최소 1개)
    KIS_APP_KEY / KIS_APP_SECRET - --collect 시에만 필요
"""
import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# 프로젝트 루트를 모듈 경로에 추가
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))

from config.settings import KIS_OUTPUT_DIR
from modules.ai_engine import analyze_kis_data_batch

KST = timezone(timedelta(hours=9))
GEMINI_DATA_PATH = KIS_OUTPUT_DIR / "kis_gemini.json"
OUTPUT_PATH = KIS_OUTPUT_DIR / "kis_analysis.json"


def load_gemini_data() -> dict:
    """기존 kis_gemini.json 로드"""
    if not GEMINI_DATA_PATH.exists():
        print(f"[ERROR] 데이터 파일 없음: {GEMINI_DATA_PATH}")
        print("  --collect 플래그로 데이터를 먼저 수집하세요.")
        sys.exit(1)

    with open(GEMINI_DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    stock_count = len(data.get("stocks", {}))
    meta = data.get("meta", {})
    print(f"[INFO] 데이터 로드: {GEMINI_DATA_PATH}")
    print(f"[INFO] 종목 수: {stock_count}개")
    print(f"[INFO] 수집 시각: {meta.get('original_collected_at', 'N/A')}")
    return data


def collect_and_transform() -> dict:
    """KIS API 수집 → 변환"""
    from modules.kis_collector import KISDataCollector
    from modules.kis_data_transformer import KISDataTransformer

    print("\n=== Phase 1: KIS API 데이터 수집 ===\n")
    collector = KISDataCollector()
    raw_data = collector.run_top50(
        include_chart=True,
        include_ticks=False,
        include_extended=True,
        save_timestamped=True,
    )

    print("\n=== Phase 2: Gemini 분석용 변환 ===\n")
    transformer = KISDataTransformer()
    gemini_data = transformer.transform_for_gemini(raw_data)
    transformer.save_transformed_data(gemini_data)

    return gemini_data


def limit_stocks(data: dict, n: int) -> dict:
    """종목 수를 N개로 제한"""
    stocks = data.get("stocks", {})
    limited_codes = list(stocks.keys())[:n]
    limited_stocks = {code: stocks[code] for code in limited_codes}

    names = [limited_stocks[c].get("name", c) for c in limited_codes]
    print(f"[INFO] 종목 제한: {len(stocks)}개 → {n}개")
    print(f"[INFO] 대상: {names}")

    return {
        "meta": data.get("meta", {}),
        "stocks": limited_stocks,
    }


def save_results(results: list[dict]) -> Path:
    """분석 결과를 kis_analysis.json에 저장"""
    output_data = {
        "analysis_time": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
        "total_analyzed": len(results),
        "results": results,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\n[SAVED] {OUTPUT_PATH} ({len(results)}개 종목)")
    return OUTPUT_PATH


def print_signal_summary(results: list[dict]):
    """시그널 요약 출력"""
    if not results:
        print("\n[WARN] 분석 결과 없음")
        return

    signal_counts: dict[str, int] = {}
    for r in results:
        sig = r.get("signal", "중립")
        signal_counts[sig] = signal_counts.get(sig, 0) + 1

    print(f"\n{'='*50}")
    print(f"시그널 요약 ({len(results)}개 종목)")
    print(f"{'='*50}")
    for sig, count in sorted(signal_counts.items(), key=lambda x: -x[1]):
        print(f"  {sig}: {count}개")

    # 적극매수/매수 종목 리스트
    buy_signals = [r for r in results if r.get("signal") in ("적극매수", "매수")]
    if buy_signals:
        print(f"\n매수 시그널 종목:")
        for r in buy_signals:
            print(f"  [{r['signal']}] {r.get('name', '?')} ({r.get('code', '?')}) "
                  f"- confidence: {r.get('confidence', 'N/A')}")


def main():
    parser = argparse.ArgumentParser(
        description="KIS Gemini 분석 로컬 테스트",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--stocks", type=int, default=0,
        help="분석할 종목 수 제한 (기본: 전체)",
    )
    parser.add_argument(
        "--collect", action="store_true",
        help="KIS API에서 데이터 수집 후 분석 (기본: 기존 데이터 재사용)",
    )
    parser.add_argument(
        "--batch-size", type=int, default=10,
        help="배치당 종목 수 (기본: 10)",
    )
    args = parser.parse_args()

    # 1. 데이터 준비
    if args.collect:
        gemini_data = collect_and_transform()
    else:
        gemini_data = load_gemini_data()

    # 2. 종목 수 제한
    if args.stocks > 0:
        gemini_data = limit_stocks(gemini_data, args.stocks)

    # 3. Gemini 분석
    results = analyze_kis_data_batch(
        gemini_data,
        batch_size=args.batch_size,
    )

    # 4. 결과 저장 + 요약
    if results:
        save_results(results)
        print_signal_summary(results)
    else:
        print("\n[ERROR] 분석 결과 없음. API 키 및 로그를 확인하세요.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
