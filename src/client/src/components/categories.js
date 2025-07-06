// 카테고리 목록 중앙 관리
export const CATEGORIES = [
  {
    id: '프론트엔드',
    name: '프론트엔드',
    description: 'React, 넥사크로, Vue, JavaScript 등',
    color: '#61DAFB'
  },
  {
    id: '백엔드',
    name: '백엔드',
    description: 'Node.js, NestJS, 서버 개발',
    color: '#68D391'
  },
  {
    id: '데이터베이스',
    name: '데이터베이스',
    description: 'MySQL, MongoDB, 데이터 모델링',
    color: '#9F7AEA'
  },
  {
    id: '보안',
    name: '보안',
    description: '웹 보안, 인증, 암호화',
    color: '#F56565'
  },
  {
    id: '네트워크',
    name: '네트워크',
    description: 'HTTP, TCP/IP, 네트워크 프로토콜',
    color: '#4299E1'
  },
  {
    id: '모의해킹',
    name: '모의해킹',
    description: '펜테스팅, 취약점 분석',
    color: '#ED8936'
  },
  {
    id: '인공지능',
    name: '인공지능',
    description: 'Machine Learning, Deep Learning',
    color: '#38B2AC'
  },
  {
    id: '정보처리기사',
    name: '정보처리기사',
    description: '정보처리기사 필기/실기 공부',
    color: '#48BB78'
  },
  {
    id: '주식',
    name: '주식',
    description: '투자, 시장 분석, 경제',
    color: '#D69E2E'
  }
];

// 카테고리 이름만 배열로 추출
export const CATEGORY_NAMES = CATEGORIES.map(category => category.name);

// 카테고리 이름으로 객체 찾기
export const getCategoryByName = (name) => {
  return CATEGORIES.find(category => category.name === name);
};

// 카테고리 ID로 객체 찾기
export const getCategoryById = (id) => {
  return CATEGORIES.find(category => category.id === id);
}; 