"""
한국 주식시장 휴장일 체크 모듈
KRX(한국거래소) 휴장일 기준
"""
from datetime import datetime, date, timedelta, timezone
import sys

# KST 시간대 (UTC+9)
KST = timezone(timedelta(hours=9))

# 한국 주식시장 정기 휴장일 (2024-2026)
# 출처: 한국거래소(KRX) 휴장일 공지
KRX_HOLIDAYS = {
    # 2024년
    "2024-01-01",  # 신정
    "2024-02-09",  # 설날 연휴
    "2024-02-10",  # 설날
    "2024-02-11",  # 설날 연휴
    "2024-02-12",  # 설날 대체휴일
    "2024-03-01",  # 삼일절
    "2024-04-10",  # 국회의원선거일
    "2024-05-01",  # 근로자의날
    "2024-05-06",  # 어린이날 대체휴일
    "2024-05-15",  # 부처님오신날
    "2024-06-06",  # 현충일
    "2024-08-15",  # 광복절
    "2024-09-16",  # 추석 연휴
    "2024-09-17",  # 추석
    "2024-09-18",  # 추석 연휴
    "2024-10-03",  # 개천절
    "2024-10-09",  # 한글날
    "2024-12-25",  # 크리스마스
    "2024-12-31",  # 연말휴장

    # 2025년
    "2025-01-01",  # 신정
    "2025-01-28",  # 설날 연휴
    "2025-01-29",  # 설날
    "2025-01-30",  # 설날 연휴
    "2025-03-01",  # 삼일절
    "2025-03-03",  # 삼일절 대체휴일
    "2025-05-01",  # 근로자의날
    "2025-05-05",  # 어린이날
    "2025-05-06",  # 부처님오신날
    "2025-06-06",  # 현충일
    "2025-08-15",  # 광복절
    "2025-10-03",  # 개천절
    "2025-10-05",  # 추석 연휴
    "2025-10-06",  # 추석
    "2025-10-07",  # 추석 연휴
    "2025-10-08",  # 추석 대체휴일
    "2025-10-09",  # 한글날
    "2025-12-25",  # 크리스마스
    "2025-12-31",  # 연말휴장

    # 2026년
    "2026-01-01",  # 신정
    "2026-02-16",  # 설날 연휴
    "2026-02-17",  # 설날
    "2026-02-18",  # 설날 연휴
    "2026-03-01",  # 삼일절
    "2026-03-02",  # 삼일절 대체휴일
    "2026-05-01",  # 근로자의날
    "2026-05-05",  # 어린이날
    "2026-05-24",  # 부처님오신날
    "2026-05-25",  # 부처님오신날 대체휴일
    "2026-06-06",  # 현충일
    "2026-08-15",  # 광복절
    "2026-08-17",  # 광복절 대체휴일
    "2026-09-24",  # 추석 연휴
    "2026-09-25",  # 추석
    "2026-09-26",  # 추석 연휴
    "2026-10-03",  # 개천절
    "2026-10-05",  # 개천절 대체휴일
    "2026-10-09",  # 한글날
    "2026-12-25",  # 크리스마스
    "2026-12-31",  # 연말휴장
}


def is_weekend(check_date: date = None) -> bool:
    """주말 여부 확인 (토요일=5, 일요일=6)"""
    if check_date is None:
        check_date = datetime.now().date()
    return check_date.weekday() >= 5


def is_krx_holiday(check_date: date = None) -> bool:
    """KRX 공휴일 여부 확인"""
    if check_date is None:
        check_date = datetime.now().date()
    date_str = check_date.strftime("%Y-%m-%d")
    return date_str in KRX_HOLIDAYS


def is_market_open(check_date: date = None) -> bool:
    """주식시장 개장일 여부 확인"""
    if check_date is None:
        check_date = datetime.now().date()

    # 주말이면 휴장
    if is_weekend(check_date):
        return False

    # 공휴일이면 휴장
    if is_krx_holiday(check_date):
        return False

    return True


def is_market_hours() -> bool:
    """현재 시각이 장중(09:00~15:30 KST)인지 확인"""
    now_kst = datetime.now(KST)
    if not is_market_open(now_kst.date()):
        return False
    market_open = now_kst.replace(hour=9, minute=0, second=0, microsecond=0)
    market_close = now_kst.replace(hour=15, minute=30, second=0, microsecond=0)
    return market_open <= now_kst <= market_close


def get_market_status(check_date: date = None) -> dict:
    """시장 상태 정보 반환"""
    if check_date is None:
        check_date = datetime.now().date()

    date_str = check_date.strftime("%Y-%m-%d")
    weekday_names = ["월", "화", "수", "목", "금", "토", "일"]
    weekday = weekday_names[check_date.weekday()]

    status = {
        "date": date_str,
        "weekday": weekday,
        "is_weekend": is_weekend(check_date),
        "is_holiday": is_krx_holiday(check_date),
        "is_market_open": is_market_open(check_date)
    }

    if status["is_weekend"]:
        status["reason"] = "주말"
    elif status["is_holiday"]:
        status["reason"] = "공휴일"
    else:
        status["reason"] = "정상 거래일"

    return status


if __name__ == "__main__":
    """CLI로 실행 시 시장 상태 출력 및 종료 코드 반환"""
    import pytz

    # KST 기준으로 날짜 계산
    kst = pytz.timezone('Asia/Seoul')
    kst_now = datetime.now(kst)
    today = kst_now.date()

    status = get_market_status(today)

    print(f"날짜: {status['date']} ({status['weekday']})")
    print(f"상태: {status['reason']}")
    print(f"시장 개장: {'예' if status['is_market_open'] else '아니오'}")

    # GitHub Actions용 출력
    if status['is_market_open']:
        print("::notice::Market is OPEN. Proceeding with analysis.")
        sys.exit(0)  # 성공 - 분석 진행
    else:
        print(f"::notice::Market is CLOSED ({status['reason']}). Skipping analysis.")
        sys.exit(1)  # 실패 - 분석 스킵
