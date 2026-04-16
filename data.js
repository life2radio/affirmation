// ==========================================
// data.js - 인생확언 앱 통합 데이터 (최종 완성본)
// 1단계 BFI_ITEMS + 2단계 함수 로직 + 3단계 64가지 템플릿
// ==========================================

const affirmationsData = [
  {day:1,month:1,dayOfMonth:1,theme:"새로 시작하는 나",text:"새로운 시작이 두렵다는 건, 내가 그만큼 진지하다는 증거다. 나는 오늘, 완벽하지 않아도 시작한다.",action:"올해 바라는 것 딱 한 가지를 종이에 손으로 써서 눈에 보이는 곳에 붙인다.",episode:"",episodeTitle:""},
  // ... (365개 데이터는 기존 affirmationsData를 그대로 사용)
];

const INSIGHTS = [
    "확언을 21일 반복하면 뇌의 신경 경로가 새롭게 형성됩니다. 지금 뇌를 바꾸는 중입니다.",
    "감사를 기록하면 뇌에서 세로토닌과 도파민이 동시에 분비됩니다.",
    "자기 언어로 만든 확언이 외부 확언보다 뇌에 3배 더 강하게 각인됩니다.",
    "기분을 기록하는 것만으로도 감정 조절 능력이 향상됩니다.",
    "반복이 정체성을 만듭니다. 오늘의 선택이 내일의 나를 결정합니다."
];

const BADGES = [
    { target:7, icon:'🌱', name:'씨앗을 심었습니다' },
    { target:30, icon:'🌿', name:'한 달을 걸어왔습니다' },
    { target:100, icon:'🌳', name:'뿌리가 깊어집니다' },
    { target:200, icon:'🌟', name:'빛나고 있습니다' },
    { target:365, icon:'🏆', name:'인생2막 마스터' }
];

const EMOJIS = ['😔','😐','🙂','😊','😄'];

// ==========================================
// [1단계] 16가지 동물 기본 정보 (수정: emoji 정확화)
// ==========================================
const PSYCH_ANIMALS = {
    '☀️🔥🤝⚡': { animal:'🦁', name:'사자형', title:'카리스마 리더', mbti:'ENFJ/ENTJ' },
    '☀️🌱🤝💭': { animal:'🦦', name:'수달형', title:'유쾌한 낙천가', mbti:'ESFP/ISFP' },
    '🌙🔥🤝💭': { animal:'🐋', name:'고래형', title:'깊은 공감자', mbti:'INFP/INFJ' },
    '🌙🌱🤝⚡': { animal:'🐢', name:'거북이형', title:'묵묵한 동반자', mbti:'ISFJ/ISTJ' },
    '☀️🔥🧊⚡': { animal:'🦅', name:'독수리형', title:'비전의 선구자', mbti:'ENTJ/ESTP' },
    '☀️🌱🧊⚡': { animal:'🦫', name:'비버형', title:'원칙주의 전문가', mbti:'ISTJ/ISTP' },
    '🌙🔥🤝⚡': { animal:'🐺', name:'늑대형', title:'본능의 리더', mbti:'INFJ/INTJ' },
    '🌙🔥🧊⚡': { animal:'🐆', name:'표범형', title:'은밀한 혁신가', mbti:'INTJ/ISTP' },
    '☀️🔥🧊💭': { animal:'🐒', name:'원숭이형', title:'에너지 넘치는 탐험가', mbti:'ENTP/ENFP' },
    '☀️🌱🧊💭': { animal:'🦊', name:'여우형', title:'직관의 탐험가', mbti:'INTP/INTJ' },
    '🌙🔥🧊💭': { animal:'🦢', name:'백조형', title:'우아한 창조자', mbti:'INFP/ENFP' },
    '🌙🌱🧊💭': { animal:'🦌', name:'사슴형', title:'조용한 평화주의자', mbti:'ISFP/INFP' },
    '☀️🔥🤝💭': { animal:'🐘', name:'코끼리형', title:'포용적 통솔자', mbti:'ENFP/ESFJ' },
    '☀️🌱🤝⚡': { animal:'🦝', name:'라쿤형', title:'유쾌한 분위기메이커', mbti:'ESFJ/ENFJ' },
    '🌙🌱🧊⚡': { animal:'🐯', name:'호랑이형', title:'고독한 실력자', mbti:'ISTJ/INTJ' },
    '🌙🌱🤝💭': { animal:'🐱', name:'고양이형', title:'다정한 소수정예', mbti:'ISFP/INFP' }
};

