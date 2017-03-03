# Endangered Data Week

A static site, [http://endangereddataweek.org/](http://endangereddataweek.org).

## Generating Events

-   `cd _events`
-   Drop in a new CSV file called `events.csv` formatted the way it appears in the sample.
-   From CLI, run `python generate_events.py`. The script will create new Markdown files for each event in the CSV.
-   Jekyll will handle the rest. When the site is generated, the events will appear on the front page.

## License

[CC-BY](LICENSE.md)
