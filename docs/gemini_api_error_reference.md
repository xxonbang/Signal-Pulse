# Google Gemini API 오류 코드 종합 레퍼런스

> **작성일:** 2026-02-23
> **목적:** Gemini API 호출 시 발생할 수 있는 모든 오류를 분류·정리하고, 프로젝트(`signal_analysis`) 운영에 필요한 대응 전략 수립

---

## 목차

1. [HTTP 상태 코드 전체 목록](#1-http-상태-코드-전체-목록)
2. [Python SDK 에러 클래스 계층](#2-python-sdk-에러-클래스-계층)
3. [429 RESOURCE_EXHAUSTED 상세](#3-429-resource_exhausted-상세)
4. [모델별 Rate Limit (Tier별)](#4-모델별-rate-limit-tier별)
5. [일일 할당량(RPD) 리셋 시간](#5-일일-할당량rpd-리셋-시간)
6. [RPM vs RPD 프로그래밍적 구분법](#6-rpm-vs-rpd-프로그래밍적-구분법)
7. [FinishReason 열거형 (전체)](#7-finishreason-열거형-전체)
8. [BlockedReason 열거형 (전체)](#8-blockedreason-열거형-전체)
9. [Content Safety / 차단 오류](#9-content-safety--차단-오류)
10. [Google Search Grounding 관련 오류](#10-google-search-grounding-관련-오류)
11. [이미지/멀티모달 관련 오류](#11-이미지멀티모달-관련-오류)
12. [스트리밍 관련 오류](#12-스트리밍-관련-오류)
13. [빈 응답(Empty Response) 문제](#13-빈-응답empty-response-문제)
14. [RECITATION 오류](#14-recitation-오류)
15. [구조화 출력(Structured Output) 오류](#15-구조화-출력structured-output-오류)
16. [SDK 마이그레이션 이슈](#16-sdk-마이그레이션-이슈)
17. [2025년 12월 Free Tier 할당량 대폭 축소](#17-2025년-12월-free-tier-할당량-대폭-축소)
18. [알려진 버그 (GitHub Issues)](#18-알려진-버그-github-issues)
19. [권장 Retry 전략](#19-권장-retry-전략)
20. [signal_analysis 프로젝트 적용 시사점](#20-signal_analysis-프로젝트-적용-시사점)
21. [출처](#21-출처)

---

## 1. HTTP 상태 코드 전체 목록

| HTTP 코드 | gRPC Status | 의미 | 재시도 가능? | 대응 |
|-----------|-------------|------|:----------:|------|
| **400** | `INVALID_ARGUMENT` | 요청 형식 오류, 필수 필드 누락, 파라미터 범위 초과 | **X** | 요청 수정 |
| **400** | `FAILED_PRECONDITION` | 전제 조건 불충족 (지역 제한, 빌링 미활성화) | **X** | 전제 조건 해결 |
| **401** | `UNAUTHENTICATED` | API 키 누락·만료·유출 | **X** | 키 재발급 |
| **403** | `PERMISSION_DENIED` | API 미활성화, 지역 제한, ToS 위반 | **X** | 권한 설정 확인 |
| **404** | `NOT_FOUND` | 모델명 오류, 지원 종료된 모델 | **X** | 모델명 수정 |
| **429** | `RESOURCE_EXHAUSTED` | RPM/TPM/RPD 할당량 초과 | **O** | 지수 백오프 |
| **499** | `CANCELLED` | 클라이언트가 요청 취소 | - | - |
| **500** | `INTERNAL` | 서버 내부 오류 | **△** | 2~3회 재시도 후 포기 |
| **503** | `UNAVAILABLE` | 서버 과부하, 모델 오버로드 | **O** | 지수 백오프 |
| **504** | `DEADLINE_EXCEEDED` | 서버 측 5분 하드 리밋 초과 | **△** | 입력 축소 또는 모델 변경 |

### 드물게 발생하는 코드

| HTTP 코드 | gRPC Status | 의미 |
|-----------|-------------|------|
| 409 | `ABORTED` | 동시성 충돌 |
| 409 | `ALREADY_EXISTS` | 리소스 이미 존재 |
| 416 | `OUT_OF_RANGE` | 파라미터 유효 범위 초과 |
| 501 | `UNIMPLEMENTED` | 미구현 기능 요청 |

### 에러 응답 JSON 구조

```json
{
  "error": {
    "code": 429,
    "message": "Quota exceeded for metric: ...generate_content_free_tier_requests, limit: 50\nPlease retry in 34.074824224s.",
    "status": "RESOURCE_EXHAUSTED",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.QuotaFailure",
        "violations": [{
          "quotaMetric": "generativelanguage.googleapis.com/generate_content_free_tier_requests",
          "quotaId": "GenerateRequestsPerDayPerProjectPerModel-FreeTier",
          "quotaDimensions": { "location": "global", "model": "gemini-2.5-pro" },
          "quotaValue": "50"
        }]
      },
      {
        "@type": "type.googleapis.com/google.rpc.RetryInfo",
        "retryDelay": "34s"
      }
    ]
  }
}
```

---

## 2. Python SDK 에러 클래스 계층

`google-genai` (신규 통합 SDK) 기준:

```
Exception
  └── APIError          ← 모든 API 에러 베이스 (code, response, status, message)
        ├── ClientError  ← HTTP 4xx (400, 401, 403, 404, 429)
        └── ServerError  ← HTTP 5xx (500, 503, 504)

ValueError
  ├── UnknownFunctionCallArgumentError
  ├── UnsupportedFunctionError
  ├── FunctionInvocationError
  └── UnknownApiResponseError
```

**캐치 패턴:**
```python
from google.genai.errors import ClientError, ServerError, APIError

try:
    response = client.models.generate_content(...)
except ClientError as e:    # 4xx
    if e.code == 429: ...   # Rate limit
except ServerError as e:    # 5xx
    ...
```

---

## 3. 429 RESOURCE_EXHAUSTED 상세

### 할당량 차원별 분류

| 차원 | 설명 | 리셋 주기 |
|------|------|-----------|
| **RPM** (Requests Per Minute) | 분당 요청 수 | 60초 롤링 윈도우 |
| **TPM** (Tokens Per Minute) | 분당 토큰 수 (입력+출력) | 60초 롤링 윈도우 |
| **RPD** (Requests Per Day) | 일일 요청 수 | 매일 자정 PT |
| **IPM** (Images Per Minute) | 분당 이미지 수 (이미지 생성 모델 전용) | 60초 롤링 윈도우 |

### quotaId로 구분하는 방법

| quotaId 패턴 | 의미 |
|--------------|------|
| `...PerMinute...` | RPM/TPM 제한 (일시적, 재시도 가능) |
| `...PerDay...` | RPD 제한 (당일 소진, 리셋까지 대기) |
| `...FreeTier...` | 무료 티어 한도 |

### 핵심 주의사항

- **할당량은 프로젝트 단위** — 같은 프로젝트 내 여러 API 키는 할당량 공유
- **실패한 요청(400)도 TPM/RPM 소비** — 토큰 카운트가 차감됨
- **유료 티어에서도 429 발생 가능** — 내부 인프라 제한이 문서화된 한도보다 엄격할 수 있음
- **Grounding 도구는 별도 할당량** — 문서화되지 않은 별도 한도 존재 (~2k-6k/일)

---

## 4. 모델별 Rate Limit (Tier별)

### Free Tier (빌링 불필요)

| 모델 | RPM | TPM | RPD | 비고 |
|------|-----|-----|-----|------|
| Gemini 2.5 Pro | 5 | 250,000 | 100 | |
| Gemini 2.5 Flash | 10 | 250,000 | 250 | |
| Gemini 2.5 Flash-Lite | 15 | 250,000 | 1,000 | |
| Gemini 2.0 Flash | 10 | 250,000 | 250 | **2026-03-03 지원 종료 예정** |
| Gemini 2.0 Flash-Lite | 15 | 250,000 | 1,000 | **2026-03-03 지원 종료 예정** |

### Tier 1 (빌링 활성화, 즉시 업그레이드)

| 모델 | RPM | TPM | RPD |
|------|-----|-----|-----|
| Gemini 2.5 Pro | 150 | 1,000,000 | 1,500 |
| Gemini 2.5 Flash | 200 | 1,000,000 | 1,500 |
| Gemini 2.5 Flash-Lite | 300 | 1,000,000 | 1,500 |

### Tier 2 ($250 누적 지출 + 30일)

| 차원 | 범위 |
|------|------|
| RPM | 500–1,500 |
| RPD | 10,000 |
| TPM | 2,000,000 |

### Tier 3 ($1,000+ 누적 지출)

| 차원 | 범위 |
|------|------|
| RPM | 4,000+ |
| RPD | 사실상 무제한 |
| TPM | 4,000,000+ |

> **주의:** Google 공식 문서: "Specified rate limits are not guaranteed and actual capacity may vary."

---

## 5. 일일 할당량(RPD) 리셋 시간

RPD는 **미국 태평양 시간(PT) 자정**에 리셋됩니다.

| Pacific Time | UTC | **KST (한국 표준시)** |
|-------------|-----|----------------------|
| 00:00 PST (11월~3월) | 08:00 UTC | **17:00 KST (오후 5시)** |
| 00:00 PDT (3월~11월) | 07:00 UTC | **16:00 KST (오후 4시)** |

**현재 (2026년 2월):** PST 적용 → **오후 5시 KST에 리셋**

> **알려진 버그:** 일부 사용자가 자정 PT 이후에도 RPD가 리셋되지 않는 현상을 3일 이상 경험. Google 측 버그로 추정되며, 새 프로젝트 생성 외 해결책 없음.

---

## 6. RPM vs RPD 프로그래밍적 구분법

### 방법 1: `quotaId` 필드 파싱 (가장 정확)

```python
def classify_quota_error(error_details):
    for detail in error_details:
        if detail.get("@type") == "type.googleapis.com/google.rpc.QuotaFailure":
            for violation in detail.get("violations", []):
                quota_id = violation.get("quotaId", "")
                if "PerMinute" in quota_id:
                    return "RPM"   # 일시적 → 재시도 가능
                elif "PerDay" in quota_id:
                    return "RPD"   # 당일 소진 → 리셋까지 대기
    return "UNKNOWN"
```

### 방법 2: `retryDelay` 기반 휴리스틱

```python
def is_retryable(error_details):
    for detail in error_details:
        if detail.get("@type") == "type.googleapis.com/google.rpc.RetryInfo":
            delay = float(detail.get("retryDelay", "0s").rstrip("s"))
            return delay <= 300  # 5분 이하면 RPM, 이상이면 RPD
    return False
```

### 방법 3: 행동 패턴 기반 (Fallback)

- 버스트 후 에러 → 성공 반복 = **RPM**
- 요청 크기에 비례한 에러 = **TPM**
- 하루 동안 점진적 증가 → 자정 PT 후 해소 = **RPD**

> **참고:** Gemini CLI PR #18073에서 확립된 원칙: `RetryInfo`와 `QuotaFailure`가 동시에 존재하면, `RetryInfo`를 우선 적용 (RPM 제한에서도 daily quota 정보가 함께 오는 경우가 있음).

---

## 7. FinishReason 열거형 (전체)

| FinishReason | 코드 | 설명 | 대응 |
|---|:---:|---|---|
| `STOP` | 1 | 정상 종료 | 정상 |
| `MAX_TOKENS` | 2 | `max_output_tokens` 도달 | 토큰 한도 증가 또는 후속 호출 |
| `SAFETY` | 3 | 안전 필터 차단 | 프롬프트 수정, safety 설정 조정 |
| `RECITATION` | 4 | 저작권 유사 콘텐츠 감지 | 프롬프트 차별화, 온도 증가 |
| `OTHER` | 5 | 기타 차단 (ToS 위반 등) | ToS 준수 확인 |
| `LANGUAGE` | 6 | 미지원 언어 | 지원 언어 사용 |
| `BLOCKLIST` | 7 | 금칙어 포함 | 금칙어 제거 |
| `PROHIBITED_CONTENT` | 8 | 금지 콘텐츠 | 콘텐츠 수정 |
| `SPII` | 9 | 민감 개인정보 감지 | PII 제거 |
| `MALFORMED_FUNCTION_CALL` | 10 | 잘못된 함수 호출 생성 | 함수 선언 확인 |
| `UNEXPECTED_TOOL_CALL` | - | 설정 안 된 도구 호출 | 도구 설정 확인 |
| `IMAGE_SAFETY` | 11 | 이미지 안전 차단 | 이미지 콘텐츠 수정 |
| `IMAGE_PROHIBITED_CONTENT` | - | 이미지 금지 콘텐츠 | 이미지 수정 |
| `IMAGE_RECITATION` | - | 이미지 저작권 | 이미지 수정 |
| `NO_IMAGE` | - | 이미지 미생성 | 프롬프트 수정 |
| `MODEL_ARMOR` | - | Model Armor 차단 | 프롬프트 수정 |

---

## 8. BlockedReason 열거형 (전체)

`promptFeedback.blockReason`에서 프롬프트 자체가 차단된 경우:

| BlockReason | 설명 |
|---|---|
| `SAFETY` | 안전 필터 차단 |
| `OTHER` | 기타 차단 (ToS 위반) |
| `BLOCKLIST` | 금칙어 포함 |
| `PROHIBITED_CONTENT` | 금지 콘텐츠 |
| `MODEL_ARMOR` | Model Armor 차단 |
| `IMAGE_SAFETY` | 이미지 생성 시 안전 차단 |
| `JAILBREAK` | 탈옥 시도 감지 |

---

## 9. Content Safety / 차단 오류

### 안전 카테고리 (설정 가능)

- `HARM_CATEGORY_HARASSMENT` — 괴롭힘/혐오 발언
- `HARM_CATEGORY_HATE_SPEECH` — 무례/불경한 콘텐츠
- `HARM_CATEGORY_SEXUALLY_EXPLICIT` — 성적 콘텐츠
- `HARM_CATEGORY_DANGEROUS_CONTENT` — 위험 행위 조장

### 임계값 수준

| 수준 | 설명 |
|------|------|
| `BLOCK_NONE` | 모두 허용 (단, 핵심 유해 콘텐츠는 여전히 차단) |
| `BLOCK_ONLY_HIGH` | 높은 확률만 차단 |
| `BLOCK_MEDIUM_AND_ABOVE` | 중간 이상 차단 (기본값) |
| `BLOCK_LOW_AND_ABOVE` | 낮은 이상 모두 차단 |

### 주요 이슈

- **오탐(False Positive):** UN 보고서, 의학 주제 등 무해한 콘텐츠도 차단되는 사례 다수
- **`BLOCK_NONE`도 만능이 아님:** 다층 필터링 존재. `PROHIBITED_CONTENT`는 `BLOCK_NONE`으로도 해제 불가
- **아동 안전 보호는 조정 불가:** 어떤 설정으로도 비활성화 불가능

---

## 10. Google Search Grounding 관련 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| `Please use google_search field instead of google_search_retrieval` | Gemini 2.0+에서 필드명 변경 | `google_search` 사용 |
| `Unknown name 'dynamicRetrievalConfig'` | 신규 `google_search`에서 미지원 | `dynamicRetrievalConfig` 제거 |
| `Search Grounding can't be used with JSON/YAML/XML mode` | 구조화 출력과 비호환 | 별도 처리 |
| `Grounding Search and plugins together not supported` | Gemini 2.0+ 미지원 | `tools` 리스트 안에 함께 정의 |
| `429 RESOURCE_EXHAUSTED` (grounding 전용) | **별도 문서화되지 않은 할당량** | 일반 RPD와 별개. ~2k-6k/일 추정 |

> **중요:** Grounding 도구는 표준 할당량 대시보드에 표시되지 않는 **별도 할당량**이 있으며, Tier 3에서도 429가 발생할 수 있음.

---

## 11. 이미지/멀티모달 관련 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| `empty inlineData parameter` | 이미지 데이터가 비어있음 | 전송 전 null/empty 체크 |
| `Unable to process input image` | 미지원 포맷 또는 손상된 파일 | JPEG/PNG/GIF/WebP 확인 |
| `Invalid value at 'inline_data.data'` | `data:image/...;base64,` 접두사 포함 | 접두사 제거, 순수 base64만 전송 |
| Gemini 2.5 모델 비디오 바이트 실패 | SDK 버그 | [#728](https://github.com/googleapis/python-genai/issues/728) |
| `inline_data.data` 랜덤 접근 실패 | 이미지 프리뷰 모델 버그 | [#1406](https://github.com/googleapis/python-genai/issues/1406) |

---

## 12. 스트리밍 관련 오류

| 오류 | 설명 |
|------|------|
| `Model stream ended without a finish reason` | 스트림 비정상 종료 |
| `Model stream ended with empty response text` | 빈 응답으로 종료 |
| `Model stream ended with an invalid chunk` | 잘못된 청크 |
| `websockets.ConnectionClosedError: 1011 (internal error)` | Live API WebSocket 오류 |
| `Connect Timeout error when streaming via async client` | 비동기 스트리밍 타임아웃 |

---

## 13. 빈 응답(Empty Response) 문제

### 증상

- `response.text`가 빈 문자열 `""`
- `finish_reason`은 `STOP` (성공으로 보임)이지만 내용 없음
- safety_ratings도 비어있음

### 알려진 트리거

- Gemini 2.5 Pro + Grounded Search 조합
- Gemini 3.0 Pro Preview
- Free Tier 부하 시
- Apps Script에서 호출 시

### 권장 대응

```python
if not response.text or not response.text.strip():
    # finish_reason이 STOP이어도 빈 응답은 에러로 처리
    raise ValueError("Empty response despite STOP finish_reason")
```

---

## 14. RECITATION 오류

### 증상

- `finish_reason: RECITATION`으로 응답이 비거나 잘림
- `response_validation=False`로도 해결 안 됨
- Safety 설정과 달리 비활성화 불가

### 자주 발생하는 상황

- 코드 예제 작업
- 저작권 텍스트 번역
- 대용량 JSON 출력
- 코드 실행 기능 사용

### 공식 권장 해결책

1. 프롬프트에 고유한 컨텍스트 추가
2. `temperature` 증가 (더 다양한 출력 유도)
3. 스트리밍 모드 사용 (RECITATION 감지율 낮음)
4. 요약/의역 형태로 요청 변경

---

## 15. 구조화 출력(Structured Output) 오류

| 오류 | 원인 | 해결 |
|------|------|------|
| `Default value is not supported in the response schema` | Pydantic 필드에 `default=...` 사용 | `default` 제거 |
| `AnyOf is not supported in the response schema` | `Union`/`Optional` 타입 사용 | 구체 타입으로 변경 |
| `additionalProperties` 거부 | SDK가 API보다 엄격하게 검증 | 수동 스키마 딕트 구성 |
| `Search Grounding can't be used with JSON mode` | Grounding + 구조화 출력 비호환 | 별도 처리 |

---

## 16. SDK 마이그레이션 이슈

### 타임라인

| SDK | 상태 | 비고 |
|-----|------|------|
| `google-generativeai` | **2025-08-31 Deprecated** | 이전 SDK |
| `google-genai` | **GA (2025-05부터)** | 신규 통합 SDK |
| `google-cloud-aiplatform` | 2026-06-24 Sunset | Vertex AI 전용 |

### 주요 Breaking Change

```python
# 구 SDK (google-generativeai)
import google.generativeai as genai
genai.configure(api_key="...")
model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("Hello")

# 신 SDK (google-genai)
from google import genai
client = genai.Client(api_key="...")
response = client.models.generate_content(model="gemini-2.0-flash", contents="Hello")
```

> **주의:** AI 코드 생성 도구(ChatGPT, Claude 등)가 **구 SDK** 패턴을 생성하는 경우가 빈번. 코드 리뷰 시 확인 필요.

---

## 17. 2025년 12월 Free Tier 할당량 대폭 축소

2025년 12월 7일, Google이 사전 공지 없이 Free Tier 할당량을 **50~92% 축소**:

| 모델 | 변경 전 | 변경 후 | 감소율 |
|------|---------|---------|--------|
| Gemini 2.5 Pro (RPD) | 50 | **0** (무료 제거) | 100% |
| Gemini 2.5 Flash (RPD) | 250 | 20~50 | 80~92% |
| Gemini 2.0 Flash (RPM) | 10 | 5 | 50% |

**사유 (Logan Kilpatrick, Google PM):** "원래 단일 주말만 제공할 예정이었던 관대한 한도가 수개월간 실수로 유지됨. 대규모 부정 사용으로 인해 축소."

> 2026년 2월 현재 일부 복구되었으나, 변동이 계속되고 있음.

---

## 18. 알려진 버그 (GitHub Issues)

### googleapis/python-genai (신 SDK)

| 이슈 | 설명 |
|------|------|
| [#17](https://github.com/googleapis/python-genai/issues/17) | Google Search 도구 사용 후 유휴 상태에서 첫 요청 즉시 429 |
| [#460](https://github.com/googleapis/python-genai/issues/460) | 구조화 출력 정상 동작 안 함 |
| [#680](https://github.com/googleapis/python-genai/issues/680) | File API 서버 에러: JSON 변환 실패 |
| [#699](https://github.com/googleapis/python-genai/issues/699) | Pydantic default 필드값 거부 |
| [#728](https://github.com/googleapis/python-genai/issues/728) | Gemini 2.5 모델 비디오 바이트 실패 |
| [#1083](https://github.com/googleapis/python-genai/issues/1083) | AIOHTTP 세션 미공유, 동시성 에러 |
| [#1289](https://github.com/googleapis/python-genai/issues/1289) | Gemini 2.5 Pro Free Tier 빈 응답 빈발 |
| [#1341](https://github.com/googleapis/python-genai/issues/1341) | Batch API 약 50% 에러율 |
| [#1373](https://github.com/googleapis/python-genai/issues/1373) | Gemini 2.5 Pro/Flash 지속적 503 |
| [#1427](https://github.com/googleapis/python-genai/issues/1427) | Grounding 도구 429 RESOURCE_EXHAUSTED |
| [#1606](https://github.com/googleapis/python-genai/issues/1606) | AI 코드 생성이 구 SDK 패턴을 생성하여 생태계 혼란 |
| [#1815](https://github.com/googleapis/python-genai/issues/1815) | additionalProperties SDK 검증이 API보다 엄격 |

### gemini-cli

| 이슈 | 설명 |
|------|------|
| [#9248](https://github.com/google-gemini/gemini-cli/issues/9248) | RPM을 RPD로 잘못 분류하여 불필요한 모델 전환 |
| [#18073](https://github.com/google-gemini/gemini-cli/pull/18073) | RetryInfo를 QuotaFailure보다 우선시하도록 수정 |
| [#11939](https://github.com/google-gemini/gemini-cli/issues/11939) | 토큰 수 초과 시 에러 |
| [#15184](https://github.com/google-gemini/gemini-cli/issues/15184) | 토큰 초과 에러가 TPM 할당량 소비 |

---

## 19. 권장 Retry 전략

### 에러별 의사결정 매트릭스

| HTTP 코드 | 재시도? | 전략 |
|-----------|:-------:|------|
| 400 | X | 요청 수정 |
| 401/403 | X | 인증/권한 수정 |
| 404 | X | 모델명/엔드포인트 수정 |
| **429** | **O** | 지수 백오프 + 지터 |
| **500** | △ | 2~3회 재시도 후 포기 |
| **503** | **O** | 지수 백오프 + 지터 (30초~) |
| **504** | △ | 입력 축소 후 재시도 |

### 지수 백오프 구현 (Python)

```python
import time, random

def call_with_backoff(func, max_retries=5, base_delay=1, max_delay=60):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            code = getattr(e, 'code', None)
            if code in (429, 500, 503):
                delay = min(base_delay * (2 ** attempt), max_delay)
                jitter = random.uniform(0, delay * 0.1)
                time.sleep(delay + jitter)
            else:
                raise
    raise Exception("Max retries exceeded")
```

### Google 공식 권장사항

1. 공식 SDK의 내장 `RetryConfig` 사용
2. 응답의 `retryDelay` 파싱하여 최소 대기 시간으로 활용
3. 지터(jitter) 추가 — Thundering Herd 방지
4. RPD 소진 감지 시 즉시 실패 처리 (재시도 낭비 방지)
5. 모델 폴백 고려 (Pro → Flash → Flash-Lite)
6. 대용량 작업은 Batch API 사용 (별도 할당량)

---

## 20. signal_analysis 프로젝트 적용 시사점

### 프로젝트 키 구성

**모든 API 키는 별도 Google Cloud 프로젝트 기반으로 생성되어 일일 할당량(RPD)을 공유하지 않음.**
- 키 5개 × Free Tier RPD 100 = 총 500 RPD/일 (gemini-2.5-flash 기준: 키 5개 × 250 = 1,250)
- 429 발생 시 다른 키는 독립된 프로젝트이므로 **즉시 전환 가능** (대기 불필요)

### 현재 구현 (적용 완료)

| 항목 | 구현 내용 |
|------|----------|
| RPM vs RPD 구분 | `_parse_quota_type()` — `quotaId`의 `PerDay`/`PerMinute` 패턴 매칭 + `consecutive_429 >= 3` 휴리스틱 병행 |
| retryDelay 활용 | `_parse_retry_delay()` — 에러 메시지에서 대기 시간 추출, RPM 쿨다운에 반영 |
| 429 후 키 전환 | 다른 프로젝트 키가 남아있으면 1~3초만 대기 후 즉시 전환 (불필요한 60초 대기 제거) |
| FinishReason 검사 | `_check_finish_reason()` — SAFETY/RECITATION/PROHIBITED_CONTENT 감지 후 재시도 |
| 빈 응답 처리 | `response.text.strip()` 추가 — 공백만 있는 응답도 감지 |
| 400 에러 분리 | 요청 문제로 판단하여 키 보존 + 즉시 종료 (이전: 키를 잘못 소진 처리) |
| 503/504 차별화 | 503: 긴 백오프 (30~120초), 504: 짧은 백오프 + 5분 서버 제한 로그 |

### 남은 과제

| 항목 | 현재 | 비고 |
|------|------|------|
| 모델 지원 종료 | `gemini-2.0-flash` 사용 중 | **2026-03-03 지원 종료 예정** → `gemini-2.5-flash`로 마이그레이션 필요 |
| Grounding 할당량 | 일반 할당량과 합산 | 별도 문서화되지 않은 한도 존재 (~2k-6k/일). 현재 모니터링 없음 |

### 긴급: Gemini 2.0 Flash 지원 종료 (2026-03-03)

`config/settings.py`에서 사용 중인 `gemini-2.0-flash` 및 `gemini-2.0-flash-lite`가 **2026년 3월 3일에 지원 종료** 예정. `gemini-2.5-flash` / `gemini-2.5-flash-lite`로 마이그레이션 필요.

---

## 21. 출처

### Google 공식 문서
- [Gemini API Troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Safety Settings](https://ai.google.dev/gemini-api/docs/safety-settings)
- [Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search)
- [Available Regions](https://ai.google.dev/gemini-api/docs/available-regions)
- [Migration Guide](https://ai.google.dev/gemini-api/docs/migrate)
- [Vertex AI API Errors Reference](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/api-errors)
- [Error Code 429 (Vertex AI)](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/provisioned-throughput/error-code-429)
- [Handle 429 Errors (Google Cloud Blog)](https://cloud.google.com/blog/products/ai-machine-learning/learn-how-to-handle-429-resource-exhaustion-errors-in-your-llms)

### 커뮤니티 / 가이드
- [Gemini by Example: Rate Limits & Retries](https://geminibyexample.com/029-rate-limits-retries/)
- [Gemini API Rate Limits 2026: Complete Per-Tier Guide](https://www.aifreeapi.com/en/posts/gemini-api-rate-limits-per-tier)
- [Gemini API Free Tier Rate Limits 2026](https://www.aifreeapi.com/en/posts/gemini-api-free-tier-rate-limits)
- [Gemini API Rate Limits 2026 Developer Guide](https://blog.laozhang.ai/en/posts/gemini-api-rate-limits-guide)
- [Interpreting Google AI Studio Rate Limits](https://help.apiyi.com/en/google-ai-studio-rate-limits-2026-guide-en.html)
- [Gemini API Error 401 Troubleshooting](https://www.aifreeapi.com/en/posts/gemini-api-error-401-troubleshooting)
- [FAILED_PRECONDITION Guide](https://www.aifreeapi.com/en/posts/gemini-api-request-failed-precondition)

### Google AI Forum
- [429 RESOURCE_EXHAUSTED on Paid API](https://discuss.ai.google.dev/t/429-resource-exhausted-error-on-paid-api-despite-being-far-below-all-quota-limits/111855)
- [429 errors despite waiting after retryDelay](https://discuss.ai.google.dev/t/429-errors-despite-waiting-after-retrydelay/96899)
- [504 Deadline Exceeded](https://discuss.ai.google.dev/t/504-deadline-exceeded-error/81769)
- [Frequent 503 Errors](https://discuss.ai.google.dev/t/frequent-503-errors-service-unavailable-across-all-models/116450)
- [Rate Limit Reset Discussion](https://discuss.ai.google.dev/t/api-rate-limit-reset/6851)
- [Rate Limit Not Resetting](https://support.google.com/gemini/thread/393202846)
- [Grounding + JSON Incompatible](https://discuss.ai.google.dev/t/rest-api-grounding-and-json-responses-not-compatible/73101)
- [Grounding 429 on Tier 3](https://discuss.ai.google.dev/t/429-resource-exhausted-when-using-grounding-tool-on-tier-3-api-key/123549)
- [Empty Response Text](https://discuss.ai.google.dev/t/gemini-2-5-pro-with-empty-response-text/81175)

### 한국어 커뮤니티
- [Postype: Gemini API 정책 변경 및 대응 가이드](https://www.postype.com/@zz-kyun-j/post/21053239)
- [Clien: 구글 제미나이 무료 API 키 사용기](https://www.clien.net/service/board/use/19096819)
- [Svrforum: 제미나이 API 과금문제 해결](https://svrforum.com/software/2525266)
- [Velog: Gemini API 트러블슈팅](https://velog.io/@kdy5487/Gemini-API-%ED%8A%B8%EB%9F%AC%EB%B8%94%EC%8A%88%ED%8C%85)
- [WikiDocs: 자세히 쓰는 Gemini API](https://wikidocs.net/book/14285)

### GitHub Issues
- [python-genai Repository](https://github.com/googleapis/python-genai/issues)
- [gemini-cli Repository](https://github.com/google-gemini/gemini-cli/issues)
- [PR #18073: Prioritize RetryInfo over QuotaFailure](https://github.com/google-gemini/gemini-cli/pull/18073)
