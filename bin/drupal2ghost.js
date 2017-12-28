#!/usr/bin/node
var drupal2ghost = require('../lib/drupal2ghost.js');
var path = require('path');
var fs = require('fs');
var program = require('commander');
var download = require('../lib/download');

main();

function main() {
    program
        .option('-i, --input <input file>', 'JSON file from Drupal')
        .option('-o, --output <output file>', 'JSON file for Ghost')
        .option('-t, --tags <tags file>', 'CSV file of authors - see README')
        .option('-d, --download <download folder>', 'Download folder for images - see README')
        .option('-u, --url <base URL>', 'Base URL required to download the images - see README')
        .parse(process.argv);

    if (!program.input) {
        return console.error('Missing input file! Pass it using -i parameter');
    }

    if (!program.output) {
        return console.error('Missing output file! Pass it using -o parameter');
    }

    process.stdout.write("");

    var when = drupal2ghost.fromFile(program.input, program.tags, program.download);
    when.then(function(data) {
      if (program.download != null) {

        console.log("Downloading images");

        if (program.url == null) {
          process.stderr.write("You need to provide the base URL if you want to donwload the images");
          exit;
        } else {
          var posts = data.db[0].data.posts;

          posts.forEach(function(post){

            var images = post.images;
            if (images != null) {
              images.forEach(function(image){

                var url = program.url;
                if (url.endsWith("/")) url = url.substr(0, url.length - 1);
                url += image.replace(/"/g, "");
                var filename = decodeURIComponent(url.substring(url.lastIndexOf('/')+1));

                var folder = program.download;
                if (!folder.endsWith("/")) folder += "/";
                folder += "import/";

                if (!fs.existsSync(folder)){
                  fs.mkdirSync(folder);
                }

                if (!fs.existsSync(folder + filename))
                  download(url, folder + filename, function (state) {
                  }, function (response) {
                  }, function (error) {
                      console.log("Error", error);
                  }, function () {
                      console.log("  Downloaded: " + url);
                  });
                else
                  console.log("  Already Downloaded: " + url);

                //Update the html
                post.html = post.html.replace(image, "\"/content/images/import/" + filename + "\"");
              });
              delete post.images;
            }
          });
        }
      }
      fs.writeFile(program.output, JSON.stringify(data));
    }, function(err) {
      process.stderr.write(JSON.stringify(err));
    });
}
