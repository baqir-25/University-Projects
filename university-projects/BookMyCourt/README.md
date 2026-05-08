# BookMyCourt

## Project Overview

BookMyCourt is a full-stack web application for discovering and booking sports courts. It supports multiple user roles — players, arena owners, and admins — enabling seamless court reservations, event management, and arena administration through a clean, role-based interface.

---

## Group Members

| Name | Role |
|Baqir Zaidi 24L-0601|Group Leader|
|Ayyan Khan 24L-0912|Member|
|Sohaib Irshad 24L-0679|Member|
|Saadi Ali Bhatti 24L-0704|Member|
|Hasan Shaigan 24L-0621|Member|

---

## Folder Hierarchy

```
SDA Project/
├── BOOKMYCOURT/                          # Frontend (React + Vite)
│   ├── public/
│   │   └── vite.svg
│   ├── dist/                             # Production build output
│   │   ├── index.html
│   │   └── assets/
│   │       ├── index-CUtnfz52.css
│   │       ├── index-DozzdLbr.js
│   │       ├── login-hero-CZiUpcDH.jpg
│   │       ├── logo-CT5Sft0r.png
│   │       └── padel-D5chB34E.jpg
│   ├── src/
│   │   ├── api/                          # API service layer
│   │   │   ├── admin.js
│   │   │   ├── arenaReviews.js
│   │   │   ├── arenas.js
│   │   │   ├── auth.js
│   │   │   ├── client.js
│   │   │   ├── discover.js
│   │   │   ├── eventRegistration.js
│   │   │   ├── owner.js
│   │   │   ├── ownerMappers.js
│   │   │   ├── playerBookings.js
│   │   │   ├── publicDeals.js
│   │   │   └── publicEvents.js
│   │   ├── assets/                       # Static media assets
│   │   │   ├── badminton.jpg
│   │   │   ├── basketball.jpg
│   │   │   ├── cricket.jpg
│   │   │   ├── login-hero.jpg
│   │   │   ├── logo.png
│   │   │   ├── padel.jpg
│   │   │   └── react.svg
│   │   ├── auth/
│   │   │   └── session.js
│   │   ├── components/                   # Shared UI components
│   │   │   ├── Help.jsx
│   │   │   ├── RatingModal.jsx
│   │   │   └── Ui.jsx
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── data/                         # Static data & constants
│   │   │   ├── constants.js
│   │   │   ├── discoverMeta.js
│   │   │   ├── offers.js
│   │   │   ├── serverBookingSlots.js
│   │   │   └── timeSlots.js
│   │   ├── pages/                        # Route-level page components
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboardPage.jsx
│   │   │   ├── owner/
│   │   │   │   ├── OwnerBookingsPage.jsx
│   │   │   │   ├── OwnerCourtsPage.jsx
│   │   │   │   ├── OwnerHomePage.jsx
│   │   │   │   ├── OwnerLayout.jsx
│   │   │   │   ├── OwnerSettingsPage.jsx
│   │   │   │   └── ownerUtils.js
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── Confirmed.jsx
│   │   │   ├── Detail.jsx
│   │   │   ├── Discover.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OwnerLogin.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Slots.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── theme.js
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── BookMyCourt-backend/                  # Backend (Node.js + Express)
    ├── config/
    │   ├── db.js                         # MongoDB connection
    │   └── slotConfig.js
    ├── constants/
    │   └── sports.js
    ├── controllers/                      # Request handlers
    │   ├── adminController.js
    │   ├── arenaController.js
    │   ├── authController.js
    │   ├── bookingController.js
    │   ├── dealController.js
    │   ├── eventController.js
    │   ├── ownerController.js
    │   └── reviewController.js
    ├── middleware/
    │   └── authMiddleware.js             # JWT auth middleware
    ├── models/                           # Mongoose schemas
    │   ├── Arena.js
    │   ├── Booking.js
    │   ├── Court.js
    │   ├── Deal.js
    │   ├── Event.js
    │   ├── EventRegistration.js
    │   ├── Review.js
    │   ├── RevokedToken.js
    │   ├── TimeSlot.js
    │   └── User.js
    ├── repositories/                     # Data access layer
    │   ├── ArenaRepository.js
    │   ├── BaseRepository.js
    │   ├── BookingRepository.js
    │   ├── CourtRepository.js
    │   ├── DealRepository.js
    │   ├── EventRegistrationRepository.js
    │   ├── EventRepository.js
    │   ├── ReviewRepository.js
    │   └── UserRepository.js
    ├── routes/                           # Express route definitions
    │   ├── adminRoutes.js
    │   ├── arenaRoutes.js
    │   ├── authRoutes.js
    │   ├── bookingRoutes.js
    │   ├── dealRoutes.js
    │   ├── eventRoutes.js
    │   └── ownerRoutes.js
    ├── services/                         # Business logic layer
    │   ├── AdminService.js
    │   ├── ArenaService.js
    │   ├── AuthService.js
    │   ├── BookingService.js
    │   ├── EventService.js
    │   ├── OwnerHomeService.js
    │   ├── PasswordService.js
    │   ├── PublicArenaService.js
    │   └── TokenService.js
    ├── utils/
    │   ├── ApiResponse.js
    │   └── courtStatus.js
    ├── .env
    ├── .gitignore
    ├── package.json
    └── server.js
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| React Router DOM v7 | Client-side routing |
| Vite 6 | Build tool & dev server |
| ESLint | Code linting |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express 5 | Web framework |
| MongoDB | Database |
| Mongoose | ODM for MongoDB |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| Morgan | HTTP request logging |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variable management |
| nodemon | Development auto-reload |

---

### Prerequisites
Make sure all the mentioned technologies above are installed on your machine.

### Backend Setup
Open the backend folder in visual studio code, open the terminal then run the 'npm i' command to install all node modules to set up the backend. After that, run the 'npm run start' command to make sure all components of the backend are running and functional.

### Frontend Setup
Open the frontend folder in visual studio code, open the terminal then run the 'npm i' command to install the node modules to set up the frontend. Then run the 'npm run dev' command to make sure all components of the frontend are running and functional.

### Running the Application
Once the frontend and backend are functional, the local host application can be recieved from the result of 'npm run dev' command. Click it and you will be redirected to the browser with the final product on display.
---

## Features
Mentioned below are the use cases for each role.
### Player
1.Ability to login using account credentials.
2.Ability to search an arena.
3.Ability to filter arenas based on sports.
4.View arena details.
5.Check arena avaialability.
6.Make bookings absed on date.
7.Access to booking history.


### Arena Owner
1.Ability to login using account credentials.
2.Ability to monitor a single arena's revenue.
3.Toggle arena's visibility and availability.
4.Manage promotions/discounts.
### Admin
1.Ability to view all arena's revenue.
2.Manage User Accounts.
3.Remove or Block Arena.
4.View Platform Analytics.

## SOLID Principles implemented:
1. Single Responsibility Principle (SRP):
Every layer has exactly one job and one reason to change. The codebase is split into four distinct layers, each with a clear, narrow responsibility:
(i)Models (Arena.js, Booking.js etc.) — only define schema and database structure
(ii)Repositories (ArenaRepository.js, BookingRepository.js, etc.) — only handle database queries and data access
(iii)Services (AuthService.js, BookingService.js, etc.) — only contain business logic
(iv)Controllers (authController.js, bookingController.js, etc.) — only handle HTTP request/response translation

2. Open Closed Principle (OCP):
BaseRepository is open for extension but closed for modification. It provides findAll, findById, create, updateById,
and deleteById as a stable base. Every concrete repository extends it to add domain-specific queries without touching
the base class. If a new entity were added, a new repository would extend BaseRepository without any modification to
existing code.

3. Liskov Substitution Principle (LSP):
Every concrete repository is a valid substitute for BaseRepository. They all honour the same method contracts
inherited from the base — findAll(), findById(), create(), updateById(), deleteById() — while simply adding extra
methods on top. No subclass breaks or overrides the base behaviour in incompatible ways.

4. Interface Segregation Principle (ISP):
Services are injected with only the repositories they actually need, not one massive repository. No service is forced
to depend on methods it doesn't need.

5. Dependency Inversion Principle (DIP):
Services depend on abstractions (repository instances), not on concrete Mongoose model calls directly. For example
AuthService is constructed by injecting UserRepository, PasswordService, and TokenService through its constructor —
it never imports Mongoose or calls User.findOne() directly. The same holds for BookingService and OwnerHomeService
This makes the services fully testable by swapping in mock repositories.

## Design Patterns implemented:
1. Template Design Pattern:
BaseRepository defines the template (the skeleton of CRUD operations), and each subclass fills in domain-specific
behaviour by adding new query methods while inheriting the base template unchanged. This is the classic Template
Method structure applied to data access.

2. Singleton Design Pattern:
All repository instances are exported as singletons — module.exports = new ArenaRepository() and module.exports = new
BookingRepository() etc. This ensures a single shared instance is reused across the entire application rather than a
new instance being created on every import.

3. Model View Controller:
The project follows a strict four-layer architecture: Routes → Controllers → Services → Repositories → Models. This
is a variation of MVC where the Model layer is further split into repositories (data access) and services (business
logic).

4. Factory:
Services are manually composed via constructor injection in the controllers. For example, in authController.js, the controller acts as a simple factory that wires together its dependencies at startup.