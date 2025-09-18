// 환경 변수 수정 및 export 추가
const cloudName = process.env.REACT_APP_CLOUD_NAME;
const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;

const imageUploader = async (file) => {
    // 환경 변수 확인 (더 자세한 디버깅)
    console.log('🔍 전체 process.env:', process.env);
    console.log('🔍 Cloudinary 설정:');
    console.log('cloudName:', cloudName);
    console.log('uploadPreset:', uploadPreset);
    console.log('REACT_APP_CLOUD_NAME 원본:', process.env.REACT_APP_CLOUD_NAME);
    console.log('REACT_APP_UPLOAD_PRESET 원본:', process.env.REACT_APP_UPLOAD_PRESET);
    
    if (!cloudName || !uploadPreset) {
        console.error('❌ Cloudinary 환경 변수가 설정되지 않았습니다');
        alert(`환경변수 누락: cloudName=${cloudName}, uploadPreset=${uploadPreset}`);
        throw new Error('Cloudinary 설정이 누락되었습니다');
    }
    
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    
    try {
        console.log('📤 이미지 업로드 시작:', file.name, file.size);
        
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, 
            {
                method: "POST",
                body: data,
            }
        );
        
        console.log('📥 응답 상태:', res.status, res.statusText);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ 업로드 실패 응답:', errorText);
            throw new Error(`Upload failed: ${res.status} - ${errorText}`);
        }
        
        const result = await res.json();
        console.log('✅ 업로드 성공:', result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error('💥 Image upload error:', error);
        throw error;
    }
};

export default imageUploader; 