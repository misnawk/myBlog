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
    id: '트러블슈팅',
    name: '트러블슈팅',
    description: '문제 해결, 디버깅, 오류 처리',
    color: '#F56565'
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
    id: '모바일',
    name: '모바일 개발',
    description: 'Android, iOS, React Native, Flutter',
    color: '#3DDC84'
  },
  {
    id: '시스템프로그래밍',
    name: '시스템 프로그래밍',
    description: '컴파일러, 링커, 저수준 프로그래밍',
    color: '#805AD5'
  },
  {
    id: 'DevOps',
    name: 'DevOps/인프라',
    description: 'Docker, K8s, CI/CD, 클라우드',
    color: '#2D3748'
  },
  {
    id: '알고리즘',
    name: '알고리즘/자료구조',
    description: '코딩테스트, PS, 자료구조',
    color: '#D69E2E'
  },
  {
    id: 'CS기초',
    name: 'CS 기초',
    description: '컴퓨터구조, 운영체제, 이산수학', 
    color: '#DD6B20'
  },
  {
    id: '블록체인',
    name: '블록체인/Web3',
    description: '스마트 컨트랙트, DeFi, NFT',
    color: '#319795'
  },
  {
    id: '할일',
    name: '할일',
    description: '할일을 정리해두는 곳',
    color: '#E53E3E'
  },  
  {
    id: '독서',
    name: '독서',
    description: '독서를 정리해두는 곳',
    color: '#4299E1'
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