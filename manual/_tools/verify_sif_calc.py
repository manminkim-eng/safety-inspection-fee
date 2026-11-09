# -*- coding: utf-8 -*-
"""안전점검등 대가 산출기 — 독립 검증 (작업지시서 v1.61 §3-5)
usage: python -X utf8 verify_sif_calc.py <cases.json> [고시 원문 .md 폴더]

① 기준표 대조 — 고시 제2026-444호 원문 정리본(.md)에서 별표 22(건축물 · 제1종/제2종 성능평가) ·
   별표 23 다목 · 별표 26 제10호(3) · 제62조 표를 읽어 앱 상수와 한 칸씩 비교한다.
② 계산 대조 — dump_sif_cases.js 가 앱에 넣은 무작위 입력을 분수(Fraction)로 처음부터 다시 계산해
   앱 결과(인원 · 직접인건비 · 제경비 · 기술료 · 직접경비 7항목 · 보정 · 선택과업 · 공급가액 · VAT · 견적금액)와 비교한다.
   앱 코드를 옮겨 쓰지 않고 고시 문장대로 다시 짰다(보간 기준점 = 별표 24의 '인접한 작은 쪽 · 큰 쪽 기준점')."""
import sys, os, re, json, math
from fractions import Fraction as F

SRC = sys.argv[2] if len(sys.argv) > 2 else r'Y:\5.안전진단\A.기준자료\03.대가기준\안전점검[국토교통부2026-444호,2026.08.21]'
data = json.load(open(sys.argv[1], encoding='utf-8'))
K_ = data['consts']; ok = True
def chk(name, cond, info=''):
    global ok; ok &= bool(cond); print(('✓' if cond else '✗'), name, info)
def rd(name): return open(os.path.join(SRC, name), encoding='utf-8').read()

# ── ① 원문 기준표 ──────────────────────────────────────────────
t22 = rd('[별표22] 시설물별 직접인건비 기준인원수.md')
def num(s): s = s.strip().replace(',', ''); return None if s in ('–', '-', '') else int(s)
blk = t22.split('### ★ 건축물')[1].split('###')[0]
ORIG = {'diag': {}, 'prec': {}, 'reg': {}}
for r in re.findall(r'^\|\s*([\d,]+)\s*㎡\s*\|(.+)\|\s*$', blk, re.M):
    x = int(r[0].replace(',', '')); c = [num(v) for v in r[1].split('|')]
    for i, k in enumerate(('diag', 'prec', 'reg')):
        if c[2*i] is not None: ORIG[k][x] = (c[2*i], c[2*i+1])
for sec, keys in (('## 2. 제1종성능평가', ('p1only', 'p1with', 'p1use')), ('## 3. 제2종성능평가', ('p2only', 'p2with', 'p2use'))):
    b = t22.split(sec)[1].split('\n## ')[0]
    for k in keys: ORIG[k] = {}
    for r in re.findall(r'^\|\s*([\d,]+)\s*㎡\s*\|(.+)\|\s*$', b, re.M):
        x = int(r[0].replace(',', '')); c = [v.strip() for v in r[1].split('|')]
        for i, k in enumerate(keys):
            a, o = c[i].split('/'); ORIG[k][x] = (int(a), int(o))
bad = []
for k, tb in ORIG.items():
    app = K_['P_TBL'][k]; got = {x: (a, o) for x, a, o in zip(app['x'], app['a'], app['o'])}
    if got != tb: bad.append(k)
chk('별표 22 기준인원수 9종 = 원문', not bad and len(ORIG) == 9, f'{sum(len(v) for v in ORIG.values())}칸 ' + str(bad))

t23 = rd('[별표23] 시설물별 조정비.md').split('## ★ 다. 건축물')[1].split('\n## ')[0]
st = dict((a.strip(), float(b)) for a, b in re.findall(r'^\|\s*([^|]+?)\s*\|\s*([\d.]+)\s*\|\s*$', t23.split('### (2)')[0], re.M))
us = dict((a.strip(), float(b)) for a, b in re.findall(r'^\|\s*([^|]+?)\s*\|\s*([\d.]+)\s*\|\s*$', t23.split('### (2)')[1], re.M))
norm = lambda s: s.replace(' ', '').replace('·', ',').replace('(', ',').replace(')', '')
chk('별표 23 다목(1) 구조형식 7종 = 원문', len(st) == 7 and all(st.get(n) == v for n, v in K_['STRUCT']), str(st))
uapp = {norm(n): v for n, v in K_['USE']}; uorg = {norm(n): v for n, v in us.items()}
chk('별표 23 다목(2) 용도 5종 = 원문', len(us) == 5 and sorted(uapp.values()) == sorted(uorg.values()) and uapp.get('주거용') == 1.1 and uapp.get('특수용') == 1.2, str(us))

