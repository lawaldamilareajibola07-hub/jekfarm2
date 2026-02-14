# JekFarm - Farm to Consumer E-Commerce Platform

## 📋 Project Overview

JekFarm is a comprehensive mobile and web e-commerce application that connects farmers directly with consumers. It provides a marketplace for buying fresh agricultural products, managing loans, wallet transactions, and community engagement through group chats.

### Key Features
- **User Authentication** - Secure login/registration for customers and farmers
- **Product Marketplace** - Browse, search, and purchase fresh farm products
- **Wallet System** - Digital wallet for payments and fund management
- **Loan Management** - Apply for loans with eligibility checks and approval workflow
- **Chat System** - Direct messaging between users, group chats, and AI chatbot support
- **Points & Rewards** - Transaction history, referral program, and reward system
- **Settings & Profile** - User profile management, security settings, address book

---

## 🏗️ Project Structure

```
jekfarm2/
├── App.js                          # Main app entry point with navigation
├── index.js                        # React Native app registration
├── package.json                    # Dependencies and scripts
├── app.json                        # Expo app configuration
├── tsconfig.json                   # TypeScript configuration
├── CartContext.js                  # Global cart state management
│
├── api/
│   └── api.js                      # Axios instance with interceptors
│
├── screens/                        # Main application screens
│   ├── Home.js                     # Home/dashboard screen
│   ├── LoginScreen.js              # User login
│   ├── CreateAccountScreen.js      # User registration (Customer/Farmer)
│   ├── OnboardingScreen.js         # App onboarding flow
│   ├── ProductDetails.js           # Individual product details
│   ├── CategoriesScreen.js         # Product categories
│   ├── WalletScreen.js             # Wallet & balance management
│   ├── ProfileScreen.js            # User profile
│   ├── Points.js                   # Points & rewards screen
│   ├── Loans.js                    # Loan management screen
│   ├── ChatScreen.js               # One-on-one chat
│   ├── ChatBotScreen.js            # AI chatbot interface
│   ├── ChatListScreen.js           # List of conversations
│   ├── GroupListScreen.js          # List of groups
│   ├── GroupChatScreen.js          # Group chat interface
│   ├── CreateGroupScreen.js        # Create new group
│   ├── InboxScreen.js              # Inbox/notifications
│   ├── Orders.js                   # Order management
│   ├── AddProductScreen.js         # Farmer: Add new product
│   ├── UserSearchScreen.js         # Search users
│   ├── ProfileScreen.js            # User profile page
│   │
│   ├── Points/
│   │   ├── AddMoneyScreen.js       # Add funds to wallet
│   │   ├── EnterAmountScreen.js    # Enter transfer amount
│   │   ├── SendMoneyScreen.js      # Send money interface
│   │   ├── CryptoFundingScreen.js  # Cryptocurrency funding
│   │   ├── SendCryptoScreen.js     # Send crypto
│   │   └── SwapSuccessScreen.js    # Success confirmation
│   │
│   ├── Trans/
│   │   ├── ReceiptScreen.js        # Transaction receipt
│   │   └── TransactionItem.js      # Transaction list item
│   │
│   ├── Ref/
│   │   └── ReferralScreen.js       # Referral & rewards program
│   │
│   ├── Sub/
│   │   └── SubscriptionsScreen.js  # Subscription management
│   │
│   ├── Settings-Screens/
│   │   ├── Settings.js             # Settings main page
│   │   ├── PersonalInfoScreen.js   # Personal information
│   │   ├── EditProfileScreen.js    # Edit profile
│   │   ├── DeliveryPreferencesScreen.js
│   │   ├── SettingsSecurityScreen.js
│   │   ├── AddressBookScreen.js    # Manage delivery addresses
│   │   └── components/
│   │       ├── Section.js
│   │       └── ListItem.js
│   │
│   ├── _components/                # Reusable loan application components
│   │   ├── PersonalInformation.js  # Step 1: Personal info form
│   │   ├── JobInformation.js       # Step 2: Job/employment info
│   │   ├── EmergencyContacts.js    # Step 3: Emergency contacts
│   │   ├── UploadIDCard.js         # Step 4: ID verification
│   │   ├── SelfieWithID.js         # Step 5: Selfie verification
│   │   ├── LoanUnderReview.js      # Loan application pending
│   │   ├── LoanApproved.js         # Loan approval success
│   │   └── LoanUnsuccessful.js     # Loan application rejected
│   │
│   └── Loan.css                    # CSS for loan screens
│
├── components/                     # Reusable UI components
│   ├── MainTabNavigator.js         # Bottom tab navigation (Customer)
│   ├── FarmerTabNavigator.js       # Bottom tab navigation (Farmer)
│   ├── Categories.js               # Category list/selector
│   ├── Greetings.js                # Greeting component
│   ├── SearchBar.js                # Product search
│   ├── SearchComponent.js          # Search interface
│   ├── HorizontalProductList.js    # Horizontal scrolling products
│   ├── DiscountedItems.js          # Sale/discount items
│   ├── ChatBubble.jsx              # Chat message bubble
│   ├── ConversationCard.jsx        # Conversation preview card
│   ├── GroupCard.jsx               # Group preview card
│   ├── MessageList.jsx             # Message list container
│   ├── InputBar.jsx                # Chat input component
│   ├── TypingIndicator.jsx         # "User is typing" indicator
│   └── WalletBalanceScreen.js      # Wallet balance display
│
├── farmers-com/                    # Farmer-specific components
│   ├── ProductsHeader.js           # Farmer dashboard header
│   └── DashboardOverview.js        # Farmer dashboard overview
│
├── utils/
│   └── logout.js                   # Logout utility function
│
├── data/
│   └── onboardingData.js           # Onboarding screens data
│
├── assets/                         # Images and static files
│   ├── farm1.png - farm4.png       # Onboarding images
│   ├── App-Banner.png
│   ├── Ellipse-1.png
│   ├── menu.png
│   ├── sleepy-cloud.png
│   ├── karibu-meat.jpeg
│   └── ... (other images)
│
└── .expo/                          # Expo configuration
```

