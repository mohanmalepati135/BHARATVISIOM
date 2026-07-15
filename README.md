<div align="center">

#  BharatVision

### Research Platform for Human Evaluation of AI Image Generation Models

Evaluate how accurately modern AI image generation models represent **Indian festivals, regional traditions, and cultural diversity** through structured blind human evaluation.

---

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

# 🌍 Why BharatVision?

Most AI image benchmarks measure:

- Image quality
- Realism
- Prompt following

Very few evaluate whether AI truly understands **Indian culture**.

BharatVision fills this gap by allowing real users to compare AI-generated images without knowing which model created them.

The platform evaluates:

✅ Cultural Authenticity

✅ Regional Accuracy

✅ Religious Symbols

✅ Traditional Clothing

✅ Prompt Adherence

✅ Overall Visual Quality

---

# ✨ Features

| Admin | Participant |
|--------|------------|
| Prompt Management | Blind Evaluation |
| Image Upload | Rating System |
| Session Management | Randomized Images |
| Analytics | Consent Form |
| Leaderboard | Progress Tracking |
| CSV Export | Secure Login |

---

# 🏗 System Architecture

```text
                +-----------------------+
                |     AI Models         |
                | GPT • Gemini 2.5 • 3.1|
                +----------+------------+
                           |
                    Generated Images
                           |
                           ▼
                 +--------------------+
                 |   Admin Dashboard  |
                 +--------------------+
                           |
                    Upload Images
                           |
                           ▼
                 +--------------------+
                 | Evaluation Session |
                 +--------------------+
                           |
                     Publish Session
                           |
                           ▼
                 +--------------------+
                 | Participants       |
                 +--------------------+
                           |
                    Blind Evaluation
                           |
                           ▼
                 +--------------------+
                 | MongoDB Database   |
                 +--------------------+
                           |
                    Analytics Engine
                           |
                           ▼
                 +--------------------+
                 | Leaderboard        |
                 +--------------------+
```

---

# 🔄 Evaluation Workflow

```text
Prompt Design
      │
      ▼
Image Generation
      │
      ▼
Admin Upload
      │
      ▼
Blind Evaluation
      │
      ▼
Participant Ratings
      │
      ▼
Analytics
      │
      ▼
Leaderboard
```

---

# 📊 Evaluation Criteria

| Criterion | Weight |
|-----------|-------:|
| Prompt Adherence | 20% |
| Cultural Authenticity | 20% |
| Regional Accuracy | 15% |
| Traditional Attire | 10% |
| Religious Symbols | 10% |
| Visual Quality | 15% |
| Overall Rating | 10% |

---

# 🤖 AI Models

| Company | Model |
|----------|-------------------------|
| OpenAI | GPT Image 1 |
| Google | Gemini 2.5 Flash Image |
| Google | Gemini 3.1 Flash Image Preview |

---

# 💻 Tech Stack

### Frontend

- React 19
- Vite
- TypeScript
- TailwindCSS v4
- React Router
- React Hook Form
- TanStack Query
- Framer Motion
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Multer
- Helmet
- Zod

---

# 📂 Project Structure

```text
bharatvision
│
├── client
│
├── server
│
├── screenshots
│
├── docs
│
└── README.md
```

---

# 📸 Screenshots

## 🏠 Dashboard

> Add screenshot

---

## 📝 Prompt Management

> Add screenshot

---

## ☁️ Image Upload

> Add screenshot

---

## 👥 Blind Evaluation

> Add screenshot

---

## 📈 Analytics

> Add screenshot

---

## 🏆 Leaderboard

> Add screenshot

---

# 🔐 Security

✔ JWT Authentication

✔ Role Based Authorization

✔ Helmet

✔ Rate Limiting

✔ Mongo Sanitization

✔ File Validation

✔ Password Hashing

---

# 📈 Analytics

Automatically generated:

- Average Score
- Festival Performance
- Win Percentage
- Leaderboard
- Radar Charts
- Bar Charts
- CSV Export

---

# 🚀 Future Enhancements

- More AI Models
- Video Evaluation
- Expert Review Panel
- Multi-language Prompts
- Public Benchmark
- Mobile App
- PDF Reports

---

# 📜 About

BharatVision was developed as part of the **Josh Talks AI Image Evaluation Assignment**.

The project demonstrates how structured human evaluation can benchmark AI-generated cultural images using real participant feedback.

---

<div align="center">

### ⭐ If you found this project interesting, consider giving it a star ⭐

Made with ❤️ by **Sreenivasa Mohan Malepati**

</div>
