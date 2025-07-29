import hljs from 'highlight.js';
// Atom One Dark 테마 사용
import 'highlight.js/styles/atom-one-dark.css';

// highlight.js를 전역에 등록
if (typeof window !== 'undefined') {
  window.hljs = hljs;
  
  // 언어 설정
  hljs.configure({
    languages: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'sql', 'bash', 'json', 'typescript', 'jsx', 'tsx'],
    classPrefix: 'hljs-'
  });
}

export default hljs;