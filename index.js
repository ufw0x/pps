import express from "express";
import axios from "axios";
import { load } from "cheerio";
import { config } from "dotenv";
import cors from "cors";
import helmet from "helmet";

config();

const app = express();
const port = process.env.PORT || 8000;

//express middleware config
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const endpointUrl = "https://pastpapers.wiki/";

const scrapeData = async (req, res) => {
	const {grade, subject} = req.params;
	if(!grade || !subject)return res.json({error:true, message:'bad request'})
	try {
		const html = await axios.get(
			`${endpointUrl}grade-${grade}-${subject}`.trim(),
		);

		// check whether request has successed??

		if (parseInt(html.status) !== 200)
			throw new Error("request went wrong!");

		// load data with cheerio

		const $ = load(html.data);

		// initializing array which will store filtered urls

		const filteredUrls = [];

		$("ul > li > strong > a").each(function (i, element) {
			let $text = $(element).text();
			// filtering paper among whole links
			if (!$text.includes("paper")) return;

			let $url = $(element).attr("href");

			let obj = { name: $text, url: $url };

			filteredUrls.push(obj);
		});
		if(filteredUrls)return res.json(filteredUrls);
		if(!subject.includes('-2'))return res.json({error:false, message:'requested data not found', hints:'try adding -2 after url (example:- "https://pps.vercel.app/6/science-2")'});
		return res.json({error:false, message:'requested data not found'})

	} catch (err) {
		return res.json({error:true, message:err.message})
	}
};

app.get("/:grade/:subject", scrapeData);

app.get('/', (req, res)=>{
	return res.json({message:'scraper is online !!!!'})
})
app.listen(port, () => {
	console.log("Gerrr!");
});
