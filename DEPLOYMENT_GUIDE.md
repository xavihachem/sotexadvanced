# 🚀 Sotex VPS Deployment Guide

Complete step-by-step guide to deploy your Sotex website on a VPS with a custom domain.

---

## 📋 Prerequisites

- ✅ VPS server (Ubuntu/Debian recommended)
- ✅ Domain name purchased
- ✅ SSH access to your VPS
- ✅ Root or sudo privileges

---

## 🌐 Part 1: Domain & DNS Configuration

### Step 1: Configure DNS Records

Log into your domain registrar's control panel and add these DNS records:

```
Type    Name    Value                   TTL
A       @       YOUR_VPS_IP_ADDRESS     3600
A       www     YOUR_VPS_IP_ADDRESS     3600
```

**Example:**
- If your domain is `sotex.dz` and VPS IP is `203.0.113.45`:
  - `A` record: `@` → `203.0.113.45`
  - `A` record: `www` → `203.0.113.45`

**Note:** DNS propagation can take 5 minutes to 48 hours.

---

## 🖥️ Part 2: VPS Server Setup

### Step 1: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
# or
ssh username@YOUR_VPS_IP
```

### Step 2: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Node.js & npm

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Install Nginx (Web Server)

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

---

## 📦 Part 3: Deploy Your Application

### Step 1: Create Application Directory

```bash
sudo mkdir -p /var/www/sotex
cd /var/www/sotex
```

### Step 2: Upload Your Files

**Option A: Using SCP (from your local machine)**
```bash
scp -r D:\workspace\sotexshop/* root@YOUR_VPS_IP:/var/www/sotex/
```

**Option B: Using Git**
```bash
cd /var/www/sotex
git clone YOUR_REPOSITORY_URL .
```

**Option C: Using FTP/SFTP Client**
- Use FileZilla or WinSCP
- Connect to your VPS
- Upload all files to `/var/www/sotex/`

### Step 3: Install Dependencies

```bash
cd /var/www/sotex
npm install
```

### Step 4: Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/sotex
sudo chmod -R 755 /var/www/sotex
```

---

## 🔧 Part 4: Configure Nginx

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/sotex
```

### Step 2: Add This Configuration

```nginx
server {
    listen 80;
    server_name sotex.dz www.sotex.dz;  # Replace with your domain

    # Serve static files
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optimize static file serving
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 3: Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/sotex /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

---

## 🔐 Part 5: SSL Certificate (HTTPS)

### Step 1: Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Obtain SSL Certificate

```bash
sudo certbot --nginx -d sotex.dz -d www.sotex.dz
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

### Step 3: Auto-Renewal Setup

```bash
sudo certbot renew --dry-run  # Test renewal
```

Certbot automatically sets up a cron job for renewal.

---

## 🚀 Part 6: Start Your Application

### Step 1: Start with PM2

```bash
cd /var/www/sotex
pm2 start server.js --name sotex
pm2 save
pm2 startup
```

### Step 2: Verify It's Running

```bash
pm2 status
pm2 logs sotex  # View logs
```

---

## 🔥 Part 7: Firewall Configuration

### Step 1: Configure UFW Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## ✅ Part 8: Verification

### Step 1: Check Your Website

Visit your domain in a browser:
- `http://sotex.dz` (should redirect to HTTPS)
- `https://sotex.dz`
- `https://www.sotex.dz`

### Step 2: Test Email Functionality

Submit a test order to verify Brevo email integration works.

---

## 🛠️ Useful PM2 Commands

```bash
pm2 list                  # List all processes
pm2 restart sotex         # Restart application
pm2 stop sotex           # Stop application
pm2 delete sotex         # Remove from PM2
pm2 logs sotex           # View logs
pm2 logs sotex --lines 100  # View last 100 lines
pm2 monit                # Monitor resources
```

---

## 🔄 Updating Your Application

When you make changes:

```bash
cd /var/www/sotex
git pull  # If using Git
# or upload new files via SCP/FTP

npm install  # If dependencies changed
pm2 restart sotex
```

---

## 🐛 Troubleshooting

### Issue: Site not loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Check PM2 status
pm2 status

# Check application logs
pm2 logs sotex

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 PROCESS_ID
```

### Issue: Permission denied

```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/sotex
sudo chmod -R 755 /var/www/sotex
```

### Issue: DNS not resolving

```bash
# Check DNS propagation
nslookup sotex.dz
dig sotex.dz

# Wait for DNS propagation (up to 48 hours)
```

---

## 📊 Monitoring & Maintenance

### Daily Checks

```bash
pm2 status           # Check app status
pm2 logs sotex --lines 50  # Check recent logs
df -h                # Check disk space
free -h              # Check memory
```

### Weekly Maintenance

```bash
sudo apt update && sudo apt upgrade -y  # Update system
pm2 update           # Update PM2
sudo certbot renew   # Renew SSL (automatic)
```

---

## 🔒 Security Best Practices

1. **Change SSH Port** (optional but recommended)
2. **Disable Root Login** via SSH
3. **Use SSH Keys** instead of passwords
4. **Keep System Updated** regularly
5. **Monitor Logs** for suspicious activity
6. **Backup Database** if you add one later
7. **Use Strong Passwords** for all services

---

## 📧 Email Configuration Notes

Your Brevo SMTP is already configured in `server.js`:
- Host: `smtp-relay.brevo.com`
- Port: `587`
- User: `9585b6001@smtp-brevo.com`
- Emails sent to: `onyxiajewelry0@gmail.com`

**No additional configuration needed!**

---

## 🎉 Success Checklist

- [ ] DNS records configured
- [ ] VPS server set up with Node.js
- [ ] Application files uploaded
- [ ] Dependencies installed
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Application running with PM2
- [ ] Firewall configured
- [ ] Website accessible via domain
- [ ] Email orders working
- [ ] Phone validation working
- [ ] All 58 wilayas loading correctly

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review PM2 logs: `pm2 logs sotex`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify DNS propagation: `nslookup your-domain.com`

---

**🎊 Congratulations! Your Sotex website is now live!**
