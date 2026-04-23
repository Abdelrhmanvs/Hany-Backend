# API Testing Examples (curl + Postman)

Use these examples to test:
- Signup
- Login
- Create chat
- Send message
- TTS

## Base URL

```bash
export BASE_URL="http://localhost:5000/api"
```

---

## 1) Signup

```bash
curl -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

---

## 2) Login (save token)

```bash
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }')

echo "$LOGIN_RESPONSE"
export TOKEN=$(echo "$LOGIN_RESPONSE" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).data.token));')
echo "TOKEN=$TOKEN"
```

---

## 3) Create Chat (save chat id)

```bash
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Postman Test Chat",
    "firstMessage": "Hello from test setup"
  }')

echo "$CHAT_RESPONSE"
export CHAT_ID=$(echo "$CHAT_RESPONSE" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).data.chat.id));')
echo "CHAT_ID=$CHAT_ID"
```

---

## 4) Send Message to AI

Endpoint: `POST /api/chat/send`

```bash
curl -X POST "$BASE_URL/chat/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"chatId\": \"$CHAT_ID\",
    \"content\": \"Give me one short breathing exercise for stress.\"
  }"
```

---

## 5) TTS (Text to Speech)

Endpoint: `POST /api/tts`

```bash
TTS_RESPONSE=$(curl -s -X POST "$BASE_URL/tts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "Take a slow breath in for four counts, and out for six."
  }')

echo "$TTS_RESPONSE" > tts-response.json
echo "Saved raw response to tts-response.json"
```

Optional: save returned base64 audio to MP3:

```bash
node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync("tts-response.json","utf8")); fs.writeFileSync("tts-output.mp3", Buffer.from(data.data.audioBase64, "base64")); console.log("Saved tts-output.mp3");'
```

---

## Postman Quick Setup

1. Import `postman/Hany-Backend.postman_collection.json`
2. Set collection variables:
   - `baseUrl` = `http://localhost:5000/api`
   - `email` = `test@example.com`
   - `password` = `Password123`
3. Run requests in this order:
   - `Auth / Signup`
   - `Auth / Login` (stores `token`)
   - `Chat / Create` (stores `chatId`)
   - `Chat / Send`
   - `TTS / Generate`
