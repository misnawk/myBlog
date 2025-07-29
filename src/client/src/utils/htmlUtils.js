import DOMPurify from 'dompurify';

// HTML 태그를 제거하고 텍스트만 추출하는 함수
export const stripHtmlTags = (html) => {
  if (!html) return '';
  
  // DOMPurify로 HTML을 안전하게 정제 (모든 태그 제거)
  const cleanHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  
  // HTML 엔티티 디코딩
  const textarea = document.createElement('textarea');
  textarea.innerHTML = cleanHTML;
  return textarea.value.replace(/\s+/g, ' ').trim();
};

// 텍스트 미리보기 생성 함수
export const createPreview = (content, maxLength = 150) => {
  if (!content) return '내용이 없습니다.';
  
  const plainText = stripHtmlTags(content);
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...' 
    : plainText;
};

// HTML 콘텐츠인지 확인하는 함수
export const isHtmlContent = (content) => {
  return content && (
    content.includes('<p>') || 
    content.includes('<div>') || 
    content.includes('<h1>') || 
    content.includes('<h2>') || 
    content.includes('<h3>') ||
    content.includes('<strong>') ||
    content.includes('<em>') ||
    content.includes('<ul>') ||
    content.includes('<ol>') ||
    content.includes('<pre>') ||  // 코드블록 추가
    content.includes('<img>') ||  // 이미지 추가
    content.includes('<br>') ||   // 줄바꿈 추가
    content.includes('<blockquote>') || // 인용문 추가
    content.includes('</') // 닫는 태그가 있으면 HTML로 간주
  );
}; 