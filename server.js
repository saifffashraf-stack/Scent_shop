const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL@gmail.com',
        pass: 'YOUR_APP_PASSWORD'
    }
});

const usersDb = [];

app.post('/api/signup', async (req, res) => {
    const { name, email, password, age, gender } = req.body;
    const existing = usersDb.find(u => u.email === email);
    if (existing) {
        return res.status(400).json({ success: false, message: 'الإيميل مسجل من قبل' });
    }
    const newUser = { name, email, password, age, gender };
    usersDb.push(newUser);

    try {
        await transporter.sendMail({
            from: 'YOUR_EMAIL@gmail.com',
            to: email,
            subject: 'تم إنشاء حسابك بنجاح',
            text: `أهلاً ${name}، تم إنشاء حسابك بنجاح على متجرنا.`
        });
    } catch (err) {
        console.log(err);
    }

    res.json({ success: true, user: newUser });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = usersDb.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ success: false, message: 'البيانات غير صحيحة' });
    }

    try {
        await transporter.sendMail({
            from: 'YOUR_EMAIL@gmail.com',
            to: email,
            subject: 'تنبيه: تسجيل دخول جديد',
            text: `مرحباً ${user.name}، تم تسجيل الدخول إلى حسابك بنجاح.`
        });
    } catch (err) {
        console.log(err);
    }

    res.json({ success: true, user });
});

app.post('/api/google-auth', async (req, res) => {
    const { email, name } = req.body;
    let user = usersDb.find(u => u.email === email);
    if (!user) {
        user = { name: name || 'مستخدم جوجل', email, password: '', age: 'غير محدد', gender: 'غير محدد' };
        usersDb.push(user);
    }

    try {
        await transporter.sendMail({
            from: 'YOUR_EMAIL@gmail.com',
            to: email,
            subject: 'تسجيل دخول عبر جوجل',
            text: `مرحباً ${user.name}، تم تسجيل الدخول بنجاح باستخدام حساب جوجل.`
        });
    } catch (err) {
        console.log(err);
    }

    res.json({ success: true, user });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});