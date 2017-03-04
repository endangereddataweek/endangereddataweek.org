require 'google_drive'
require 'dotenv/tasks'
require 'dotenv'
require 'colorize'
require 'chronic'
require 'geocoder'
require 'ra11y'

# system requirements
require 'csv'
require 'date'
require 'erb'
require 'json'

Dotenv.load

namespace :import do
    desc 'Import Events from the Google Spreadsheet'
    task :events do
        login
        (2..@ws.num_rows).each do |row|
            @event = {
                title: @ws[row, 2],
                date: Chronic.parse(@ws[row, 3]).strftime('%Y-%m-%d'),
                time: @ws[row, 4],
                institution: @ws[row, 5],
                location: @ws[row, 6],
                contact: @ws[row, 7],
                description: @ws[row, 8]
            }

            contents = render_erb('templates/event.html.erb')
            file_path = filename(@event)
            write_file(file_path, contents)
            puts "Writing the event for '#{@event[:title]}'".green
        end
        # import:events
    end
end

def filename(event)
    formatted_date = Chronic.parse(event[:date]).strftime('%Y-%m-%d')
    event_name = event[:title].split(%r{ |!|/|:|&|-|$|,|“|”}).map do |i|
        i.downcase if i != ''
    end.compact.join('-')
    "_events/#{formatted_date}-#{event_name}.md"
end

def render_erb(template_path)
    template = File.open(template_path, "r").read
    erb = ERB.new(template)
    erb.result(binding)
end

# Login to Google with a saved session and set spreadsheet
def login
    system('clear')
    puts 'Authorizing...'.green

    @session ||= GoogleDrive.saved_session('config.json')
    @ws ||= @session.spreadsheet_by_key(ENV['SPREADSHEET_KEY']).worksheets[0]
end

def spreadsheet
    @ws ||= @session.spreadsheet_by_key(ENV['SPREADSHEET_KEY'])
end

def write_file(path, contents)
    begin
        file = File.open(path, 'w')
        file.write(contents)
    rescue IOError => error
        puts "File not writable. Check your permissions"
        puts error.inspect
    ensure
        file.close unless file == nil
    end
end

def geocode(address)
    result = Geocoder.search(address).first
    if result
        {
            lat: result.latitude,
            lon: result.latitude
        }
    else
        {}
    end
end
