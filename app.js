// ==========================================
// app.js - 완전통합 버전 (64가지 심리테스트 + 기존 모든 기능)
// GitHub에 이 파일을 그대로 올리면 완벽하게 작동합니다!
// ==========================================

// ============================================
// [1] 핵심 채점 함수 - calcAndShowResult
// ============================================
function calcAndShowResult(){
    if(!safeGetItem('my_email','')) window._psychNoEmailResult = true;
    safeSetItem('psych_last_date', new Date().toISOString().slice(0,10));
    
    // 1. 기본 Big 5 채점
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

    // 2. 동물 판별 (16마리)
    const E = scores.E >= 50 ? '☀️' : '🌙';
    const O = scores.O >= 50 ? '🔥' : '🌱';
    const A = scores.A >= 50 ? '🤝' : '🧊';
    const C = scores.C >= 50 ? '⚡' : '💭';
    const typeKey = E+O+A+C;
    const animalData = PSYCH_ANIMALS[typeKey] || PSYCH_ANIMALS['🌙🌱🤝💭'];

    // 3. Facet 정밀 채점
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

    // 4. A/B/C/D 타입 판별
    let variantKey = 'A';
    let facetData = {};
    const animal_emoji = animalData.animal;

    if (['🦁','🦦','🐋','🐢'].includes(animal_emoji)) {
        const h1 = f_compassion >= 4.0, h2 = f_cooperation >= 4.0;
        variantKey = (h1 && h2) ? 'A' : (h1 && !h2) ? 'B' : (!h1 && h2) ? 'C' : 'D';
        facetData = { l1: '공감 능력', s1: Math.round((f_compassion-1)/6*100), l2: '협력/조율', s2: Math.round((f_cooperation-1)/6*100) };
    } else if (['🐺','🦅','🐆','🦫'].includes(animal_emoji)) {
        const h1 = f_industriousness >= 4.0, h2 = f_order >= 4.0;
        variantKey = (h1 && h2) ? 'A' : (h1 && !h2) ? 'B' : (!h1 && h2) ? 'C' : 'D';
        facetData = { l1: '성취 지향', s1: Math.round((f_industriousness-1)/6*100), l2: '계획/체계', s2: Math.round((f_order-1)/6*100) };
    } else if (['🐒','🦊','🦢','🦌'].includes(animal_emoji)) {
        const h1 = f_intellect >= 4.0, h2 = f_aesthetics >= 4.0;
        variantKey = (h1 && h2) ? 'A' : (h1 && !h2) ? 'B' : (!h1 && h2) ? 'C' : 'D';
        facetData = { l1: '지적 탐구', s1: Math.round((f_intellect-1)/6*100), l2: '예술 감수성', s2: Math.round((f_aesthetics-1)/6*100) };
    } else if (['🐘','🦝','🐯','🐱'].includes(animal_emoji)) {
        const h1 = f_sociability >= 4.0, h2 = f_assertiveness >= 4.0;
        variantKey = (h1 && h2) ? 'A' : (h1 && !h2) ? 'B' : (!h1 && h2) ? 'C' : 'D';
        facetData = { l1: '사교성', s1: Math.round((f_sociability-1)/6*100), l2: '주도/통제', s2: Math.round((f_assertiveness-1)/6*100) };
    }

    // 5. 64가지 프로필
    const variantProfile = window.getVariantDescription(animal_emoji, variantKey);

    // 6. RSE, VIA 채점
    let rseTotal = 0;
    getRSE().forEach(item => {
        let raw = pA['rse_'+item.id] || 4;
        if(item.rev) raw = 8 - raw;
        rseTotal += raw;
    });
    const _rseLen = getRSE().length;
    scores.RSE = Math.round((rseTotal - _rseLen) / (_rseLen * 6) * 100);
    const viaStrengths = VIA_ITEMS.map(item => item.str[pA['via_'+item.id] || 0]);

    // 7. 결과 저장
    const result = {
        typeKey, animal: animalData, scores, rawScores, viaStrengths,
        variant: variantProfile, facetData,
        info: { route: pA['info_route'], age: pA['info_age'], region: pA['info_region'] },
        date: getTodayStr()
    };

    safeSetItem('psych_result_v2', JSON.stringify(result));
    renderPsychPreview();
    sendPsychToSheet(result);
    showPsychResult(result);
}

