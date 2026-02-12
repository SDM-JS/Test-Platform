# Test Platform - Full-Stack Application

A comprehensive test platform built with Next.js, MongoDB, and shadcn/ui that supports role-based access, multiple test variants, and automatic answer checking.

## Features

### 🎯 Core Functionality

- **Role-Based Access Control**: Admin, Teacher, and Student roles with specific permissions
- **Cookie-Based Authentication**: Secure HTTP-only cookie authentication
- **Multiple Test Variants**: Each test can have multiple variants with different questions
- **Random Variant Assignment**: Students automatically receive a random variant when joining a room
- **Automatic Grading**: Auto-check answers when room is closed
- **Question Types**: Support for Multiple Choice, Matching, and Open-ended questions

### 👥 User Roles

#### Admin
- Create and manage teacher accounts
- View all teachers
- Delete teachers

#### Teacher
- Create tests with multiple variants
- Manage questions (Multiple Choice, Matching, Open)
- Create rooms from tests
- Close rooms (triggers automatic checking)
- View student results

#### Student
- Access rooms via URL: `/room/{roomId}`
- Simple login (name only)
- Take tests with assigned variant
- Submit and update answers (until room closes)
- View results after room closes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **Authentication**: JWT with HTTP-only cookies (jose + bcryptjs)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: react-hook-form + zod
- **Notifications**: sonner

## Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js     # All API endpoints
│   ├── page.js                       # Login/Signup page
│   ├── layout.js                     # Root layout with Toaster
│   ├── admin/page.js                 # Admin dashboard
│   ├── teacher/
│   │   ├── page.js                   # Teacher dashboard
│   │   ├── tests/
│   │   │   ├── create/page.js        # Create test
│   │   │   └── [id]/page.js          # View test details
│   │   └── rooms/
│   │       ├── create/page.js        # Create room
│   │       └── [id]/page.js          # View room & results
│   ├── student/page.js               # Student dashboard
│   └── room/[id]/page.js             # Student room access
├── lib/
│   ├── mongodb.js                    # MongoDB connection
│   ├── auth.js                       # Authentication utilities
│   └── utils.js                      # Helper functions
└── components/ui/                    # shadcn components