---

## 🔐 Authentication

### Registration Flow
1. User selects account type: **Customer** or **Farmer**
2. Fills in: Full Name, Email, Phone, Password
3. System sends OTP to email
4. User confirms OTP to complete registration

**Endpoint**: `POST /auth/register.php?action=send-otp`

### Login Flow
1. User enters email and password
2. System validates credentials
3. Session created and user data stored in AsyncStorage
4. Navigation to MainTabs (Customer) or FarmerTabs (Farmer)

**Endpoint**: `POST /auth/login.php`

### Session Management
- Uses AsyncStorage to persist user session
- Token-based authentication via axios interceptors
- Session cookie management for API requests

---

## 🛍️ Marketplace Features

### Product Browsing
- **Categories**: Browse products by category (Vegetables, Fruits, Grains, Meat)
- **Search**: Full-text search for products
- **Product Details**: View images, price, weight, description, farmer info
- **Cart Management**: Add/remove items, manage quantities via CartContext

### Product Management (Farmers)
- **Add Products**: Farmers can list new products with:
  - Name, description, price, stock status
  - Category, unit of measurement
  - Harvest date, delivery methods (Pickup/Delivery)
  - Image upload
- **Dashboard**: View sales, revenue, inventory status
- **Order Management**: Track and manage customer orders

**Endpoints**:
- `GET /products/list.php` - List all products
- `GET /products/by-category.php?category_id=X` - Filter by category
- `POST /products/add.php` - Add new product (Farmer)

---

## 💰 Wallet & Points System

### Wallet Features
- **Balance Display**: Current wallet balance and account metrics
- **Add Funds**: Support for multiple funding methods:
  - Bank Transfer (Money Transfer)
  - Cryptocurrency funding
- **Transaction History**: Complete list of all transactions with:
  - Transaction type (purchase, refund, expense, income)
  - Amount, date, time
  - Status (completed, declined, pending)
- **Payout Management**: View pending and completed payouts

### Points & Rewards
- **Quick Access**: Shortcuts for common wallet operations
- **Transaction Details**: Receipt view with transaction info
- **Referral System**: Earn rewards by referring friends
  - Share referral link
  - Track referred friends
  - Monitor reward balance

**Endpoints**:
- `POST /wallet/add-funds.php` - Add funds to wallet
- `GET /wallet/balance.php` - Get wallet balance
- `GET /wallet/transactions.php` - Get transaction history
- `POST /wallet/transfer.php` - Transfer money

---

## 📋 Loan Management System

