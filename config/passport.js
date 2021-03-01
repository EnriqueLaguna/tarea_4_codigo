const passport = require ( 'passport' );
const GoogleStrategy = require ( 'passport-google-oauth20' ).Strategy;
const pool = require('../database/pool');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: 'http://localhost:3001/auth/google/callback' ,
        },
        function (accessToken, refreshToken, profile, done) {
            //console.log(profile);
            done(null, profile);
        }
    )
);

passport.serializeUser(async function (user, done) {
    console.log(user);
    const idReducido = parseInt(Math.sqrt(Math.sqrt(user.id)));

    //Revisar si el ID ya esta en la base de datos

    (await pool).query('select * from users where id=$1', [idReducido], async(qerr, qres) => {
        if(qerr){
            console.log(qerr);
            return;
        }
        const existUser = qres.rows[0];

//Si no existe un user con ese id, se inserta en la base de datos

        if(!existUser){
            (await pool).query('insert into users("id", "fullname", "email","imagen") values($1, $2, $3, $4)', 
            [idReducido, user.displayName, user.emails[0].value, user.photos[0].value], 
            (qerr2, qres2) => {
                if(qerr2){
                    console.log(qerr2);
                    return;
                }
            });
        }
    });
    done(null, idReducido);
});

passport.deserializeUser(async function (id, done) {
    if(id >= 1000000000000000000000){
        id = parseInt(Math.sqrt(Math.sqrt(id)));
    }
    console.log(id);
    (await pool).query('select u.id, u.fullname, u.email, u.imagen from users u where u.id = $1', [id], async(qerr, qres) => {
        if(qerr){
            console.error(qerr);
        }else{
            const user=qres.rows[0];
            if(user){
                done(null, user);
            }else{
                done();
            }
        }   
    });
});