t26 = rd('[별표26] 선택과업 비용 기준.md').split('### ★ (3) 건축물')[1].split('###')[0]
v26 = [int(v) for v in re.findall(r'\|\s*(\d+)\s*\|\s*$', t26, re.M)]
app26 = K_['ANA_TBL']['rc'] + K_['ANA_TBL']['pc'] + K_['ANA_TBL']['sp']
chk('별표 26 제10호(3) 구조해석 15칸 = 원문', v26 == app26, str(v26))

t6 = rd('00_제6장 비용의 산정기준(제55조-제62조).md')
age = [float(v) for v in re.findall(r'^\|\s*\d+년[^|]*\|\s*([\d.]+)\s*\|', t6, re.M)][:5]
chk('제62조 경과년수 보정 5단계 = 원문', age == [1.0, 1.05, 1.1, 1.15, 1.2], str(age))
chk('제62조 전차보고서 보정 = 원문', '0.97' in t6 and '0.95' in t6 and [p[1] for p in K_['PREV']] == [1.0, 0.97, 0.95])
t25 = rd('[별표21,24,25,27] 기준시설물-보간-직접경비-군집시설물.md')
chk('별표 25 차량 손료계수 1,547×10⁻⁷ = 원문', '1,547' in t25 and abs(K_['CAR_K'] - 1547e-7) < 1e-15)

# ── ② 독립 재계산 ──────────────────────────────────────────────
STRUCT = [F(str(v)) for _, v in K_['STRUCT']]; USE = [F(str(v)) for _, v in K_['USE']]; PREV = [F(str(v)) for _, v in K_['PREV']]
TRV = {'reg': 2, 'prec': 8, 'diag': 10, 'p1only': 10, 'p1with': 10, 'p1use': 10, 'p2only': 8, 'p2with': 8, 'p2use': 8}   # 별표 25 제1호 여비 인원
ANA = {'rc': [7, 8, 11, 14, 21], 'pc': [11, 12, 16, 21, 32], 'sp': None}
ANA['sp'] = v26[10:15]; AX = [5000, 10000, 30000, 50000, 100000]

def half_up(v, d):            # 사사오입(제56조④⑤)
    q = F(10) ** d; return F(math.floor(v * q + F(1, 2)), q)
def interp(x, pts):           # 별표 24 — x₁ = 인접한 작은 쪽 기준점, x₂ = 인접한 큰 쪽 기준점(원점 금지). 범위 밖(A·C점)은 끝의 두 점으로 외삽
    xs = sorted(pts)
    if x <= xs[0]: a, b = xs[0], xs[1]
    elif x >= xs[-1]: a, b = xs[-2], xs[-1]
    else: a = max(p for p in xs if p <= x); b = min(p for p in xs if p > x)
    return lambda y: y(a) + (y(b) - y(a)) * (x - a) / (b - a)
def persons(task, area):
    tb = ORIG[task]; f = interp(F(str(area)), tb.keys())
    return max(F(0), half_up(f(lambda p: F(tb[p][0])), 1)), max(F(0), half_up(f(lambda p: F(tb[p][1])), 1))
def age_f(y): return F(1) if y <= 15 else F(105, 100) if y <= 25 else F(110, 100) if y <= 35 else F(115, 100) if y <= 55 else F(120, 100)
fl = lambda v: math.floor(v)

def core(task, units, I, mR, prt):
    pA = pO = F(0); rows = []
    for u in units:
        a, o = persons(task, u['area'])
        al, ou = half_up(a * u['adj'] * u['f'], 3), half_up(o * u['adj'] * u['f'], 3)
        pA += al; pO += ou; rows.append((al, ou))
    R = I['R']; labor = fl(pA * R); over = fl(F(labor) * I['oR'] / 100); tech = fl(F(labor + over) * I['tR'] / 100)
    days = I['days'] if I['days'] > 0 else max(1, math.ceil(pO / 4))
    cars = max(1, math.ceil(pO / days / 4))
    travel = TRV[task] * I['fare'] * 2
    stay = fl(pO * I['perDiem']) + I['lodgeN'] * I['lodgeRate']
    carHr = fl(F(I['carPrice']) * F(1547, 10**7) + F(1, 2))
    carDay = carHr * F(str(I['carHours'])) + 10 * I['fuel'] + fl(F(10 * I['fuel']) / 10)
    car = carDay * cars * days
    helper = fl(half_up(pO * F(4, 10), 3) * I['helper'])
    danger = fl(F(fl(pO * R)) * I['dR'] / 100)
    mach = fl(F(labor) * F(str(mR)) / 100)
    exp = travel + stay + car + helper + danger + mach + prt
    return dict(rows=rows, pAll=pA, pOut=pO, labor=labor, over=over, tech=tech, days=days, cars=cars, travel=travel, stay=stay, car=car,
                helper=helper, danger=danger, mach=mach, prt=prt, exp=exp, basic=labor + over + tech + exp)

