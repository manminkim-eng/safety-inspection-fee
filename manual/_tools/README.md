# 매뉴얼 생성 도구 (안전점검등 대가 산출기 · 건축물)

| 파일 | 하는 일 |
|---|---|
| `build.sh <repo> <raw>` | 캡처 → WebP → HTML → PDF → 검증을 한 번에 |
| `capture_sif.js` | 앱 화면 24장 캡처, 번호 표시점(`_marks.json`) · 예제 값(`_example.json`) 기록 (1440×900, 배율 1.25, 날짜 고정 2026-11-09) |
| `serve.js` | 로컬 서버 (Windows 실행판 — CDN 통과) |
| `gen_manual_sif.py` · `manual_engine.py` | 매뉴얼 본문 → `manual/index.html` (예제 수치는 `_example.json`에서 읽음) |
| `pdf_sif.js` | A4 PDF |
| `dump_sif_cases.js` · `verify_sif_calc.py` | 앱에 무작위 입력 800건 → 고시 원문(.md) 기준표로 독립 재계산 대조 + 별표 22 · 23 · 26 · 제62조 표 대조 |
| `verify_manual.py` | 그림 · 표시점 · 범례 수, 예제 수치, 내부 링크, 앱 근거 표기 · 매뉴얼 버튼 검사 |

환경 변수: `MM_PW`(playwright 모듈 경로) · `NODE` · `PY` · `SIF_SRC`(고시 원문 정리본 폴더) · `MANUAL_DIR`

이 PC(Windows) 실행 예:
`MM_PW=C:/Users/user/miniconda3/Lib/site-packages/playwright/driver/package NODE=/c/Users/user/miniconda3/Lib/site-packages/playwright/driver/node.exe bash build.sh ../.. <임시폴더>`

고시나 노임단가가 바뀌면 ① 앱 `index.html`의 기준표 · 단가 · 근거 표기를 고치고 ② `gen_manual_sif.py`의 고시 번호 · 표 · 단가를 고친 뒤 ③ `build.sh`를 다시 돌린다.
