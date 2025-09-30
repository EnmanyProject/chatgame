// 캐릭터 사진 관리 API v1.0.0
// GitHub API를 통한 사진 저장 및 관리 시스템

import { Octokit } from 'https://esm.sh/@octokit/rest';

// GitHub 설정
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'EnmanyProject';
const GITHUB_REPO = 'chatgame';
const PHOTOS_FILE_PATH = 'data/character-photos.json';

// Octokit 인스턴스 생성
const octokit = new Octokit({
    auth: GITHUB_TOKEN,
});

// 📸 사진 카테고리 설정
const PHOTO_CATEGORIES = {
    'profile': { name: '프로필', max: 1, description: '메인 프로필 사진' },
    'casual': { name: '일상', max: 5, description: '일상적인 모습' },
    'romantic': { name: '로맨틱', max: 5, description: '로맨틱한 순간' },
    'emotional': { name: '감정표현', max: 5, description: '다양한 감정 표현' },
    'special': { name: '특별한순간', max: 4, description: '특별한 이벤트나 순간' }
};

// 🔧 유틸리티 함수들
function validatePhotoData(photoData, category) {
    if (!photoData || !photoData.startsWith('data:image/')) {
        throw new Error('유효하지 않은 이미지 데이터입니다.');
    }

    if (!PHOTO_CATEGORIES[category]) {
        throw new Error(`지원하지 않는 카테고리입니다: ${category}`);
    }

    // Base64 데이터 크기 확인 (약 500KB 제한)
    const sizeInBytes = (photoData.length * 3) / 4;
    const maxSizeInBytes = 500 * 1024; // 500KB

    if (sizeInBytes > maxSizeInBytes) {
        throw new Error(`이미지 크기가 너무 큽니다. 최대 500KB까지 지원됩니다. (현재: ${Math.round(sizeInBytes / 1024)}KB)`);
    }

    return true;
}

function generatePhotoId(characterId, category) {
    const timestamp = Date.now();
    return `${characterId}_${category}_${timestamp}`;
}

// 📂 GitHub에서 사진 데이터 로드
async function loadPhotosFromGitHub() {
    try {
        const { data } = await octokit.repos.getContent({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            path: PHOTOS_FILE_PATH,
        });

        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return JSON.parse(content);
    } catch (error) {
        if (error.status === 404) {
            console.log('📸 사진 데이터베이스가 없습니다. 새로 생성합니다.');
            return {
                photos: {},
                metadata: {
                    version: "1.0.0",
                    total_characters: 0,
                    total_photos: 0,
                    storage_type: "github_base64",
                    max_photo_size: "500KB",
                    supported_formats: ["jpeg", "jpg", "png", "webp"],
                    categories: PHOTO_CATEGORIES,
                    created: new Date().toISOString(),
                    last_updated: new Date().toISOString()
                }
            };
        }
        throw error;
    }
}

// 💾 GitHub에 사진 데이터 저장
async function savePhotosToGitHub(photosData, sha) {
    const content = Buffer.from(JSON.stringify(photosData, null, 2)).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: PHOTOS_FILE_PATH,
        message: `Update character photos database - ${new Date().toISOString()}`,
        content: content,
        sha: sha,
    });
}

