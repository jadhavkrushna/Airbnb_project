# Wanderlust - Premium Travel Listing Platform

Wanderlust is a full-stack web application that allows users to list, discover, and book unique travel accommodations worldwide. Built with a focus on premium aesthetics and seamless user experience, it serves as a comprehensive clone of platforms like Airbnb.

## ✨ Features

- **Listing Management**: Users can create, edit, and delete their own travel listings.
- **Review System**: Integrated review and rating system for each listing.
- **User Authentication**: Secure signup and login functionality using Passport.js.
- **Messaging System**: Real-time messaging simulation between guests and hosts with automated response logic.
- **Wishlist**: Users can save their favorite listings for future trips.
- **Map Integration**: Visualizing listing locations using Mapbox SDK.
- **Image Uploads**: Cloud-based image storage integrated with Cloudinary.
- **Responsive Design**: Fully responsive UI with a modern glassmorphism aesthetic.

## 🛠️ Tech Stack

- **Frontend**: EJS (Embedded JavaScript templates), CSS3 (Modern Styling), JavaScript.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Atlas) with Mongoose ODM.
- **Authentication**: Passport.js with Local Strategy.
- **Storage**: Cloudinary for high-quality image management.
- **Maps**: Mapbox SDK for location-based services.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB account (Atlas or Local)
- Cloudinary account
- Mapbox account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jadhavkrushna/Airbnb_project.git
   cd Airbnb_project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add the following keys:
   ```env
   ATLASBD_URL=your_mongodb_atlas_url
   CLOUD_NAME=your_cloudinary_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   MAP_TOKEN=your_mapbox_token
   SECRET=your_session_secret
   ```

4. **Run the application**:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Access the app**:
   Open your browser and navigate to `http://localhost:8080`.

## 📂 Project Structure

- `app.js`: Main entry point and server configuration.
- `models/`: Mongoose schemas for Listings, Reviews, Users, and Messages.
- `routes/`: Express routers for different feature modules.
- `controllers/`: Logic for handling requests and responses.
- `views/`: EJS templates for the frontend.
- `public/`: Static assets (CSS, JS, Images).

## 📄 License

This project is licensed under the MIT License.