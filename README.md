# NTUST-order-system

This is a softeware engineering final project in NTUST, 114-1.

## Backend
### Add .env at backend root
```bash=
PORT=3000
MONGO_URI=mongodb+srv://<db_user_name>:<db_password>@item.ku9u5e7.mongodb.net/
```

### Initailize database
```bash=
cd backend
node scripts/initData.js
```