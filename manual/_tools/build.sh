#!/bin/bash
# 매뉴얼 전체 재생성: 캡처 → WebP → HTML → PDF → 검증   usage: bash build.sh <repoDir> <rawDir>
# 환경: MM_PW(playwright 경로) · NODE(node 실행 파일, 기본 node) · PY(python, 기본 python) · SIF_SRC(고시 원문 .md 폴더, 기본 Y:\5.안전진단\…)
set -e; cd "$(dirname "$0")"; REPO="$(cd "$1" && (pwd -W 2>/dev/null || pwd))"; RAW="$2"; M="$REPO/manual"; NODE="${NODE:-node}"; PY="${PY:-python}"; rm -rf "$RAW"; mkdir -p "$RAW" "$M/images"
"$NODE" capture_sif.js "$REPO" "$RAW" > "$RAW/_log.json"
"$PY" -X utf8 - "$RAW" "$M" <<'PY'
import sys,glob,os,shutil
from PIL import Image
raw,M=sys.argv[1],sys.argv[2]
for f in glob.glob(M+'/images/s*.webp'): os.remove(f)
for f in sorted(glob.glob(raw+'/s*.png')): Image.open(f).convert('RGB').save(M+'/images/'+os.path.basename(f)[:-4]+'.webp',quality=82,method=6)
shutil.copy(raw+'/_marks.json',M+'/images/_marks.json'); shutil.copy(raw+'/_example.json',M+'/_tools/_example.json')
PY
MANUAL_DIR="$M" "$PY" -X utf8 gen_manual_sif.py
"$NODE" pdf_sif.js "$M" SIF_사용자매뉴얼_Ver-1.0.pdf "안전점검등 대가 산출기 사용자 매뉴얼 Ver-1.0"
"$NODE" dump_sif_cases.js "$REPO" "$RAW/_cases.json" 800
"$PY" -X utf8 verify_sif_calc.py "$RAW/_cases.json" ${SIF_SRC:+"$SIF_SRC"}
"$PY" -X utf8 verify_manual.py "$REPO"