### Loan Features
- **Loan Limits**: Display maximum available loan limit
- **Loan Application**: Multi-step application process (5 steps):
  1. **Personal Information** - Name, DOB, email, phone, address, education
  2. **Job Information** - Employment details, income, job type
  3. **Emergency Contacts** - Contact persons for emergencies
  4. **ID Verification** - Upload ID card photos
  5. **Selfie Verification** - Selfie with ID for KYC

### Loan Status Flow
- **Under Review**: Application submitted, pending approval (24hrs)
- **Approved**: Loan approved with disbursement confirmation
- **Unsuccessful**: Application rejected with feedback
- **History**: View past loan applications and status

### Loan Products
- Business capital loans
- Personal loans
- Home loans
- Education loans
- Medical loans

**Endpoints**:
- `POST /loans/apply.php` - Submit loan application
- `GET /loans/status.php` - Check application status
- `GET /loans/history.php` - Get loan history
- `GET /loans/limit.php` - Get loan limit

---

## 💬 Communication System

### One-on-One Chat
- **Direct Messaging**: Message individual users or farmers
- **Conversation List**: List all active conversations
- **Message Status**: Read/unread indicators
- **Auto-refresh**: Messages update every 3 seconds
- **Typing Indicator**: See when user is typing

### Group Chat
- **Create Groups**: Create communities with multiple users
- **Group Messages**: Group-wide messaging
- **Member Management**: Add/remove members
- **Typing Indicators**: See who is typing in group
- **Message History**: Persistent message storage

### AI Chatbot
- **24/7 Support**: AI-powered customer service bot
- **Message Storage**: Chat history stored locally (AsyncStorage)
- **Bot Responses**: Integrated with backend API
- **Typing Animation**: Visual feedback while bot responds

**Endpoints**:
- `POST /conversations/create.php` - Start conversation
- `GET /messages/list.php?conversation_id=X` - Get messages
- `POST /messages/send.php` - Send message
- `POST /messages/mark-read.php` - Mark as read
- `POST /groups/create.php` - Create group
- `GET /groups/list.php` - Get user groups
- `POST /chat.php` - Chatbot API

---

## 👤 User Profile & Settings

### Profile Management
- **View Profile**: Display user information with avatar
- **Edit Profile**: Update personal information
- **Profile Sections**:
  - Personal Information
  - Account Security
  - Delivery Preferences
  - Address Book
  - Wallet/Token info
  - Notifications
  - About & Support

### Settings
- **Account**: Security, personal info, notifications
- **Delivery**: Preferences, address management
- **Security**: Change password, two-factor auth
- **General**: FAQ, support, about, logout

### Address Management
- **Add Addresses**: Store multiple delivery addresses
- **Address Labels**: Home, Office, etc.
- **Manage Addresses**: Edit or delete saved addresses
- **Default Address**: Set preferred delivery location

**Endpoints**:
- `POST /addresses/add.php` - Add new address
- `GET /addresses/list.php` - Get all addresses
- `PUT /addresses/update.php?id=X` - Update address
- `DELETE /addresses/delete.php?id=X` - Delete address

---

## 🛠️ Technical Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Managed React Native framework
- **React Navigation** - Stack and tab navigation
- **AsyncStorage** - Client-side data persistence
- **Axios** - HTTP client with interceptors
- **React Native Vector Icons** - Icon library (Ionicons)
- **React Native Modal** - Modal components
- **Image Picker** - Select and upload images

### Backend
- **PHP** - Server-side logic
- **MySQL/PDO** - Database with prepared statements
- **RESTful API** - JSON-based endpoints
- **Session Management** - User authentication

### Database (Recommended Structure)
```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20),
  type ENUM('customer', 'farmer'),
  avatar VARCHAR(255),
  created_at TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  category_id INT,
  stock_status BOOLEAN,
  harvest_date DATE,
  image_url VARCHAR(255),
  created_at TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id)
);

-- Orders table
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  total_amount DECIMAL(10, 2),
  status ENUM('pending', 'completed', 'cancelled'),
  created_at TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  type ENUM('fund', 'purchase', 'refund', 'transfer'),
  amount DECIMAL(10, 2),
  status ENUM('pending', 'completed', 'failed'),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Addresses
CREATE TABLE addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  label VARCHAR(255),
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  postal_code VARCHAR(20),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Loan applications
CREATE TABLE loan_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  status ENUM('submitted', 'under_review', 'approved', 'rejected'),
  amount DECIMAL(10, 2),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Conversations
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user1_id INT,
  user2_id INT,
  created_at TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id)
);

-- Messages
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT,
  sender_id INT,
  content TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Groups
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  description TEXT,
  creator_id INT,
  created_at TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Group members
CREATE TABLE group_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT,
  user_id INT,
  joined_at TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🚀 API Base Configuration

**Base URL**: `https://preciousadedokun.com.ng/jek/`

