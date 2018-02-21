# frozen_string_literal: true

require 'active_support'
require 'active_support/inflector'
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

# importing RSS feed
require 'rss'
require 'rss/2.0'
require 'open-uri'
require 'safe_yaml'

Geocoder.configure(
  timeout: 2,
  google: {
    api_key: ENV.fetch('MAP_KEY_GOOGLE', ''),
    use_https: true
  },
  bing: {
    api_key: ENV.fetch('MAP_KEY_BING', '')
  }
)

def link_title(event)
  "<a href='#{event[:web_path]}'>#{event[:title]}</a>"
end

def shorten(string, count)
  string.match(/^.{0,#{count}}\b/)[0] + '...'
end

def set_headers
  @headers ||= {}
  login
  counter = 1
  (1..@ws.num_cols).each do |col|
    @headers[@ws[1, col].gsub(/\s+/, '_').downcase.to_sym] = counter
    counter += 1
  end

  @headers
end

def smart_add_url_protocol(url)
  unless url[/\Ahttp:\/\//] || url[/\Ahttps:\/\//] || url.empty?
    url = "http://#{url}"
  end
  url
end

def event_hash(row)
  @headers ||= set_headers
  event = {
    id: row,
    category:       Chronic.parse(@ws[row, @headers[:date]]).strftime('%Y'),
    title:          @ws[row, @headers[:title_of_your_event]],
    date:           Chronic.parse(
      @ws[row, @headers[:date]]
    ).strftime('%Y-%m-%d'),
    institution:    @ws[row, @headers[:institution]],
    location:       @ws[row, @headers[:location_]],
    contact:        @ws[row, @headers[:contact_person]],
    time:           @ws[row, @headers[:time]],
    description:    @ws[row, @headers[:event_description]],
    excerpt:        shorten(@ws[row, @headers[:event_description]], 140),
    contact_person: @ws[row, @headers[:contact_person]],
    email:          @ws[row, @headers[:contact_email]],
    website:        smart_add_url_protocol(
      @ws[row, @headers[:event_website]]
    ),
    latitude:       @ws[row, @headers[:latitude]],
    longitude:      @ws[row, @headers[:longitude]],
    virtual:        @ws[row, @headers[:virtual_event]],
    audio_url:      @ws[row, @headers[:audio_url]],
    video_url:      @ws[row, @headers[:video_url]],
    address:        @ws[row, @headers[:address]],
    locality:       @ws[row, @headers[:locality]],
    region:         @ws[row, @headers[:region]],
    postalcode:     @ws[row, @headers[:postalcode]]
  }
  event[:file_path] = filename(event)
  event[:web_path] = filename(event).gsub('_event', '/event').gsub('.md', '/')
  event.merge!(link: link_title(event))
end

def filename(event)
  formatted_date = Chronic.parse(event[:date]).strftime('%Y-%m-%d')
  event_name = ActiveSupport::Inflector.parameterize(event[:title])
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
      lon: result.longitude,
      region: result.state_code,
      locality: result.city,
      postalcode: result.postal_code,
      address: result.address
    }
  else
    {}
  end
end
