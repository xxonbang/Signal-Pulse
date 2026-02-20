"""
네이버 뉴스 API 모듈
종목별 최신 뉴스 수집
"""
import os
import re
import time
import requests
from datetime import datetime
from html import unescape
from typing import Dict, List, Any, Optional


# 영문 종목명 → 한글 별칭 (뉴스 검색 보완용)
_KOREAN_ALIASES = {
    "NAVER": "네이버",
    "NHN": "엔에이치엔",
    "NCsoft": "엔씨소프트",
    "KT&G": "케이티앤지",
}


class NaverNewsAPI:
    """네이버 검색 API를 활용한 뉴스 수집"""

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        request_delay: float = 0.1,
        max_retries: int = 3,
    ):
        self.client_id = client_id or os.getenv("NAVER_CLIENT_ID", "")
        self.client_secret = client_secret or os.getenv("NAVER_CLIENT_SECRET", "")
        self.api_url = "https://openapi.naver.com/v1/search/news.json"
        self.request_delay = request_delay
        self.max_retries = max_retries
        self._last_request_time = 0

    def is_configured(self) -> bool:
        """API 키가 설정되어 있는지 확인"""
        return bool(self.client_id and self.client_secret)

    def _wait_for_rate_limit(self):
        """Rate limit 대응을 위한 딜레이"""
        elapsed = time.time() - self._last_request_time
        if elapsed < self.request_delay:
            time.sleep(self.request_delay - elapsed)
        self._last_request_time = time.time()

    def _clean_html(self, text: str) -> str:
        """HTML 태그 및 특수문자 제거"""
        if not text:
            return ""
        # HTML 엔티티 디코딩 (&amp; -> &, &lt; -> < 등)
        text = unescape(text)
        # HTML 태그 제거
        text = re.sub(r'<[^>]+>', '', text)
        # 연속 공백 제거
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _parse_date(self, date_str: str) -> str:
        """날짜 문자열 파싱

        입력: "Mon, 02 Feb 2026 14:30:00 +0900"
        출력: "02-02 14:30"
        """
        try:
            dt = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
            return dt.strftime("%m-%d %H:%M")
        except Exception:
            return date_str[:16] if date_str else ""

    def search_news(
        self,
        query: str,
        display: int = 3,
        sort: str = "date",
    ) -> List[Dict[str, Any]]:
        """뉴스 검색

        Args:
            query: 검색어 (종목명)
            display: 검색 결과 개수 (최대 100)
            sort: 정렬 방식 (date: 최신순, sim: 정확도순)

        Returns:
            뉴스 리스트
        """
        if not self.is_configured():
            return []

        self._wait_for_rate_limit()

        headers = {
            "X-Naver-Client-Id": self.client_id,
            "X-Naver-Client-Secret": self.client_secret,
        }

        params = {
            "query": query,
            "display": display,
            "start": 1,
            "sort": sort,
        }

        for attempt in range(self.max_retries):
            try:
                response = requests.get(
                    self.api_url,
                    headers=headers,
                    params=params,
                    timeout=10,
                )

                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])

                    # 데이터 정제
                    cleaned_items = []
                    for item in items:
                        cleaned_items.append({
                            "title": self._clean_html(item.get("title", "")),
                            "link": item.get("link", ""),
                            "description": self._clean_html(item.get("description", "")),
                            "pubDate": self._parse_date(item.get("pubDate", "")),
                            "originallink": item.get("originallink", ""),
                        })
                    return cleaned_items

                elif response.status_code == 429:
                    # Rate limit - exponential backoff
                    wait_time = (2 ** attempt) * 0.5
                    if attempt < self.max_retries - 1:
                        print(f"  [WARN] Rate limit, 재시도 대기 {wait_time}초...")
                        time.sleep(wait_time)
                        continue
                    else:
                        print("  [ERROR] Rate limit 초과: 최대 재시도 횟수 도달")
                        return []

                else:
                    print(f"  [ERROR] API 응답 에러: {response.status_code}")
                    return []

            except requests.exceptions.Timeout:
                print(f"  [WARN] 타임아웃, 재시도 {attempt + 1}/{self.max_retries}")
                if attempt < self.max_retries - 1:
                    time.sleep(1)
                    continue
                return []

            except Exception as e:
                print(f"  [ERROR] 요청 실패: {e}")
                return []

        return []

    def _detect_korean_alias(self, stock_name: str, raw_results: List[Dict]) -> Optional[str]:
        """영문 종목명의 한글 별칭을 검색 결과에서 자동 감지

        "NAVER 주가" 검색 시, 제목에 "NAVER"는 없지만 "네이버"로 시작하는
        기사들이 존재. 이 패턴에서 한글 별칭을 추출한다.
        """
        # 한글이 포함된 종목명은 별칭 불필요
        if re.search(r'[가-힣]', stock_name):
            return None

        # 영문 종목명이 없는 제목들에서 첫 한글 단어 추출
        candidates: Dict[str, int] = {}
        for n in raw_results:
            title = n["title"]
            if stock_name not in title:
                match = re.match(r'([가-힣]{2,})', title)
                if match:
                    word = match.group(1)
                    candidates[word] = candidates.get(word, 0) + 1

        if not candidates:
            return None

        # 가장 빈도 높은 한글 단어 (최소 2회 이상)
        best = max(candidates, key=candidates.get)
        if candidates[best] >= 2:
            return best
        return None

    def get_stock_news(self, stock_name: str, count: int = 3) -> List[Dict]:
        """종목명으로 뉴스 검색 (정확도순 수집 → 제목 필터 → 최신순 정렬)

        Args:
            stock_name: 종목명 (예: "삼성전자")
            count: 뉴스 개수

        Returns:
            뉴스 리스트
        """
        # 1. sim(정확도순)으로 충분한 양 수집
        raw = self.search_news(f"{stock_name} 주가", display=20, sort="sim")

        # 2. 제목에 종목명 포함 + 봇 기사 제거
        filtered = [
            n for n in raw
            if stock_name in n["title"]
            and not re.search(r"주가,\s*\d", n["title"])
        ]

        # 3. 결과 부족 시 한글 별칭으로 재검색 (NAVER→네이버 등)
        alias = _KOREAN_ALIASES.get(stock_name)
        if len(filtered) < count and not alias:
            alias = self._detect_korean_alias(stock_name, raw)
            if alias:
                _KOREAN_ALIASES[stock_name] = alias
                print(f"  [AUTO] 한글 별칭 감지: {stock_name} → {alias}")

        if len(filtered) < count and alias:
            seen_links = {n["link"] for n in filtered}
            raw_alias = self.search_news(f"{alias} 주가", display=20, sort="sim")
            for n in raw_alias:
                if (alias in n["title"]
                        and not re.search(r"주가,\s*\d", n["title"])
                        and n["link"] not in seen_links):
                    filtered.append(n)

        # 4. 최신순 재정렬 (pubDate: "MM-DD HH:MM" 형식)
        filtered.sort(key=lambda n: n["pubDate"], reverse=True)

        return filtered[:count]

    def get_multiple_stocks_news(
        self,
        stocks: List[Dict[str, Any]],
        news_count: int = 3,
    ) -> Dict[str, List[Dict]]:
        """여러 종목의 뉴스 일괄 수집

        Args:
            stocks: 종목 리스트 [{"code": "005930", "name": "삼성전자"}, ...]
            news_count: 종목당 뉴스 개수

        Returns:
            {종목코드: [뉴스리스트], ...}
        """
        result = {}
        total = len(stocks)

        for idx, stock in enumerate(stocks, 1):
            code = stock.get("code", "")
            name = stock.get("name", "")

            if not name:
                continue

            if idx % 10 == 0 or idx == 1:
                print(f"  뉴스 수집 중... {idx}/{total}")

            news = self.get_stock_news(name, count=news_count)
            result[code] = news

        return result


def collect_news_for_stocks(stocks: List[Dict[str, Any]], news_count: int = 3) -> Dict[str, List[Dict]]:
    """종목 리스트에 대한 뉴스 수집 (외부 호출용)

    Args:
        stocks: 종목 리스트
        news_count: 종목당 뉴스 개수

    Returns:
        {종목코드: [뉴스리스트], ...}
    """
    api = NaverNewsAPI()

    if not api.is_configured():
        print("  [SKIP] 네이버 API 키가 설정되지 않아 뉴스 수집을 건너뜁니다")
        return {}

    print(f"  네이버 뉴스 API로 {len(stocks)}개 종목 뉴스 수집 시작")
    return api.get_multiple_stocks_news(stocks, news_count)
