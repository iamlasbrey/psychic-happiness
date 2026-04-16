const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { googleAuthUser } = require('../services/user.service');
const config = require('./index');

const configureGoogleStrategy = () => {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    console.warn(
      '⚠️  Google OAuth credentials missing; /auth/google endpoints will be disabled.',
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const { user, token } = await googleAuthUser(profile);
          done(null, { user, token });
        } catch (error) {
          done(error, null);
        }
      },
    ),
  );
};

module.exports = { passport, configureGoogleStrategy };
