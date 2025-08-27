// Vercel 서버리스 환경에서 파일 업로드 처리 (Base64 방식)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// 메모리 기반 파일 저장소 (Vercel 서버리스 대응)
let RUNTIME_FILES = {};

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { fileData, fileName, fileType } = req.body;
      
      if (!fileData || !fileName) {
        return res.status(400).json({ error: 'File data and name are required' });
      }

      // Base64 데이터인지 확인
      if (!fileData.startsWith('data:')) {
        return res.status(400).json({ error: 'Invalid file data format' });
      }

      // 파일 크기 체크 (대략적으로)
      const base64Data = fileData.split(',')[1];
      const sizeInBytes = (base64Data.length * 3) / 4;
      if (sizeInBytes > 5 * 1024 * 1024) { // 5MB 제한
        return res.status(400).json({ error: 'File too large (max 5MB)' });
      }

      // 이미지 파일 타입 확인
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const detectedType = fileData.split(';')[0].split(':')[1];
      
      if (!allowedTypes.includes(detectedType)) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }
      
      // 고유 파일 ID 생성
      const fileId = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 메모리에 저장
      RUNTIME_FILES[fileId] = {
        id: fileId,
        originalName: fileName,
        mimeType: detectedType,
        size: sizeInBytes,
        dataUrl: fileData,
        uploadedAt: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        file: {
          id: fileId,
          url: `/api/upload?file=${fileId}`,
          dataUrl: fileData,
          size: Math.round(sizeInBytes),
          name: fileName
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ 
        error: 'Upload failed: ' + error.message,
        success: false 
      });
    }
  }

  // GET 요청: 파일 조회
  if (req.method === 'GET') {
    const { file: fileId } = req.query;
    
    if (!fileId || !RUNTIME_FILES[fileId]) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = RUNTIME_FILES[fileId];
    
    // Base64 데이터에서 실제 이미지 데이터 추출
    const base64Data = file.dataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1년 캐시
    
    return res.send(buffer);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// 파일 목록 조회 (관리용)
export function getUploadedFiles() {
  return Object.values(RUNTIME_FILES);
}

// 파일 삭제 (관리용)
export function deleteFile(fileId) {
  if (RUNTIME_FILES[fileId]) {
    delete RUNTIME_FILES[fileId];
    return true;
  }
  return false;
}