// ==========================================
// [1단계] BFI_ITEMS 44개 (2x2 Facet 분류)
// ==========================================
const BFI_ITEMS = [
    // E (8개)
    { id: 'E1',  axis: 'E', facet: 'sociability',   rev: false, text: '나는 말이 많은 편이에요' },
    { id: 'E3',  axis: 'E', facet: 'sociability',   rev: false, text: '나는 사람들과 어울리는 것을 즐겨요' },
    { id: 'E7',  axis: 'E', facet: 'sociability',   rev: false, text: '나는 친구들과 함께 시간을 보내는 것이 좋아요' },
    { id: 'E8',  axis: 'E', facet: 'sociability',   rev: false, text: '나는 모임에서 중심이 되는 편이에요' },
    { id: 'E2',  axis: 'E', facet: 'assertiveness', rev: false, text: '나는 다른 사람들을 이끌어가는 역할을 잘해요' },
    { id: 'E4',  axis: 'E', facet: 'assertiveness', rev: true,  text: '나는 내 의견을 주장하기 어려워해요' },
    { id: 'E5',  axis: 'E', facet: 'assertiveness', rev: false, text: '나는 자신감이 있는 편이에요' },
    { id: 'E6',  axis: 'E', facet: 'assertiveness', rev: true,  text: '나는 조용하고 눈에 띄지 않는 편이에요' },
    // O (10개)
    { id: 'O1',  axis: 'O', facet: 'intellect',     rev: true,  text: '나는 새로운 경험에 조심스러운 편이에요' },
    { id: 'O2',  axis: 'O', facet: 'intellect',     rev: false, text: '나는 색다른 일을 시도해보고 싶어요' },
    { id: 'O3',  axis: 'O', facet: 'intellect',     rev: false, text: '나는 철학이나 추상적인 개념에 관심이 많아요' },
    { id: 'O8',  axis: 'O', facet: 'intellect',     rev: false, text: '나는 새로운 아이디어를 탐구하는 것을 좋아해요' },
    { id: 'O9',  axis: 'O', facet: 'intellect',     rev: false, text: '나는 창의적이고 혁신적인 사람이에요' },
    { id: 'O4',  axis: 'O', facet: 'aesthetics',    rev: false, text: '나는 미술, 음악, 문학 같은 예술을 감상하는 것을 좋아해요' },
    { id: 'O5',  axis: 'O', facet: 'aesthetics',    rev: false, text: '나는 다양한 생각과 문화를 존중해요' },
    { id: 'O6',  axis: 'O', facet: 'aesthetics',    rev: false, text: '나는 아름다운 것들에 깊이 감동해요' },
    { id: 'O7',  axis: 'O', facet: 'aesthetics',    rev: true,  text: '나는 일상의 루틴을 선호해요' },
    { id: 'O10', axis: 'O', facet: 'aesthetics',    rev: false, text: '나는 창의적인 표현에 끌려요' },
    // A (9개)
    { id: 'A1',  axis: 'A', facet: 'compassion',    rev: true,  text: '나는 다른 사람의 감정을 이해하기 어려워해요' },
    { id: 'A2',  axis: 'A', facet: 'compassion',    rev: false, text: '나는 남의 고통에 쉽게 공감해요' },
    { id: 'A4',  axis: 'A', facet: 'compassion',    rev: false, text: '나는 타인의 감정을 배려해요' },
    { id: 'A6',  axis: 'A', facet: 'compassion',    rev: true,  text: '나는 남의 일에 별로 관심이 없어요' },
    { id: 'A7',  axis: 'A', facet: 'compassion',    rev: false, text: '나는 약한 사람들을 돕고 싶어요' },
    { id: 'A3',  axis: 'A', facet: 'cooperation',   rev: false, text: '나는 타인과 쉽게 협력할 수 있어요' },
    { id: 'A5',  axis: 'A', facet: 'cooperation',   rev: true,  text: '나는 경쟁에서 이기는 것을 중요하게 생각해요' },
    { id: 'A8',  axis: 'A', facet: 'cooperation',   rev: false, text: '나는 남을 도우려고 해요' },
    { id: 'A9',  axis: 'A', facet: 'cooperation',   rev: true,  text: '나는 다른 사람과 싸우기 쉬운 편이에요' },
    // C (9개)
    { id: 'C1',  axis: 'C', facet: 'order',         rev: false, text: '나는 철저하게 일을 처리해요' },
    { id: 'C4',  axis: 'C', facet: 'order',         rev: false, text: '나는 계획을 세워 실행하는 편이에요' },
    { id: 'C7',  axis: 'C', facet: 'order',         rev: true,  text: '나는 정리정돈을 잘하지 못해요' },
    { id: 'C8',  axis: 'C', facet: 'order',         rev: false, text: '나는 깔끔하고 체계적이에요' },
    { id: 'C2',  axis: 'C', facet: 'industriousness', rev: false, text: '나는 부지런하고 꾸준해요' },
    { id: 'C3',  axis: 'C', facet: 'industriousness', rev: true,  text: '나는 다른 사람들에게 신뢰받지 못해요' },
    { id: 'C5',  axis: 'C', facet: 'industriousness', rev: false, text: '나는 목표를 달성하기 위해 노력해요' },
    { id: 'C6',  axis: 'C', facet: 'industriousness', rev: true,  text: '나는 게을러서 자주 미루는 편이에요' },
    { id: 'C9',  axis: 'C', facet: 'industriousness', rev: false, text: '나는 높은 기준을 유지하려고 노력해요' },
    // N (8개)
    { id: 'N1',  axis: 'N', facet: 'volatility',    rev: false, text: '나는 감정 기복이 큰 편이에요' },
    { id: 'N2',  axis: 'N', facet: 'volatility',    rev: true,  text: '나는 차분하고 침착해요' },
    { id: 'N5',  axis: 'N', facet: 'volatility',    rev: true,  text: '나는 감정적으로 안정돼 있어요' },
    { id: 'N6',  axis: 'N', facet: 'volatility',    rev: false, text: '나는 화내기 쉬운 편이에요' },
    { id: 'N3',  axis: 'N', facet: 'anxiety',       rev: false, text: '나는 걱정이 많은 편이에요' },
    { id: 'N4',  axis: 'N', facet: 'anxiety',       rev: false, text: '나는 불안감을 자주 느껴요' },
    { id: 'N7',  axis: 'N', facet: 'anxiety',       rev: true,  text: '나는 긍정적인 마음가짐을 유지해요' },
    { id: 'N8',  axis: 'N', facet: 'anxiety',       rev: false, text: '나는 스트레스에 쉽게 영향을 받아요' }
];

