var fs = require('fs');
var slug = require('slug');

exports.fromFile = function(file, csvTagFile,downloadFolder) {
  var Promise = require('promise');
  return new Promise(function(resolve, reject) {
    fs.readFile(file, 'utf-8', function(err, d) {
        if(err) {
          reject(err);
          exit;
        }

        if (csvTagFile != null)
          fs.readFile(csvTagFile, 'utf-8', function(err, tags) {
              if(err) {
                reject(err);
                exit;
              }

              resolve(buildJSON(JSON.parse(d), tags, downloadFolder));
          });
        else {
          resolve(buildJSON(JSON.parse(d), null, downloadFolder));
        }
    });
  });
};

function buildJSON(input, tags, downloadFolder) {

  var authors = getAuthors(input);

  var ghost = {
    "db": [
      {
        "data": {
          "posts": getPosts(input, authors, downloadFolder),
          "tags": getTags(tags),
          "posts_tags": [],
          "users": getUsers(authors),
          "roles_users": []
        },
        "meta":{
          "exported_on": Date.now(),
          "version": "003"
        }
      }
    ]
  };

  return ghost;
}

// Get the list of authors
function getAuthors(input) {
  var authors = [];
  input.forEach(function(post){
    if (authors.indexOf(post.name) === -1)
      authors.push(post.name);
  });
  return authors;
}

// Transform the list of authors to the list of users
function getUsers(authors) {
  var users = [];
  authors.forEach(function(author){
    users.push({
      "id": String(authors.indexOf(author) + 1),
      "slug": slug(author.replace(/\./g, "").toLowerCase()),
      "name": author,
      "email": author +"@emailme.com"
    });
  });
  return users;
}

// Generate the array of tags
function getTags(csv) {
  var tags = [];
  if (csv != null)
    csv.replace(/\r/g, "").split("\n").forEach(function(line){
      var items = line.split(",");
      if (items[1]) {
        tags.push({
          "id": items[1],
          "name": items[0],
          "slug": slug(items[0].toLowerCase())
        });
      }
    });
  return tags;
}

// Get all posts
function getPosts(input, authors, downloadFolder) {
  var posts = [];
  input.forEach(function(post){

    var html = treatHTML(post.body.und[0].safe_value);
    var images = [];
    if (downloadFolder != null) {
      var re = /"\/sites\/default.*?"/g;
      images = html.match(re);
    }

    posts.push({
      "images": images, // Images to download
      "id": parseInt(post.nid),
      "title": post.title,
      "slug": slug(post.title.toLowerCase()),
      "markdown": null,
      "html": html,
      "image": null,
      "featured": false,
      "page": 0,
      "status":  post.status === "1" ? "published" : "draft",
      "language": "en_US",
      "meta_title": null,
      "meta_description": null,
      "author_id": String(1 + authors.indexOf(post.name)),
      "created_at": new Date(1000 * parseInt(post.created)),
      "created_by": String(1 + authors.indexOf(post.name)),
      "updated_at": new Date(1000 * parseInt(post.changed)),
      "updated_by": String(1 + authors.indexOf(post.name)),
      "published_at": new Date(1000 * parseInt(post.revision_timestamp)),
      "published_by": String(1 + authors.indexOf(post.name))
    });
  });
  return posts;
}

var treat = function(html) {
  html = html.replace(/\r\n/g, "\n");
  html = html.replace(/\r/g, "\n");
  html = html.replace(/<p>&nbsp;<\/p>/g, "");
  html = html.replace(/\[((source)?code)[^\]]*\]\n*([\s\S]*?)\n*\[\/\1\]/g, '<pre><code>$3</code></pre>');
  html = html.replace(/\[caption.+\](.+)\[\/caption\]/g, '$1');
  return html;
}

var treatHTML = function(html) {
  html = treat(html);
  html = html.replace(/\n\n/g, '<p>');
  html = html.replace(/<pre>(.*?)<\/pre>/g, function(match) { return match.replace(/<p>/g, "\n\n"); });
  html = html.replace(/<p><pre>/g, "<pre>");
  html = html.replace(/style=(\"|')[^(\"|')]*(\"|')/g, "");
  html = html.replace(/<strong *>(.*)<\/strong>/g, "$1");
  html = html.replace(/<span *>(.*)<\/span>/g, "$1");
  return html;
}
