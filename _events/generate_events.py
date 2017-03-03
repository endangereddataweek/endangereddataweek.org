#!/usr/bin/env python

import csv

csvfile = open('events.csv', 'rU')
csvreader = csv.reader(csvfile, delimiter=",", quotechar='"')

# Empty array for headings, made from first row of CSV
data_headings = [] 

for row_index, row in enumerate(csvreader):
	if row_index == 0:
		data_headings = row
	else:
		# Open a new file with filename based on the date column and title column
		filename = row[0] + "-" + row[4].lower().replace(" ", "_").replace(":", "") + '.md'
		event_yaml = open(filename, 'w')

		# Empty string that we will fill with YAML formatted text based on data extracted from our CSV.
		yaml_text = ""
		yaml_text += "---\n"
		yaml_text += "layout: post \n"

		# Loop through each cell in this row
		for cell_index, cell in enumerate(row):

			if cell_index == 7:
				cell_heading = data_headings[cell_index].lower()
				cell_text = cell.replace("\n", ", ") + "\n"

				event_text = cell_text

			else:
				cell_heading = data_headings[cell_index].lower().replace(" ", "_").replace("-", "_")
				cell_text = cell_heading + ": " + '"' + cell.replace("\n", ", ") + '"' + "\n"
				yaml_text += cell_text

		event_yaml.write(yaml_text + "---\n" + event_text)
		event_yaml.close()

csvfile.close()