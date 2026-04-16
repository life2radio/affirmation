// ==========================================
// app.js - 64가지 세부 유형 심리테스트 함수 (최종 완성본)
// 기존 app.js에서 calcAndShowResult + showPsychResult만 교체하면 됨
// ==========================================

// ============================================
// [교체 1] 채점 및 동물 판별 함수
// ============================================
function calcAndShowResult(){
    if(!safeGetItem('my_email','')) window._psychNoEmailResult = true;
    safeSetItem('psych_last_date', new Date().toISOString().slice(0,10));
    
    // 1. 기본 Big 5 채점 (E, O, A, C, N)
    const bfi = { E:[], O:[], A:[], C:[], N:[] };
    getBFI().forEach(item => {
        let raw = pA['bfi_'+item.id] || 4;
        if(item.rev) raw = 8 - raw;
        bfi[item.axis].push(raw);
    });
    
    const scores = {};
    const rawScores = {}; 
    ['E','O','A','C','N'].forEach(ax => {
        const avg = bfi[ax].reduce((a,b)=>a+b,0)/bfi[ax].length;
        scores[ax] = Math.round((avg-1)/6*100);
        rawScores[ax] = Math.round(avg*100)/100;
    });

    // 2. 동물 판별 (16마리 기본 슬롯)
    const E = scores.E >= 50 ? '☀️' : '🌙';
    const O = scores.O >= 50 ? '🔥' : '🌱';
    const A = scores.A >= 50 ? '🤝' : '🧊';
    const C = scores.C >= 50 ? '⚡' : '💭';
    const typeKey = E+O+A+C;
    const animalData = PSYCH_ANIMALS[typeKey] || PSYCH_ANIMALS['🌙🌱🤝💭'];

    // 3. 하위 요인(Facet) 정밀 채점
    const calcFacet = (facetName) => {
        const items = getBFI().filter(it => it.facet === facetName);
        let sum = 0, count = 0;
        items.forEach(it => {
            const val = pA['bfi_'+it.id];
            if(val !== undefined){
                const raw = it.rev ? 8 - val : val;
                sum += raw;
                count++;
            }
        });
        return count === 0 ? 4 : sum / count;
    };

    const f_compassion = calcFacet('compassion');
    const f_cooperation = calcFacet('cooperation');
    const f_industriousness = calcFacet('industriousness');
    const f_order = calcFacet('order');
    const f_intellect = calcFacet('intellect');
    const f_aesthetics = calcFacet('aesthetics');
    const f_sociability = calcFacet('sociability');
    const f_assertiveness = calcFacet('assertiveness');

    // 4. 타입 판별 (A/B/C/D)
    let variantKey = 'A';
    let facetData = {};
    const animal_emoji = animalData.animal;

    // A그룹: 친화성 기준
    if (['🦁','🦦','🐋','🐢'].includes(animal_emoji)) {
        const h1 = f_compassion >= 4.0;
        const h2 = f_cooperation >= 4.0;
        variantKey = (h1 && h2) ? 'A' : (h1 && !h2) ? 'B' : (!h1 && h2) ? 'C' : 'D';
        facetData = {
            l1: '공감 능력',
            s1: Math.round((f_compassion-1)/6*100),
            l2: '협력/조율',
            s2: Math.round((f_cooperation-1)/6*100)
        };
    }
    // C그룹: 성실성 기준
    else if (['🐺','🦅','🐆','🦫'].includes(animal_emoji)) {
        const h1 = f_industriousness >= 4.0;
        const h2 = f_order >= 4.0;
        variantKey = (h1 && h2) ? 'A' : (h1 && !h2) ? 'B' : (!h1 && h2) ? 'C' : 'D';
        facetData = {
            l1: '성취 지향',
            s1: Math.round((f_industriousness-1)/6*100),
            l2: '계획/체계',
            s2: Math.round((f_order-1)/6*100)
        };
    }
    // O그룹: 개방성 기준
    else if (['🐒','🦊','🦢','🦌'].includes(animal_emoji)) {
        const h1 = f_intellect >= 4.0;
        const h2 = f_aesthetics >= 4.0;
        variantKey = (h1 && h2) ? 'A' : (h1 && !h2) ? 'B' : (!h1 && h2) ? 'C' : 'D';
        facetData = {
            l1: '지적 탐구',
            s1: Math.round((f_intellect-1)/6*100),
            l2: '예술 감수성',
            s2: Math.round((f_aesthetics-1)/6*100)
        };
    }
    // E그룹: 외향성 기준
    else if (['🐘','🦝','🐯','🐱'].includes(animal_emoji)) {
        const h1 = f_sociability >= 4.0;
        const h2 = f_assertiveness >= 4.0;
        variantKey = (h1 && h2) ? 'A' : (h1 && !h2) ? 'B' : (!h1 && h2) ? 'C' : 'D';
        facetData = {
            l1: '사교성',
            s1: Math.round((f_sociability-1)/6*100),
            l2: '주도/통제',
            s2: Math.round((f_assertiveness-1)/6*100)
        };
    }

    // 5. 64가지 세부 프로필 가져오기
    const variantProfile = window.getVariantDescription(animal_emoji, variantKey);

    // 6. RSE(자존감), VIA(강점) 채점
    let rseTotal = 0;
    getRSE().forEach(item => {
        let raw = pA['rse_'+item.id] || 4;
        if(item.rev) raw = 8 - raw;
        rseTotal += raw;
    });
    const _rseLen = getRSE().length;
    scores.RSE = Math.round((rseTotal - _rseLen) / (_rseLen * 6) * 100);
    const viaStrengths = VIA_ITEMS.map(item => item.str[pA['via_'+item.id] || 0]);

    // 7. 최종 결과 저장
    const result = {
        typeKey,
        animal: animalData,
        scores,
        rawScores,
        viaStrengths,
        variant: variantProfile,
        facetData,
        info: { route: pA['info_route'], age: pA['info_age'], region: pA['info_region'] },
        date: getTodayStr()
    };

    safeSetItem('psych_result_v2', JSON.stringify(result));
    renderPsychPreview();
    sendPsychToSheet(result);
    showPsychResult(result);
}