// 🎯 메인 API 핸들러
export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { action, character_id, category, photo_id } = req.method === 'GET' ? req.query : req.body;

        console.log(`📸 사진 API 호출: ${action} - ${character_id || 'N/A'}`);

        // 사진 데이터 로드
        const photosData = await loadPhotosFromGitHub();
        let needsSave = false;
        let sha = null;

        // GitHub 파일의 SHA 가져오기 (업데이트를 위해 필요)
        try {
            const { data: fileData } = await octokit.repos.getContent({
                owner: GITHUB_OWNER,
                repo: GITHUB_REPO,
                path: PHOTOS_FILE_PATH,
            });
            sha = fileData.sha;
        } catch (error) {
            // 파일이 없는 경우 새로 생성
            sha = null;
        }

        switch (action) {
            case 'list_all_photos':
                return res.status(200).json({
                    success: true,
                    data: photosData,
                    timestamp: new Date().toISOString()
                });

            case 'get_character_photos':
                if (!character_id) {
                    return res.status(400).json({ success: false, message: '캐릭터 ID가 필요합니다.' });
                }

                const characterPhotos = photosData.photos[character_id] || {
                    character_id,
                    photos: Object.keys(PHOTO_CATEGORIES).reduce((acc, cat) => {
                        acc[cat] = cat === 'profile' ? null : [];
                        return acc;
                    }, {}),
                    photo_count: 0
                };

                return res.status(200).json({
                    success: true,
                    data: characterPhotos,
                    categories: PHOTO_CATEGORIES
                });

            case 'upload_photo':
                const { photo_data } = req.body;

                if (!character_id || !category || !photo_data) {
                    return res.status(400).json({
                        success: false,
                        message: '캐릭터 ID, 카테고리, 사진 데이터가 모두 필요합니다.'
                    });
                }

                // 사진 데이터 검증
                validatePhotoData(photo_data, category);

                // 캐릭터 사진 데이터 초기화 (없는 경우)
                if (!photosData.photos[character_id]) {
                    photosData.photos[character_id] = {
                        character_id,
                        character_name: character_id.split('_')[0],
                        photos: Object.keys(PHOTO_CATEGORIES).reduce((acc, cat) => {
                            acc[cat] = cat === 'profile' ? null : [];
                            return acc;
                        }, {}),
                        photo_count: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                }

                const charPhotos = photosData.photos[character_id];
                const categoryConfig = PHOTO_CATEGORIES[category];

                // 카테고리별 최대 개수 확인
                if (category === 'profile') {
                    charPhotos.photos.profile = {
                        id: generatePhotoId(character_id, 'profile'),
                        data: photo_data,
                        uploaded_at: new Date().toISOString()
                    };
                } else {
                    if (charPhotos.photos[category].length >= categoryConfig.max) {
                        return res.status(400).json({
                            success: false,
                            message: `${categoryConfig.name} 카테고리는 최대 ${categoryConfig.max}장까지만 업로드 가능합니다.`
                        });
                    }

                    charPhotos.photos[category].push({
                        id: generatePhotoId(character_id, category),
                        data: photo_data,
                        uploaded_at: new Date().toISOString()
                    });
                }

                // 카운트 업데이트
                charPhotos.photo_count = Object.values(charPhotos.photos).reduce((count, photos) => {
                    if (Array.isArray(photos)) {
                        return count + photos.length;
                    } else if (photos !== null) {
                        return count + 1;
                    }
                    return count;
                }, 0);

                charPhotos.updated_at = new Date().toISOString();

                // 메타데이터 업데이트
                photosData.metadata.total_photos = Object.values(photosData.photos).reduce((total, char) => total + char.photo_count, 0);
                photosData.metadata.last_updated = new Date().toISOString();

                needsSave = true;
                break;

            case 'delete_photo':
                if (!character_id || !category || !photo_id) {
                    return res.status(400).json({
                        success: false,
                        message: '캐릭터 ID, 카테고리, 사진 ID가 모두 필요합니다.'
                    });
                }

                if (!photosData.photos[character_id]) {
                    return res.status(404).json({ success: false, message: '캐릭터를 찾을 수 없습니다.' });
                }

                const targetCharPhotos = photosData.photos[character_id];

                if (category === 'profile') {
                    if (targetCharPhotos.photos.profile && targetCharPhotos.photos.profile.id === photo_id) {
                        targetCharPhotos.photos.profile = null;
                        needsSave = true;
                    }
                } else {
                    const photoIndex = targetCharPhotos.photos[category].findIndex(photo => photo.id === photo_id);
                    if (photoIndex !== -1) {
                        targetCharPhotos.photos[category].splice(photoIndex, 1);
                        needsSave = true;
                    }
                }

                if (needsSave) {
                    // 카운트 업데이트
                    targetCharPhotos.photo_count = Object.values(targetCharPhotos.photos).reduce((count, photos) => {
                        if (Array.isArray(photos)) {
                            return count + photos.length;
                        } else if (photos !== null) {
                            return count + 1;
                        }
                        return count;
                    }, 0);

                    targetCharPhotos.updated_at = new Date().toISOString();
                    photosData.metadata.last_updated = new Date().toISOString();
                }

                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: `지원하지 않는 액션입니다: ${action}`
                });
        }

        // 변경사항이 있는 경우 GitHub에 저장
        if (needsSave) {
            await savePhotosToGitHub(photosData, sha);
            console.log('✅ 사진 데이터가 GitHub에 저장되었습니다.');
        }

        return res.status(200).json({
            success: true,
            message: action === 'upload_photo' ? '사진이 성공적으로 업로드되었습니다.' :
                     action === 'delete_photo' ? '사진이 성공적으로 삭제되었습니다.' : '작업 완료',
            data: photosData.photos[character_id] || null,
            categories: PHOTO_CATEGORIES
        });

    } catch (error) {
        console.error('❌ 사진 API 오류:', error);
        return res.status(500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
            error_type: error.name || 'UnknownError'
        });
    }
}