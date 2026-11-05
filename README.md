# 🇧🇹 DrukLearn – Project II
### Learn Dzongkha, Learn Bhutan.

DrukLearn is a mobile-based Dzongkha learning application designed to make learning Bhutan's national language more interactive, accessible, and engaging.

Project II builds upon the original DrukLearn application by introducing an improved learning experience with a structured learning path, daily missions, vocabulary practice, personalized revision, gamification, and Tibetan-script calligraphy practice.

---

## 📖 Project Overview

Learning a new language requires consistent practice and motivation. DrukLearn addresses this by combining interactive lessons, quizzes, writing practice, and gamified learning activities in one mobile application.

The application supports two main user roles:

- **Students:** Learn Dzongkha, complete lessons, practise vocabulary, attempt quizzes, and track learning progress.
- **Teachers:** Manage learning content, create quizzes, organize competitions, and monitor student performance.

## ✨ Key Features

### 1. User Authentication
- Student and teacher registration.
- Email and password login.
- Role-based navigation.
- Password recovery.
- Profile management.

### 2. Interactive Learning
- Structured lessons organized by topics.
- Vocabulary and phrase learning.
- Lesson completion tracking.
- Access codes for individual lessons and quizzes.

### 3. Learning Path
- Organized learning journey through different topics.
- Locked and unlocked learning nodes.
- Progress-based topic unlocking.
- Visual representation of learning progress.

### 4. Quizzes and Weekly Competition
- Multiple-choice quizzes.
- Teacher-created questions.
- Automatic answer checking.
- Weekly learning competitions.
- Student rankings and leaderboards.

### 5. Calligraphy Practice
- Practice Tibetan-script characters used for Dzongkha.
- Trace characters using finger drawing.
- Faint character guides for tracing.
- Visual comparison of student drawings with reference characters.
- Percentage-based tracing score when supported by the device.

### 6. Gamification and Rewards
- Earn XP by completing learning activities.
- Level progression.
- Daily learning streaks.
- Achievement badges.
- Weekly and overall leaderboards.
- Hearts system to encourage careful quiz practice.

### 7. Daily Missions
- Daily learning challenges.
- Activity-based progress tracking.
- XP rewards for completing missions.
- Daily mission resets.

### 8. Vocabulary and Personalized Review
- Word of the Day.
- Vocabulary learning and practice.
- Save useful words for later revision.
- Personalized review based on weaker topics.
- Additional XP for revision activities.

### 9. Notifications
- Local learning reminders.
- Daily practice reminders.
- Streak reminders.
- Test notification functionality.

### 10. Teacher Dashboard
- Create, edit, and delete lessons.
- Create, edit, and delete quizzes.
- Manage weekly competitions.
- Manage vocabulary content.
- View student learning progress.
- Monitor quiz scores and lesson completion.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React Native | Mobile application development |
| Expo | Development and testing environment |
| JavaScript | Application programming language |
| Expo Router | Navigation and routing |
| Firebase Authentication | User authentication |
| Cloud Firestore | Cloud database |
| React Native Skia | Calligraphy drawing and rendering |
| AsyncStorage | Local data persistence |
| Expo Notifications | Local notifications |
| Git & GitHub | Version control and source code hosting |

---

## 📂 Project Structure

```text
druklearn/
│
├── assets/
│   └── fonts/
│       └── TibetanFont.ttf
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (student)/
│   │   ├── (teacher)/
│   │   ├── _layout.js
│   │   └── index.js
│   │
│   ├── components/
│   │   ├── calligraphy/
│   │   ├── learning/
│   │   └── ui/
│   │
│   ├── config/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   └── utils/
│
├── .env
├── .gitignore
├── app.json
├── eas.json
├── package.json
└── README.md
```

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- Git
- Visual Studio Code
- Expo Go (for compatible device testing)

### 1. Clone the Repository

```bash
git clone https://github.com/kinley-wa/DRUKLEARN_PROJECT_2.git
```

### 2. Navigate to the Project

```bash
cd DRUKLEARN_PROJECT_2
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Firebase

Create a `.env` file in the project root and add your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the placeholder values with your own Firebase project configuration.

Enable Email/Password authentication in Firebase Authentication and configure Cloud Firestore with the required collections and security rules.

### 5. Start the Application

```bash
npx expo start -c
```

Scan the QR code using Expo Go to open the application on a compatible device.

---

## 🔥 Firebase Integration

DrukLearn uses Firebase services to support authentication and cloud-based learning data.

Main Firestore collections include:

- `users`
- `lessons`
- `quizzes`
- `competitions`
- `competition_attempts`
- `topics`
- `vocabulary`
- `dailyMissions`
- `savedWords`
- `topicStats`

Additional per-user records support progress, achievements, review, and learning activities.

---

## 🎯 Project Objectives

- Make Dzongkha learning more accessible through mobile technology.
- Encourage independent and consistent language practice.
- Improve vocabulary, reading, and writing skills.
- Provide interactive learning activities.
- Motivate students through rewards and achievements.
- Support teachers in managing lessons and monitoring student progress.

---

## ⚠️ Known Limitations

- Calligraphy scoring measures visual shape and position overlap, not stroke order or writing direction.
- Calligraphy scoring may not be supported on every device.
- Local notifications have limitations when the application is closed.
- Expo Go does not fully support remote push notifications; a development build is needed for that functionality.
- XP, hearts, and access-code checks are primarily client-side and would require additional server-side validation for production security.

---

## 🚀 Future Improvements

- Improve calligraphy recognition and stroke-order evaluation.
- Add more Dzongkha vocabulary and learning materials.
- Introduce additional interactive exercises.
- Improve offline learning support.
- Add secure server-side validation.
- Support more language-learning levels.
- Improve accessibility and user experience.

---

## 👨‍💻 Developer

**Project:** DrukLearn – Project II  
**Repository:** [DRUKLEARN_PROJECT_2](https://github.com/kinley-wa/DRUKLEARN_PROJECT_2)  
**Platform:** Android and iOS (Expo-compatible development)

---

### 🇧🇹 DrukLearn
*Learn Dzongkha, Learn Bhutan.*

