const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
	console.log("Database Connected!");
});

const Campground = require("../models/campground");
const Review = require("../models/review");

const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	await Review.deleteMany({});
	for (let i = 0; i < 200; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20 + 10);
		const camp = new Campground({
			title: `${sample(descriptors)} ${sample(places)}`,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: { "type" : "Point", "coordinates" : [ cities[random1000].longitude, cities[random1000].latitude ] },
			author: "60cf47e65c8afa27941da6c9",
			images: [
				{
					url: "https://res.cloudinary.com/ajilp/image/upload/v1624296475/YelpCamp/vbsnazuzoqsxxjx9y5jd.jpg",
					filename: "YelpCamp/spx3qzbyhmbu1rizqjgk",
				},
				{
					url: "https://res.cloudinary.com/ajilp/image/upload/v1624297073/YelpCamp/637e0c16393a7996_c7cdbc.jpg",
					filename: "YelpCamp/lkmyvulrhcah6art83qh",
				},
			],
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis soluta modi illo explicabo. Molestias dolorum possimus expedita consectetur quae! Tempore.",
			price,
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
