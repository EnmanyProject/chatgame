// 채팅 앱 설정
const ChatConfig = {
    // 캐릭터 설정
    CHARACTER: {
        name: "윤아",
        age: 20,
        relationship: "후배",
        personality: "순수하고 적극적인, 선배를 좋아하는",
        initialAffection: 75
    },

    // 타이밍 설정
    TIMING: {
        typingDelay: 1500,      // 타이핑 인디케이터 표시 시간
        messageDelay: 800,      // 메시지 간 간격
        choiceDelay: 2000,      // 선택지 표시까지의 지연
        autoProgressDelay: 3000 // 자동 진행 지연
    },

    // UI 설정
    UI: {
        maxMessagesVisible: 50, // 화면에 표시할 최대 메시지 수
        animationSpeed: 300,    // 애니메이션 속도
        scrollBehavior: 'smooth'
    },

    // 시나리오 설정
    STORY: {
        title: "어제 밤의 기억",
        description: "술 마신 후 기억이 가물가물한 상황에서 시작되는 후배와의 대화",
        totalMessages: 200,
        branchingPoints: 15
    }
};

// 전역 변수로 설정
if (typeof window !== 'undefined') {
    window.ChatConfig = ChatConfig;
}