def calc(I):
    B = [b for b in I['bld'] if b['area'] > 0]
    for b in B: b['adj'] = half_up(STRUCT[b['st']] * USE[b['us']], 3)
    if len(B) == 1: units = [dict(area=B[0]['area'], adj=B[0]['adj'], f=F(1))]
    elif not I['cluster']: units = [dict(area=b['area'], adj=b['adj'], f=F(1)) for b in B]       # 군집 아님 — 동마다 기본시설물
    else:                                                                                       # 별표 27 군집시설물
        small = [b for b in B if b['area'] < 1000]; big = [b for b in B if b['area'] >= 1000]
        lst = [dict(area=b['area'], adj=b['adj']) for b in big]
        if small:
            sa = sum(F(str(b['area'])) for b in small)
            adj = small[0]['adj'] if len(small) == 1 else half_up(sum(b['adj'] * F(str(b['area'])) for b in small) / sa, 3)   # 제56조⑥ 면적 가중 평균조정비
            lst.append(dict(area=float(sa), adj=adj))
        if not big: units = [dict(lst[-1], f=F(1))]
        else:
            mi = max(range(len(lst)), key=lambda i: (lst[i]['area'], -i))
            units = [dict(u, f=F(1) if i == mi else F(7, 10)) for i, u in enumerate(lst)]
    C = core(I['task'], units, I, I['mR'], I['prt'])
    tot = sum(F(str(b['area'])) for b in B)
    cf = [half_up(age_f(max(0, I['repYear'] - b['yr']) if b['yr'] else 0) * PREV[b['pv']], 3) for b in B]
    cAvg = half_up(sum(c * F(str(b['area'])) for c, b in zip(cf, B)) / tot, 3)
    K = half_up(cAvg * (1 + F(I['cx'], 100)), 3)
    basicK = fl(K * C['basic'])
    opt = []
    if I['draw'] > 0:
        D = core('diag', units, I, 10, I['prt']); opt.append(fl(F(fl(K * D['basic'])) * I['draw'] / 100))   # 별표 26 제1호
    if I['ana'] != 'none':
        aA = float(I['anaArea']) if I['anaArea'] not in ('', None) and float(I['anaArea']) > 0 else float(tot)
        if I['anaType'] == 'rc' and aA <= 5000: base = F(7)
        else:
            tb = dict(zip(AX, ANA[I['anaType']])); base = interp(F(str(aA)), tb.keys())(lambda p: F(tb[p]))
        pA = half_up(base, 1); mul = F(1)
        if I['ana'] == 'seis1': mul = F(2)
        if I['ana'] == 'seis2': mul = min(F(3), max(F(5, 2), F(str(float(I['seisMul']) or 2.5))))
        p = half_up(pA * mul, 1); lab = fl(p * I['R']); ov = fl(F(lab) * I['oR'] / 100); te = fl(F(lab + ov) * I['tR'] / 100)
        opt.append(lab + ov + te)
    opt += [e['amt'] for e in I['etc'] if e['it'] and e['amt'] > 0]
    sub = basicK + sum(opt); vat = fl(F(sub) / 10) if I['vat'] else 0; gross = sub + vat
    return dict(C, cAvg=cAvg, K=K, basicK=basicK, opt=opt, optSum=sum(opt), sub=sub, vat=vat, gross=gross, total=gross // I['cut'] * I['cut'])

KEYS = ('pAll', 'pOut', 'labor', 'over', 'tech', 'days', 'cars', 'travel', 'stay', 'car', 'helper', 'danger', 'mach', 'prt', 'exp', 'basic', 'cAvg', 'K', 'basicK', 'optSum', 'sub', 'vat', 'gross', 'total')
mism = []; n = 0; kinds = {}
for i, c in enumerate(data['cases']):
    if c['out'] is None: continue
    n += 1; kinds[c['out']['ctype']] = kinds.get(c['out']['ctype'], 0) + 1
    r = calc(c['in'])
    for k in KEYS:
        if abs(float(r[k]) - float(c['out'][k])) > 1e-6: mism.append((i, k, float(r[k]), c['out'][k])); break
    else:
        if [float(v) for v in r['opt']] != [float(v) for v in c['out']['opt']]: mism.append((i, 'opt', r['opt'], c['out']['opt']))
chk(f'무작위 {n}건 재계산 = 앱 (항목 {len(KEYS)}개)', not mism, str(mism[:4]))
print('  유형 분포:', json.dumps(kinds, ensure_ascii=False))
chk('앱 실행 오류 없음', not data['errs'], str(data['errs'][:3]))
sys.exit(0 if ok else 1)
