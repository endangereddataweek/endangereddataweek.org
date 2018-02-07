# Endangered Data Week

[![Build Status](https://travis-ci.org/endangereddataweek/endangereddataweek.org.svg?branch=gh-pages)](https://travis-ci.org/endangereddataweek/endangereddataweek.org)

A static site, [http://endangereddataweek.org/](http://endangereddataweek.org).

## Getting started

1. Clone the [repo](https://github.com/endangereddataweek/endangereddataweek.org) to your projects directory (e.g. `mkdir -p ~/projects/ && git clone git@github.com:endangereddataweek/endangereddataweek.org.git`). If you have a new computer, you may need to [set up your keys](https://help.github.com/articles/generating-ssh-keys/).
2. Make sure you're on the `gh-pages` branch (`cd ~/projects/endangereddataweek.org && git checkout gh-pages`).
3. Install the dependencies (`bundle install`).

To make it easier, paste this in to your terminal:

```
mkdir -p ~/projects && git clone git@github.com:endangereddataweek/endangereddataweek.org.git
cd ~/projects/endangereddataweek.org && git checkout gh-pages && git checkout gh-pages && bundle install
```

You can now run the project locally by running `jekyll serve` and pointing your browser to <http://localhost:4000>

## Advanced Setup

1. Make sure you have [node](https://nodejs.org/en/download/) installed.
2. Run `npm install` in the project directory (e.g. `cd ~/projects/endangereddataweek.org && npm install`)
3. Start the server, file watchers, compressions, and browser sync with `gulp`. This will automatically launch your default browser with the project and reload the page when you save a change to the project.

## Generating Events

This is automated through `rake` tasks that retrieve data from the Google Spreadsheet that the online form populates. Generating events is the default task, so you only need to run `rake` in the project directory to generate all events.

```
$ cd ~/projects/endangereddataweek
$ rake
```

This will generate the new files needed create new events. Then simply add, commit, and push to the repo.

```
$ git commit -am "Added new events [event names]"
```

To see the full list of tasks available, you can run `rake -T` in the project directory.

### Skipping Geocoding

If there is an event that is a virtual event that needs to be manually excluded in the geocoding, edit the "Endangered Data Week Event (Responses)" sheet in Google Drive and set the `geocode` column value to **0** (actually any string will work--code just checks if there's something in that field). if there are any values in the `latitude` or `longitude` columns, be sure to delete those too. Then, rerun `rake`.

## Content Edits

Content edits can be easily made on the browser-based GitHub editor.
- Find the relevant page (for example, the page for the Standards and
  Practices Interest Group is
[standards-and-practices.md](https://github.com/clirdlf/ndsa.org/blob/gh-pages/standards-and-practices.md))
- Click the pencil icon or type "e" to edit the file
- Make the edits, add a [short description](http://chris.beams.io/posts/git-commit/), and commit the changes to the
  gh-pages branch

For information on formatting, please review the [Markdown
  Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). GitHub keyboard shortcuts can be found
[here](https://help.github.com/articles/using-keyboard-shortcuts/).

## Accessibility

We're using [pa11y](https://github.com/nature/pa11y) for accessibility testing.

### Installation

You will need to make sure you have [npm](https://www.npmjs.com/) installed.
Easiest way on OS X is with [brew](http://brew.sh/).

```
$ brew install npm
$ npm install -g phantomjs pa11y
$ bundle
```

## Thumbnails

`convert apple-touch-icon.png -thumbnail 192x192^ -extent 192x192 icon.png`

### Generating a Report

There is a `Rake` task that will generate the appropriate report:

```
$ rake test:accessibility
```

## License

The code for Endangered Data Week is released under the [MIT License](LICENSE).
