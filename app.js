const express=require('express');
const app=express();
const port=3000;
const https = require('https');
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static(`${__dirname}/public`));

app.get('/',(req,res)=>{
    res.sendFile(`${__dirname}/public/index.html`)
});

app.post('/',(req,res)=>{
   const city=req.body.cityName;
   
   //api keys
   const weather_api_key=process.env.weather_api_key;
   const timeZone_api_key=process.env.timeZone_api_key;

   //https://openweathermap.org/api 
   const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weather_api_key}&units=metric`;

   https.get(url,(resp)=>{

     
       resp.on('data', (data)=>{
           const weatherData=JSON.parse(data);
            

           if(weatherData.cod===200){

            //https://app.ipgeolocation.io/ API
            //-hkatwork
            
             //calculating time in that city
            https.get(`https://api.ipgeolocation.io/timezone?apiKey=${timeZone_api_key}&lat=${weatherData.coord.lat}&long=${weatherData.coord.lon}`,(response)=>{
                response.on('data',(data)=>{
                   const timeZoneData=JSON.parse(data);
                   const time=timeZoneData.time_12.slice(0,5)+" "+timeZoneData.time_12.slice(9);
                   const date=timeZoneData.date_time_wti.slice(0,16);

                   const timeZone=time+", "+date;



                   const weatherDetails={
                    country: weatherData.sys.country,
                    city: weatherData.name,
                    temperature: Math.round(weatherData.main.temp),
                    feelsLike: Math.round(weatherData.main.feels_like),
                    description: weatherData.weather[0].main,
                    imageURL: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
                    humidity: weatherData.main.humidity,
                    visibility: ((weatherData.visibility)/1000).toFixed(1),
                    wind: weatherData.wind.speed,
                    time:timeZone
                }
     
               res.render('weatherPage',{weatherDetails: weatherDetails});



                })
            })
       
           }

           else{
            res.render('failurePage',{city: city});
           }
          
       })

   })

});


app.post('/failure',(req,res)=>{
   res.redirect('/');
});


app.listen(process.env.PORT || port,()=>{
    console.log(`Server running on port ${port}`);
});