```

## Database Schema (MongoDB)

### Collections

**users**
- `_id`: ObjectId
- `name`: String
- `email`: String
- `password`: String (hashed)
- `role`: Enum (ADMIN, TEACHER, STUDENT)
- `createdAt`: Date

**tests**
- `_id`: ObjectId
- `title`: String
- `description`: String
- `teacherId`: String (reference to user)
- `createdAt`: Date

**variants**
- `_id`: ObjectId
- `testId`: String (reference to test)
- `name`: String
- `createdAt`: Date

**questions**
- `_id`: ObjectId
- `variantId`: String (reference to variant)
- `text`: String
- `type`: Enum (MULTIPLE_CHOICE, MATCHING, OPEN)
- `order`: Number
- `points`: Number
- `createdAt`: Date

**options** (for Multiple Choice questions)
- `_id`: ObjectId
- `questionId`: String (reference to question)
- `text`: String
- `isCorrect`: Boolean

**matchingpairs** (for Matching questions)
- `_id`: ObjectId
- `questionId`: String (reference to question)
- `left`: String
- `right`: String

**rooms**
- `_id`: ObjectId
- `testId`: String (reference to test)
- `name`: String
- `status`: Enum (OPEN, CLOSED)
- `teacherId`: String (reference to user)
- `createdAt`: Date
- `closedAt`: Date

**roomstudents**
- `_id`: ObjectId
- `roomId`: String (reference to room)
- `studentId`: String (reference to user)
- `assignedVariantId`: String (reference to variant)
- `submittedAt`: Date
- `score`: Number
- `createdAt`: Date

**answers**
- `_id`: ObjectId
- `roomStudentId`: String (reference to roomstudent)
- `questionId`: String (reference to question)
- `answer`: Mixed (String for OPEN, ObjectId for MULTIPLE_CHOICE, Array for MATCHING)
- `isCorrect`: Boolean
- `createdAt`: Date

**results**
- `_id`: ObjectId
- `roomId`: String (reference to room)
- `studentId`: String (reference to user)
- `roomStudentId`: String (reference to roomstudent)
- `score`: Number
- `totalPoints`: Number
- `percentage`: Number
- `createdAt`: Date

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login (regular or student room login)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin (ADMIN role only)
- `GET /api/teachers` - List all teachers
- `POST /api/teachers` - Create teacher account
- `DELETE /api/teachers/{id}` - Delete teacher

### Tests (TEACHER role)
- `GET /api/tests` - List teacher's tests
- `POST /api/tests` - Create test with variants
- `GET /api/tests/{id}` - Get test details
- `DELETE /api/tests/{id}` - Delete test

### Rooms (TEACHER role)
- `GET /api/rooms` - List teacher's rooms
- `POST /api/rooms` - Create room from test
- `GET /api/rooms/{id}` - Get room details
- `POST /api/rooms/{id}/close` - Close room (triggers auto-checking)
- `GET /api/rooms/{id}/results` - View results (teacher sees all, student sees own)

### Student Room Access (STUDENT role)
- `POST /api/rooms/{id}/join` - Join room (assigns random variant)
- `GET /api/rooms/{id}/questions` - Get questions for assigned variant
- `POST /api/rooms/{id}/submit` - Submit/update answers

## Room Flow

1. **Teacher creates test** with multiple variants
2. **Teacher creates room** from test
3. **Students access room** via URL: `/room/{roomId}`
4. **System assigns random variant** to each student (first time)
5. **Student answers questions** and submits
6. **Teacher closes room** → Automatic checking begins
7. **Results calculated** and stored
8. **Students view results** on the same room page

## Auto-Checking Logic

When a room is closed:

1. **Multiple Choice**: Checks if selected option has `isCorrect: true`
2. **Matching**: Verifies all pairs match correctly
3. **Open**: Remains unchecked (`isCorrect: false`) - requires manual grading

Scores are calculated based on:
- Points per question
- Percentage = (score / totalPoints) × 100

## Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
# Edit .env file with your MongoDB connection string

# Start development server
yarn dev
```

## Environment Variables

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=testplatform
NEXT_PUBLIC_BASE_URL=https://your-domain.com
JWT_SECRET=your-secret-key-here
```

## Usage

### For Admins
1. Login with admin credentials
2. Go to Admin Dashboard
3. Create teacher accounts
4. Manage teachers

### For Teachers
1. Login with teacher credentials
2. Create a test with variants
3. Add questions (Multiple Choice, Matching, or Open)
4. Create a room from the test
5. Share the room link with students
6. Monitor student participation
7. Close the room when ready (triggers auto-checking)
8. View results

### For Students
1. Click on the room link provided by teacher
2. Enter your name (if not logged in)
3. Answer all questions
4. Submit answers
5. Wait for teacher to close room
6. View your results

## Security Features

- HTTP-only cookies for authentication
- Password hashing with bcryptjs
- Role-based authorization on all endpoints
- Teachers can only manage their own tests/rooms
- Students can only see their own results

## Key Features Explained

### Random Variant Assignment
- Each student gets a random variant when joining a room
- The same student always receives the same variant (stored in `roomstudents`)
- Prevents cheating while allowing retakes

### Automatic Checking
- Triggered when teacher closes the room
- Processes all submitted answers
- Calculates scores for auto-gradable questions
- Open-ended questions remain for manual review

### Room Status
- **OPEN**: Students can join and submit answers
- **CLOSED**: No new submissions, results available

## Testing Status

✅ **Backend**: Fully tested and operational
- All authentication flows working
- Admin, teacher, and student flows verified
- Random variant assignment confirmed
- Auto-checking logic validated
- Authorization controls tested

## Notes

- Students can update answers until the room is closed
- Each test must have at least one variant
- Each variant must have at least one question
- Results are only visible after room is closed

## License

MIT
