const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;
const port = process.env.PORT || 8000;
const app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/appmatrix');
mongoose.connection.on('connected', () => console.log('mongo connected'));

const analystSchema = new Schema({
    fullname:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    jobtitle:{
        type: String,
        required: true,
        trim: true
    },
    email: String,
    mobilenum: String,
    desknum: String,

    applications: [{
        type: Schema.Types.ObjectId,
        ref: 'Application'
    }]
},{
    timestamps: true
});

const appSchema = new Schema ({
    appname:{
        type: String,
        required: true,
        trim: true
    },
    appserver: String,
    appvendor: String,
    appstatus: String,
    appzone: String,
    applevel: String,
    appdesc: String,
    appdataowner: String,
    appverison: String,
    appbackup: String,



    analysts: [{
        type: Schema.Types.ObjectId,
        ref: 'Analyst'
    }]

}, {
    timestamps: true
});

const Analyst = mongoose.model('Analyst', analystSchema );
const Application = mongoose.model('Application', appSchema );
app.get('/', function(request, response) {

    response.render('index');

});

app.get('/analysts', function ( request, response){
    Analyst.find({}, function(err, analysts){
        if (err){
            console.log(err);
            throw err;
        }

        response.render('analysts/index.ejs', { analysts });
    });
});

 app.get('/analysts/new', function(request, response){
     response.render('analysts/new');
 });

app.post('/analysts', function(request, response){
    console.log(request.body);
    const analyst = new Analyst({
        jobtitle: request.body.jobtitle,
        fullname: request.body.fullname,
        mobilenum: request.body.mobilenum,
        desknum: request.body.desknum,
        email: request.body.email
    })

    analyst.save()
        .then(function(){
            console.log('saved user');
            response.redirect('/analysts');
        })
        .catch(error => {
            console.log('something went wrong');
        })

})

// app.get('/appss', function (request, response){
//     Application.find({})
//     .then(applications => {
//         response.render('apps/index', { applications });
//     })
//     .catch(function(error){
//         console.log("error in adding apps");
//     });
// });

app.get('/apps', function ( request, response){
    Application.find({}, function(err, applications){
        if (err){
            console.log(err);
            throw err;
        }

        response.render('apps/index', { applications });
    });
});

app.post('/applications', function(request, response){
    console.log(request.body);
    const application = new Application({
        appname: request.body.appname,
        appserver: request.body.appserver,
        appvendor: request.body.appvendor,
        appzone: request.body.appzone,
        applevel: request.body.applevel,
        appdesc: request.body.appdesc,
        appverison: request.body.appverison
    })

    application.save()
        .then(function(){
            console.log('saved app');
            response.redirect('/apps');
        })
        .catch(error => {
            console.log('something went wrong');
        })

})

app.get('/applications/new', function( request, response){
    Analyst.find({}, function(err, anaylsts){
        if (err){
            console.log(err);
            throw err;
        }
        response.render('apps/new', { anaylsts});
    });
});

// app.get('/applications/new', function(request, response){
//     Analyst.find()
//     .sort('fullname')
//     .then(anaylsts => response.render('apps/new', { anaylsts}))
//     .catch(console.log);
//
// });

app.listen(port, () => console.log('listen on port 8000 ${ port }'));