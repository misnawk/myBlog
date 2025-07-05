// 환경 변수 수정 및 export 추가
const cloudName = process.env.REACT_APP_CLOUD_NAME;
const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;

// 환경변수 체크
console.log('🔧 [CLOUDINARY CONFIG] 환경변수 설정 확인');
console.log('🔧 [CLOUDINARY CONFIG] REACT_APP_CLOUD_NAME:', cloudName);
console.log('🔧 [CLOUDINARY CONFIG] REACT_APP_UPLOAD_PRESET:', uploadPreset);
console.log('🔧 [CLOUDINARY CONFIG] NODE_ENV:', process.env.NODE_ENV);

const imageUploader = async (file) => {
    console.log('📸 [IMAGE UPLOAD] 이미지 업로드 시작');
    console.log('📸 [IMAGE UPLOAD] 파일 정보:', {
        name: file?.name,
        size: file?.size,
        type: file?.type,
        lastModified: file?.lastModified
    });
    
    // 환경변수 체크
    if (!cloudName || !uploadPreset) {
        console.error('❌ [IMAGE UPLOAD] 환경변수 누락');
        console.error('❌ [IMAGE UPLOAD] cloudName:', cloudName);
        console.error('❌ [IMAGE UPLOAD] uploadPreset:', uploadPreset);
        throw new Error('Cloudinary 환경변수가 설정되지 않았습니다. 관리자에게 문의하세요.');
    }
    
    // 파일 유효성 검사
    if (!file) {
        console.error('❌ [IMAGE UPLOAD] 파일이 제공되지 않음');
        throw new Error('업로드할 파일을 선택해주세요.');
    }
    
    // 파일 크기 체크 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        console.error('❌ [IMAGE UPLOAD] 파일 크기 초과:', file.size);
        throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
    }
    
    // 파일 타입 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        console.error('❌ [IMAGE UPLOAD] 지원하지 않는 파일 타입:', file.type);
        throw new Error('지원하는 이미지 형식: JPEG, PNG, GIF, WebP');
    }
    
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('📡 [IMAGE UPLOAD] 업로드 URL:', uploadUrl);
    console.log('📡 [IMAGE UPLOAD] FormData 생성 완료');
    
    try {
        console.log('📤 [IMAGE UPLOAD] Cloudinary 요청 시작');
        
        const res = await fetch(uploadUrl, {
            method: "POST",
            body: data,
        });
        
        console.log('📥 [IMAGE UPLOAD] 응답 수신');
        console.log('📥 [IMAGE UPLOAD] Status:', res.status);
        console.log('📥 [IMAGE UPLOAD] Status Text:', res.statusText);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ [IMAGE UPLOAD] 업로드 실패');
            console.error('❌ [IMAGE UPLOAD] Status:', res.status);
            console.error('❌ [IMAGE UPLOAD] Error Response:', errorText);
            
            if (res.status === 401) {
                throw new Error('Cloudinary 인증 실패. 환경변수를 확인해주세요.');
            } else if (res.status === 400) {
                throw new Error('잘못된 요청. 파일 형식이나 설정을 확인해주세요.');
            } else {
                throw new Error(`업로드 실패: ${res.status} - ${errorText}`);
            }
        }
        
        const result = await res.json();
        console.log('✅ [IMAGE UPLOAD] 업로드 성공');
        console.log('✅ [IMAGE UPLOAD] 결과:', {
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        });
        
        return result.secure_url;
    } catch (error) {
        console.error('❌ [IMAGE UPLOAD] 업로드 중 오류 발생');
        console.error('❌ [IMAGE UPLOAD] Error:', error.message);
        console.error('❌ [IMAGE UPLOAD] Stack:', error.stack);
        throw error;
    }
};

export default imageUploader; 