require 'google_drive'
require 'dotenv/tasks'
require 'dotenv'
require 'colorize'
require 'chronic'
require 'geocoder'
require 'html-proofer'
require 'ra11y'

# system requirements
require 'csv'
require 'date'
require 'erb'
require 'json'

Dotenv.load

task default: 'import:events'

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

    desc 'Generate GeoJSON from Google Spreadsheet'
    task map: :dotenv do
        login
        system('clear')
        @features = []

        (2..@ws.num_rows).each do |row|
            feature = {} # feature container

            feature = {
                id: row,
                title: @ws[row, 2],
                date: Chronic.parse(@ws[row, 3]).strftime('%Y-%m-%d'),
                institution: @ws[row, 5],
                location: @ws[row, 6],
                contact: @ws[row, 7],
                time: @ws[row, 4],
                longitude: @ws[row, 9],
                latitude: @ws[row, 10]
            }

            # check if a location has been created
            if feature[:longitude] == '' || feature[:latitude] == ''
                address = "#{@ws[row, 5]}, #{@ws[row, 6]}"
                puts "Looking up #{address}".yellow
                result = geocode(address)
                @ws[row, 9]  = result[:lat]
                @ws[row, 10] = result[:lon]
                @ws.save
            else
                puts "\tUsing cached location: (#{feature[:longitude]},#{feature[:latitude]}) for #{feature[:title]}".green
            end

            puts "Adding #{feature[:title]}".yellow
            @features << feature
        end

        puts 'Rendering JavaScript map data'.green
        contents = render_erb('templates/events.js.erb')
        write_file('./data/events_map.js', contents)
    end
end

namespace :test do
    desc 'Validate HTML output'
    task :html do
        sh "bundle exec jekyll build"
        options = { :assume_extension => true }
        HTMLProofer.check_directory("./_site", options).run
    end

    desc 'Validate site with pa11y'
    task :accessibility do
        sh "bundle exec jekyll build"
        Ra11y::Site.new("./_site").run
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
    template = File.open(template_path, 'r').read
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
    file = File.open(path, 'w')
    file.write(contents)
rescue IOError => error
    puts 'File not writable. Check your permissions'
    puts error.inspect
ensure
    file.close unless file.nil?
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