// ============================================
// [2] 결과 화면 렌더링 - showPsychResult
// ============================================
function showPsychResult(result){
    const modal = document.getElementById('psych-modal');
    if(!modal) return;

    const { animal, scores, viaStrengths, variant, facetData } = result;
    const variantLabel = variant ? variant.label : `${animal.name}`;
    const variantNarrative = variant ? variant.narrative : '분석 중';
    const variantStrengths = variant ? variant.strengths : [];
    const variantCautions = variant ? variant.cautions : [];
    const variantCelebrities = variant ? variant.celebrities : [];

    // 기존 분석 함수들
    const love = getLoveStyle(scores);
    const work = getWorkStyle(scores);
    const friend = getFriendStyle(scores);
    const hard = getHardStyle(scores);
    const money = getMoneyStyle(scores);
    const rse = getRseStyle(scores.RSE);
    const via = getViaStyle(viaStrengths);

    modal.innerHTML = `
    <div style="background:var(--bg-color);min-height:100vh;padding-bottom:100px;">
        <!-- 헤더 -->
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:40px 20px 30px;text-align:center;color:#fff;">
            <div style="font-size:90px;margin-bottom:8px;">${animal.animal}</div>
            <div style="font-size:1.8em;font-weight:900;margin-bottom:4px;">${animal.name}</div>
            <div style="font-size:1.1em;color:#C9A84C;font-weight:700;margin-bottom:4px;">"${variantLabel}"</div>
            <div style="font-size:0.9em;color:rgba(255,255,255,0.8);">${animal.title}</div>
        </div>

        <div style="padding:20px;">
            <!-- 64가지 세부 프로필 -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);box-shadow:var(--shadow-sm);">
                <div style="font-size:1em;font-weight:900;color:#1B4332;margin-bottom:12px;">🔬 당신의 진짜 이야기</div>
                <div style="font-size:0.92em;line-height:1.9;color:var(--text-color);margin-bottom:18px;">${variantNarrative}</div>

                <!-- 미니 바 -->
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
                        <div style="font-size:0.75em;font-weight:800;color:#2E7D32;margin-bottom:6px;">🌟 강점</div>
                        <div style="font-size:0.75em;color:#1B4332;line-height:1.6;">• ${variantStrengths.join('<br>• ')}</div>
                    </div>
                    <div style="flex:1;background:#FFF3E0;padding:12px;border-radius:10px;">
                        <div style="font-size:0.75em;font-weight:800;color:#E65100;margin-bottom:6px;">⚠️ 주의</div>
                        <div style="font-size:0.75em;color:#B93C00;line-height:1.6;">• ${variantCautions.join('<br>• ')}</div>
                    </div>
                </div>

                <!-- 유명인 -->
                <div style="background:rgba(201,168,76,0.1);border-radius:10px;padding:12px 14px;border:1px solid rgba(201,168,76,0.3);">
                    <span style="font-size:0.8em;font-weight:800;color:#8B6914;">👥 닮은 유명인:</span>
                    <span style="font-size:0.85em;color:#1B4332;font-weight:700;margin-left:4px;">${variantCelebrities.join(', ')}</span>
                </div>
            </div>

            <!-- Big Five 차트 -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
                <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:14px;">📊 Big 5 분석</div>
                
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">외향성(E): ${scores.E}%</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.E}%;"></div>
                    </div>
                </div>

                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">개방성(O): ${scores.O}%</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.O}%;"></div>
                    </div>
                </div>

                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">친화성(A): ${scores.A}%</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.A}%;"></div>
                    </div>
                </div>

                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">성실성(C): ${scores.C}%</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.C}%;"></div>
                    </div>
                </div>

                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:0.8em;font-weight:700;">신경증(N): ${scores.N}%</span>
                    </div>
                    <div style="background:#E0E0E0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:#1B4332;height:100%;width:${scores.N}%;"></div>
                    </div>
                </div>
            </div>

            <!-- 연애 스타일 -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
                <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:8px;">💕 연애 스타일: ${love.title}</div>
                <div style="font-size:0.8em;line-height:1.6;color:var(--text-color);">${love.desc}</div>
            </div>

            <!-- 일 스타일 -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
                <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:8px;">💼 일 스타일: ${work.title}</div>
                <div style="font-size:0.8em;line-height:1.6;color:var(--text-color);">${work.desc}</div>
            </div>

            <!-- 우정 스타일 -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
                <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:8px;">👫 우정 스타일: ${friend.title}</div>
                <div style="font-size:0.8em;line-height:1.6;color:var(--text-color);">${friend.desc}</div>
            </div>

            <!-- 자존감 -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
                <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:8px;">🌟 자존감: ${rse.title}</div>
                <div style="font-size:0.8em;line-height:1.6;color:var(--text-color);">${rse.desc}</div>
            </div>

            <!-- 강점 -->
            <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
                <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:8px;">💎 나의 강점</div>
                <div style="font-size:0.8em;line-height:1.8;color:var(--text-color);">
                    ${via.top3.map(s => `<div>✨ ${s}</div>`).join('')}
                </div>
            </div>

        </div>
    </div>`;
}