// ==========================================
// [2단계] 64가지 세부 유형 템플릿
// ==========================================
const FACET_TEMPLATES = {
    'A_high_high': { 
        narrative: (name) => `당신은 ${name}의 강점에 더해, 따뜻한 공감과 포용력으로 사람을 품는 성향이 강합니다. 의견이 다른 사람의 말에도 귀 기울이며 부드럽게 타협점을 찾아내는 완벽한 조율자입니다.`,
        strengths: ['깊은 공감력', '갈등 중재', '포용적 리더십'],
        cautions: ['모두를 만족시키려다 자신이 지칠 수 있습니다']
    },
    'A_high_low': { 
        narrative: (name) => `당신은 ${name}의 특성을 가지면서도, 사람의 마음은 깊이 이해하지만 자신의 신념 앞에서는 쉽게 타협하지 않습니다. 공감하면서도 뚝심 있게 밀어붙이는 진정성 있는 타입입니다.`,
        strengths: ['진정성 있는 설득력', '흔들리지 않는 신념', '깊은 1:1 관계'],
        cautions: ['때로는 융통성이 부족해 보일 수 있습니다']
    },
    'A_low_high': { 
        narrative: (name) => `당신은 ${name}이지만, 감정보다는 시스템과 합리적인 조율을 중시합니다. 매우 전략적이고 영리하며, 타협을 통해 조직과 관계의 최선의 결과를 도출해내는 실용주의자입니다.`,
        strengths: ['전략적 조율', '시스템 구축', '감정에 휘둘리지 않음'],
        cautions: ['인간미가 다소 부족하다는 오해를 받을 수 있습니다']
    },
    'A_low_low': { 
        narrative: (name) => `당신은 가장 순수하고 독립적인 형태의 ${name}입니다. 섣불리 타협하지 않고 감정에 휘둘리지 않으며, 오직 자신의 명확한 비전과 결과만을 향해 압도적으로 나아갑니다.`,
        strengths: ['압도적인 추진력', '명확한 비전', '뛰어난 결과 도출'],
        cautions: ['주변 사람들의 감정을 놓치지 않도록 주의가 필요합니다']
    },
    'C_high_high': { 
        narrative: (name) => `당신은 ${name}의 매력에 더해, 원대한 목표를 세우고 완벽한 로드맵을 그리는 치밀함이 있습니다. 흔들림 없이 계획대로 전진하여 반드시 결과를 내는 무서운 실력자입니다.`,
        strengths: ['완벽한 실행력', '철저한 계획', '높은 신뢰성'],
        cautions: ['계획이 틀어질 때 스트레스를 크게 받을 수 있습니다']
    },
    'C_high_low': { 
        narrative: (name) => `당신은 ${name}이면서도, 빡빡한 계획이나 규칙에 얽매이는 것을 싫어합니다. 하지만 목표를 향한 집념은 타의 추종을 불허하며, 예상치 못한 상황도 유연하게 돌파해내는 실전형 야심가입니다.`,
        strengths: ['강력한 목표 달성력', '뛰어난 위기 대처', '유연한 사고'],
        cautions: ['초반에 체계가 없어 보일 수 있습니다']
    },
    'C_low_high': { 
        narrative: (name) => `당신은 ${name}의 본성에 더해, 모험보다는 안정을, 즉흥성보다는 정돈된 체계를 선호합니다. 화려한 목표를 외치기보다 묵묵히 시스템을 유지하고 관리하는 든든한 방어막입니다.`,
        strengths: ['안정적인 관리 능력', '꼼꼼한 디테일', '높은 유지력'],
        cautions: ['새로운 변화를 수용하는 속도가 느릴 수 있습니다']
    },
    'C_low_low': { 
        narrative: (name) => `당신은 거침없는 야망이나 빡빡한 계획에 자신을 가두지 않는 자유로운 ${name}입니다. 순간의 직관과 유연함을 믿으며, 남들이 보지 못하는 틈새에서 자신만의 행복과 성과를 찾아냅니다.`,
        strengths: ['탁월한 적응력', '틀에 얽매이지 않는 자유로움', '스트레스 내성'],
        cautions: ['장기적인 끈기가 다소 부족할 수 있습니다']
    },
    'O_high_high': { 
        narrative: (name) => `당신은 ${name}의 특징과 함께, 논리적인 분석력과 예술적인 영감을 동시에 갖춘 르네상스적 인물입니다. 높은 곳에서 세상을 넓게 보며 융합적인 사고를 해냅니다.`,
        strengths: ['풍부한 상상력', '논리와 직관의 융합', '다각적 문제 해결'],
        cautions: ['생각이 너무 많아 현실 감각을 잃을 수 있습니다']
    },
    'O_high_low': { 
        narrative: (name) => `당신은 ${name}이면서도, 감성보다는 '왜 그렇게 되는가?'에 대한 지적 탐구심이 극에 달한 사람입니다. 냉철한 이성과 예리한 분석력으로 세상의 진리와 규칙을 파헤칩니다.`,
        strengths: ['날카로운 분석력', '객관적 통찰력', '지적 호기심'],
        cautions: ['타인의 감정적 호소에 둔감할 수 있습니다']
    },
    'O_low_high': { 
        narrative: (name) => `당신은 복잡한 논리나 이론보다는, ${name} 특유의 직관적이고 감각적인 아름다움을 추구합니다. 섬세한 안목과 감수성으로 일상 속에서 예술적인 가치를 창조해냅니다.`,
        strengths: ['뛰어난 직관', '풍부한 감수성', '감각적 안목'],
        cautions: ['논리적인 설명이나 근거 제시를 어려워할 수 있습니다']
    },
    'O_low_low': { 
        narrative: (name) => `당신은 뜬구름 잡는 이상이나 예술보다는, 당장 눈앞에 보이는 현실적이고 실용적인 문제 해결을 가장 중요하게 생각하는 현실밀착형 ${name}입니다.`,
        strengths: ['뛰어난 현실 감각', '실용적 문제 해결', '안정감'],
        cautions: ['기존의 방식을 깨는 혁신을 주저할 수 있습니다']
    },
    'E_high_high': { 
        narrative: (name) => `당신은 ${name}의 성향을 바탕으로, 사람들과 어울리는 것을 사랑하며 무리의 중심에서 주도권을 쥐는 데 탁월합니다. 어디서나 눈에 띄는 타고난 스타이자 통솔자입니다.`,
        strengths: ['강한 장악력', '폭넓은 네트워크', '자신감'],
        cautions: ['타인의 의견을 압도할 위험이 있습니다']
    },
    'E_high_low': { 
        narrative: (name) => `당신은 내가 앞장서서 지시하기보다는, 사람들과 웃고 떠들며 편안한 분위기를 만드는 것을 좋아하는 친근한 ${name}입니다. 모두가 곁에 두고 싶어 하는 다정한 친구입니다.`,
        strengths: ['편안한 분위기 조성', '높은 호감도', '갈등 완화'],
        cautions: ['중요한 결정의 순간에 주도권을 넘길 수 있습니다']
    },
    'E_low_high': { 
        narrative: (name) => `당신은 불필요한 사교 모임에는 에너지를 아끼지만, 목표를 이끌거나 중요한 결정을 내릴 때는 주저 없이 리더십을 발휘하는 카리스마 있는 ${name}입니다.`,
        strengths: ['결정적 리더십', '효율적 에너지 사용', '강한 결단력'],
        cautions: ['차갑거나 다가가기 어렵다는 인상을 줄 수 있습니다']
    },
    'E_low_low': { 
        narrative: (name) => `당신은 나서는 것이나 시끄러운 환경을 피하고, 자신만의 고요한 영역을 지키는 매력적인 ${name}입니다. 소수의 사람들과 깊게 교류하며 내면의 에너지를 축적합니다.`,
        strengths: ['높은 집중력', '자아 성찰', '깊은 1:1 관계'],
        cautions: ['자신을 알릴 기회를 놓치기 쉽습니다']
    }
};

