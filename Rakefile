# frozen_string_literal: true

require_relative 'lib/utils.rb'
require_relative 'lib/multi_geocoder.rb'

Dotenv.load

# Feed for EDW posts
@feed_url = 'https://www.diglib.org/category/edw/feed/'

# task default: 'import:events'
task default: 'import:all'

# get the year for the next event from the _config file
config = YAML.load_file('_config.yml')

# @current_year = Chronic.parse(config['date']).strftime('%Y')
@current_year = Date.today.year

desc 'Clean _events directory'
task :clean do
  FileUtils.rm_f Dir.glob('_events/*')
end

namespace :import do
  desc 'Import events for the collection, map, and datatable'
  task all: %i[events data map rss]

  desc 'Import Events from the Google Spreadsheet'
  task :events do
    login
    (2..@ws.num_rows).each do |row|
      @event = event_hash(row)
      contents = render_erb('templates/event.html.erb')
      file_path = @event[:file_path]
      write_file(file_path, contents)
      puts "Writing the event for '#{@event[:title]}'".green
    end
  end

  desc 'Import EDW data feed'
  task :rss do
    open(@feed_url) do |rss|
      feed = RSS::Parser.parse(rss)
      feed.items.each do |item|
        formatted_date = item.date.strftime('%Y-%m-%d')
        post_name = ActiveSupport::Inflector.parameterize(item.title)
        name = "#{formatted_date}-#{post_name}"

        header = {
          'layout' => 'blog_entry',
          'title' => item.title,
          'date' => item.date.strftime('%Y-%m-%d %T %z')
        }

        FileUtils.mkdir_p('_posts')

        File.open("_posts/#{name}.html", 'w') do |f|
          puts "Importing #{name}".green
          f.puts header.to_yaml
          f.puts "---\n\n"
          f.puts item.content_encoded
        end
      end
    end
  end

  desc 'Generate JSON for dynatable plugin'
  task data: :dotenv do
    login
    system('clear')
    @events = []

    (2..@ws.num_rows).each do |row|
      @event = {
        date: Chronic.parse(@ws[row, @headers[:date]]).strftime('%Y-%m-%d'),
        location: @ws[row, @headers[:institution]],
        title: @ws[row, @headers[:title_of_your_event]]
      }

      event_year = Chronic.parse(@ws[row, @headers[:date]]).strftime('%Y')

      next unless event_year == @current_year
      @event[:file_path] = filename(@event)
      @event[:web_path] = filename(@event).gsub('_event', '/event').gsub('.md', '/')

      unless @ws[row, @headers[:virtual_event]].empty?
        @event[:location] = "<i class='fa fa-globe orange'></i>"\
        " #{@ws[row, @headers[:institution]]}"
      end
      @event[:link] = link_title(@event)
      @events << @event
    end

    puts "Writing events for table view'".green
    File.open('data/events_table.json', 'w') { |f| f.write(@events.to_json) }
  end

  # for testing
  task :set_headers do
    puts set_headers
  end

  desc 'Generate GeoJSON from Google Spreadsheet'
  task map: :dotenv do
    login
    system('clear')
    @features = []

    puts "Rows are #{@ws.num_rows}".red

    (2..@ws.num_rows).each do |row|
      feature = event_hash(row)

      # check if a location has been created
      if feature[:longitude] == ''
        next if @ws[row, @headers[:geocode]] == 0

        address = "#{@ws[row, @headers[:institution]]},"\
          " #{@ws[row, @headers[:location_]]}"

        puts "Looking up #{address}".yellow
        result = MultiGeocoder.geocode!(address)
        @ws[row, @headers[:latitude]]   = result[:lat]
        @ws[row, @headers[:longitude]]  = result[:lon]
        @ws[row, @headers[:locality]]   = result[:locality]
        @ws[row, @headers[:region]]     = result[:region]
        @ws[row, @headers[:postalcode]] = result[:postalcode]
        @ws[row, @headers[:address]]    = result[:address]
        @ws.save
        feature[:longitude]  = result[:lon]
        feature[:latitude]   = result[:lat]
        feature[:locality]   = result[:locality]
        feature[:region]     = result[:region]
        feature[:postalcode] = result[:postalcode]
        feature[:address]    = result[:address]
      else
        puts "\tUsing cached location: (#{feature[:longitude]},"\
          "#{feature[:latitude]}) for #{feature[:title]}".green
      end

      event_year = Chronic.parse(@ws[row, @headers[:date]]).strftime('%Y')
      # puts "#{event_year == @current_year}".red
      if event_year == @current_year
        puts "Adding #{feature[:title]}".yellow
        @features << feature unless feature[:latitude].to_s.empty?
      end
    end

    puts 'Rendering JavaScript map data'.green
    contents = render_erb('templates/events.js.erb')
    write_file('./data/events_map.js', contents)
  end
end

namespace :test do
  desc 'Validate HTML output'
  task :html do
    sh 'bundle exec jekyll build'
    options = {
      assume_extension: true,
      check_opengraph: true,
      check_html: true,
      disable_external: true
    }
    HTMLProofer.check_directory('./_site', options).run
  end

  desc 'Validate site with pa11y'
  task :accessibility do
    sh 'bundle exec jekyll build'
    Ra11y::Site.new('./_site').run
  end
end