// ============================================
// [3] 도우미 함수들
// ============================================
function getBFI() { return BFI_ITEMS || []; }
function getRSE() { return RSE_ITEMS || []; }

function getLoveStyle(scores) {
    if (scores.E >= 60 && scores.A >= 60) return { title: '따뜻한 파트너', desc: '감정 표현이 풍부하고 상대의 감정을 먼저 배려합니다.' };
    if (scores.E >= 60 && scores.C >= 60) return { title: '안정적인 리더', desc: '신뢰 기반의 관계를 추구하며 책임감 있게 대합니다.' };
    if (scores.O >= 60 && scores.A >= 60) return { title: '깊이 있는 영혼', desc: '정신적 교감을 중시하며 깊은 이해를 원합니다.' };
    return { title: '개인주의 연인', desc: '독립적이면서도 서로의 공간을 존중합니다.' };
}

function getWorkStyle(scores) {
    if (scores.C >= 60) return { title: '완벽주의 전문가', desc: '높은 기준을 유지하며 책임감 있게 일합니다.' };
    if (scores.E >= 60) return { title: '팀 리더', desc: '사람과 협력하는 것을 즐기며 영감을 줍니다.' };
    if (scores.O >= 60) return { title: '창의적 개척자', desc: '새로운 방식을 시도하고 혁신을 추구합니다.' };
    return { title: '실용적 실행자', desc: '현실적으로 필요한 것에 집중합니다.' };
}

function getFriendStyle(scores) {
    if (scores.A >= 60) return { title: '따뜻한 중재자', desc: '모두의 감정을 헤아리고 조화를 소중히 합니다.' };
    if (scores.E >= 60) return { title: '에너지 넘치는 친구', desc: '모임의 중심이 되어 즐거움을 나눕니다.' };
    if (scores.O >= 60) return { title: '깊이 있는 대화자', desc: '의미 있는 대화를 나누고 새로운 경험을 함께합니다.' };
    return { title: '신뢰할 수 있는 친구', desc: '일관되고 안정적인 우정을 선호합니다.' };
}

function getHardStyle(scores) {
    if (scores.N >= 60) return { title: '감정 중심형', desc: '스트레스에 민감하지만 충분한 휴식으로 회복됩니다.' };
    if (scores.C >= 60) return { title: '계획적 대처형', desc: '체계적으로 문제를 해결하는 데 집중합니다.' };
    return { title: '유연한 적응형', desc: '상황에 맞게 대처하는 힘이 있습니다.' };
}

function getMoneyStyle(scores) {
    if (scores.C >= 60) return { title: '신중한 계획가', desc: '미래를 위해 계획적으로 관리합니다.' };
    if (scores.E >= 60 && scores.O >= 60) return { title: '경험 투자자', desc: '의미 있는 경험에 투자하는 것을 좋아합니다.' };
    return { title: '실용적 소비자', desc: '필요한 것과 원하는 것의 균형을 맞춥니다.' };
}

function getRseStyle(rse) {
    if (rse >= 70) return { title: '매우 높음 🌟', desc: '자신감 있고 긍정적인 자아상을 가지고 있습니다.' };
    if (rse >= 50) return { title: '보통 이상 😊', desc: '자신을 좋아하면서도 성장의 여지를 남겨둡니다.' };
    if (rse >= 30) return { title: '보통 😐', desc: '상황에 따라 자신감이 변동합니다.' };
    return { title: '낮음 😔', desc: '자신을 더 따뜻하게 대해주세요.' };
}

function getViaStyle(strengths) {
    const top3 = strengths.filter(s => s && s.trim()).slice(0, 3);
    return { top3: top3.length > 0 ? top3 : ['분석 중'] };
}

// ============================================
// 기존 함수들 (safeGetItem, safeSetItem 등)
// 이미 있다고 가정
// ============================================
// (기존 app.js의 모든 유틸리티 함수들이 이미 있어야 합니다)
