# Online Quiz System

Online Quiz System is a full-stack web application built with Angular and ASP.NET Core Web API. It provides secure authentication, role-based access, quiz and question management, timed quiz attempts, automatic scoring, result tracking, leaderboard ranking, and certificate generation.

## GitHub About Description (350 chars)

Online Quiz System is a full-stack web app built with Angular and ASP.NET Core Web API. It supports secure login/register, role-based admin controls, quiz and question management, timed attempts, auto-scoring, result history, leaderboards, and certificate generation, delivering an engaging platform for practice and assessment.

## Features

- User registration and login
- Role-based authorization (Admin/User)
- Create, update, and manage quizzes
- Create, update, and manage questions
- Timed quiz attempts
- Automatic score calculation
- Result history per user
- Leaderboard display
- Certificate generation support

## Tech Stack

- Frontend: Angular
- Backend: ASP.NET Core Web API
- ORM: Entity Framework Core
- Database: SQL database via EF Core configuration
- Authentication: Token-based auth flow

## Project Structure

```text
online-quiz-system/
	quiz-app/      # Angular frontend
	QuizAPI/       # ASP.NET Core backend
```

## Prerequisites

- Node.js and npm
- .NET SDK (matching project target framework)
- SQL database server configured in backend settings

## Setup and Run

### 1. Clone repository

```bash
git clone https://github.com/Priyansu-afk/Online-Quiz.git
cd Online-Quiz
```

### 2. Run backend (QuizAPI)

```bash
cd QuizAPI
dotnet restore
dotnet ef database update
dotnet run
```

The API typically starts at `https://localhost:xxxx` or `http://localhost:xxxx`.

### 3. Run frontend (quiz-app)

```bash
cd ../quiz-app
npm install
ng serve
```

Frontend usually runs at `http://localhost:4200`.

## API Controllers

- `AuthController`
- `QuizController`
- `QuestionController`
- `ResultController`
- `CertificateController`

## Common Git Commands

```bash
git add .
git commit -m "your message"
git push
```

## Future Improvements

- Add unit and integration tests
- Add CI/CD workflow (GitHub Actions)
- Add Docker support
- Add quiz analytics dashboard

## License

This project is for educational and portfolio use.
