/**
 * 인생확언 앱 - 구글 앱스 스크립트 v2.0
 * 수집 데이터: 사용자현황 / 심리검사결과 / 닉네임이메일등록 /
 *              레벨업 / 연속달성마일스톤 / 사연보내기 / 설문정보 / PDF해금
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ① 사용자 현황 (기존)
    if(data.action === 'user_log'){
      let sheet = ss.getSheetByName('사용자현황');
      if(!sheet){
        sheet = ss.insertSheet('사용자현황');
        sheet.appendRow(['최종업데이트','닉네임','이메일','기기','설치일','총달성일','연속달성','포인트','등급','마지막방문']);
      }
      const rows = sheet.getDataRange().getValues();
      let found = -1;
      for(let i=1;i<rows.length;i++){
        if(rows[i][1] === data.nickname && rows[i][3] === data.device){ found=i+1; break; }
      }
      const row = [new Date(), data.nickname, data.email||'', data.device,
        data.installDate, data.totalDays, data.streak, data.points, data.level, data.lastVisit];
      if(found>0){ sheet.getRange(found,1,1,row.length).setValues([row]); }
      else { sheet.appendRow(row); }
    }

    // ② 심리검사 결과
    else if(data.action === 'psych_result'){
      let sheet = ss.getSheetByName('심리검사결과');
      if(!sheet){
        sheet = ss.insertSheet('심리검사결과');
        sheet.appendRow(['날짜','닉네임','이메일','유입경로','나이','지역','동물유형','유형키',
          'E외향성','O개방성','A친화성','C성실성','N안정성','자존감RSE','핵심강점']);
      }
      sheet.appendRow([new Date(), data.nickname, data.email||'', data.route, data.age, data.region,
        data.animalType, data.typeKey, data.E, data.O, data.A, data.C, data.N, data.RSE, data.strengths]);
    }

    // ③ 닉네임/이메일 등록
    else if(data.action === 'user_register'){
      let sheet = ss.getSheetByName('회원등록');
      if(!sheet){
        sheet = ss.insertSheet('회원등록');
        sheet.appendRow(['날짜','닉네임','이메일','등록경로']);
      }
      // 중복 체크 (이메일 기준)
      if(data.email){
        const rows = sheet.getDataRange().getValues();
        const exists = rows.slice(1).some(r => r[2] === data.email);
        if(!exists){ sheet.appendRow([new Date(), data.nickname, data.email, data.trigger||'']); }
        else {
          // 기존 행 업데이트
          for(let i=1;i<rows.length;i++){
            if(rows[i][2]===data.email){
              sheet.getRange(i+1,1,1,4).setValues([[new Date(), data.nickname, data.email, data.trigger||'']]);
              break;
            }
          }
        }
      }
    }

    // ④ 레벨업
    else if(data.action === 'level_up'){
      let sheet = ss.getSheetByName('레벨업이력');
      if(!sheet){
        sheet = ss.insertSheet('레벨업이력');
        sheet.appendRow(['날짜','닉네임','이메일','달성등급']);
      }
      sheet.appendRow([new Date(), data.nickname, data.email||'', data.level]);
    }

    // ⑤ 연속달성 마일스톤 (100/200/300일)
    else if(data.action === 'streak_milestone'){
      let sheet = ss.getSheetByName('연속달성마일스톤');
      if(!sheet){
        sheet = ss.insertSheet('연속달성마일스톤');
        sheet.appendRow(['날짜','닉네임','이메일','연속일수']);
      }
      sheet.appendRow([new Date(), data.nickname, data.email||'', data.days]);
    }

    // ⑥ 사연 보내기
    else if(data.action === 'story_sent'){
      let sheet = ss.getSheetByName('사연보내기');
      if(!sheet){
        sheet = ss.insertSheet('사연보내기');
        sheet.appendRow(['날짜','닉네임','이메일']);
      }
      sheet.appendRow([new Date(), data.nickname, data.email||'']);
    }

    // ⑦ 설문 정보
    else if(data.action === 'survey_saved'){
      let sheet = ss.getSheetByName('설문정보');
      if(!sheet){
        sheet = ss.insertSheet('설문정보');
        sheet.appendRow(['날짜','닉네임','이메일','나이대','유입경로','나의유형','평소기분','기분좋을때']);
      }
      const d = data.data || {};
      // 기존 행 업데이트 또는 신규 추가
      const rows = sheet.getDataRange().getValues();
      let found = -1;
      for(let i=1;i<rows.length;i++){
        if(rows[i][1]===data.nickname && rows[i][2]===(data.email||'')){ found=i+1; break; }
      }
      const row = [new Date(), data.nickname, data.email||'', d.age||'', d.route||'', d.type||'', d.mood||'', d.happy||''];
      if(found>0){ sheet.getRange(found,1,1,row.length).setValues([row]); }
      else { sheet.appendRow(row); }
    }

    // ⑧ PDF 해금
    else if(data.action === 'pdf_access'){
      let sheet = ss.getSheetByName('PDF해금');
      if(!sheet){
        sheet = ss.insertSheet('PDF해금');
        sheet.appendRow(['날짜','닉네임','이메일','PDF명']);
      }
      sheet.appendRow([new Date(), data.nickname, data.email||'', data.pdf]);
    }

  } catch(err) {
    Logger.log('오류: ' + err.toString());
  }
  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};

  // ① 시크릿 코드
  try {
    const sheet = ss.getSheetByName('시크릿코드');
    if(sheet){
      const rows = sheet.getDataRange().getValues();
      const codes = {};
      rows.slice(1).forEach(row => {
        if(row[0] && row[1]){
          const dateStr = Utilities.formatDate(new Date(row[0]), 'Asia/Seoul', 'yyyy-M-d');
          codes[dateStr] = String(row[1]).trim();
        }
      });
      result.secretCodes = codes;
    }
  } catch(e){ result.secretCodes = {}; }

  // ② 쇼츠 영상
  try {
    const sheet = ss.getSheetByName('쇼츠영상');
    if(sheet){
      const rows = sheet.getDataRange().getValues();
      const shorts = [];
      rows.slice(1).forEach(row => {
        if(row[0]){
          shorts.push({ ep:Number(row[0]), title:String(row[1]||''), theme:String(row[2]||''),
            url:String(row[3]||''), tags:String(row[4]||'') });
        }
      });
      result.shorts = shorts;
    }
  } catch(e){ result.shorts = []; }

  // ③ 에피소드 배너
  try {
    const sheet = ss.getSheetByName('에피소드배너');
    if(sheet){
      const rows = sheet.getDataRange().getValues();
      if(rows.length > 1){
        result.latestEpisode = {
          ep: Number(rows[1][0]), title: String(rows[1][1]||''),
          url: String(rows[1][2]||''), thumbnail: String(rows[1][3]||''),
          date: String(rows[1][4]||'')
        };
      }
    }
  } catch(e){}

  // ④ 핵심질문
  try {
    const sheet = ss.getSheetByName('핵심질문');
    if(sheet){
      const rows = sheet.getDataRange().getValues();
      const questions = {};
      rows.slice(1).forEach(row => {
        if(row[0]) questions[String(row[0])] = String(row[1]||'');
      });
      result.coreQuestions = questions;
    }
  } catch(e){ result.coreQuestions = {}; }

  // ⑤ 설정 (PDF URL 등)
  try {
    const sheet = ss.getSheetByName('설정');
    if(sheet){
      const rows = sheet.getDataRange().getValues();
      const settings = {};
      rows.forEach(row => { if(row[0]) settings[String(row[0])] = String(row[1]||''); });
      result.settings = settings;
    }
  } catch(e){ result.settings = {}; }

  // ⑥ 시크릿 콘텐츠
  try {
    const sheet = ss.getSheetByName('시크릿콘텐츠');
    if(sheet){
      const rows = sheet.getDataRange().getValues();
      const contents = {};
      rows.slice(1).forEach(row => {
        if(row[0]){
          const dateStr = Utilities.formatDate(new Date(row[0]), 'Asia/Seoul', 'yyyy-M-d');
          contents[dateStr] = { type:String(row[1]||''), text:String(row[2]||'') };
        }
      });
      result.secretContents = contents;
    }
  } catch(e){ result.secretContents = {}; }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====================================================
// ★ 주간 자동 분석 시스템 (Gemini API)
// 매주 월요일 오전 9시 자동 실행
// ====================================================

const GEMINI_API_KEY = 'AIzaSyDf6suDaIY0DkvaVCQdsIW0PKtjQCleZHU';
const REPORT_EMAIL = 'life2radio@gmail.com';

// ★ 트리거 자동 설치 (최초 1회만 실행)
function installWeeklyTrigger() {
  // 기존 트리거 삭제
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'weeklyAnalysis') {
      ScriptApp.deleteTrigger(t);
    }
  });
  // 매주 월요일 오전 9시 트리거 등록
  ScriptApp.newTrigger('weeklyAnalysis')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
  Logger.log('✅ 주간 분석 트리거 설치 완료! 매주 월요일 오전 9시 자동 실행.');
}

// ★ 주간 분석 메인 함수
function weeklyAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. 모든 시트 데이터 수집
  const data = collectAllData(ss, weekAgo);

  // 2. Gemini API로 분석
  const analysis = callGeminiAnalysis(data);

  // 3. 주간분석 시트에 저장
  saveAnalysisToSheet(ss, analysis, now);

  // 4. 이메일 발송
  if (REPORT_EMAIL) sendAnalysisEmail(analysis, now);

  Logger.log('✅ 주간 분석 완료!');
}

// ★ 모든 시트 데이터 수집
function collectAllData(ss, weekAgo) {
  const result = {};

  const sheetNames = [
    '사용자현황', '심리검사결과', '회원등록', '레벨업이력',
    '연속달성마일스톤', '사연보내기', '설문정보', 'PDF해금',
    '에피소드클릭', '쇼츠클릭', '영상링크클릭', '즐겨찾기',
    '일일방문', '확언완료', '기분체크', '앱설치'
  ];

  sheetNames.forEach(name => {
    try {
      const sheet = ss.getSheetByName(name);
      if (!sheet) return;
      const rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) return;

      // 이번 주 데이터만 필터
      const headers = rows[0];
      const weekRows = rows.slice(1).filter(row => {
        const dateVal = row[0];
        if (!dateVal) return false;
        const d = new Date(dateVal);
        return d >= weekAgo;
      });

      result[name] = { total: rows.length - 1, thisWeek: weekRows.length, headers, weekRows };
    } catch(e) {}
  });

  return result;
}

// ★ Gemini API 호출
function callGeminiAnalysis(data) {
  const prompt = buildPrompt(data);

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
    };

    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });

    const json = JSON.parse(res.getContentText());
    return json.candidates?.[0]?.content?.parts?.[0]?.text || '분석 실패';
  } catch(e) {
    return '분석 오류: ' + e.toString();
  }
}

// ★ 프롬프트 생성
function buildPrompt(data) {
  const lines = [];

  lines.push('당신은 인생2막라디오 확언 앱의 전문 데이터 분석가입니다.');
  lines.push('아래 이번 주 앱 데이터를 분석하여 한국어로 보고서를 작성해주세요.\n');

  // 핵심 지표 요약
  lines.push('=== 이번 주 핵심 데이터 ===');

  if (data['사용자현황']) {
    lines.push(`• 전체 사용자: ${data['사용자현황'].total}명`);
    lines.push(`• 이번 주 활동 사용자: ${data['사용자현황'].thisWeek}명`);
  }
  if (data['회원등록']) {
    lines.push(`• 이번 주 신규 등록: ${data['회원등록'].thisWeek}명`);
  }
  if (data['심리검사결과']) {
    lines.push(`• 심리검사 완료: 누적 ${data['심리검사결과'].total}명 / 이번 주 ${data['심리검사결과'].thisWeek}명`);
    // 유형 분포
    const typeCount = {};
    data['심리검사결과'].weekRows.forEach(row => {
      const type = row[6] || '미상';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    if (Object.keys(typeCount).length > 0) {
      lines.push(`• 이번 주 인기 유형: ${JSON.stringify(typeCount)}`);
    }
    // 자존감 평균
    const rseVals = data['심리검사결과'].weekRows.map(r => Number(r[13])).filter(v => v > 0);
    if (rseVals.length > 0) {
      const avg = (rseVals.reduce((a,b)=>a+b,0)/rseVals.length).toFixed(1);
      lines.push(`• 이번 주 평균 자존감(RSE): ${avg}점`);
    }
  }
  if (data['레벨업이력']) {
    lines.push(`• 레벨업 달성: ${data['레벨업이력'].thisWeek}명`);
    data['레벨업이력'].weekRows.forEach(row => {
      lines.push(`  - ${row[1]} → ${row[3]}`);
    });
  }
  if (data['연속달성마일스톤']) {
    lines.push(`• 연속달성 마일스톤: ${data['연속달성마일스톤'].thisWeek}명`);
  }
  if (data['사연보내기']) {
    lines.push(`• 사연 보낸 사람: ${data['사연보내기'].thisWeek}명`);
  }
  if (data['영상링크클릭']) {
    lines.push(`• 영상 링크 클릭: ${data['영상링크클릭'].thisWeek}회`);
  }
  if (data['기분체크']) {
    lines.push(`• 기분 체크: ${data['기분체크'].thisWeek}회`);
  }

  lines.push('\n');
  lines.push('=== 분석 요청 ===');
  lines.push('위 데이터를 바탕으로 아래 항목을 분석해주세요:\n');
  lines.push('1. 📊 이번 주 핵심 요약 (3줄 이내)');
  lines.push('2. 🌟 잘 되고 있는 점 (구체적으로)');
  lines.push('3. ⚠️ 주의가 필요한 점 (구체적으로)');
  lines.push('4. 📺 이번 주 만들면 좋을 콘텐츠 주제 (데이터 근거 포함)');
  lines.push('5. 💰 수익화 기회 포인트 (구체적 액션 포함)');
  lines.push('6. 🎯 다음 주 우선 행동 3가지 (가장 중요한 것부터)');
  lines.push('7. 💡 채널 성장을 위한 인사이트 (데이터에서 발견한 패턴)');

  return lines.join('\n');
}

// ★ 주간분석 시트에 저장
function saveAnalysisToSheet(ss, analysis, date) {
  let sheet = ss.getSheetByName('주간분석리포트');
  if (!sheet) {
    sheet = ss.insertSheet('주간분석리포트');
    sheet.appendRow(['날짜', '분석내용']);
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 800);
  }
  sheet.appendRow([date, analysis]);

  // 최신 분석을 맨 위로
  const lastRow = sheet.getLastRow();
  if (lastRow > 2) {
    sheet.moveRows(sheet.getRange(lastRow, 1, 1, 2), 2);
  }
}

// ★ 이메일 발송
function sendAnalysisEmail(analysis, date) {
  try {
    const subject = `[인생확언앱] 주간 분석 리포트 - ${Utilities.formatDate(date, 'Asia/Seoul', 'yyyy년 MM월 dd일')}`;
    const body = `안녕하세요!\n\n이번 주 인생확언 앱 분석 리포트입니다.\n\n${analysis}\n\n---\n구글 시트에서 전체 데이터를 확인하세요.`;
    GmailApp.sendEmail(REPORT_EMAIL, subject, body);
  } catch(e) {
    Logger.log('이메일 발송 실패: ' + e);
  }
}

// ★ 즉시 분석 실행 (테스트용)
function runAnalysisNow() {
  weeklyAnalysis();
  SpreadsheetApp.getUi().alert('✅ 분석 완료! 주간분석리포트 시트를 확인하세요.');
}