// ==========================================
// [2단계] 64가지 세부 유형 데이터
// ==========================================
const ANIMAL_FACET_MAP = {
    '🦁': { name: '사자형', variants: { 'A': { label: '성인군자형 사자', template: 'A_high_high', celebs: ['넬슨 만델라', '오프라 윈프리'] }, 'B': { label: '비전의 사자', template: 'A_high_low', celebs: ['스티브 잡스', '마틴 루터 킹'] }, 'C': { label: '전술적 사자', template: 'A_low_high', celebs: ['빌 클린턴', '리 쿠안유'] }, 'D': { label: '절대군주형 사자', template: 'A_low_low', celebs: ['마거릿 대처', '알렉산더 대왕'] } } },
    '🦦': { name: '수달형', variants: { 'A': { label: '유쾌한 중재자 수달', template: 'A_high_high', celebs: ['유재석', '로빈 윌리엄스'] }, 'B': { label: '주관 있는 낙천가 수달', template: 'A_high_low', celebs: ['윌 스미스', '짐 캐리'] }, 'C': { label: '융통성 있는 협력가 수달', template: 'A_low_high', celebs: ['성룡', '엘런 디제너러스'] }, 'D': { label: '마이웨이 쾌락주의 수달', template: 'A_low_low', celebs: ['로버트 다우니 주니어', '잭 블랙'] } } },
    '🐋': { name: '고래형', variants: { 'A': { label: '성역의 수호자 고래', template: 'A_high_high', celebs: ['마더 테레사', '슈바이처'] }, 'B': { label: '신념의 치유자 고래', template: 'A_high_low', celebs: ['간디', '플로렌스 나이팅게일'] }, 'C': { label: '현실적 조율자 고래', template: 'A_low_high', celebs: ['지미 카터', '반기문'] }, 'D': { label: '고독한 사색가 고래', template: 'A_low_low', celebs: ['장 자크 루소', '아르투어 쇼펜하우어'] } } },
    '🐢': { name: '거북이형', variants: { 'A': { label: '따뜻한 동반자 거북이', template: 'A_high_high', celebs: ['링컨', '마더 테레사'] }, 'B': { label: '원칙의 수호자 거북이', template: 'A_high_low', celebs: ['조지 워싱턴', '워런 버핏'] }, 'C': { label: '시스템 관리자 거북이', template: 'A_low_high', celebs: ['앙겔라 메르켈', '이순신 장군'] }, 'D': { label: '묵묵한 실천가 거북이', template: 'A_low_low', celebs: ['마이클 조던', '타이거 우즈'] } } },
    '🐺': { name: '늑대형', variants: { 'A': { label: '완벽주의 리더 늑대', template: 'C_high_high', celebs: ['제프 베이조스', '손흥민'] }, 'B': { label: '신념의 투사 늑대', template: 'C_high_low', celebs: ['일론 머스크', '조지 오웰'] }, 'C': { label: '치밀한 설계자 늑대', template: 'C_low_high', celebs: ['빌 게이츠', '팀 쿡'] }, 'D': { label: '고독한 개척자 늑대', template: 'C_low_low', celebs: ['스티븐 킹', '찰스 부코스키'] } } },
    '🦅': { name: '독수리형', variants: { 'A': { label: '전략적 지휘관 독수리', template: 'C_high_high', celebs: ['더글러스 맥아더', '줄리어스 시저'] }, 'B': { label: '압도적 행동파 독수리', template: 'C_high_low', celebs: ['리처드 브랜슨', '나폴레옹'] }, 'C': { label: '안정적 관리자 독수리', template: 'C_low_high', celebs: ['콜린 파월', '조지 마샬'] }, 'D': { label: '자유로운 비행가 독수리', template: 'C_low_low', celebs: ['어니스트 헤밍웨이', '잭 케루악'] } } },
    '🐆': { name: '표범형', variants: { 'A': { label: '완벽한 사냥꾼 표범', template: 'C_high_high', celebs: ['스티브 잡스', '코비 브라이언트'] }, 'B': { label: '본능적 타격가 표범', template: 'C_high_low', celebs: ['마이크 타이슨', '브루스 리'] }, 'C': { label: '은밀한 관찰자 표범', template: 'C_low_high', celebs: ['블라디미르 푸틴', '쑨원'] }, 'D': { label: '독립적 방랑자 표범', template: 'C_low_low', celebs: ['제임스 딘', '살바도르 달리'] } } },
    '🦫': { name: '비버형', variants: { 'A': { label: '원칙주의 마스터 비버', template: 'C_high_high', celebs: ['헨리 포드', '이건희'] }, 'B': { label: '유연한 해결사 비버', template: 'C_high_low', celebs: ['잭 마', '리드 헤이스팅스'] }, 'C': { label: '체계적 조력자 비버', template: 'C_low_high', celebs: ['팀 쿡', '순다르 피차이'] }, 'D': { label: '마이웨이 실천가 비버', template: 'C_low_low', celebs: ['리누스 토르발스', '리처드 파인만'] } } },
    '🐒': { name: '원숭이형', variants: { 'A': { label: '융합형 천재 원숭이', template: 'O_high_high', celebs: ['스티브 잡스', '에디슨'] }, 'B': { label: '호기심 넘치는 연구자 원숭이', template: 'O_high_low', celebs: ['리처드 도킨스', '닐 타이슨'] }, 'C': { label: '감각적 아티스트 원숭이', template: 'O_low_high', celebs: ['앤디 워홀', '백남준'] }, 'D': { label: '순발력 넘치는 해결사 원숭이', template: 'O_low_low', celebs: ['고든 램지', '백종원'] } } },
    '🦊': { name: '여우형', variants: { 'A': { label: '창의적 전략가 여우', template: 'O_high_high', celebs: ['마키아벨리', '일론 머스크'] }, 'B': { label: '논리적 사상가 여우', template: 'O_high_low', celebs: ['르네 데카르트', '이마누엘 칸트'] }, 'C': { label: '직관적 탐험가 여우', template: 'O_low_high', celebs: ['스티븐 스필버그', '쿠엔틴 타란티노'] }, 'D': { label: '실용적 문제해결사 여우', template: 'O_low_low', celebs: ['토머스 에디슨', '벤자민 프랭클린'] } } },
    '🦢': { name: '백조형', variants: { 'A': { label: '우아한 창조자 백조', template: 'O_high_high', celebs: ['코코 샤넬', '안나 윈투어'] }, 'B': { label: '냉철한 분석가 백조', template: 'O_high_low', celebs: ['조르주 오웰', '수전 손택'] }, 'C': { label: '감성적 표현가 백조', template: 'O_low_high', celebs: ['마릴린 먼로', '마이클 잭슨'] }, 'D': { label: '세련된 실용주의자 백조', template: 'O_low_low', celebs: ['그레이스 켈리', '재클린 케네디 오나시스'] } } },
    '🦌': { name: '사슴형', variants: { 'A': { label: '깊은 몽상가 사슴', template: 'O_high_high', celebs: ['J.R.R. 톨킨', '빈센트 반 고흐'] }, 'B': { label: '철학적 사색가 사슴', template: 'O_high_low', celebs: ['장 폴 사르트르', '쇠렌 키르케고르'] }, 'C': { label: '섬세한 예술가 사슴', template: 'O_low_high', celebs: ['쇼팽', '오드리 헵번'] }, 'D': { label: '평온한 관찰자 사슴', template: 'O_low_low', celebs: ['밥 로스', '제인 오스틴'] } } },
    '🐘': { name: '코끼리형', variants: { 'A': { label: '포용적 통솔자 코끼리', template: 'E_high_high', celebs: ['오프라 윈프리', '마틴 루터 킹'] }, 'B': { label: '따뜻한 수호자 코끼리', template: 'E_high_low', celebs: ['톰 행크스', '프린세스 다이애나'] }, 'C': { label: '든든한 기둥 코끼리', template: 'E_low_high', celebs: ['콜린 파월', '안젤리나 졸리'] }, 'D': { label: '묵묵한 지지자 코끼리', template: 'E_low_low', celebs: ['달라이 라마', '테레사 수녀'] } } },
    '🦝': { name: '라쿤형', variants: { 'A': { label: '유쾌한 핵인싸 라쿤', template: 'E_high_high', celebs: ['잭 블랙', '라이언 레이놀즈'] }, 'B': { label: '다정한 분위기메이커 라쿤', template: 'E_high_low', celebs: ['유재석', '박보검'] }, 'C': { label: '센스 넘치는 리더 라쿤', template: 'E_low_high', celebs: ['로버트 다우니 주니어', '이효리'] }, 'D': { label: '조용한 센스쟁이 라쿤', template: 'E_low_low', celebs: ['키아누 리브스', '앤 헤서웨이'] } } },
    '🐯': { name: '호랑이형', variants: { 'A': { label: '압도적 통솔자 호랑이', template: 'E_high_high', celebs: ['알렉산더 대왕', '나폴레옹'] }, 'B': { label: '친근한 골목대장 호랑이', template: 'E_high_low', celebs: ['드웨인 존슨', '마동석'] }, 'C': { label: '고독한 실력자 호랑이', template: 'E_low_high', celebs: ['마이클 조던', '크리스티아누 호날두'] }, 'D': { label: '마이웨이 관찰자 호랑이', template: 'E_low_low', celebs: ['클린트 이스트우드', '해리슨 포드'] } } },
    '🐱': { name: '고양이형', variants: { 'A': { label: '당당한 매력쟁이 고양이', template: 'E_high_high', celebs: ['마돈나', '테일러 스위프트'] }, 'B': { label: '다정한 소수정예 고양이', template: 'E_high_low', celebs: ['아이유', '빌리 아일리시'] }, 'C': { label: '도도한 기획자 고양이', template: 'E_low_high', celebs: ['칼 라거펠트', '안나 윈투어'] }, 'D': { label: '자유로운 마이웨이 고양이', template: 'E_low_low', celebs: ['조니 뎁', '제임스 딘'] } } }
};

// ==========================================
// [핵심] getVariantDescription 함수
// ==========================================
window.getVariantDescription = function(animalEmoji, variantKey) {
    const animalMap = ANIMAL_FACET_MAP[animalEmoji];
    if(!animalMap) return null;
    const config = animalMap.variants[variantKey];
    if(!config) return null;
    const template = FACET_TEMPLATES[config.template];
    if(!template) return null;
    return {
        label: config.label,
        narrative: template.narrative(animalMap.name),
        strengths: template.strengths,
        cautions: template.cautions,
        celebrities: config.celebs
    };
};

// ==========================================
// [필수] 헬퍼 함수들
// ==========================================
function getBFI() {
    return BFI_ITEMS || [];
}

function getRSE() {
    return RSE_ITEMS || [];
}

// ... (기존의 affirmationsData, RSE_ITEMS, VIA_ITEMS 등은 그대로 유지하세요)
