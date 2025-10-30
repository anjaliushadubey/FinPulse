# 🚀 FinPulse - Personal Finance Management System

FinPulse is a modern, full-stack personal finance management application that helps users track their expenses, manage budgets, and take control of their financial life.

![FinPulse Logo](client/public/logo192.png)

## ✨ Features

- 🔐 Secure user authentication and authorization
- 💰 Account management and tracking
- 📊 Budget planning and monitoring
- 📱 Responsive design with modern UI
- 🔄 Real-time updates
- 🎯 Financial goal setting

## 🛠️ Tech Stack

### Frontend
- React.js 18
- TailwindCSS for styling
- Axios for API requests
- Modern responsive design

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- CORS enabled
- Bcrypt for password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/anjaliushadubey/FinPulse.git
cd FinPulse
```

2. **Install Server Dependencies**
```bash
cd server
npm install
```

3. **Install Client Dependencies**
```bash
cd ../client
npm install
```

4. **Environment Setup**
Create a `.env` file in the server directory with the following variables:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

5. **Start the Development Servers**

For Backend:
```bash
cd server
npm start
```

For Frontend:
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
FinPulse/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/              # Source files
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   └── routes/          # API routes
└── README.md            # Project documentation
```

## 🔒 Security Features

- JWT based authentication
- Encrypted password storage
- Protected API endpoints
- Secure session management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- **Anjali Usha Dubey** - *Initial work*

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape FinPulse
- Special thanks to the open-source community

---

Made with ❤️ by [anjaliushadubey](https://github.com/anjaliushadubey)