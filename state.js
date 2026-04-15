// ==========================================
// state.js (인생확언앱 중앙 상태 관리소)
// ==========================================

class AppState {
  constructor() {
    this.state = this.loadState();
  }

  // 1. 초기 상태 정의 및 로드
  loadState() {
    const defaultState = {
      user: { points: 0, nickname: '', email: '' },
      settings: { mode: 'A', bgmAuto: false, darkMode: false, fontSize: 'normal' },
      today: { isCompleted: false, moodBefore: null, moodAfter: null },
      cache: {},      // ← 메모리 캐시 (localStorage 저장 안 함)
      json: {}        // ← JSON 파싱 결과 캐시 (localStorage 저장 안 함)
    };
    try {
      const saved = localStorage.getItem('appState_v2');
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch(e) {
      return defaultState;
    }
  }

  // 2. 전체 상태를 로컬스토리지에 안전하게 자동 저장
  // (cache와 json은 제외 - 메모리에만 유지)
  saveState() {
    try { 
      const { cache, json, ...persistState } = this.state;
      localStorage.setItem('appState_v2', JSON.stringify(persistState)); 
    } catch(e) {
      console.error('상태 저장 실패:', e);
    }
  }

  // 3. 상태 변경 (데이터를 바꿀 때는 무조건 이 함수를 통과해야 함)
  set(category, key, value) {
    if (!this.state[category]) this.state[category] = {};
    this.state[category][key] = value;
    this.saveState();
    console.log(`[상태 업데이트] ${category}.${key} =`, value);
  }

  // 4. 상태 가져오기
  get(category, key) {
    return this.state[category] ? this.state[category][key] : null;
  }
}

// 앱 어디서든 appState.get(), appState.set() 으로 접근 가능하게 만들기
window.appState = new AppState();
