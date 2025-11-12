# E-Commerce Backend

A modern e-commerce backend API built with Node.js, Express, and Prisma.

## Features

- User authentication and authorization
- Product management
- Order processing
- Database integration with Prisma ORM

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

## Installation

1. Clone the repository
```bash
git clone https://github.com/Afaqahmad1122/e-commerce-backend.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start the server
```bash
npm run dev
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

