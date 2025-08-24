// 프로필 사진 관리 시스템
class ProfileManager {
    constructor() {
        this.currentProfileSrc = 'assets/images/yuna.svg';
        this.defaultProfileSrc = 'assets/images/yuna.svg';
        this.tempProfileSrc = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSavedProfile();
    }

    // DOM 요소 초기화
    initializeElements() {
        this.profileModal = document.getElementById('profileModal');
        this.avatar = document.querySelector('.avatar');
        this.profilePreview = document.getElementById('profilePreview');
        this.profileUpload = document.getElementById('profileUpload');
        this.uploadArea = document.getElementById('uploadArea');
        this.selectPhotoBtn = document.getElementById('selectPhotoBtn');
        this.saveProfileBtn = document.getElementById('saveProfileBtn');
        this.resetProfileBtn = document.getElementById('resetProfileBtn');
        this.closeProfileModal = document.getElementById('closeProfileModal');
        
        // 요소 상태 확인
        console.log('🔍 ProfileManager elements initialized:');
        console.log('- profileModal:', !!this.profileModal);
        console.log('- avatar:', !!this.avatar);
        console.log('- profilePreview:', !!this.profilePreview);
        console.log('- profileUpload:', !!this.profileUpload);
        console.log('- uploadArea:', !!this.uploadArea);
        console.log('- selectPhotoBtn:', !!this.selectPhotoBtn);
        console.log('- saveProfileBtn:', !!this.saveProfileBtn);
        console.log('- resetProfileBtn:', !!this.resetProfileBtn);
        console.log('- closeProfileModal:', !!this.closeProfileModal);
    }

