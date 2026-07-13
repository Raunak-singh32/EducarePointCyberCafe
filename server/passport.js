const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://educarepointcybercafe-1.onrender.com/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            }

            // Check if email already registered with password
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                // Link Google to existing account
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            }

            // Create new user from Google
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                password: null,
                whatsapp: '',
                address: ''
            });

            await user.save();
            return done(null, user);

        } catch (error) {
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};