# Introduction

`drupal2ghost` is a migration tool to move JSON content exported from Drupal to Ghost.

# How to use it?

First, you'll need to export blog posts from Drupal. To do so, you'll need the following module installed in your Drupal instance.

[Drupal Node Export](https://www.drupal.org/project/node_export)

This module will allow you to export all your blogs in a JSON format that will be used by this `drupal2ghost` binary.

Then, if you want to import tags, you'll need to follow up these steps (just export it as CSV instead of XML):

[Export Taxonomy terms (tags) as an XML file](https://www.drupal.org/node/2283641)

When you have all artifacts, you can execute the following command:

```
node bin/drupal2ghost.js \
  -i ~/Downloads/drupalnodexport.json \
  -t ~/Downloads/tags.csv \
  -d ~/Downloads/test/content/images \
  -u http://bataon.com/ \
  -o ~/Downloads/ghost.json 
```

It will browse the file `drupalnodexport.json` exported from the module *Drupal Node Export*, create the relevant tags using the file `tags.csv` generated from the taxonomy module. It will download all images from your Drupal blog and save it in the folder `~/Downloads/test/content/images` (using the domain name `http://bataon.com/`). And it will finally generate the file `ghost.json` that you can re-import in Ghost.