const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
// const $ = require('jQuery');
const { Schema } = mongoose;
const port = process.env.PORT || 8000;
const app = express();


app.use(express.static(__dirname + '/public'));
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

    _applications: [{
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
    appzone: String,
    applevel: String,
    appdesc: String,
    appdataowner: String,
    appverison: String,
    appbackup: String,
    appmaint: String,
    appvensupport: String,



    _analysts: [{
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


// app.get('/analysts', function(request, response){
//     Analyst.find({})
//     .then(analysts => {
//         response.render('analysts/index.ejs', { analysts});
//     })
//     .catch(function(eorror){
//         console.log('something went wrong on find');
//     })
// });



app.get('/analysts', function ( request, response){
    Analyst.find({})
     .populate('analysts')
     .exec(function(err, analysts){
        if (err){
            console.log(err);
            throw err;
        }

        response.render('analysts/index.ejs', { analysts });
    });
});

//admin dashboard
app.get('/admin/analysts', function ( request, response){
    Analyst.find({})
     .populate('analysts')
     .exec(function(err, analysts){
        if (err){
            console.log(err);
            throw err;
        }

        response.render('admin/analystsindex.ejs', { analysts });
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

app.get('/apps', function (request, response){
    Application.find({})
    .populate('_analysts')
    .then(applications => {
        response.render('apps/index', { applications });
    })
    .catch(function(error){
        console.log("error in adding apps");
    });
});

//admin dashboard
app.get('/admin', function (request, response){
    Application.find({})
    .populate('_analysts')
    .then(applications => {
        response.render('admin/appindex', { applications });
    })
    .catch(function(error){
        console.log("error in adding apps");
    });
});

//admin dashboard analyst
app.get('/admin/analyst', function (request, response){
    Analyst.find({})
    .populate('_analysts')
    .then(analysts => {
        response.render('admin/analystsindex', { analysts });
    })
    .catch(function(error){
        console.log("error in adding apps");
    });
});
// app.get('/apps', function ( request, response){
//     Application.find({}, function(err, applications){
//         if (err){
//             console.log(err);
//             throw err;
//         }
//
//         response.render('apps/index', { applications });
//     });
// });

app.post('/applications', function(request, response){
    console.log(request.body);
    const application = new Application({
        appname: request.body.appname,
        appserver: request.body.appserver,
        appvendor: request.body.appvendor,
        appzone: request.body.appzone,
        applevel: request.body.applevel,
        appdesc: request.body.appdesc,
        appverison: request.body.appverison,
        appmaint: request.body.appmaint,
        appvensupport: request.body.appvensupport,
        appbackup: request.body.appbackup,
        appdataowner: request.body.appdataowner,
        _analysts: request.body._analysts
    })

    application.save()
        .then( _applications => {
            console.log(application);
            return Analyst.findById(application._analysts)
            .then(analyst => {
                analyst._applications.push(application);
                return analyst.save();
            });
        })
        .then(()=> response.redirect('/apps'))
        .catch(console.log);
        // .then(function(){
        //     console.log('saved app');
        //     return Analyst.findById(application._analysts, { $push: { applications: applications }})
        //      .then( analysts => {
        //          console.log('analysts', analysts);
        //          response.redirect('/apps');
        //      })
        // })
        // .catch(error => {
        //     console.log('something went wrong');
        // })

})

// app.get('/applications/new', function( request, response){
//     Analyst.find({}, function(err, analysts){
//         if (err){
//             console.log(err);
//             throw err;
//         }
//         response.render('apps/new', { analysts});
//     });
// });

app.get('/applications/new', function(request, response){
    Analyst.find()
    .sort('fullname')
    .then(analysts => response.render('apps/new', { analysts}))
    .catch(console.log);

});

//show id route analyst
app.get('/:id', (request, response) => {
    Analyst.findById(request.params.id)
    .populate('_applications')
    .then(analyst => {
        console.log(analyst);
        response.render('analysts/show', { analyst })
    })
    .catch(console.log);
});

//admin id route analyst
app.get('/admin/:id', (request, response) => {
    Analyst.findById(request.params.id)
    .populate('_applications')
    .then(analyst => {
        console.log(analyst);
        response.render('admin/editanalyst', { analyst })
    })
    .catch(console.log);
});

app.get('/:id/app', (request, response) => {
    Application.findById(request.params.id)
    // Application.find({})
    .populate('_analysts')
    .then(application => {
        return Analyst.find({})
        .then( analysts => {
            console.log('application', application);
            console.log('analysts', analysts);
            response.render('apps/show', { application, analysts })
        })

    })
    .catch(console.log);
});

//admin dashboard
app.get('/:id/admin', (request, response) => {
    Application.findById(request.params.id)
    // Application.find({})
    .populate('_analysts')
    .then(application => {
        return Analyst.find({})
        .then( analysts => {
            console.log('application', application);
            console.log('analysts', analysts);
            response.render('admin/editapp', { application, analysts })
        })

    })
    .catch(console.log);
});

app.post('/apps/:id/edit', (request, response) => {
    Application.findByIdAndUpdate(request.params.id, request.body)
    .then(() =>{
        console.log('editsomething');
        response.redirect('/apps');
    })
    .catch(console.log)
});


//admin dashboard Edit
app.post('/admin/:id/edit', (request, response) => {
    Application.findByIdAndUpdate(request.params.id, request.body)
    .then(() =>{
        console.log('editsomething');
        response.redirect('/admin');
    })
    .catch(console.log)
});
//admin dashboard Remove
app.post('/apps/:id/remove', (request, response) => {
    Application.findByIdAndRemove(request.params.id)
    .then(() =>{
        console.log('remove');
        response.redirect('/admin');
    })

    .catch(console.log)
})
// app.get('apps/:id/remove', function(req, res){
//     console.log('deleteing something');
//   Application.remove({ _id: req.params.id }, function(err, application){
//     if (err) { console.log(err); }
//     res.redirect('/apps');
//   });
// });

app.post('/apps/:id/remove', (request, response) => {
    Application.findByIdAndRemove(request.params.id)
    .then(() =>{
        console.log('remove');
        response.redirect('/apps');
    })

    .catch(console.log)
})
//admin dashboard Analyst edit
app.post('/admin/analyst/:id/edit', (request, response) => {
    Analyst.findByIdAndUpdate(request.params.id, request.body)
    .then(() =>{
        console.log('editsomething for analyst');
        response.redirect('/admin/analyst');
    })
    .catch(console.log)
});

app.listen(port, () => console.log('listen on port 8000 ${ port }'));
