<h1 align="center">
  <br>
  <img href=">
    <a href="#/"><img src="https://github.com/alin00r/Eunoia-Backend/blob/authentication/public/img/logo/logo.png" alt="Natours" width="200"></a>
  <br>
  Eunoia API
  <br>
</h1>

# 💫 Eunoia Project (Graduation Project)

Eunoia simplifies event planning by integrating services like venues, catering, and photography into a single platform. Accessible via app and web, it features AI-powered recommendations and secure booking.

## 🌟 Eunoia API

This project offers APIs for efficient event planning, enabling access to service provider directories, booking services, and user account management. Built with Express.js and tested with Jest, it includes AI-powered recommendations and secure transactions to enhance user experience.

## 📋 Table of Contents

- [🌟 Eunoia API](#-eunoia-api)
  - [📋 Table of Contents](#-table-of-contents)
  - [🚀 Getting Started](#-getting-started)
    - [🔧 Prerequisites](#-prerequisites)
    - [📦 Installation](#-installation)
    - [🖥️ Running the Server](#️-running-the-server)
    - [🧪 Running Tests](#-running-tests)
  - [📚 API Documentation](#-api-documentation)
    - [👥 Authentication Endpoints](#-authentication-endpoints)
    - [📊 Services Endpoints](#-services-endpoints)
    - [👌 API Complete Docs](#-api-complete-Docs)
  - [🗂️ Project Structure](#️-project-structure)
  - [📜 License](#-license)

## 🚀 Getting Started

### 🔧 Prerequisites

Ensure you have the following installed:

- Node.js
- npm or yarn

### 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/Eunoia-Backend.git
   cd Eunoia-Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### 🖥️ Running the Server

1. Start the development server :

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. The server should now be running at `http://localhost:3000`.

### 🧪 Running Tests

To run the test suite:

```bash
npm test
# or
yarn test
```

## 📚 API Documentation

### 👥 Authentication Endpoints

- **Endpoint:** `api/v1/auth/register`
- **Method:** `Post`
- **Body:**

  - `name` (string): user name
  - `email` (string): user email
  - `password` (string): user password
  - `passwordConfirm` (string): user confirm password
  - `role` (string): user role (user/serviceProvider)

- **Example Request:**

  ```bash
  curl "http://localhost:3000/api/v1/auth/register"
  ```

- **Example Response:**

  ```json
  [
    {
      "status": "success",
      "token": "JWT TOKEN"
    }
  ]
  ```

- **Endpoint:** `api/v1/auth/login`
- **Method:** `Post`
- **Body:**

  - `email` (string): user email
  - `password` (string): user password

- **Example Request:**

  ```bash
  curl "http://localhost:3000/api/v1/auth/login"
  ```

- **Example Response:**

  ```json
  [
    {
      "status": "success",
      "token": "JWT TOKEN"
    }
  ]
  ```

- **Endpoint:** `api/v1/auth/logout`
- **Method:** `Post`
- **Body:**

  - empty

- **Example Request:**

  ```bash
  curl "http://localhost:3000/api/v1/auth/logout"
  ```

- **Example Response:**

  ```json
  [
    {
      "status": "success"
    }
  ]
  ```

- **Endpoint:** `api/v1/auth/forgotPassword`
- **Method:** `Post`
- **Body:**

  - `email` (string): user email

- **Example Request:**

  ```bash
  curl "http://localhost:3000/api/v1/auth/forgotPassword"
  ```

- **Example Response:**

  ```json
  [
    {
      "status": "Success",
      "message": "Reset code sent to email"
    }
  ]
  ```

- **Endpoint:** `api/v1/auth/forgotPassword`
- **Method:** `Post`
- **Body:**

  - `otp` (number): The code sent to the email

- **Example Request:**

  ```bash
  curl "http://localhost:3000/api/v1/auth/verfiyCode"
  ```

- **Example Response:**

  ```json
  [
    {
      "status": "Success",
      "messgae": "Your Code has been successfully verified. You can now proceed to reset your password."
    }
  ]
  ```

- **Endpoint:** `api/v1/auth/resetPassword`
- **Method:** `Patch`
- **Body:**

  - `email` (string): your email
  - `newPassword` (string): your new password

- **Example Request:**

  ```bash
  curl "http://localhost:3000/api/v1/auth/resetPassword"
  ```

- **Example Response:**

  ```json
  [
    {
      "status": "success",
      "token": "JWT TOKEN"
    }
  ]
  ```

### 📊 Services Endpoints

- **Endpoint:** `api/v1/services`
- **Method:** `POST`
- **Body:**

  - `businessName` (String)
  - `about` (string)
  - `location` (string)
  - `businessCategory` (string)
  - `phoneNumber` (number)
  - `avatar` (FormData)
  - `images` (FormData):array of images
  - `imageCover`(FormData)

- **Example Request:**

  ```bash
  curl "http://127.0.0.1:3000/api/v1/services/"
  ```

- **Example Response:**

  ```json
  {
    "status": "success",
    "message": "Service Profile created successfully",
    "data": {
      "_id": "660878526adb0cb6ece59904",
      "businessName": "The Garden",
      "about": "The Garden features three main spaces for your wedding day: a Rooftop Terrace with a picturesque views of Bryant Park, the Grill Dining Room, and the South Garden. The terrace is best suited for your wedding ceremony and can accommodate up to 220 guests. The restaurant can host a seated dinner for up to 220 guests. For couples interested in booking the full venue, up to 1,000 guests can be serviced.",
      "location": "Ismailia",
      "businessCategory": "Venues",
      "phoneNumber": "01234567890",
      "avatar": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1711831118/avatar.jpg",
      "imageCover": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714673495/CoverImages/serviceProfile/cb13896a-1d0c-4d66-b7e0-9334a9c4cc37.jpg",
      "images": [
        "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714669784/Albums/serviceProfile/Albums0-10974f93-dd59-435f-9c34-a15e14e0dcff.jpg"
      ],
      "owner": "660860be6adb0cb6ece598fe",
      "createdAt": "2024-03-30T20:38:43.001Z",
      "updatedAt": "2024-06-21T13:32:59.867Z",
      "ratingsAverage": 4,
      "ratingsQuantity": 2,
      "id": "660878526adb0cb6ece59904"
    }
  }
  ```

- **Endpoint:** `api/v1/services`
- **Method:** `GET`
- **Query Parameters:**

  - `page` (number): the number of page you want to return.
  - `limit` (number): the number of document you want to return in the page.
  - `sort` (string): (ratingsQuantity|ratingsAverage|updatedAt|updatedAt)
  - `limitFields` (string): name of field you want to return in the response (\_id|businessName|about|location|businessCategory|phoneNumber|images|owner|ratingsQuantity|ratingsAverage)
  - `ratingsAverage` return the services which have ratingsAverage[gte(greater than or equal) || gt(greater than) || ls(less than ) || lte(less than or equal) ]:(number)
  - `sort` (field name): sort by filed name like ratingsAverage or ratingsquantity

- **Example Request:**

  ```bash
  curl "http://127.0.0.1:3000/api/v1/services/?page=2&limit=5&ratingsAverage[gte]=4.3&filter=DJs&sort=createdAt"
  ```

- **Example Response:**

  ```json
  {
    "results": 7,
    "paginationResult": {
      "currntPage": 1,
      "limit": 50,
      "numberOfPages": 1
    },
    "data": [
      {
        "_id": "660878526adb0cb6ece59904",
        "businessName": "The Garden",
        "about": "The Garden features three main spaces for your wedding day: a Rooftop Terrace with a picturesque views of Bryant Park, the Grill Dining Room, and the South Garden. The terrace is best suited for your wedding ceremony and can accommodate up to 220 guests. The restaurant can host a seated dinner for up to 220 guests. For couples interested in booking the full venue, up to 1,000 guests can be serviced.",
        "location": "Ismailia",
        "businessCategory": "Venues",
        "phoneNumber": "01234567890",
        "avatar": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1711831118/avatar.jpg",
        "imageCover": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714673495/CoverImages/serviceProfile/cb13896a-1d0c-4d66-b7e0-9334a9c4cc37.jpg",
        "images": [
          "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714669784/Albums/serviceProfile/Albums0-10974f93-dd59-435f-9c34-a15e14e0dcff.jpg"
        ],
        "owner": "660860be6adb0cb6ece598fe",
        "createdAt": "2024-03-30T20:38:43.001Z",
        "updatedAt": "2024-06-21T13:32:59.867Z",
        "ratingsAverage": 4,
        "ratingsQuantity": 2,
        "id": "660878526adb0cb6ece59904"
      }
      // more services ...
    ]
  }
  ```

- **Endpoint:** `api/v1/services/:id`
- **Method:** `GET`
- **Query params:**

  - `id` (mongoID): mongoId of exist document

- **Example Request:**

  ```bash
  curl "http://127.0.0.1:3000/api/v1/services/660878526adb0cb6ece59904"
  ```

- **Example Response:**

  ```json
  {
    "data": {
      "_id": "660878526adb0cb6ece59904",
      "businessName": "The Garden",
      "about": "The Garden features three main spaces for your wedding day: a Rooftop Terrace with a picturesque views of Bryant Park, the Grill Dining Room, and the South Garden. The terrace is best suited for your wedding ceremony and can accommodate up to 220 guests. The restaurant can host a seated dinner for up to 220 guests. For couples interested in booking the full venue, up to 1,000 guests can be serviced.",
      "location": "Ismailia",
      "businessCategory": "Venues",
      "phoneNumber": "01234567890",
      "avatar": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1711831118/avatar.jpg",
      "imageCover": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714673495/CoverImages/serviceProfile/cb13896a-1d0c-4d66-b7e0-9334a9c4cc37.jpg",
      "images": [
        "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714669784/Albums/serviceProfile/Albums0-10974f93-dd59-435f-9c34-a15e14e0dcff.jpg",
        "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714673192/Albums/serviceProfile/Albums0-2e6d3f3e-c654-4fc2-a0f0-64ab474406dc.jpg"
      ],
      "owner": "660860be6adb0cb6ece598fe",
      "createdAt": "2024-03-30T20:38:43.001Z",
      "updatedAt": "2024-06-21T13:32:59.867Z",
      "__v": 5,
      "ratingsAverage": 4,
      "ratingsQuantity": 2,
      "reviews": [
        {
          "_id": "662aa6131bef1b61ca7c3e8e",
          "title": "amazing service\n",
          "ratings": 3,
          "user": {
            "_id": "6612f57ad4ff84c0ed4acced",
            "name": "omar ",
            "avatar": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1713651559/avatar.jpg"
          },
          "service": "660878526adb0cb6ece59904",
          "createdAt": "2024-04-25T18:50:59.017Z",
          "updatedAt": "2024-04-25T18:50:59.017Z",
          "__v": 0
        },
        {
          "_id": "6675810af4e1130ec348b254",
          "title": "",
          "ratings": 5,
          "user": {
            "_id": "6674a92b8217a177b6921aa0",
            "name": "Ali Nour",
            "avatar": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1718922031/ProfilePicture/avatar/7219325b-667c-47db-a7f1-b25128955cc0.jpg"
          },
          "service": "660878526adb0cb6ece59904",
          "createdAt": "2024-06-21T13:32:58.550Z",
          "updatedAt": "2024-06-21T13:32:58.550Z",
          "__v": 0
        }
      ],
      "packages": [],
      "id": "660878526adb0cb6ece59904"
    }
  }
  ```

- **Endpoint:** `api/v1/services/:id`
- **Method:** `DELETE`
- **Query params:**

  - `id` (mongoID): mongoId of exist document (You should be the owner of the service to delete it)

- **Example Request:**

  ```bash
  curl "http://127.0.0.1:3000/api/v1/services/660878526adb0cb6ece59904"
  ```

- **Example Response:**

  ```json
  {}
  ```

- **Endpoint:** `api/v1/services/:id`
- **Method:** `PATCH`
- **Query params:**

  - `id` (mongoID): mongoId of exist document (You should be the owner of the service to delete it)

- **Body:**
- `businessName`:(String)
- `about`:(String)
- `images`:(formData)
- `location`:(String)
- `businessCategory`:(String)
- `phoneNumber`:(number)
- `avatar`:(formData)
- `imageCover`:(formData)
- `latitude`:(number)
- `longitude`:(number)
- **Example Request:**

  ```bash
  curl "http://127.0.0.1:3000/api/v1/services/660878526adb0cb6ece59904"
  ```

- **Example Response:**

  ```json
  {
    "data": {
      "_id": "660878526adb0cb6ece59904",
      "businessName": "The Garden",
      "about": "The Garden features three main spaces for your wedding day: a Rooftop Terrace with a picturesque views of Bryant Park, the Grill Dining Room, and the South Garden. The terrace is best suited for your wedding ceremony and can accommodate up to 220 guests. The restaurant can host a seated dinner for up to 220 guests. For couples interested in booking the full venue, up to 1,000 guests can be serviced.",
      "location": "Ismailia",
      "businessCategory": "Venues",
      "phoneNumber": "01234567890",
      "avatar": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1711831118/avatar.jpg",
      "imageCover": "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714673495/CoverImages/serviceProfile/cb13896a-1d0c-4d66-b7e0-9334a9c4cc37.jpg",
      "images": [
        "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714669784/Albums/serviceProfile/Albums0-10974f93-dd59-435f-9c34-a15e14e0dcff.jpg",
        "http://res.cloudinary.com/dbrywi5aw/image/upload/v1714673192/Albums/serviceProfile/Albums0-2e6d3f3e-c654-4fc2-a0f0-64ab474406dc.jpg"
      ],
      "__v": 5,
      "ratingsAverage": 4,
      "ratingsQuantity": 2
    }
  }
  ```

### 👌 API Complete Docs

_You can see all API docs [here](http://ec2-3-129-5-59.us-east-2.compute.amazonaws.com/api/v1/)_

```
- Postman Docs will be avaliable soon.
```

## 🗂️ Project Structure

```
Here's the project structure based on the provided image:

eunoia-backend/
├── **tests**/
│ ├── service.test.js
├── src/
│ ├── config/
│ │ ├── db.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── errorController.js
│ │ ├── handelFactory.js
│ │ ├── orderController.js
│ │ ├── reviewController.js
│ │ ├── serviceController.js
│ │ ├── userController.js
│ │ ├── packageController.js
│ │ ├── requestController.js
│ │ ├── wishlistController.js
│ ├── middlewares/
│ │ ├── uploadImageMiddleware.js
│ │ ├── emailMiddleware.js
│ │ ├── validatorMiddleware.js
│ │ ├── verifyPaymobRequest.js
│ ├── models/
│ │ ├── orderModel.js
│ │ ├── packageModel.js
│ │ ├── requestModel.js
│ │ ├── reviewModel.js
│ │ ├── serviceModel.js
│ │ ├── userModel.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── orderRoutes.js
│ │ ├── packageRoutes.js
│ │ ├── requestRoutes.js
│ │ ├── reviewRoutes.js
│ │ ├── serviceRoutes.js
│ │ ├── userRoutes.js
│ │ ├── welcomeRoutes.js
│ │ ├── wishlistRoutes.js
│ ├── utils/
│ │ ├── paymob/
│ │ │ ├── authenticate.js
│ │ │ ├── checkout.js
│ │ ├── validators/
│ │ │ ├── packageValidator.js
│ │ │ ├── requestValidator.js
│ │ │ ├── reviewValidator.js
│ │ │ ├── serviceValidator.js
│ │ ├── apiFeatures.js
│ │ ├── appError.js
│ │ ├── catchAsync.js
│ │ ├── cloudinary.js
│ │ ├── createToken.js
│ │ ├── logger.js
│ │ ├── paymob.js
│ │ ├── redis.js
│ └── app.js
│ └── server.js
├── views/
│ ├── email/
│ │ ├── \_style.pug
│ │ ├── baseEmail.pug
│ │ ├── passwordChanged.pug
│ │ ├── passwordReset.pug
│ │ ├── requestAccepted.pug
│ │ ├── requestDecline.pug
│ │ ├── welcome.pug
│ ├── index.pug
├── .env
├── app.js
├── server.js
├── .gitignore
├── package.json
├── README.md

```

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This README provides a comprehensive guide for setting up, running, and testing the project, as well as detailed API documentation and project structure information.
# Eunoia-API
# Eunoia-API