### Axios Configuration
```javascript
// api/api.js
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 500
});

// Token interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📱 Navigation Structure

### Customer Navigation
```
Tab Navigation (MainTabNavigator)
├── Home - Browse products, FAB chatbot button
├── Order - View orders, order history
├── Loans - Apply for loans, view status
├── Points - Wallet, transactions, referrals
└── Account - Settings, profile
```

### Farmer Navigation
```
Tab Navigation (FarmerTabNavigator)
├── Dashboard - Overview, sales, revenue
├── Products - Manage inventory
├── Orders - View customer orders
├── Wallet - Earnings, payouts
└── Account - Settings, profile
```

### Stack Navigation
- Authentication stack (Login, Register, Onboarding, OTP)
- Loan application stack (5-step process)
- Chat stack (Conversations, Groups, Chatbot)
- Settings stack (Profile, Security, Addresses)

---

## ✨ Completed Features

- [x] User authentication (Login/Register)
- [x] OTP email verification
- [x] Product marketplace with categories
- [x] Product search and filtering
- [x] Shopping cart system
- [x] Wallet with balance display
- [x] Add funds (Bank Transfer, Crypto)
- [x] Transaction history and receipts
- [x] One-on-one chat messaging
- [x] Group chat with typing indicators
- [x] AI chatbot support
- [x] Loan management system
- [x] 5-step loan application process
- [x] Loan status tracking
- [x] User profile management
- [x] Settings and security options
- [x] Address book for delivery
- [x] Referral and rewards system
- [x] Farmer product management
- [x] Dashboard overview (Farmers)
- [x] User search functionality
- [x] Responsive UI design

---

## 🔄 Planned Features

- [ ] Payment gateway integration
- [ ] Real-time notifications
- [ ] Advanced analytics for farmers
- [ ] Subscription management
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Enhanced security (2FA)
- [ ] Performance optimization

---

## 🐛 Known Issues & TODO

- [ ] Test FAB button navigation and chatbot
- [ ] Ensure API endpoint integration
- [ ] Add SafeAreaView to all screens
- [ ] Optimize image loading for slow networks
- [ ] Add error boundary components
- [ ] Implement proper error handling
- [ ] Add loading skeletons for better UX

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- PHP server with MySQL

### Frontend Setup
```bash
# Install dependencies
npm install
# or
yarn install

# Start Expo development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

### Backend Setup
1. Set up MySQL database
2. Create tables using schema above
3. Configure database connection in `conn.php`
4. Deploy PHP files to server
5. Update `BASE_URL` in `api/api.js`

### Environment Variables
Create `.env` file (optional, currently using hardcoded values):
```
DATABASE_HOST=localhost
DATABASE_NAME=preciou3_jek
DATABASE_USER=preciou3_admin
DATABASE_PASSWORD=Apcodesphere001
API_BASE_URL=https://preciousadedokun.com.ng/jek/
```

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `App.js` | Main app with stack navigator |
| `CartContext.js` | Global cart state management |
| `api/api.js` | Axios HTTP client configuration |
| `screens/Home.js` | Home screen with FAB chatbot button |
| `screens/LoginScreen.js` | User authentication |
| `screens/Loans.js` | Loan management dashboard |
| `screens/WalletScreen.js` | Wallet and transactions |
| `screens/ChatBotScreen.js` | AI chatbot interface |
| `components/MainTabNavigator.js` | Customer bottom navigation |
| `components/FarmerTabNavigator.js` | Farmer bottom navigation |

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/YourFeature`
2. Commit changes: `git commit -m 'Add YourFeature'`
3. Push to branch: `git push origin feature/YourFeature`
4. Create Pull Request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support & Contact

For support or inquiries:
- Email: support@jekfarm.com
- Website: https://preciousadedokun.com.ng/jek/

---

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial project setup with React Native & Expo
- Complete authentication system
- Marketplace with product browsing
- Wallet and transaction management
- Loan application system (5-step process)
- Chat system (1-on-1, groups, chatbot)
- User profile and settings
- Farmer dashboard and product management

---

**Last Updated**: 2024
**Project Status**: Active Development