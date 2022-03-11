require("dotenv").config();

const express = require("express");
const hbs = require("hbs");
const async = require("hbs/lib/async");
// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/artist-search", async (req, res) => {
  //console.log(req.query.artistName);
  const apiRes = await spotifyApi.searchArtists(req.query.artistName);
  const items = apiRes.body.artists.items;
  let artistArr = [];

  for (let i = 0; i < items.length; i++) {
    let artistObj = { name: "", image: "", id: "" };
    artistObj.name = items[i].name;
    artistObj.id = items[i].id;

    if (items[i].images.length > 0) {
      artistObj.image = items[i].images[0].url;
    }
    artistArr.push(artistObj);
  }
  //console.log("I'm the Arr", artistArr);

  res.render("artist-search-results", {
    artistArr,
  });
});

app.get("/albums/:artistId", async (req, res, next) => {
  //console.log(req.params.artistId);

  const artistAlbums = await spotifyApi.getArtistAlbums(req.params.artistId);
  let albumArr = [];
  const items = artistAlbums.body.items;
  console.log(items);
  for (let i = 0; i < items.length; i++) {
    let albumObj = { img: "", name: "" };
    if (albumObj.name === "") {
      albumObj.img = items[i].images[0].url;
      albumObj.name = items[i].name;
      albumArr.push(albumObj);
    }
  }
  res.render("albums", {
    albumArr,
  });
  //console.log(albumArr);
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
