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
        # import:events
    end
end

def login
    system('clear')
    puts 'Authorizing...'.green

    @session ||= GoogleDrive.saved_session('config.json')
    @ws ||= @session.spreadsheet_by_key(ENV['SPREADSHEET_KEY'])
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