// ============================================
// [교제 2] 결과 화면 렌더링 함수
// ============================================
function showPsychResult(result){
    const modal = document.getElementById('psych-modal');
    if(!modal) return;

    const { animal, scores, viaStrengths, variant, facetData } = result;

    // null 대비
    const variantLabel = variant ? variant.label : `${animal.name}`;
    const variantNarrative = variant ? variant.narrative : '심리 프로필 분석 중입니다.';
    const variantStrengths = variant ? variant.strengths : ['분석 중'];
    const variantCautions = variant ? variant.cautions : ['분석 중'];
    const variantCelebrities = variant ? variant.celebrities : ['분석 중'];

    // 기존 Big Five 분석 함수들
    const love = getLoveStyle(scores);
    const work = getWorkStyle(scores);
    const friend = getFriendStyle(scores);
    const hard = getHardStyle(scores);
    const money = getMoneyStyle(scores);
    const rse = getRseStyle(scores.RSE);
    const via = getViaStyle(viaStrengths);

    modal.innerHTML = `
    <div style="background:var(--bg-color);min-height:100vh;padding-bottom:100px;">
        <!-- 헤더 섹션 -->
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:40px 20px 30px;text-align:center;color:#fff;">
            <div style="font-size:0.85em;color:rgba(255,255,255,0.7);margin-bottom:10px;">나의 확언 동물 유형</div>
            <div style="font-size:90px;margin-bottom:8px;">${animal.animal}</div>
            <div style="font-size:1.8em;font-weight:900;margin-bottom:4px;">${animal.name}</div>
            <div style="font-size:1.1em;color:#C9A84C;font-weight:700;margin-bottom:4px;">"${variantLabel}"</div>
            <div style="font-size:0.9em;color:rgba(255,255,255,0.8);">${animal.title}</div>
        </div>

        <!-- 메인 컨텐츠 -->
        <div style="padding:20px;">

            <!-- 세부 프로필 카드 -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);box-shadow:var(--shadow-sm);">
                <div style="font-size:1em;font-weight:900;color:#1B4332;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
                    <span>🔬</span> 당신의 진짜 이야기
                </div>
                <div style="font-size:0.92em;line-height:1.9;color:var(--text-color);margin-bottom:18px;">
                    ${variantNarrative}
                </div>

                <!-- 미니 바 차트 -->
                <div style="background:#F0F7F4;border-radius:12px;padding:14px;margin-bottom:16px;">
                    <div style="font-size:0.8em;font-weight:700;color:#1B4332;margin-bottom:10px;">🎯 나의 핵심 성향 비율</div>
                    <div style="display:flex;align-items:center;margin-bottom:8px;">
                        <span style="width:85px;font-size:0.75em;color:#555;font-weight:700;">${facetData.l1}</span>
                        <div style="flex:1;background:#D0E8DC;height:8px;border-radius:4px;margin:0 8px;overflow:hidden;">
                            <div style="background:#1B4332;height:100%;border-radius:4px;width:${facetData.s1}%;"></div>
                        </div>
                        <span style="width:35px;font-size:0.75em;color:#1B4332;font-weight:800;text-align:right;">${facetData.s1}%</span>
                    </div>
                    <div style="display:flex;align-items:center;">
                        <span style="width:85px;font-size:0.75em;color:#555;font-weight:700;">${facetData.l2}</span>
                        <div style="flex:1;background:#D0E8DC;height:8px;border-radius:4px;margin:0 8px;overflow:hidden;">
                            <div style="background:#1B4332;height:100%;border-radius:4px;width:${facetData.s2}%;"></div>
                        </div>
                        <span style="width:35px;font-size:0.75em;color:#1B4332;font-weight:800;text-align:right;">${facetData.s2}%</span>
                    </div>
                </div>

                <!-- 강점/주의 -->
                <div style="display:flex;gap:8px;margin-bottom:16px;">
                    <div style="flex:1;background:#E8F5E9;padding:12px;border-radius:10px;">
                        <div style="font-size:0.75em;font-weight:800;color:#2E7D32;margin-bottom:6px;">🌟 돋보이는 강점</div>
                        <div style="font-size:0.75em;color:#1B4332;line-height:1.6;">• ${variantStrengths.join('<br>• ')}</div>
                    </div>
                    <div style="flex:1;background:#FFF3E0;padding:12px;border-radius:10px;">
                        <div style="font-size:0.75em;font-weight:800;color:#E65100;margin-bottom:6px;">⚠️ 이 점은 주의해요</div>
                        <div style="font-size:0.75em;color:#B93C00;line-height:1.6;">• ${variantCautions.join('<br>• ')}</div>
                    </div>
                </div>

                <!-- 유명인 -->
                <div style="background:rgba(201,168,76,0.1);border-radius:10px;padding:12px 14px;border:1px solid rgba(201,168,76,0.3);">
                    <span style="font-size:0.8em;font-weight:800;color:#8B6914;">👥 나와 닮은 리더/유명인:</span>
                    <span style="font-size:0.85em;color:#1B4332;font-weight:700;margin-left:4px;">${variantCelebrities.join(', ')}</span>
                </div>
            </div>

            <!-- Big Five 차트 섹션 (기존 코드 이어짐) -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
                <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:14px;">📊 Big 5 성격 5요인 분석</div>
                
                <!-- E 막대 -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">외향성(E): ${scores.E}%</span>
                        <span style="font-size:0.75em;color:#666;">${scores.E>=50?'높음':'낮음'}</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.E}%;"></div>
                    </div>
                </div>

                <!-- O 막대 -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">개방성(O): ${scores.O}%</span>
                        <span style="font-size:0.75em;color:#666;">${scores.O>=50?'높음':'낮음'}</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.O}%;"></div>
                    </div>
                </div>

                <!-- A 막대 -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">친화성(A): ${scores.A}%</span>
                        <span style="font-size:0.75em;color:#666;">${scores.A>=50?'높음':'낮음'}</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.A}%;"></div>
                    </div>
                </div>

                <!-- C 막대 -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">성실성(C): ${scores.C}%</span>
                        <span style="font-size:0.75em;color:#666;">${scores.C>=50?'높음':'낮음'}</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.C}%;"></div>
                    </div>
                </div>

                <!-- N 막대 -->
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">신경증(N): ${scores.N}%</span>
                        <span style="font-size:0.75em;color:#666;">${scores.N>=50?'높음':'낮음'}</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.N}%;"></div>
                    </div>
                </div>
            </div>

            <!-- ★★★ 여기서 기존 showPsychResult의 나머지 코드를 이어붙이세요! ★★★ -->
            <!-- (연애/일/우정/스트레스/소비 5가지 카테고리 섹션들) -->
            <!-- (자존감/강점 섹션들) -->
            <!-- (추천 영상 섹션) -->
            <!-- (나머지 모든 기존 UI...) -->

        </div>
    </div>`;

    // ★ 주의: 여기부터는 기존 showPsychResult의 나머지 로직이 계속되어야 합니다
    // 예: renderPsychChart(result), renderCategory() 등의 함수 호출이나
    //     modal.innerHTML += `...추가 HTML...` 같은 코드가 이어져야 합니다
}

// ============================================
// [필수] 헬퍼 함수
// ============================================
function getBFI() {
    return BFI_ITEMS || [];
}

function getRSE() {
    return RSE_ITEMS || [];
}

// ... (기존의 getLoveStyle, getWorkStyle, getFriendStyle 등의 함수는 그대로 유지)
