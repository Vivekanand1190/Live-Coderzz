I built this mainly to understand how real-time collaboration works under the hood (WebSockets, syncing, etc.), and to experiment with simpler workflows.


Live at : https://live-coderzz.onrender.com


# Live-Coderzz 

Live-Coderzz is a real-time collaborative code editor that allows developers to write and sync code simultaneously. It is built to explore the power of WebSockets and real-time data synchronization, providing a seamless "Google Docs" experience for coding.

🔗 **Live Demo:** [https://live-coderzz.onrender.com](https://live-coderzz.onrender.com)

---

##  Features

- **Real-Time Synchronization:** Instant code updates across all connected clients using WebSockets.
- **Multi-User Collaboration:** Work together with teammates in the same coding session.
- **Full-Stack Architecture:** Separated Frontend and Backend for scalability.
- **Docker Ready:** Includes a `dockerfile` for easy containerization and deployment.
- **Syntax Highlighting:** Clear and modern code visualization.
- **Responsive Design:** Works smoothly across different screen sizes.

---

## Tech Stack

- **Frontend:** React.js / Modern JavaScript
- **Backend:** Node.js, Express.js
- **Real-Time Engine:** Socket.io (WebSockets)
- **Styling:** CSS3 / Modern Flexbox & Grid
- **Deployment:** Render / Docker

---

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vivekanand1190/Live-Coderzz.git
   cd Live-Coderzz
   ```

2. **Setup the Backend:**
   ```bash
   cd Backend
   npm install
   npm start
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../Frontend
   npm install
   npm run dev # or npm start
   ```

---

## Docker Deployment

You can run the entire application using Docker:

1. **Build the image:**
   ```bash
   docker build -t live-coderzz .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8080:8080 live-coderzz
   ```

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the ISC License.

---

**Built with passion to understand real-time sync systems.**
