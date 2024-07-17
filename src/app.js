const path = require('path');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');
const ratelimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: 'src/config.env' });
const dbConnection = require('./config/db');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const logger = require('./utils/logger');
const morgan = require('morgan');
const morganFormat = ':method :url :status :response-time ms';

// Routes
const userRouter = require('./routes/userRoute');
const authRouter = require('./routes/authRoute');
const welcomeRoute = require('./routes/welcomeRoute');
const serviceRouter = require('./routes/serviceRoute');
const packageRoute = require('./routes/packageRoute');
const reviewRoute = require('./routes/reviewRoute');
const wishlistRoute = require('./routes/wishlistRoute');
const requestRoute = require('./routes/requestRoute');
const orderRoute = require('./routes/orderRoute');
// const chatRoute = require('./routes/chatRoute');
const { webhookCheckout } = require('./controllers/orderController');

// Connect with db
dbConnection();

// express app
app = express();

// Enable other domains to  access the app
app.use(cors());
app.options('*', cors());

// compress all responses
app.use(compression());

//Logger
if (process.env.NODE_ENV === 'producation') {
  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(' ')[0],
            url: message.split(' ')[1],
            status: message.split(' ')[2],
            responseTime: message.split(' ')[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );
}

// checkout webhook
app.get(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

// Middlewares
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json({ limit: '20kb' }));
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Mode ${process.env.NODE_ENV}`);
}

// Cookie Parser
app.use(cookieParser());

// To apply data sanitization
app.use(mongoSanitize());
app.use(xss());

const limiter = ratelimit({
  windowMs: 60 * 60 * 1000, //1 hour
  max: 100,
  message:
    'Too many accounts created from this IP, please try again after an hour',
});
// Apply the rate limitimg middleware to  all requests
app.use('/api/v1/auth', limiter);

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      'price',
      'sold',
      'keyword',
      'location',
      'quantity',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  })
);

// Mount Routes
app.use('/api/v1', welcomeRoute);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/packages', packageRoute);
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/wishlist', wishlistRoute);
app.use('/api/v1/requests', requestRoute);
app.use('/api/v1/orders', orderRoute);
// app.use('/api/v1/chat', chatRoute);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
