const express = require('express');
const helmet = require('helmet');
const app = express();
require('dotenv').config();
const sequelize = require('./config/db');

const { apiLimiter } = require('./middleware/RateLimiter');



//use helmet for security
app.use(helmet());
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//Routes
const authRoutes = require('./routes/RegisterRoutes');
const loginRoutes = require('./routes/LoginRoutes');
const dashboardRoutes = require('./routes/DashboardRoutes');
const searchRoutes = require('./routes/SearchRoutes');
const checkpayment= require('./routes/PaymentRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const profileRoutes = require('./routes/ProfileRoutes');
const designerRoutes = require('./routes/DesignersRoutes');
const verifyRoutes = require('./routes/VerifyRoutes');
const ForgotResetPasswordRoutes = require('./routes/ForgotResetPasswordRoutes');
const FindeProductPriceRoutes=require('./routes/FetchProductPriceRoutes');
const MediaDownloadRoutes=require('./routes/MediaDownloadRoutes');
const PayInRoutes=require('./routes/PayInRoutes');
const feedRoutes = require('./routes/feedRoutes');
const commentRoutes = require('./routes/CommentsRoutes');
const LikesRoutes = require('./routes/LikesRoutes');
const FollowerFollowingRoutes=require('./routes/FollowerFollowingroutes');
const WebHookHandlingRoutes = require('./routes/WebHookHandlingRoutes');
const DeleteAccountRoutes=require('./routes/DeleteAccountRoutes');
const ResetPasswordRoutes=require('./routes/ResetPasswordRoutes');




//enable rate limiting behind proxies like nginx
app.set('trust proxy', 1);


//rate limiting
app.use('/api', apiLimiter);



app.use('/uploads', express.static('uploads'));

app.use('/api', orderRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', searchRoutes);
app.use('/api', loginRoutes);
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', checkpayment);
app.use('/api', designerRoutes);
app.use('/api', verifyRoutes);
app.use('/api', ForgotResetPasswordRoutes);
app.use('/api',FindeProductPriceRoutes);
app.use('/api',MediaDownloadRoutes);
app.use('/api',PayInRoutes);
app.use('/api', feedRoutes);
app.use('/api', commentRoutes);
app.use('/api', LikesRoutes);
app.use('/api', FollowerFollowingRoutes);
app.use('/api', WebHookHandlingRoutes);
app.use('/api',DeleteAccountRoutes);
app.use('/api',ResetPasswordRoutes);


// Test DB connection
sequelize.authenticate()
  .then(() => console.log(' MySQL connected...'))
  .catch(err => console.error(' DB connection error:', err));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
