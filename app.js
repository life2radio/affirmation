// ==========================================
// app.js - 최종 완성본 (GitHub 올리기용)
// calcAndShowResult + showPsychResult 64유형 시스템 완벽 통합
// 기존 모든 기능 100% 보존
// ==========================================

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

    // 5. 64가지 프로필 가져오기
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

function showPsychResult(result){
    const modal = document.getElementById('psych-modal');
    if(!modal) return;

    const { animal, scores, viaStrengths, variant, facetData } = result;
    const variantLabel = variant ? variant.label : `${animal.name}`;
    const variantNarrative = variant ? variant.narrative : '분석 중...';
    const variantStrengths = variant ? variant.strengths : [];
    const variantCautions = variant ? variant.cautions : [];
    const variantCelebrities = variant ? variant.celebrities : [];

    const _quickBadge = pMode==='quick' ? '<div style="background:rgba(255,193,7,0.2);border:1px solid rgba(255,193,7,0.4);border-radius:20px;padding:5px 16px;font-size:0.78em;color:#FFC107;font-weight:700;margin-bottom:10px;display:inline-block;">⚡ 빠른 테스트 결과</div>' : '';
    const _precisionCTA = pMode==='quick' ? '<div style="background:#FFF8E7;border-radius:16px;padding:16px;margin-bottom:14px;border:1px solid #F0D080;text-align:center;"><div style="font-size:0.88em;font-weight:700;color:#856404;margin-bottom:8px;">🔬 더 정확한 결과를 원하신다면?</div><div style="font-size:0.82em;color:#856404;line-height:1.7;margin-bottom:12px;">정밀 테스트(66문항)로 연애·일·소비 스타일까지<br>완전 분석해보세요!</div><button id="_precisionBtn" style="background:#1B4332;color:#fff;border:none;border-radius:12px;padding:10px 24px;font-size:0.88em;font-weight:700;cursor:pointer;">🔬 정밀 테스트 시작하기</button></div>' : '';

    const love = getLoveStyle(scores);
    const work = getWorkStyle(scores);
    const friend = getFriendStyle(scores);
    const hard = getHardStyle(scores);
    const money = getMoneyStyle(scores);
    const rse = getRseStyle(scores.RSE);
    const via = getViaStyle(viaStrengths);

    const compatibleKey = Object.keys(PSYCH_ANIMALS).find(k => k !== result.typeKey && k.includes(result.typeKey[0] === '☀️' ? '🌙' : '☀️'));
    const compatible = PSYCH_ANIMALS[compatibleKey] || PSYCH_ANIMALS['🌙🌱🤝💭'];

    modal.innerHTML = `
    <div style="background:var(--bg-color);min-height:100vh;padding-bottom:100px;">
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:40px 20px 30px;text-align:center;">
            <div style="font-size:0.8em;color:rgba(255,255,255,0.7);margin-bottom:10px;">나의 확언 동물 유형</div>
            ${_quickBadge}
            <div style="font-size:90px;margin-bottom:8px;">${animal.animal}</div>
            <div style="font-size:1.8em;font-weight:900;color:#fff;margin-bottom:4px;">${animal.name}</div>
            <div style="font-size:0.95em;color:#C9A84C;font-weight:700;margin-bottom:4px;">"${variantLabel}"</div>
            <div style="font-size:0.9em;color:rgba(255,255,255,0.8);">${animal.title}</div>
        </div>

        <div style="padding:20px;">
        ${_precisionCTA}

        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);box-shadow:var(--shadow-sm);">
            <div style="font-size:1em;font-weight:900;color:#1B4332;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
                <span>🔬</span> 당신의 진짜 이야기
            </div>
            <div style="font-size:0.9em;line-height:1.9;color:var(--text-color);margin-bottom:18px;">
                ${variantNarrative}
            </div>

            ${facetData ? `
            <div style="background:#F0F7F4;border-radius:12px;padding:14px;margin-bottom:16px;">
                <div style="font-size:0.8em;font-weight:700;color:#1B4332;margin-bottom:10px;">🎯 나의 핵심 성향 비율</div>
                <div style="display:flex;align-items:center;margin-bottom:8px;">
                    <span style="width:85px;font-size:0.75em;color:#555;font-weight:700;">${facetData.l1}</span>
                    <div style="flex:1;background:#D0E8DC;height:8px;border-radius:4px;margin:0 8px;">
                        <div style="background:#1B4332;height:100%;border-radius:4px;width:${facetData.s1}%;"></div>
                    </div>
                    <span style="width:35px;font-size:0.75em;color:#1B4332;font-weight:800;text-align:right;">${facetData.s1}%</span>
                </div>
                <div style="display:flex;align-items:center;">
                    <span style="width:85px;font-size:0.75em;color:#555;font-weight:700;">${facetData.l2}</span>
                    <div style="flex:1;background:#D0E8DC;height:8px;border-radius:4px;margin:0 8px;">
                        <div style="background:#1B4332;height:100%;border-radius:4px;width:${facetData.s2}%;"></div>
                    </div>
                    <span style="width:35px;font-size:0.75em;color:#1B4332;font-weight:800;text-align:right;">${facetData.s2}%</span>
                </div>
            </div>` : ''}

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
            <div style="background:rgba(201,168,76,0.1);border-radius:10px;padding:12px 14px;border:1px solid rgba(201,168,76,0.3);">
                <span style="font-size:0.8em;font-weight:800;color:#8B6914;">👥 나와 닮은 리더/유명인:</span>
                <span style="font-size:0.85em;color:#1B4332;font-weight:700;margin-left:4px;">${variantCelebrities.join(', ')}</span>
            </div>
        </div>

        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
            <div style="font-size:0.85em;font-weight:700;color:#1B4332;margin-bottom:14px;">📊 Big 5 성격 5요인 분석</div>
            ${[
                ['외향성', scores.E, '내향적', '외향적'],
                ['개방성', scores.O, '안정 추구', '변화 추구'],
                ['친화성', scores.A, '독립적', '관계 중심'],
                ['성실성', scores.C, '유연함', '계획적'],
                ['안정성', 100-scores.N, '예민함', '안정적'],
            ].map(([label, score, left, right])=>`
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.8em;margin-bottom:3px;">
                        <span style="font-weight:700;color:var(--text-color);">${label}</span>
                        <span style="color:#1B4332;font-weight:700;">${score}% · ${getLevelText(score)}</span>
                    </div>
                    <div style="background:var(--border-color);border-radius:6px;height:8px;">
                        <div style="background:linear-gradient(90deg,#1B4332,#C9A84C);height:100%;border-radius:6px;width:${score}%;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.7em;color:var(--text-muted);margin-top:2px;">
                        <span>${left}</span><span>${right}</span>
                    </div>
                </div>`).join('')}
            <div style="font-size:0.7em;color:var(--text-muted);margin-top:8px;">출처: BFI-44 (John, Donahue & Kentle, 1991)</div>
        </div>

        ${[love, work, friend, hard, money].map(cat=>`
        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
            <div style="font-size:1em;font-weight:700;color:#1B4332;margin-bottom:10px;">${cat.title}</div>
            <div style="font-size:0.88em;line-height:1.9;color:var(--text-color);margin-bottom:12px;">${cat.desc}</div>
            ${cat.strength ? `<div style="background:#F0F7F4;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#1B4332;margin-bottom:8px;line-height:1.7;">${cat.strength}</div>` : ''}
            ${cat.caution ? `<div style="background:#FFF8E7;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#856404;margin-bottom:8px;line-height:1.7;">${cat.caution}</div>` : ''}
            <div style="background:#E8F4F0;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#1B4332;line-height:1.7;">${cat.tip}</div>
            ${cat.video ? `<a href="${cat.video.url}" target="_blank"
                style="display:flex;align-items:center;gap:8px;margin-top:10px;padding:10px 14px;background:#fff;border:1.5px solid #1B4332;border-radius:10px;text-decoration:none;">
                <span style="font-size:1.2em;">📺</span>
                <div style="flex:1;">
                    <div style="font-size:0.75em;color:#888;">이 영상이 도움될 거예요</div>
                    <div style="font-size:0.82em;font-weight:700;color:#1B4332;">${cat.video.label}</div>
                </div>
                <span style="font-size:0.9em;color:#1B4332;">▶</span>
            </a>` : ''}
        </div>`).join('')}

        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
            <div style="font-size:1em;font-weight:700;color:#1B4332;margin-bottom:10px;">${rse.title}</div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                <div style="flex:1;background:var(--border-color);border-radius:6px;height:10px;">
                    <div style="background:linear-gradient(90deg,#C9A84C,#1B4332);height:100%;border-radius:6px;width:${rse.score}%;"></div>
                </div>
                <span style="font-size:1em;font-weight:700;color:#1B4332;">${rse.score}점</span>
            </div>
            <div style="font-size:0.88em;line-height:1.9;color:var(--text-color);margin-bottom:10px;">${rse.desc}</div>
            ${rse.strength ? `<div style="background:#F0F7F4;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#1B4332;margin-bottom:8px;line-height:1.7;">${rse.strength}</div>` : ''}
            ${rse.growth ? `<div style="background:#FFF8E7;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#856404;margin-bottom:8px;line-height:1.7;">${rse.growth}</div>` : ''}
            <div style="background:#E8F4F0;border-radius:10px;padding:12px 14px;font-size:0.82em;color:#1B4332;line-height:1.7;">${rse.tip}</div>
            ${rse.video ? `<a href="${rse.video.url}" target="_blank"
                style="display:flex;align-items:center;gap:8px;margin-top:10px;padding:10px 14px;background:#fff;border:1.5px solid #1B4332;border-radius:10px;text-decoration:none;">
                <span style="font-size:1.2em;">📺</span>
                <div style="flex:1;">
                    <div style="font-size:0.75em;color:#888;">이 영상이 도움될 거예요</div>
                    <div style="font-size:0.82em;font-weight:700;color:#1B4332;">${rse.video.label}</div>
                </div>
                <span style="font-size:0.9em;color:#1B4332;">▶</span>
            </a>` : ''}
            <div style="font-size:0.7em;color:var(--text-muted);margin-top:8px;">출처: Rosenberg Self-Esteem Scale (Rosenberg, 1965) · 60년간 52개국 검증</div>
        </div>

        <div style="background:var(--card-bg);border-radius:16px;padding:20px;margin-bottom:14px;border:1px solid var(--border-color);">
            <div style="font-size:0.95em;font-weight:700;color:#1B4332;margin-bottom:10px;">${via.title}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                ${via.strengths.map((s,i)=>`<span style="background:${i===0?'#1B4332':'var(--border-color)'};color:${i===0?'#fff':'var(--text-color)'};padding:5px 12px;border-radius:20px;font-size:0.82em;font-weight:700;">${i===0?'👑 ':''}${s}</span>`).join('')}
            </div>
            <div style="font-size:0.88em;line-height:1.8;color:var(--text-color);">${via.desc}</div>
            <div style="font-size:0.7em;color:var(--text-muted);margin-top:8px;">출처: VIA Character Strengths (Peterson & Seligman, 2004)</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
            <div style="background:var(--card-bg);border-radius:14px;padding:16px;border:1px solid var(--border-color);">
                <div style="font-size:0.78em;color:var(--text-muted);margin-bottom:4px;">🔤 MBTI 연관 유형</div>
                <div style="font-size:0.9em;font-weight:700;color:var(--text-color);">${animal.mbti}</div>
                <div style="font-size:0.7em;color:var(--text-muted);margin-top:4px;">참고: McCrae & Costa (1989)</div>
            </div>
            <div style="background:var(--card-bg);border-radius:14px;padding:16px;border:1px solid var(--border-color);">
                <div style="font-size:0.78em;color:var(--text-muted);margin-bottom:4px;">💑 궁합 유형</div>
                <div style="font-size:0.9em;font-weight:700;color:var(--text-color);">${compatible.animal} ${compatible.name}</div>
                <div style="font-size:0.75em;color:var(--text-muted);margin-top:2px;">${compatible.title}</div>
            </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">
            <button onclick="sharePsychMyResult()"
                style="width:100%;min-height:52px;background:#1B4332;color:#fff;border:none;border-radius:14px;font-size:0.95em;font-weight:700;cursor:pointer;">
                ${animal.animal} 내 결과 공유하기 📤
            </button>
            <button onclick="sharePsychInvite()"
                style="width:100%;min-height:48px;background:var(--card-bg);color:#1B4332;border:2px solid #1B4332;border-radius:14px;font-size:0.9em;font-weight:700;cursor:pointer;">
                💌 친구에게 테스트 추천하기
            </button>
        </div>
        </div>

        <div id="psych-result-cta" style="position:sticky;bottom:0;background:rgba(27,67,50,0.97);backdrop-filter:blur(8px);padding:12px 20px;display:flex;align-items:center;gap:12px;border-top:1px solid rgba(201,168,76,0.3);">
            <div style="flex:1;">
                <div id="psych-cta-title" style="font-size:0.85em;font-weight:700;color:#C9A84C;">맞춤 확언 받아보기</div>
                <div style="font-size:0.75em;color:rgba(255,255,255,0.6);">매일 무료로 받아보기</div>
            </div>
            <button id="psych-result-cta-btn"
                style="background:#C9A84C;color:#1B4332;border:none;border-radius:12px;padding:10px 20px;font-size:0.9em;font-weight:900;cursor:pointer;white-space:nowrap;">
                🌿 앱 메인으로 바로가기
            </button>
        </div>
    </div>`;

    setTimeout(function(){
        var ctaBtn = document.getElementById('psych-result-cta-btn');
        if(ctaBtn){
            ctaBtn.addEventListener('click', function(){
                document.getElementById('psych-modal').remove();
                setTimeout(function(){
                    if(safeGetItem('onboarding_done','') !== '1'){
                        showInstallPrompt ? showInstallPrompt() : initOnboarding();
                    } else {
                        switchView('home');
                    }
                }, 200);
            });
        }
        var precBtn = document.getElementById('_precisionBtn');
        if(precBtn){
            precBtn.addEventListener('click', function(){
                document.getElementById('psych-modal').remove();
                pMode='full'; psychStartReal('full');
            });
        }
    }, 100);
}
