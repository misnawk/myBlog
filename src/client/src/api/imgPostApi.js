
// 환경 변수 수정 및 export 추가
const cloudName = process.env.REACT_APP_CLOUD_NAME;
const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;


const imageUploader = async (file) => {
    
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    
    try {
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, 
            {
                method: "POST",
                body: data,
            }
        );
        
        if (!res.ok) throw new Error('Upload failed');
        
        const result = await res.json();
        return result.secure_url;
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
};

export default imageUploader; 