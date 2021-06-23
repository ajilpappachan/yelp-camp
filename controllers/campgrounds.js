const Campground = require("../models/campground");
const {cloudinary} = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mabBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mabBoxToken});

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
	const geodata = await geocoder.forwardGeocode({
		query: req.body.campground.location,
		limit: 1
	}).send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geodata.body.features[0].geometry;
	campground.author = req.user._id;
	campground.images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	await campground.save();
	req.flash("success", "Successfully made a new campground");
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findById(id)
		.populate({ path: "reviews", populate: { path: "author" } })
		.populate("author");
	if (!camp) {
		req.flash("error", "Cannot find campground");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/show", { camp });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findById(id);
	if (!camp) {
		req.flash("error", "Cannot find campground");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { camp });
};

module.exports.editCampground = async (req, res) => {
	const { id } = req.params;

	const camp = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});
	camp.author = req.user._id;
	const images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	camp.images.push(...images);
	await camp.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await camp.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
		console.log(camp);
	}
	req.flash("success", "Successfully updated campground");
	res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findByIdAndDelete(id);
	req.flash("success", "Succesfully deleted campground");
	res.redirect("/campgrounds");
};