    // 이벤트 바인딩
    bindEvents() {
        // 아바타 클릭으로 프로필 모달 열기
        if (this.avatar) {
            console.log('✅ Avatar click event attached');
            this.avatar.addEventListener('click', () => {
                console.log('🖱️ Avatar clicked!');
                this.openProfileModal();
            });
        } else {
            console.error('❌ Avatar element not found! Cannot attach click event.');
        }

        // 모달 닫기
        if (this.closeProfileModal) {
            this.closeProfileModal.addEventListener('click', () => this.closeModal());
        }

        // 모달 바깥 클릭시 닫기
        if (this.profileModal) {
            this.profileModal.addEventListener('click', (e) => {
                if (e.target === this.profileModal) {
                    this.closeModal();
                }
            });
        }

        // 파일 선택 버튼
        if (this.selectPhotoBtn) {
            this.selectPhotoBtn.addEventListener('click', () => {
                this.profileUpload.click();
            });
        }

        // 업로드 영역 클릭
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', () => {
                this.profileUpload.click();
            });
        }

        // 파일 입력 변경
        if (this.profileUpload) {
            this.profileUpload.addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
        }

        // 드래그 앤 드롭
        if (this.uploadArea) {
            this.uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.uploadArea.classList.add('dragover');
            });

            this.uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                this.uploadArea.classList.remove('dragover');
            });

            this.uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                this.uploadArea.classList.remove('dragover');
                this.handleFileDrop(e);
            });
        }

        // 기본 이미지 선택
        document.querySelectorAll('.preset-img').forEach(img => {
            img.addEventListener('click', () => {
                this.selectPresetImage(img);
            });
        });

        // 저장 버튼
        if (this.saveProfileBtn) {
            this.saveProfileBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        // 리셋 버튼
        if (this.resetProfileBtn) {
            this.resetProfileBtn.addEventListener('click', () => {
                this.resetToDefault();
            });
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.profileModal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }

    // 프로필 모달 열기
    openProfileModal() {
        console.log('🖼️ Opening profile modal');
        
        if (!this.profileModal) {
            console.error('❌ Profile modal not found!');
            this.showNotification('프로필 모달을 찾을 수 없습니다.', 'error');
            return;
        }
        
        this.tempProfileSrc = this.currentProfileSrc;
        this.updatePreview(this.currentProfileSrc);
        this.profileModal.classList.remove('hidden');
        this.updateSaveButton();
        
        console.log('✅ Profile modal opened successfully');
    }

    // 프로필 모달 닫기
    closeModal() {
        this.profileModal.classList.add('hidden');
        this.tempProfileSrc = null;
        this.saveProfileBtn.disabled = true;
        this.uploadArea.classList.remove('dragover');
        
        // 파일 입력 초기화
        if (this.profileUpload) {
            this.profileUpload.value = '';
        }
    }

    // 파일 선택 처리
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImageFile(file);
        }
    }

    // 파일 드롭 처리
    handleFileDrop(event) {
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImageFile(file);
        } else {
            this.showNotification('이미지 파일만 업로드할 수 있습니다.', 'error');
        }
    }

    // 이미지 파일 처리
    processImageFile(file) {
        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('파일 크기는 5MB 이하여야 합니다.', 'error');
            return;
        }

        // 이미지 타입 체크
        if (!file.type.startsWith('image/')) {
            this.showNotification('이미지 파일만 업로드할 수 있습니다.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.tempProfileSrc = e.target.result;
            this.updatePreview(this.tempProfileSrc);
            this.updateSaveButton();
            this.clearPresetSelection();
        };
        reader.readAsDataURL(file);
    }

    // 기본 이미지 선택
    selectPresetImage(imgElement) {
        // 이전 선택 제거
        document.querySelectorAll('.preset-img').forEach(img => {
            img.classList.remove('active');
        });
        
        // 새 선택 적용
        imgElement.classList.add('active');
        this.tempProfileSrc = imgElement.dataset.src;
        this.updatePreview(this.tempProfileSrc);
        this.updateSaveButton();
    }

    // 기본 이미지 선택 해제
    clearPresetSelection() {
        document.querySelectorAll('.preset-img').forEach(img => {
            img.classList.remove('active');
        });
    }

    // 미리보기 업데이트
    updatePreview(src) {
        if (this.profilePreview) {
            this.profilePreview.src = src;
        }
    }

    // 저장 버튼 상태 업데이트
    updateSaveButton() {
        if (this.saveProfileBtn) {
            const hasChanges = this.tempProfileSrc && this.tempProfileSrc !== this.currentProfileSrc;
            this.saveProfileBtn.disabled = !hasChanges;
        }
    }

    // 프로필 저장
    saveProfile() {
        if (!this.tempProfileSrc) return;

        try {
            // 현재 프로필 업데이트
            this.currentProfileSrc = this.tempProfileSrc;
            
            // UI 업데이트
            if (this.avatar) {
                this.avatar.src = this.currentProfileSrc;
            }

            // 로컬 스토리지에 저장
            localStorage.setItem('yuna_profile_image', this.currentProfileSrc);
            
            console.log('Profile saved:', this.currentProfileSrc);
            this.showNotification('프로필 사진이 저장되었습니다! 💕', 'success');
            
            // 모달 닫기
            this.closeModal();
            
        } catch (error) {
            console.error('Failed to save profile:', error);
            this.showNotification('저장에 실패했습니다. 다시 시도해주세요.', 'error');
        }
    }

    // 기본으로 되돌리기
    resetToDefault() {
        this.tempProfileSrc = this.defaultProfileSrc;
        this.updatePreview(this.tempProfileSrc);
        this.updateSaveButton();
        
        // 기본 이미지 선택 표시
        document.querySelectorAll('.preset-img').forEach(img => {
            img.classList.remove('active');
            if (img.dataset.src === this.defaultProfileSrc) {
                img.classList.add('active');
            }
        });
    }

    // 저장된 프로필 로드
    loadSavedProfile() {
        try {
            const savedProfile = localStorage.getItem('yuna_profile_image');
            if (savedProfile) {
                this.currentProfileSrc = savedProfile;
                
                // UI 업데이트
                if (this.avatar) {
                    this.avatar.src = this.currentProfileSrc;
                }
                
                console.log('Profile loaded:', this.currentProfileSrc);
            }
        } catch (error) {
            console.error('Failed to load saved profile:', error);
        }
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        if (window.chatUI && window.chatUI.showNotification) {
            window.chatUI.showNotification(message, type);
        } else {
            // 폴백: 간단한 alert
            alert(message);
        }
    }

    // 현재 프로필 정보 가져오기
    getProfileInfo() {
        return {
            currentSrc: this.currentProfileSrc,
            isDefault: this.currentProfileSrc === this.defaultProfileSrc,
            isCustom: this.currentProfileSrc.startsWith('data:')
        };
    }

    // 프로필 내보내기 (디버그용)
    exportProfile() {
        return {
            profileSrc: this.currentProfileSrc,
            timestamp: new Date().toISOString()
        };
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.ProfileManager = ProfileManager;
}