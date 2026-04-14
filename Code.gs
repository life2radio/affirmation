/**
 * 인생확언 앱 - 구글 앱스 스크립트
 * 이 파일을 구글 앱스 스크립트에 붙여넣고 배포하세요.
 * 
 * [시트 목록]
 * 1. 시크릿코드     - 쇼츠 시크릿 코드 관리
 * 2. 쇼츠영상       - 쇼츠 영상 URL 관리
 * 3. 에피소드배너   - 최신 에피소드 배너
 * 4. 핵심질문       - 테마별 핵심 질문
 * 5. 에피소드DB     - 키워드별 에피소드 매핑
 * 6. PDF링크        - 분기별 확언 PDF 링크
 * 7. 명예의전당     - 300일 달성자 명예의 전당
 * 8. 시크릿콘텐츠   - 날짜별 특별 콘텐츠
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if(data.action === 'user_log'){
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName('사용자현황');
      if(!sheet){
        sheet = ss.insertSheet('사용자현황');
        sheet.appendRow(['최종업데이트','닉네임','기기','설치일','총달성일','연속달성','포인트','등급','마지막방문']);
      }
      // 닉네임으로 기존 행 찾기
      const rows = sheet.getDataRange().getValues();
      let found = -1;
      for(let i=1; i<rows.length; i++){
        if(rows[i][1] === data.nickname && rows[i][2] === data.device){
          found = i+1; break;
        }
      }
      const row = [
        new Date(), data.nickname, data.device,
        data.installDate, data.totalDays, data.streak,
        data.points, data.level, data.lastVisit
      ];
      if(found > 0){
        sheet.getRange(found, 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
      }
    }
  } catch(e) {}
  return ContentService.createTextOutput('ok');
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};

  // ① 시크릿 코드
  try {
    const sheet = ss.getSheetByName('시크릿코드');
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      const codes = {};
      rows.slice(1).forEach(row => {
        if (row[0] && row[1]) {
          const dateStr = Utilities.formatDate(new Date(row[0]), 'Asia/Seoul', 'yyyy-M-d');
          codes[dateStr] = String(row[1]).trim();
        }
      });
      result.secretCodes = codes;
    }
  } catch(e) { result.secretCodes = {}; }

  // ② 쇼츠 영상
  try {
    const sheet = ss.getSheetByName('쇼츠영상');
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      const shorts = [];
      rows.slice(1).forEach(row => {
        if (row[0]) {
          shorts.push({
            ep:    Number(row[0]),
            title: String(row[1] || ''),
            theme: String(row[2] || ''),
            url:   String(row[3] || '')
          });
        }
      });
      result.shorts = shorts;
    }
  } catch(e) { result.shorts = []; }

  // ③ 에피소드 배너 (최신 1개)
  try {
    const sheet = ss.getSheetByName('에피소드배너');
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      // 마지막 행이 최신
      const last = rows.slice(1).filter(r => r[0]).pop();
      if (last) {
        result.episode = {
          title: String(last[0] || ''),
          url:   String(last[1] || ''),
          date:  last[2] ? Utilities.formatDate(new Date(last[2]), 'Asia/Seoul', 'yyyy-MM-dd') : ''
        };
      }
    }
  } catch(e) {}

  // ④ 핵심 질문 (테마별)
  try {
    const sheet = ss.getSheetByName('핵심질문');
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      const questions = [];
      rows.slice(1).forEach(row => {
        if (row[0] && row[1]) {
          questions.push({
            theme:    String(row[0]).trim(),
            question: String(row[1]).trim(),
            type:     String(row[2] || 'episode').trim(),
            url:      String(row[3] || '').trim()
          });
        }
      });
      result.questions = questions;
    }
  } catch(e) { result.questions = []; }

  // ⑤ 에피소드 DB (키워드 매핑)
  try {
    const sheet = ss.getSheetByName('에피소드DB');
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      const episodes = [];
      rows.slice(1).forEach(row => {
        if (row[0] && row[1]) {
          const keywords = String(row[2] || '').split(',').map(k => k.trim()).filter(k => k);
          episodes.push({
            title:    String(row[0]).trim(),
            url:      String(row[1]).trim(),
            keywords: keywords
          });
        }
      });
      result.episodeDB = episodes;
    }
  } catch(e) {}

  // ⑥ 설정 (PDF 링크, 명예의전당 등)
  try {
    const sheet = ss.getSheetByName('설정');
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      const settings = {};
      rows.slice(1).forEach(row => {
        if (row[0] && row[1]) {
          settings[String(row[0]).trim()] = String(row[1]).trim();
        }
      });
      result.settings = settings;
    }
  } catch(e) {}

  // ⑦ 시크릿 특별 콘텐츠 (날짜별)
  try {
    const sheet = ss.getSheetByName('시크릿콘텐츠');
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      const contents = {};
      rows.slice(1).forEach(row => {
        if (row[0] && row[1]) {
          const dateStr = Utilities.formatDate(new Date(row[0]), 'Asia/Seoul', 'yyyy-M-d');
          contents[dateStr] = {
            text:   String(row[1] || '').trim(),
            url:    String(row[2] || '').trim(),
            type:   String(row[3] || 'shorts').trim()
          };
        }
      });
      result.secretContents = contents;
    }
  } catch(e) {}

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
