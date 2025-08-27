// Vercel 서버리스 환경에서 파일 업로드 처리
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

// Vercel에서는 /tmp 디렉토리만 쓰기 가능
const UPLOAD_DIR = '/tmp/uploads';

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
      // multipart/form-data 파싱
      const form = new IncomingForm({
        uploadDir: UPLOAD_DIR,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB 제한
      });

      // 업로드 디렉토리 생성
      try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
      } catch (error) {
        // 이미 존재하는 경우 무시
      }

      const [fields, files] = await form.parse(req);
      
      if (!files.avatar || !files.avatar[0]) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const uploadedFile = files.avatar[0];
      const fileExtension = path.extname(uploadedFile.originalFilename || '').toLowerCase();
      
      // 이미지 파일만 허용
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }

      // 파일 내용을 Base64로 인코딩하여 메모리에 저장
      const fileBuffer = await fs.readFile(uploadedFile.filepath);
      const base64Data = fileBuffer.toString('base64');
      const mimeType = getMimeType(fileExtension);
      const dataUrl = `data:${mimeType};base64,${base64Data}`;
      
      // 고유 파일 ID 생성
      const fileId = `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 메모리에 저장
      RUNTIME_FILES[fileId] = {
        id: fileId,
        originalName: uploadedFile.originalFilename,
        mimeType: mimeType,
        size: uploadedFile.size,
        dataUrl: dataUrl,
        uploadedAt: new Date().toISOString()
      };

      // 임시 파일 삭제
      try {
        await fs.unlink(uploadedFile.filepath);
      } catch (error) {
        console.log('Failed to delete temp file:', error);
      }

      return res.status(200).json({
        success: true,
        file: {
          id: fileId,
          url: `/api/upload?file=${fileId}`,
          dataUrl: dataUrl,
          size: uploadedFile.size,
          name: uploadedFile.originalFilename
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Upload failed: ' + error.message });
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

// MIME 타입 결정
function getMimeType(extension) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[extension] || 'application/octet-stream';
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