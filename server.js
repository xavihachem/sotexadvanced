require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for form submission
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Brevo (Sendinblue) SMTP
const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: process.env.BREVO_SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASSWORD
    }
});

app.post('/api/order', async (req, res) => {
    console.log('\n========================================');
    console.log('📦 NEW ORDER RECEIVED');
    console.log('========================================');
    console.log('Order data:', JSON.stringify(req.body, null, 2));
    
    const { name, phone, wilaya, baladiya, address, deliveryType, area, total } = req.body;
    
    // Create email content
    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h2 style="color: #f97316; text-align: center;">طلبية جديدة - Sotex</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #1f2937;">معلومات العميل</h3>
                <p><strong>الاسم:</strong> ${name}</p>
                <p><strong>رقم الهاتف:</strong> ${phone}</p>
                <p><strong>الولاية:</strong> ${wilaya}</p>
                <p><strong>البلدية:</strong> ${baladiya}</p>
                <p><strong>العنوان:</strong> ${address}</p>
            </div>
            
            <div style="background-color: #fce7f3; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ec4899;">
                <h3 style="color: #1f2937;">💄 تفاصيل الطلب</h3>
                <p><strong>المنتج:</strong> مجموعة أدوات العناية والتجميل الفاخرة</p>
                <p><strong>الكمية:</strong> ${area} مجموعة</p>
                <p><strong>نوع التوصيل:</strong> ${deliveryType === 'office' ? 'توصيل إلى المكتب (600 دج)' : 'توصيل إلى المنزل (850 دج)'}</p>
                <p><strong>المجموع الكلي:</strong> ${total}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #6b7280;">
                <p>تم إرسال هذه الرسالة من موقع Sotex</p>
            </div>
        </div>
    `;
    
    console.log('\n📧 Preparing to send email...');
    console.log('From: "Sotex - طلبيات" <onyxiajewelry0@gmail.com>');
    console.log('To: onyxiajewelry0@gmail.com');
    console.log('Subject:', `طلبية جديدة من ${name} - Sotex`);
    
    try {
        console.log('\n Connecting to Brevo SMTP server...');
        
        // Send email
        const info = await transporter.sendMail({
            from: '"Sotex - طلبيات" <onyxiajewelry0@gmail.com>',
            to: process.env.EMAIL_TO || 'onyxiajewelry0@gmail.com',
            replyTo: phone ? `${phone}@example.com` : 'onyxiajewelry0@gmail.com',
            subject: `طلبية جديدة من ${name} - Sotex`,
            html: emailContent
        });
        
        console.log('\n EMAIL SENT SUCCESSFULLY!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('========================================\n');
        
        res.json({ success: true, message: 'تم إرسال طلبك بنجاح!' });
    } catch (error) {
        console.log('\n❌ EMAIL SENDING FAILED!');
        console.error('Error details:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        console.log('========================================\n');
        
        res.status(500).json({ success: false, message: 'حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
    console.log(`📦 Product page is ready!`);
});
