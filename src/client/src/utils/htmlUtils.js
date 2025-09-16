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

// HTML 태그 목록 (유지보수성을 위해 분리)
const HTML_TAGS = [
  '<p>', '<div>', '<h1>', '<h2>', '<h3>', '<h4>', '<h5>', '<h6>',
  '<strong>', '<em>', '<ul>', '<ol>', '<li>', '<pre>', '<code>',
  '<img>', '<br>', '<blockquote>', '<a>', '<span>'
];

// HTML 콘텐츠인지 확인하는 함수 (성능 최적화)
export const isHtmlContent = (content) => {
  if (!content || typeof content !== 'string') return false;
  
  // 닫는 태그가 있으면 HTML로 간주 (가장 빠른 검사)
  if (content.includes('</')) return true;
  
  // ReactQuill에서 생성되는 특별한 클래스들 검사
  if (content.includes('ql-') || content.includes('class=')) return true;
  
  // 속성이 있는 태그들 검사 (더 포괄적)
  if (content.match(/<[a-zA-Z][^>]*>/)) return true;
  
  // HTML 태그 검사 (some으로 최적화)
  return HTML_TAGS.some(tag => content.includes(tag));
}; 