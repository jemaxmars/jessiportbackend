# Jessi's Portfolio - Backend API

Backend service for personal portfolio website. Built with Node.js, Express, and MongoDB.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Email Service:** Nodemailer
- **Validation:** Express-validator, Joi
- **Security:** Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
src/
├── config/
│   ├── db.js              # MongoDB connection
│   └── email.js           # Email configuration
├── models/
│   └── Contact.js         # Contact form schema
├── routes/
│   └── contact.js         # Contact endpoints
├── controllers/
│   └── contactController.js # Business logic
├── middleware/
│   ├── validation.js      # Input validation
│   ├── errorHandler.js    # Error handling
│   └── rateLimit.js       # Rate limiting
├── utils/
│   ├── emailTemplate.js   # Email templates
│   └── logger.js          # Logging utility
└── app.js                 # Express app setup

server.js                   # Entry point
.env.example               # Environment variables template
```

## 🔧 Installation

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account
- Gmail account (for Nodemailer)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/jemaxmars/jessiportbackend.git
   cd jessiportbackend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**

   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000`

## 📡 API Endpoints

### Contact Form

**Submit Contact Form**

```
POST /api/contact/submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here..."
}

Response:
{
  "success": true,
  "message": "Message received successfully",
  "contactId": "507f1f77bcf86cd799439011"
}
```

**Get All Messages** (Admin)

```
GET /api/contact/messages
Authorization: Bearer token

Response:
{
  "success": true,
  "messages": [...]
}
```

**Get Specific Message**

```
GET /api/contact/messages/:id
```

**Update Message Status**

```
PATCH /api/contact/messages/:id
Content-Type: application/json

{
  "status": "read"
}
```

**Delete Message**

```
DELETE /api/contact/messages/:id
```

## 🗄️ Database Schema

### Contact Model

```javascript
{
  _id: ObjectId,
  name: String (required, trim, minLength: 2),
  email: String (required, lowercase, validated),
  message: String (required, minLength: 10, maxLength: 5000),
  status: String (enum: ['new', 'read', 'archived'], default: 'new'),
  createdAt: Date (default: Date.now),
  updatedAt: Date,
  ipAddress: String,
  userAgent: String
}
```

## 🔐 Security Features

- ✅ CORS enabled
- ✅ Helmet headers for security
- ✅ Rate limiting (5 requests per 15 minutes)
- ✅ Input validation with express-validator
- ✅ MongoDB injection prevention
- ✅ XSS protection
- ✅ HTTPS ready

## 📧 Email Configuration

### Using Gmail with Nodemailer

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

## 📦 NPM Scripts

```bash
npm run dev      # Start with nodemon (development)
npm start        # Start server (production)
npm test         # Run tests (when configured)
npm run lint     # Lint code (when configured)
```

## 🚀 Deployment

### Deployment Architecture

**Frontend:** Google Compute Engine VM → `codedwithjessi.com`  
**Backend API:** Google Compute Engine VM → `api.codedwithjessi.com`  
**Database:** MongoDB Atlas

### Single Google Compute Engine VM Setup

Both frontend and backend run on the same VM with Nginx routing traffic to the correct services.

#### 1. Create VM Instance

```bash
gcloud compute instances create portfolio-vm \
  --machine-type=e2-micro \
  --zone=us-central1-a \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB
```

#### 2. SSH into VM

```bash
gcloud compute ssh portfolio-vm --zone=us-central1-a
```

#### 3. Install Dependencies

```bash
sudo apt update
sudo apt install -y nodejs npm git nginx certbot python3-certbot-nginx
```

#### 4. Clone Repositories

```bash
cd /var/www
sudo mkdir -p codedwithjessi
sudo chown $USER:$USER codedwithjessi
cd codedwithjessi

# Clone backend
git clone https://github.com/jemaxmars/jessiportbackend.git
cd jessiportbackend
npm install

# Clone frontend
cd ..
git clone https://github.com/jemaxmars/jessiportfrontend.git
cd jessiportfrontend
npm install
npm run build
```

#### 5. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

#### 6. Start Backend with PM2

```bash
cd /var/www/codedwithjessi/jessiportbackend

# Create .env file
nano .env
```

Add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://codedwithjessi.com
```

```bash
# Start with PM2
pm2 start server.js --name "portfolio-api"
pm2 startup
pm2 save
```

#### 7. Configure Nginx for Both Services

```bash
sudo nano /etc/nginx/sites-available/codedwithjessi.com
```

Add:

```nginx
# Frontend configuration
server {
    listen 80;
    server_name codedwithjessi.com www.codedwithjessi.com;

    root /var/www/codedwithjessi/jessiportfrontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API configuration
server {
    listen 80;
    server_name api.codedwithjessi.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/codedwithjessi.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Set Up SSL with Let's Encrypt

```bash
sudo certbot --nginx -d codedwithjessi.com -d www.codedwithjessi.com -d api.codedwithjessi.com
```

#### 9. Get VM External IP

```bash
gcloud compute instances list
```

Copy the `EXTERNAL_IP`

#### 10. Configure DNS

Go to your domain registrar (GoDaddy, Namecheap, etc.) and create these DNS records:

```
A Record:
  Name: @
  Value: YOUR_VM_EXTERNAL_IP
  (This handles codedwithjessi.com and www.codedwithjessi.com)

A Record:
  Name: api
  Value: YOUR_VM_EXTERNAL_IP
```

### Environment Variables for Production

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://codedwithjessi.com
```

### Monitoring & Maintenance

**Check PM2 Logs**

```bash
pm2 logs portfolio-api
```

**Monitor Running Process**

```bash
pm2 monit
```

**Update Backend**

```bash
cd /var/www/codedwithjessi/jessiportbackend
git pull origin main
npm install
pm2 restart portfolio-api
```

**Update Frontend**

```bash
cd /var/www/codedwithjessi/jessiportfrontend
git pull origin stage-1-frontend-and-api
npm install
npm run build
sudo systemctl restart nginx
```

### Troubleshooting

**Check Nginx Status**

```bash
sudo systemctl status nginx
```

**Check PM2 Status**

```bash
pm2 status
```

**View Nginx Logs**

```bash
sudo tail -f /var/log/nginx/error.log
```

**SSH into VM**

```bash
gcloud compute ssh portfolio-vm --zone=us-central1-a
```

## 🔗 Links

- **Portfolio:** https://codedwithjessi.com
- **Backend API:** https://api.codedwithjessi.com
- **GitHub Frontend:** [github.com/jemaxmars/jessiportfrontend](https://github.com/jemaxmars/jessiportfrontend)
- **GitHub Backend:** [github.com/jemaxmars/jessiportbackend](https://github.com/jemaxmars/jessiportbackend)
- **LinkedIn:** [linkedin.com/in/jemaxmars](https://linkedin.com/in/jemaxmars)

---

**Stage 2 - Backend Setup with Google VM Deployment** 🚀
