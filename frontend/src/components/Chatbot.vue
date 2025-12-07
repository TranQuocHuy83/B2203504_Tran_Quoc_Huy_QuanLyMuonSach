<template>
  <div>
    <!-- ICON CHATBOT NỔI -->
    <div class="chatbot-icon" @click="toggleChat">
      <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" />
    </div>

    <!-- TOÀN BỘ CHAT UI -->
    <div v-if="isOpen" class="chat-app">
      <!-- Khung chatbot -->
      <div id="chat-container">
        <div id="header">
          <div class="title">🤖 Chat với Emotor</div>
          <div class="subtitle">“Chạy xanh – Sống chất”</div>
        </div>

        <div id="messages">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="msg.sender === 'user' ? 'user-msg' : 'bot-msg'"
          >
            {{ msg.text }}
          </div>
        </div>

        <div id="input-container">
          <input
            v-model="userInput"
            type="text"
            placeholder="Nhập tin nhắn..."
            @keypress.enter="sendMessage"
          />

          <!-- Nút emoji -->
          <button id="emoji-btn" @click="toggleEmojiPicker" ref="emojiBtn">
            🤖
          </button>

          <div id="emoji-picker" v-show="showEmojiPicker" ref="emojiPicker">
            <span v-for="emoji in emojis" :key="emoji" @click="addEmoji(emoji)">
              {{ emoji }}
            </span>
          </div>

          <button id="send-btn" @click="sendMessage">
            <svg width="30" height="30" viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" fill="#0078ff" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatbotWidget",

  data() {
    return {
      isOpen: false,
      senderId: "user_" + Math.floor(Math.random() * 1000000),

      messages: [],
      userInput: "",

      showEmojiPicker: false,

      emojis: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😊",
        "🙂",
        "🙃",
        "😉",
        "😍",
        "😘",
        "😋",
        "😛",
        "😝",
        "😜",
        "🤪",
        "😎",
        "🥳",
        "🤩",
        "😏",
        "😒",
        "😞",
        "😔",
        "😟",
        "😕",
        "🙁",
        "😖",
        "😫",
        "😩",
        "😭",
        "😤",
        "😠",
        "😡",
        "🤬",
        "🤯",
        "😳",
        "🥵",
        "🥶",
        "😨",
        "😰",
        "😥",
        "😓",
        "🤔",
        "🤭",
        "🤫",
        "🤥",
        "😐",
        "😑",
        "😬",
        "🤧",
        "🤒",
        "🤕",
        "🤑",
        "🤠",
        "👿",
        "👻",
        "💀",
        "🤖",
        "💩",
        "😺",
        "😸",
        "😹",
        "😻",
        "😼",
        "😽",
        "🙀",
        "😿",
        "😾",
      ],

      nluResult: "Chưa có dữ liệu...",

      rasaUrl: "http://localhost:5005/webhooks/rest/webhook",
      parseUrl: "http://localhost:5005/model/parse",
    };
  },

  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen && this.messages.length === 0) {
        this.addMessage("Xin chào! Emotor có thể hỗ trợ gì cho bạn? 🚀", "bot");
      }
    },

    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },

    addEmoji(emoji) {
      this.userInput += emoji;
      this.showEmojiPicker = false;
    },

    handleClickOutside(event) {
      const picker = this.$refs.emojiPicker;
      const btn = this.$refs.emojiBtn;

      if (
        picker &&
        btn &&
        !picker.contains(event.target) &&
        !btn.contains(event.target)
      ) {
        this.showEmojiPicker = false;
      }
    },

    addMessage(text, sender) {
      this.messages.push({ text, sender });
      this.$nextTick(() => {
        const messagesDiv = this.$el.querySelector("#messages");
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
    },

    async analyzeNLU(text) {
      try {
        const res = await fetch(this.parseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const data = await res.json();
        const intent = data.intent?.name || "Không xác định";
        const score = data.intent?.confidence?.toFixed(3) || "N/A";

        let entityList = (data.entities || [])
          .map(
            (e) =>
              `${e.entity}: "${e.value}" (score: ${
                e.confidence_entity?.toFixed(3) || "?"
              })`
          )
          .join("\n");

        if (!entityList) entityList = "(Không có entity nào)";

        this.nluResult =
          `🧠 Phân tích NLU\n\n` +
          `Người dùng: ${text}\n` +
          `Intent: ${intent}\n` +
          `Confidence: ${score}\n` +
          `Entities:\n${entityList}`;
      } catch (err) {
        console.error("❌ Lỗi phân tích NLU:", err);
        this.nluResult = "⚠️ Không thể phân tích NLU!";
      }
    },

    async sendMessage() {
      const text = this.userInput.trim();
      if (!text) return;

      this.addMessage(text, "user");
      this.userInput = "";

      try {
        const res = await fetch(this.rasaUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender: this.senderId, message: text }),
        });

        const data = await res.json();

        data.forEach((msg) => {
          if (msg.text) this.addMessage(msg.text, "bot");
        });

        setTimeout(() => this.analyzeNLU(text), 300);
      } catch (err) {
        console.error("⚠️ Lỗi Rasa:", err);
        this.addMessage("⚠️ Không thể kết nối Rasa!", "bot");
      }
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
/* ICON NỔI */
.chatbot-icon {
  position: fixed;
  bottom: 25px;
  right: 25px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #0078ff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  animation: popIn 0.3s ease;
}

.chatbot-icon img {
  width: 40px;
  height: 40px;
}

/* CHAT UI */
.chat-app {
  position: fixed;
  top: 5px;
  right: 60px;
  display: flex;
  gap: 20px;
  z-index: 9998;
  font-family: "Segoe UI", Arial, sans-serif;
  padding: 20px;
}

/* KHUNG CHAT */
#chat-container {
  width: 350px;
  height: 510px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.6s ease;
}

#header {
  background: linear-gradient(90deg, #0078ff, #00c6ff);
  color: white;
  text-align: center;
  padding: 3px;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 19px;
  font-weight: 600;
}

.subtitle {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 3px;
  font-style: italic;
}

#messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f6f8fa;
}

.user-msg,
.bot-msg {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 18px;
  margin: 8px 0;
  display: inline-block;
  line-height: 1.4;
  animation: popIn 0.3s ease-out;
  clear: both;
}

.user-msg {
  background: #0078ff;
  color: white;
  float: right;
  border-bottom-right-radius: 4px;
}

.bot-msg {
  background: #e5e7eb;
  color: #333;
  float: left;
  border-bottom-left-radius: 4px;
}

#input-container {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #ffffff;
  border-top: 1px solid #e5e5e5;
  gap: 10px;
  position: relative;
}

#input-container input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 6px 0;
  font-size: 16px;
}

#emoji-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

#emoji-picker {
  position: absolute;
  bottom: 50px;
  right: 5px;
  width: 340px;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  z-index: 9999;
}

#emoji-picker span {
  cursor: pointer;
  font-size: 22px;
  padding: 4px;
  border-radius: 6px;
}

#emoji-picker span:hover {
  background: #f0f0f0;
}

#send-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
}

#send-btn:hover {
  background: #e0f0ff;
}

/* ANIMATION */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
